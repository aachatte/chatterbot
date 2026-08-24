"""External webhook routes (Stripe, etc.)."""
from datetime import datetime
import logging

from flask import Blueprint, request, jsonify
import stripe
from config import settings
from app import db
from app.models.user import User
from app.models.subscription import Subscription

webhook_bp = Blueprint("webhooks", __name__)
logger = logging.getLogger(__name__)

stripe.api_key = settings.stripe_secret_key


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

    event_type = event["type"]
    data = event["data"]["object"]

    logger.info(f"Stripe webhook: {event_type}")

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

    db.session.commit()
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
        db.session.commit()


def _handle_payment_failed(data):
    """Handle failed invoice payment."""
    subscription_id = data.get("subscription")
    if not subscription_id:
        return

    sub = Subscription.query.filter_by(stripe_subscription_id=subscription_id).first()
    if sub:
        sub.status = "past_due"
        db.session.commit()

        # TODO: Send payment failure notification to user
        logger.warning(f"Payment failed for subscription {subscription_id}")


def _handle_subscription_deleted(data):
    """Handle subscription cancellation."""
    subscription_id = data.get("id")
    sub = Subscription.query.filter_by(stripe_subscription_id=subscription_id).first()

    if sub:
        sub.status = "canceled"
        sub.plan_tier = "free"
        db.session.commit()
        logger.info(f"Subscription {subscription_id} canceled")


def _handle_subscription_updated(data):
    """Handle subscription updates."""
    subscription_id = data.get("id")
    sub = Subscription.query.filter_by(stripe_subscription_id=subscription_id).first()

    if sub:
        sub.status = data.get("status", sub.status)
        sub.cancel_at_period_end = data.get("cancel_at_period_end", False)
        db.session.commit()
