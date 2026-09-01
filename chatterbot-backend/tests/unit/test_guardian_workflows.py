"""Focused tests for guardian-owned enrollment, alert, and support workflows."""
import pytest
from flask import Flask
from flask_jwt_extended import JWTManager, create_access_token

from app import db
from app.models.crisis_alert import CrisisAlert, CrisisStatus
from app.models.support_request import SupportRequest
from app.models.teen import Teen
from app.models.user import User
from app.routes.dashboard import dashboard_bp
from app.routes.support import support_bp


@pytest.fixture()
def app():
    """Provide an isolated app with the guardian workflow blueprints."""
    app = Flask(__name__)
    app.config.update(
        TESTING=True,
        SQLALCHEMY_DATABASE_URI="sqlite://",
        SQLALCHEMY_TRACK_MODIFICATIONS=False,
        JWT_SECRET_KEY="test-jwt-secret-must-be-at-least-32-characters",
        JWT_ACCESS_TOKEN_EXPIRES=False,
    )
    db.init_app(app)
    JWTManager(app)
    app.register_blueprint(dashboard_bp, url_prefix="/api/dashboard")
    app.register_blueprint(support_bp, url_prefix="/api/support")

    with app.app_context():
        db.create_all()
        guardian = User(
            email="guardian@example.com",
            password_hash="not-used-in-route-tests",
            first_name="Guardian",
            last_name="One",
            phone="+15555550101",
        )
        other_guardian = User(
            email="other@example.com",
            password_hash="not-used-in-route-tests",
            first_name="Guardian",
            last_name="Two",
        )
        db.session.add_all([guardian, other_guardian])
        db.session.flush()
        teen = Teen(
            parent_id=guardian.id,
            first_name="Taylor",
            phone="+15555550102",
        )
        db.session.add(teen)
        db.session.flush()
        alert = CrisisAlert(teen_id=teen.id, status=CrisisStatus.TRIGGERED.value)
        db.session.add(alert)
        db.session.commit()
        app.config["guardian_id"] = guardian.id
        app.config["other_guardian_id"] = other_guardian.id
        app.config["teen_id"] = teen.id
        app.config["alert_id"] = alert.id

    yield app

    with app.app_context():
        db.session.remove()
        db.drop_all()


@pytest.fixture()
def client(app):
    return app.test_client()


def _auth_headers(app, user_id):
    with app.app_context():
        token = create_access_token(identity=str(user_id))
    return {"Authorization": f"Bearer {token}"}


def _legacy_auth_headers(app, identity):
    with app.app_context():
        token = create_access_token(identity=identity)
    return {"Authorization": "Bearer " + token}


def test_guardian_enrollment_requires_ownership_and_never_exposes_token(
    app, client, monkeypatch
):
    """Only the teen's guardian can inspect and complete enrollment state."""
    guardian_headers = _auth_headers(app, app.config["guardian_id"])
    other_headers = _auth_headers(app, app.config["other_guardian_id"])
    teen_id = app.config["teen_id"]

    forbidden = client.get(
        f"/api/dashboard/teens/{teen_id}/enrollment", headers=other_headers
    )
    assert forbidden.status_code == 404

    consent = client.post(
        f"/api/dashboard/teens/{teen_id}/consent",
        json={"guardian_confirmation": True},
        headers=guardian_headers,
    )
    assert consent.status_code == 200
    assert consent.get_json()["enrollment"]["consent_status"] == "guardian_confirmed"

    monkeypatch.setattr(
        "app.routes.dashboard.TwilioService.send_sms",
        lambda *_args, **_kwargs: {"success": True, "sid": "SM-test"},
    )
    pending = client.post(
        f"/api/dashboard/teens/{teen_id}/phone-verification/request",
        headers=guardian_headers,
    )
    assert pending.status_code == 202
    enrollment = pending.get_json()["enrollment"]
    assert enrollment["phone_verification_status"] == "pending"
    assert pending.get_json()["delivery_method"] == "sms"
    assert "token" not in enrollment

    with app.app_context():
        teen = db.session.get(Teen, teen_id)
        token = teen.begin_phone_verification()
        token_hash = teen.phone_verification_token_hash
        db.session.commit()
    assert token != token_hash

    verified = client.post(
        f"/api/dashboard/teens/{teen_id}/phone-verification/confirm",
        json={"token": token},
        headers=guardian_headers,
    )
    assert verified.status_code == 200
    assert verified.get_json()["enrollment"]["phone_verification_status"] == "verified"
    with app.app_context():
        assert db.session.get(Teen, teen_id).phone_verification_token_hash is None


def test_guardian_preferences_and_alert_acknowledgement_are_persisted(app, client):
    """Guardian settings and alert acknowledgement retain safe audit data."""
    headers = _auth_headers(app, app.config["guardian_id"])
    teen_id = app.config["teen_id"]
    alert_id = app.config["alert_id"]

    preferences = client.put(
        "/api/dashboard/preferences",
        json={"crisis_alert_sms_enabled": False},
        headers=headers,
    )
    assert preferences.status_code == 200
    assert preferences.get_json()["preferences"]["crisis_alert_sms_enabled"] is False

    teen_preferences = client.put(
        f"/api/dashboard/teens/{teen_id}/preferences",
        json={"nudge_frequency": "low", "crisis_keywords_enabled": True},
        headers=headers,
    )
    assert teen_preferences.status_code == 200
    assert teen_preferences.get_json()["preferences"]["nudge_frequency"] == "low"

    acknowledged = client.post(
        f"/api/dashboard/alerts/{alert_id}/acknowledge",
        json={"notes": "I am checking in now."},
        headers=headers,
    )
    assert acknowledged.status_code == 200
    alert = acknowledged.get_json()["alert"]
    assert alert["status"] == CrisisStatus.ACKNOWLEDGED.value
    assert alert["acknowledged_at"] is not None
    assert alert["acknowledgement_notes"] == "I am checking in now."

    resolved = client.post(
        f"/api/dashboard/alerts/{alert_id}/resolve",
        json={"notes": "Guardian follow-up completed."},
        headers=headers,
    )
    assert resolved.status_code == 200
    with app.app_context():
        stored_alert = db.session.get(CrisisAlert, alert_id)
        assert stored_alert.resolved_by == app.config["guardian_id"]
        assert stored_alert.resolution_notes == "Guardian follow-up completed."


def test_dashboard_overview_accepts_legacy_email_identity(app, client):
    """Legacy JWT email identities should not trigger server errors."""
    headers = _legacy_auth_headers(app, "guardian@example.com")

    response = client.get("/api/dashboard/overview", headers=headers)

    assert response.status_code == 200
    assert response.get_json()["parent"]["email"] == "guardian@example.com"


def test_support_contact_persists_without_claiming_delivery(app, client):
    """Support contact creates a staff-follow-up record rather than fake email output."""
    headers = _auth_headers(app, app.config["guardian_id"])
    response = client.post(
        "/api/support/contact",
        json={
            "category": "account",
            "subject": "Need help with enrollment",
            "message": "Please help me complete the enrollment flow.",
        },
        headers=headers,
    )

    assert response.status_code == 201
    assert response.get_json()["request"]["status"] == "open"
    with app.app_context():
        request_record = SupportRequest.query.one()
        assert request_record.user_id == app.config["guardian_id"]
        assert request_record.message == "Please help me complete the enrollment flow."
