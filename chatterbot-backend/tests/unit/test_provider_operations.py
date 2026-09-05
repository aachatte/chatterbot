"""Provider webhook idempotency and operational failure tests."""
import pytest
from flask import Flask

from app import db
from app.models.operations import (
    GuardianNotification,
    OperationalEvent,
    ProviderEvent,
)
from app.models.subscription import Subscription
from app.models.user import User
from app.routes.webhook import webhook_bp
from app.services.openai_service import OpenAIService


@pytest.fixture()
def app(monkeypatch):
    app = Flask(__name__)
    app.config.update(
        TESTING=True,
        SQLALCHEMY_DATABASE_URI="sqlite://",
        SQLALCHEMY_TRACK_MODIFICATIONS=False,
    )
    db.init_app(app)
    app.register_blueprint(webhook_bp, url_prefix="/api/webhooks")
    with app.app_context():
        db.create_all()
        user = User(
            email="billing@example.com",
            password_hash="unused",
            first_name="Alex",
            last_name="Rivera",
        )
        db.session.add(user)
        db.session.flush()
        subscription = Subscription(
            user_id=user.id,
            stripe_customer_id="cus_test",
            stripe_subscription_id="sub_test",
            status="active",
        )
        db.session.add(subscription)
        db.session.commit()
    yield app
    with app.app_context():
        db.session.remove()
        db.drop_all()


def _event(event_id="evt_test"):
    return {
        "id": event_id,
        "type": "customer.subscription.updated",
        "livemode": False,
        "data": {
            "object": {
                "id": "sub_test",
                "status": "past_due",
                "cancel_at_period_end": False,
            }
        },
    }


def test_stripe_event_is_processed_once(app, monkeypatch):
    monkeypatch.setattr(
        "app.routes.webhook.stripe.Webhook.construct_event",
        lambda *_args, **_kwargs: _event(),
    )
    client = app.test_client()
    first = client.post("/api/webhooks/stripe", data=b"{}", headers={"Stripe-Signature": "test"})
    replay = client.post("/api/webhooks/stripe", data=b"{}", headers={"Stripe-Signature": "test"})

    assert first.status_code == 200
    assert replay.get_json()["status"] == "duplicate"
    with app.app_context():
        assert ProviderEvent.query.count() == 1
        assert ProviderEvent.query.one().status == "processed"
        assert Subscription.query.one().status == "past_due"


def test_failed_stripe_event_is_visible_and_retryable(app, monkeypatch):
    monkeypatch.setattr(
        "app.routes.webhook.stripe.Webhook.construct_event",
        lambda *_args, **_kwargs: _event("evt_retry"),
    )
    monkeypatch.setattr(
        "app.routes.webhook._handle_subscription_updated",
        lambda _data: (_ for _ in ()).throw(RuntimeError("provider test failure")),
    )
    client = app.test_client()
    failed = client.post("/api/webhooks/stripe", data=b"{}", headers={"Stripe-Signature": "test"})
    assert failed.status_code == 500

    with app.app_context():
        assert ProviderEvent.query.one().status == "failed"
        signal = OperationalEvent.query.one()
        assert signal.code == "webhook_processing_failed"
        assert "provider test failure" not in str(signal.detail)

    monkeypatch.setattr(
        "app.routes.webhook._handle_subscription_updated",
        lambda _data: None,
    )
    retried = client.post("/api/webhooks/stripe", data=b"{}", headers={"Stripe-Signature": "test"})
    assert retried.status_code == 200
    with app.app_context():
        assert ProviderEvent.query.one().status == "processed"


def test_openai_failure_uses_safe_fallback_and_creates_signal(app):
    class FailingCompletions:
        @staticmethod
        def create(**_kwargs):
            raise RuntimeError("sensitive provider detail")

    service = OpenAIService()
    service.client = type(
        "Client",
        (),
        {"chat": type("Chat", (), {"completions": FailingCompletions()})()},
    )()
    with app.app_context():
        response = service.generate_response("I had a difficult day")
        signal = OperationalEvent.query.one()
    assert "Thanks for sharing" in response["text"]
    assert signal.code == "generation_failed"
    assert "sensitive provider detail" not in str(signal.detail)


def test_payment_failure_creates_guardian_and_operator_notices(app, monkeypatch):
    event = {
        "id": "evt_payment_failed",
        "type": "invoice.payment_failed",
        "livemode": False,
        "data": {"object": {"subscription": "sub_test"}},
    }
    monkeypatch.setattr(
        "app.routes.webhook.stripe.Webhook.construct_event",
        lambda *_args, **_kwargs: event,
    )
    response = app.test_client().post(
        "/api/webhooks/stripe",
        data=b"{}",
        headers={"Stripe-Signature": "test"},
    )
    assert response.status_code == 200
    with app.app_context():
        assert GuardianNotification.query.one().category == "billing"
        assert OperationalEvent.query.one().code == "payment_failed"
