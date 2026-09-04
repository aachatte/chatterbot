"""Privacy export, retention, consent, and deletion workflow tests."""
from datetime import timedelta

import pytest
from flask import Flask
from flask_jwt_extended import JWTManager, create_access_token

from app import db
from app.models.conversation import Conversation, Message
from app.models.privacy import DataDeletionRequest, PrivacyEvent
from app.models.teen import Teen
from app.models.user import User
from app.routes.dashboard import dashboard_bp
from app.routes.privacy import privacy_bp
from app.services.privacy_service import REDACTED_CONTENT, run_privacy_jobs
from app.utils.time import utc_now


@pytest.fixture()
def app():
    app = Flask(__name__)
    app.config.update(
        TESTING=True,
        SQLALCHEMY_DATABASE_URI="sqlite://",
        SQLALCHEMY_TRACK_MODIFICATIONS=False,
        JWT_SECRET_KEY="privacy-lifecycle-secret-at-least-32-characters",
    )
    db.init_app(app)
    JWTManager(app)
    app.register_blueprint(dashboard_bp, url_prefix="/api/dashboard")
    app.register_blueprint(privacy_bp, url_prefix="/api/privacy")
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
        other_guardian = User(
            email="other@example.com",
            password_hash="unused",
            first_name="Jordan",
            last_name="Lee",
        )
        db.session.add(other_guardian)
        db.session.flush()
        teen = Teen(
            parent_id=guardian.id,
            first_name="Maya",
            phone="+15555550102",
            consent_verified=True,
            consent_status="guardian_confirmed",
        )
        db.session.add(teen)
        db.session.flush()
        conversation = Conversation(teen_id=teen.id)
        db.session.add(conversation)
        db.session.flush()
        db.session.add(Message(
            conversation_id=conversation.id,
            direction="inbound",
            content="This private message must never enter the guardian export.",
            created_at=utc_now() - timedelta(days=120),
            twilio_sid="SM-private",
        ))
        db.session.commit()
        app.config.update(
            guardian_id=guardian.id,
            other_guardian_id=other_guardian.id,
            teen_id=teen.id,
        )
    yield app
    with app.app_context():
        db.session.remove()
        db.drop_all()


@pytest.fixture()
def client(app):
    return app.test_client()


def _headers(app):
    with app.app_context():
        token = create_access_token(identity=str(app.config["guardian_id"]))
    return {"Authorization": f"Bearer {token}"}


def test_export_is_audited_and_excludes_message_text(app, client):
    response = client.post("/api/privacy/export", headers=_headers(app))
    assert response.status_code == 200
    serialized = response.get_data(as_text=True)
    assert "This private message" not in serialized
    assert "Message text is excluded" in serialized
    with app.app_context():
        assert PrivacyEvent.query.filter_by(event_type="export_generated").count() == 1


def test_retention_redacts_content_and_provider_identifier(app):
    with app.app_context():
        result = run_privacy_jobs()
        message = Message.query.one()
        assert result["messages_redacted"] == 1
        assert message.content == REDACTED_CONTENT
        assert message.twilio_sid is None


def test_deletion_requires_name_and_can_be_canceled(app, client):
    url = f"/api/privacy/teens/{app.config['teen_id']}/deletion-requests"
    rejected = client.post(url, json={"confirmation": "wrong"}, headers=_headers(app))
    assert rejected.status_code == 400
    created = client.post(url, json={"confirmation": "Maya"}, headers=_headers(app))
    assert created.status_code == 202
    request_id = created.get_json()["deletion_request"]["id"]
    with app.app_context():
        assert db.session.get(Teen, app.config["teen_id"]).is_active is False
    canceled = client.delete(
        f"/api/privacy/deletion-requests/{request_id}", headers=_headers(app)
    )
    assert canceled.status_code == 200
    with app.app_context():
        assert DataDeletionRequest.query.one().status == "canceled"
        assert db.session.get(Teen, app.config["teen_id"]).is_active is True


def test_due_deletion_erases_teen_and_retains_minimal_request_record(app):
    with app.app_context():
        deletion = DataDeletionRequest(
            guardian_id=app.config["guardian_id"],
            teen_id=app.config["teen_id"],
            teen_name="Maya",
            scheduled_for=utc_now() - timedelta(minutes=1),
        )
        db.session.add(deletion)
        db.session.commit()
        result = run_privacy_jobs()
        assert result["deletions_completed"] == 1
        assert db.session.get(Teen, app.config["teen_id"]) is None
        stored = DataDeletionRequest.query.one()
        assert stored.status == "completed"
        assert stored.teen_id is None


def test_withdrawing_consent_disables_service_and_is_audited(app, client):
    response = client.delete(
        f"/api/privacy/teens/{app.config['teen_id']}/consent",
        headers=_headers(app),
    )
    assert response.status_code == 200
    assert response.get_json()["enrollment"]["consent_status"] == "withdrawn"
    with app.app_context():
        teen = db.session.get(Teen, app.config["teen_id"])
        assert teen.is_active is False
        assert PrivacyEvent.query.filter_by(event_type="consent_withdrawn").count() == 1


def test_other_guardian_cannot_schedule_or_withdraw_for_teen(app, client):
    headers = _headers(app)
    with app.app_context():
        token = create_access_token(identity=str(app.config["other_guardian_id"]))
    headers = {"Authorization": f"Bearer {token}"}
    teen_id = app.config["teen_id"]
    deletion = client.post(
        f"/api/privacy/teens/{teen_id}/deletion-requests",
        json={"confirmation": "Maya"},
        headers=headers,
    )
    withdrawal = client.delete(
        f"/api/privacy/teens/{teen_id}/consent",
        headers=headers,
    )
    assert deletion.status_code == 404
    assert withdrawal.status_code == 404
