"""Named staff access, authorization, auditing, and pilot metrics tests."""
from datetime import timedelta

import pytest
from flask import Flask

from app import db, limiter
from app.models.conversation import Conversation, Message
from app.models.crisis_alert import CrisisAlert
from app.models.operations import OperationalEvent, PilotEnrollment, ProviderEvent
from app.models.staff import StaffAuditLog, StaffUser
from app.models.teen import Teen
from app.models.user import User
from app.routes.admin import admin_bp
from app.utils.time import utc_now
from config import settings


@pytest.fixture()
def app(monkeypatch):
    monkeypatch.setattr(settings, "admin_api_key", "test-admin-key")
    app = Flask(__name__)
    app.config.update(
        TESTING=True,
        RATELIMIT_ENABLED=False,
        SQLALCHEMY_DATABASE_URI="sqlite://",
        SQLALCHEMY_TRACK_MODIFICATIONS=False,
    )
    db.init_app(app)
    limiter.init_app(app)
    app.register_blueprint(admin_bp, url_prefix="/api/admin")
    with app.app_context():
        db.create_all()
        guardian = User(
            first_name="Alex",
            last_name="Rivera",
            email="guardian@example.com",
            password_hash="unused",
        )
        db.session.add(guardian)
        db.session.flush()
        teen = Teen(
            parent_id=guardian.id,
            first_name="Maya",
            phone="+15555550110",
            consent_verified=True,
            phone_verification_status="verified",
        )
        db.session.add(teen)
        db.session.flush()
        db.session.add(PilotEnrollment(guardian_id=guardian.id, status="ready"))
        event = OperationalEvent(
            category="messaging",
            severity="critical",
            source="provider",
            code="delivery_failed",
        )
        db.session.add(event)
        db.session.commit()
        app.config["event_id"] = event.id
    yield app
    with app.app_context():
        db.session.remove()
        db.drop_all()


def _legacy_headers():
    return {
        "X-Admin-API-Key": "test-admin-key",
        "X-Admin-Actor": "Bootstrap owner",
    }


def _create_and_login(client, role="operator", email="operator@example.com"):
    created = client.post(
        "/api/admin/staff",
        json={
            "name": "Pilot Operator",
            "email": email,
            "password": "strong-staff-password",
            "role": role,
        },
        headers=_legacy_headers(),
    )
    assert created.status_code == 201
    login = client.post(
        "/api/admin/session",
        json={"email": email, "password": "strong-staff-password"},
    )
    assert login.status_code == 200
    return {
        "Authorization": f"Bearer {login.get_json()['access_token']}"
    }


def test_named_operator_can_resolve_events_and_is_audited(app):
    client = app.test_client()
    headers = _create_and_login(client)
    resolved = client.patch(
        f"/api/admin/operations/{app.config['event_id']}/resolve",
        json={"note": "Carrier issue reviewed"},
        headers=headers,
    )
    assert resolved.status_code == 200
    assert resolved.get_json()["event"]["status"] == "resolved"
    assert client.patch(
        "/api/admin/pilot", json={"enabled": False}, headers=headers
    ).status_code == 403
    with app.app_context():
        audit = StaffAuditLog.query.filter_by(
            action="operational_event_resolved"
        ).one()
        assert audit.actor_name == "Pilot Operator"


def test_viewer_is_read_only_and_revoked_session_is_rejected(app):
    client = app.test_client()
    headers = _create_and_login(client, role="viewer", email="viewer@example.com")
    assert client.get("/api/admin/operations", headers=headers).status_code == 200
    assert client.get("/api/admin/users", headers=headers).status_code == 403
    assert client.patch(
        f"/api/admin/operations/{app.config['event_id']}/resolve",
        json={"note": "Should not work"},
        headers=headers,
    ).status_code == 403
    assert client.delete("/api/admin/session", headers=headers).status_code == 200
    assert client.get("/api/admin/operations", headers=headers).status_code == 401


def test_repeated_failed_staff_login_temporarily_locks_account(app):
    client = app.test_client()
    _create_and_login(client, email="locked@example.com")
    for _ in range(5):
        response = client.post(
            "/api/admin/session",
            json={"email": "locked@example.com", "password": "wrong-password"},
        )
        assert response.status_code == 401
    locked = client.post(
        "/api/admin/session",
        json={
            "email": "locked@example.com",
            "password": "strong-staff-password",
        },
    )
    assert locked.status_code == 423


def test_pilot_metrics_are_aggregate_and_time_bounded(app):
    with app.app_context():
        teen = Teen.query.one()
        conversation = Conversation(teen_id=teen.id)
        db.session.add(conversation)
        db.session.flush()
        db.session.add(Message(
            conversation_id=conversation.id,
            direction="inbound",
            content="private content",
            created_at=utc_now() - timedelta(days=1),
        ))
        db.session.add(CrisisAlert(
            teen_id=teen.id,
            severity="critical",
            created_at=utc_now() - timedelta(hours=2),
            resolved_at=utc_now() - timedelta(hours=1),
        ))
        db.session.add(ProviderEvent(
            provider="twilio",
            event_id="failed-1",
            event_type="delivery",
            status="failed",
        ))
        db.session.commit()

    response = app.test_client().get(
        "/api/admin/pilot/metrics?days=30",
        headers={"X-Admin-API-Key": "test-admin-key"},
    )
    assert response.status_code == 200
    metrics = response.get_json()
    assert metrics["activation"]["families_ready"] == 1
    assert metrics["engagement"]["engaged_teens"] == 1
    assert metrics["safety"]["critical_alerts"] == 1
    assert metrics["reliability"]["provider_failures"] == 1
    assert "private content" not in str(metrics)
