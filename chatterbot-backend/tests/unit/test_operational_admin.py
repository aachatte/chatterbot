"""Administrative pilot operations visibility tests."""
import pytest
from flask import Flask

from app import db, limiter
from app.models.operations import OperationalEvent
from app.routes.admin import admin_bp
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
        event = OperationalEvent(
            category="messaging",
            severity="critical",
            source="twilio.delivery_status",
            code="sms_delivery_failed",
            detail={"delivery_id": 42},
        )
        db.session.add(event)
        db.session.commit()
        app.config["event_id"] = event.id
    yield app
    with app.app_context():
        db.session.remove()
        db.drop_all()


def test_operations_summary_requires_admin_and_exposes_safe_signals(app):
    client = app.test_client()
    assert client.get("/api/admin/operations").status_code == 401
    response = client.get(
        "/api/admin/operations",
        headers={"X-Admin-API-Key": "test-admin-key"},
    )
    assert response.status_code == 200
    body = response.get_json()
    assert body["open_critical"] == 1
    assert body["events"][0]["code"] == "sms_delivery_failed"


def test_operator_can_resolve_event_with_attribution(app):
    response = app.test_client().patch(
        f"/api/admin/operations/{app.config['event_id']}/resolve",
        json={"note": "Carrier incident reviewed"},
        headers={
            "X-Admin-API-Key": "test-admin-key",
            "X-Admin-Actor": "Pilot operator",
        },
    )
    assert response.status_code == 200
    event = response.get_json()["event"]
    assert event["status"] == "resolved"
    assert event["detail"]["resolution"]["actor"] == "Pilot operator"
