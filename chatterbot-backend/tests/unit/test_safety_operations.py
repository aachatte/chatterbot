"""Safety plan, workflow audit, and delivery evidence tests."""
import pytest
from flask import Flask
from flask_jwt_extended import JWTManager, create_access_token

from app import db
from app.models.crisis_alert import CrisisAlert
from app.models.safety_operations import (
    FamilySafetyPlan,
    NotificationDelivery,
    SafetyAlertEvent,
)
from app.models.teen import Teen
from app.models.user import User
from app.routes.dashboard import dashboard_bp
from app.routes.safety_plan import safety_plan_bp, teen_visible_summary
from app.routes.sms import sms_bp


@pytest.fixture()
def app(monkeypatch):
    app = Flask(__name__)
    app.config.update(
        TESTING=True,
        SQLALCHEMY_DATABASE_URI="sqlite://",
        SQLALCHEMY_TRACK_MODIFICATIONS=False,
        JWT_SECRET_KEY="safety-operations-secret-at-least-32-characters",
    )
    db.init_app(app)
    JWTManager(app)
    app.register_blueprint(dashboard_bp, url_prefix="/api/dashboard")
    app.register_blueprint(safety_plan_bp, url_prefix="/api/safety-plans")
    app.register_blueprint(sms_bp, url_prefix="/api/sms")
    monkeypatch.setattr("app.routes.sms._valid_twilio_signature", lambda: True)

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
            phone_verification_status="verified",
        )
        db.session.add(teen)
        db.session.flush()
        alert = CrisisAlert(
            teen_id=teen.id,
            severity="critical",
            status="triggered",
            categories=["self_harm"],
        )
        db.session.add(alert)
        db.session.commit()
        app.config.update(
            guardian_id=guardian.id,
            teen_id=teen.id,
            alert_id=alert.id,
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


def test_family_plan_is_server_backed_versioned_and_teen_visible(app, client):
    url = f"/api/safety-plans/{app.config['teen_id']}"
    response = client.put(
        url,
        json={
            "is_active": True,
            "plan": {
                "checkInTime": "4:00 PM",
                "tone": "Calm and direct",
                "localInstructions": "Go to the kitchen and call Alex.",
            },
        },
        headers=_headers(app),
    )
    assert response.status_code == 200
    assert response.get_json()["safety_plan"]["version"] == 1
    assert response.get_json()["safety_plan"]["is_active"] is True

    second = client.put(
        url,
        json={"is_active": True, "plan": {"checkInTime": "6:30 PM"}},
        headers=_headers(app),
    )
    assert second.get_json()["safety_plan"]["version"] == 2
    with app.app_context():
        assert FamilySafetyPlan.query.count() == 1
        teen = db.session.get(Teen, app.config["teen_id"])
        summary = teen_visible_summary(teen)
        assert "Alex" in summary
        assert "Routine conversation text is not shared" in summary


def test_plan_activation_requires_a_reachable_adult(app, client):
    with app.app_context():
        guardian = db.session.get(User, app.config["guardian_id"])
        guardian.phone = None
        db.session.commit()
    response = client.put(
        f"/api/safety-plans/{app.config['teen_id']}",
        json={"is_active": True, "plan": {"tone": "Encouraging"}},
        headers=_headers(app),
    )
    assert response.status_code == 409


def test_guardian_owner_change_is_persisted_and_audited(app, client):
    response = client.patch(
        f"/api/dashboard/alerts/{app.config['alert_id']}/workflow",
        json={"assigned_to": "primary_guardian"},
        headers=_headers(app),
    )
    assert response.status_code == 200
    assert response.get_json()["alert"]["assigned_to"] == "primary_guardian"
    with app.app_context():
        event = SafetyAlertEvent.query.one()
        assert event.action == "owner_changed"


def test_delivery_callback_records_final_evidence(app, client):
    with app.app_context():
        delivery = NotificationDelivery(
            alert_id=app.config["alert_id"],
            recipient_type="guardian",
            recipient_id=app.config["guardian_id"],
            recipient_name="Alex",
            provider_sid="SM-delivery",
            status="sent",
        )
        db.session.add(delivery)
        db.session.commit()
    response = client.post(
        "/api/sms/delivery-status",
        data={"MessageSid": "SM-delivery", "MessageStatus": "delivered"},
    )
    assert response.status_code == 200
    retry = client.post(
        "/api/sms/delivery-status",
        data={"MessageSid": "SM-delivery", "MessageStatus": "delivered"},
    )
    assert retry.status_code == 200
    with app.app_context():
        stored = NotificationDelivery.query.one()
        assert stored.status == "delivered"
        assert stored.delivered_at is not None
        assert SafetyAlertEvent.query.filter_by(action="notification_delivered").count() == 1
