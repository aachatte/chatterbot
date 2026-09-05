"""External webhook routes (Stripe, etc.)."""
from datetime import datetime
import logging

from flask import Blueprint, request, jsonify
import stripe
from sqlalchemy.exc import IntegrityError
from config import settings
from app import db
from app.models.user import User
from app.models.subscription import Subscription
from app.models.operations import GuardianNotification, ProviderEvent
from app.services.operations_service import (
    claim_provider_event,
    complete_provider_event,
    record_operational_event,
)
from app.utils.time import utc_now

webhook_bp = Blueprint("webhooks", __name__)
logger = logging.getLogger(__name__)

stripe.api_key = settings.stripe_secret_key
stripe.max_network_retries = settings.provider_max_retries


@webhook_bp.route("/stripe", methods=["POST"])
def stripe_webhook():
    """Handle Stripe webhook events."""
    payload = request.get_data()
    sig_header = request.headers.get("Stripe-Signature")

    try:
        event = stripe.Webhook.construct_event(
            payload, sig_header, settings.stripe_webhook_secret
        )
    except ValueError:
        return jsonify({"error": "Invalid payload"}), 400
    except stripe.error.SignatureVerificationError:
        return jsonify({"error": "Invalid signature"}), 400

    event_id = event.get("id")
    event_type = event["type"]
    data = event["data"]["object"]
    if not isinstance(event_id, str) or not event_id:
        return jsonify({"error": "Webhook event identifier is required"}), 400
    receipt = claim_provider_event(
        "stripe", event_id, event_type, {"livemode": bool(event.get("livemode"))}
    )
    if receipt is None:
        return jsonify({"status": "duplicate"}), 200

    logger.info("Stripe webhook received type=%s", event_type)

    try:
        if event_type == "checkout.session.completed":
            _handle_checkout_completed(data)
        elif event_type == "invoice.payment_succeeded":
            _handle_payment_succeeded(data)
        elif event_type == "invoice.payment_failed":
            _handle_payment_failed(data)
        elif event_type == "customer.subscription.deleted":
            _handle_subscription_deleted(data)
        elif event_type == "customer.subscription.updated":
            _handle_subscription_updated(data)
        complete_provider_event(receipt)
        db.session.commit()
    except IntegrityError:
        db.session.rollback()
        existing = ProviderEvent.query.filter_by(
            provider="stripe", event_id=event_id
        ).first()
        if existing:
            return jsonify({"status": "duplicate"}), 200
        logger.exception("Stripe webhook integrity failure type=%s", event_type)
        return jsonify({"error": "Webhook processing failed"}), 500
    except Exception:
        db.session.rollback()
        failed = claim_provider_event(
            "stripe", event_id, event_type, {"livemode": bool(event.get("livemode"))}
        )
        if failed is not None:
            failed.status = "failed"
            failed.processed_at = utc_now()
            record_operational_event(
                "billing",
                "stripe.webhook",
                "webhook_processing_failed",
                severity="critical",
                detail={"event_type": event_type},
            )
            db.session.commit()
        logger.exception("Stripe webhook processing failed type=%s", event_type)
        return jsonify({"error": "Webhook processing failed"}), 500

    return jsonify({"status": "ok"}), 200


def _handle_checkout_completed(data):
    """Handle successful checkout completion."""
    customer_id = data.get("customer")
    subscription_id = data.get("subscription")

    # Find user by Stripe customer ID
    user = User.query.filter(
        User.subscriptions.any(Subscription.stripe_customer_id == customer_id)
    ).first()

    if not user:
        logger.error(f"No user found for Stripe customer {customer_id}")
        return

    # Update or create subscription
    sub = Subscription.query.filter_by(stripe_customer_id=customer_id).first()
    if not sub:
        sub = Subscription(
            user_id=user.id,
            stripe_customer_id=customer_id,
        )
        db.session.add(sub)

    sub.stripe_subscription_id = subscription_id
    sub.status = "active"
    sub.plan_tier = "premium"

    # Get subscription details from Stripe
    if not subscription_id:
        logger.warning("Checkout completed without a subscription ID for customer %s", customer_id)
    else:
        try:
            stripe_sub = stripe.Subscription.retrieve(subscription_id)
            sub.current_period_start = datetime.utcfromtimestamp(
                stripe_sub.current_period_start
            )
            sub.current_period_end = datetime.utcfromtimestamp(
                stripe_sub.current_period_end
            )
            sub.amount = stripe_sub.plan.amount
            sub.currency = stripe_sub.plan.currency
            sub.interval = stripe_sub.plan.interval
        except stripe.error.StripeError as exc:
            logger.warning(
                "Could not retrieve Stripe subscription %s: %s",
                subscription_id,
                exc,
            )

    logger.info(f"Subscription activated for user {user.id}")


def _handle_payment_succeeded(data):
    """Handle successful invoice payment."""
    subscription_id = data.get("subscription")
    if not subscription_id:
        return

    sub = Subscription.query.filter_by(stripe_subscription_id=subscription_id).first()
    if sub:
        sub.status = "active"
        sub.current_period_start = datetime.utcfromtimestamp(data["period_start"])
        sub.current_period_end = datetime.utcfromtimestamp(data["period_end"])


def _handle_payment_failed(data):
    """Handle failed invoice payment."""
    subscription_id = data.get("subscription")
    if not subscription_id:
        return

    sub = Subscription.query.filter_by(stripe_subscription_id=subscription_id).first()
    if sub:
        sub.status = "past_due"
        record_operational_event(
            "billing",
            "stripe.invoice",
            "payment_failed",
            severity="warning",
            detail={"subscription_record_id": sub.id, "guardian_id": sub.user_id},
        )
        db.session.add(GuardianNotification(
            guardian_id=sub.user_id,
            category="billing",
            title="Payment needs attention",
            body=(
                "We could not process your latest payment. Review billing "
                "details to prevent an interruption."
            ),
        ))
        logger.warning("Payment failed for subscription record %s", sub.id)


def _handle_subscription_deleted(data):
    """Handle subscription cancellation."""
    subscription_id = data.get("id")
    sub = Subscription.query.filter_by(stripe_subscription_id=subscription_id).first()

    if sub:
        sub.status = "canceled"
        sub.plan_tier = "free"
        logger.info("Subscription record %s canceled", sub.id)


def _handle_subscription_updated(data):
    """Handle subscription updates."""
    subscription_id = data.get("id")
    sub = Subscription.query.filter_by(stripe_subscription_id=subscription_id).first()

    if sub:
        sub.status = data.get("status", sub.status)
        sub.cancel_at_period_end = data.get("cancel_at_period_end", False)
