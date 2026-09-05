"""End to end tests for the enrolled teen SMS safety path."""
import pytest
from flask import Flask

from app import db
from app.models.conversation import Message
from app.models.crisis_alert import CrisisAlert
from app.models.operations import ProviderEvent
from app.models.privacy import PrivacyEvent
from app.models.teen import Teen
from app.models.user import User
from app.routes.sms import sms_bp


@pytest.fixture()
def app(monkeypatch):
    app = Flask(__name__)
    app.config.update(
        TESTING=True,
        SQLALCHEMY_DATABASE_URI="sqlite://",
        SQLALCHEMY_TRACK_MODIFICATIONS=False,
    )
    db.init_app(app)
    app.register_blueprint(sms_bp, url_prefix="/api/sms")
    monkeypatch.setattr("app.routes.sms._valid_twilio_signature", lambda: True)
    monkeypatch.setattr(
        "app.services.twilio_service.TwilioService.send_sms",
        lambda *_args, **_kwargs: {"success": True, "sid": "SM-outbound"},
    )
    monkeypatch.setattr(
        "app.services.twilio_service.TwilioService.send_crisis_alert",
        lambda *_args, **_kwargs: {"success": True, "sid": "SM-alert"},
    )

    with app.app_context():
        db.create_all()
        guardian = User(
            email="guardian@example.com",
            password_hash="unused",
            first_name="Alex",
            last_name="Rivera",
            phone="+15555550101",
        )
        db.session.add(guardian)
        db.session.flush()
        teen = Teen(
            parent_id=guardian.id,
            first_name="Maya",
            phone="+15555550102",
            consent_verified=True,
            consent_status="guardian_confirmed",
            phone_verification_status="verified",
        )
        db.session.add(teen)
        db.session.commit()
        app.config["teen_id"] = teen.id
    yield app
    with app.app_context():
        db.session.remove()
        db.drop_all()


@pytest.fixture()
def client(app):
    return app.test_client()


def _post_sms(client, body, sid):
    return client.post(
        "/api/sms/webhook",
        data={"From": "+15555550102", "Body": body, "MessageSid": sid},
    )


def test_incomplete_enrollment_blocks_collection(app, client):
    with app.app_context():
        teen = db.session.get(Teen, app.config["teen_id"])
        teen.consent_verified = False
        db.session.commit()

    response = _post_sms(client, "This should not be stored", "SM-blocked")
    assert response.status_code == 200
    with app.app_context():
        assert Message.query.count() == 0


def test_crisis_path_is_deterministic_and_creates_privacy_safe_alert(
    app, client, monkeypatch
):
    monkeypatch.setattr(
        "app.routes.sms.openai_svc.generate_response",
        lambda **_kwargs: pytest.fail("Crisis path must not call the language model"),
    )
    response = _post_sms(
        client,
        "I have a plan to kill myself tonight and I have the pills",
        "SM-crisis",
    )
    assert response.status_code == 200

    with app.app_context():
        alert = CrisisAlert.query.one()
        outbound = Message.query.filter_by(direction="outbound").one()
        assert alert.severity == "critical"
        assert alert.categories == ["self_harm"]
        assert alert.status == "parent_notified"
        assert "kill myself" not in alert.context_summary
        assert "988" in outbound.content
        assert "911" in outbound.content


def test_retried_webhook_does_not_duplicate_messages_or_alerts(app, client):
    _post_sms(client, "I want to kill myself", "SM-retry")
    _post_sms(client, "I want to kill myself", "SM-retry")

    with app.app_context():
        assert Message.query.filter_by(direction="inbound").count() == 1
        assert Message.query.filter_by(direction="outbound").count() == 1
        assert CrisisAlert.query.count() == 1


def test_stop_blocks_collection_and_is_audited_once(app, client):
    first = _post_sms(client, "STOP", "SM-stop")
    replay = _post_sms(client, "STOP", "SM-stop")
    blocked = _post_sms(client, "This must not be stored", "SM-after-stop")

    assert first.status_code == 200
    assert replay.status_code == 200
    assert blocked.status_code == 200
    with app.app_context():
        teen = db.session.get(Teen, app.config["teen_id"])
        assert teen.sms_opted_out_at is not None
        assert teen.sms_opt_out_source == "teen_keyword"
        assert Message.query.count() == 0
        assert PrivacyEvent.query.filter_by(event_type="sms_opted_out").count() == 1
        assert ProviderEvent.query.filter_by(provider="twilio").count() == 1


def test_start_restores_sms_without_changing_guardian_consent(app, client):
    _post_sms(client, "unsubscribe", "SM-stop-2")
    _post_sms(client, "START", "SM-start")

    with app.app_context():
        teen = db.session.get(Teen, app.config["teen_id"])
        assert teen.sms_opted_out_at is None
        assert teen.consent_verified is True
        assert PrivacyEvent.query.filter_by(event_type="sms_opted_in").count() == 1


def test_help_returns_resources_without_storing_conversation(app, client):
    response = _post_sms(client, "HELP", "SM-help")
    assert response.status_code == 200
    with app.app_context():
        assert Message.query.count() == 0
        assert ProviderEvent.query.filter_by(
            event_type="sms_command.help"
        ).count() == 1
