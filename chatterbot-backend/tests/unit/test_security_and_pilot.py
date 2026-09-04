"""Durable sessions, pilot controls, and readiness tests."""
from datetime import timedelta

import pytest
from flask import Flask
from flask_jwt_extended import JWTManager

from app import db, limiter
from app.models.operations import PilotEnrollment, RefreshSession
from app.models.safety_operations import FamilySafetyPlan
from app.models.teen import Teen
from app.models.user import User
from app.routes.auth import auth_bp
from app.services.pilot_service import (
    get_pilot_control,
    pilot_allows_guardian,
    refresh_pilot_enrollment,
)
from app.services.privacy_service import run_privacy_jobs
from app.services.readiness_service import readiness_report
from app.services.security_service import apply_security_headers, assign_request_id
from app.utils.time import utc_now
from config import settings


@pytest.fixture()
def app(monkeypatch):
    monkeypatch.setattr(settings, "pilot_mode", False)
    app = Flask(__name__)
    app.config.update(
        TESTING=True,
        RATELIMIT_ENABLED=False,
        SQLALCHEMY_DATABASE_URI="sqlite://",
        SQLALCHEMY_TRACK_MODIFICATIONS=False,
        JWT_SECRET_KEY="security-test-secret-at-least-32-characters",
        SESSION_COOKIE_SECURE=False,
    )
    db.init_app(app)
    jwt = JWTManager(app)

    @jwt.token_in_blocklist_loader
    def token_is_invalid(_header, payload):
        user = db.session.get(User, int(payload["sub"]))
        return user is None or payload.get("sv") != (user.session_version or 0)
    limiter.init_app(app)
    app.register_blueprint(auth_bp)
    with app.app_context():
        db.create_all()
    yield app
    with app.app_context():
        db.session.remove()
        db.drop_all()


def test_refresh_rotation_rejects_replayed_session(app):
    client = app.test_client()
    registered = client.post("/api/auth/register", json={
        "first_name": "Alex",
        "last_name": "Rivera",
        "email": "alex@example.com",
        "password": "strong-password",
    })
    assert registered.status_code == 201
    original_cookie = client.get_cookie("refresh_token", path="/api/auth").value

    refreshed = client.post("/api/auth/refresh")
    assert refreshed.status_code == 200
    assert client.get_cookie("refresh_token", path="/api/auth").value != original_cookie

    replay = app.test_client()
    replay.set_cookie("refresh_token", original_cookie, domain="localhost", path="/api/auth")
    rejected = replay.post("/api/auth/refresh")
    assert rejected.status_code == 401
    with app.app_context():
        sessions = RefreshSession.query.order_by(RefreshSession.created_at.asc()).all()
        assert len(sessions) == 2
        assert sessions[0].revoked_at is not None
        assert sessions[0].replaced_by_jti_hash == sessions[1].jti_hash


def test_logout_invalidates_existing_access_token(app):
    client = app.test_client()
    registered = client.post("/api/auth/register", json={
        "first_name": "Alex",
        "last_name": "Rivera",
        "email": "logout@example.com",
        "password": "strong-password",
    })
    token = registered.get_json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}
    assert client.get("/api/auth/me", headers=headers).status_code == 200
    assert client.post("/api/auth/logout", headers=headers).status_code == 200
    assert client.get("/api/auth/me", headers=headers).status_code == 401


def test_pilot_requires_complete_setup_and_honors_global_pause(app, monkeypatch):
    monkeypatch.setattr(settings, "pilot_mode", True)
    with app.app_context():
        guardian = User(
            first_name="Alex",
            last_name="Rivera",
            email="pilot@example.com",
            password_hash="unused",
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
        db.session.add(FamilySafetyPlan(
            guardian_id=guardian.id,
            teen_id=teen.id,
            plan_data={},
            is_active=True,
        ))
        db.session.flush()
        enrollment = refresh_pilot_enrollment(guardian.id)
        db.session.commit()
        assert enrollment.status == "ready"
        assert pilot_allows_guardian(guardian.id) is True

        control = get_pilot_control()
        control.enabled = False
        refresh_pilot_enrollment(guardian.id)
        db.session.commit()
        assert PilotEnrollment.query.one().status == "paused"
        assert pilot_allows_guardian(guardian.id) is False


def test_readiness_requires_fresh_privacy_job_heartbeat(app):
    with app.app_context():
        stale = readiness_report(check_migration=False, check_redis=False)
        assert stale["ready"] is False
        assert stale["checks"]["privacy_jobs"]["ok"] is False
        run_privacy_jobs(now=utc_now() - timedelta(hours=1))
        ready = readiness_report(check_migration=False, check_redis=False)
        assert ready["ready"] is True


def test_security_headers_and_request_id_are_applied():
    secured = Flask(__name__)
    secured.before_request(assign_request_id)
    secured.after_request(lambda response: apply_security_headers(response, production=True))

    @secured.get("/probe")
    def probe():
        return {"ok": True}

    response = secured.test_client().get(
        "/probe", headers={"X-Request-ID": "request_12345678"}
    )
    assert response.headers["X-Request-ID"] == "request_12345678"
    assert response.headers["X-Content-Type-Options"] == "nosniff"
    assert response.headers["X-Frame-Options"] == "DENY"
    assert "max-age=31536000" in response.headers["Strict-Transport-Security"]
