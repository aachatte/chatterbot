"""Authentication routes for guardian accounts."""
import hashlib
from datetime import datetime, timedelta, timezone
from flask import Blueprint, current_app, jsonify, make_response, request
from flask_jwt_extended import (
    create_access_token,
    create_refresh_token,
    decode_token,
    get_jwt_identity,
    jwt_required,
)

from app import db, limiter
from app.models.user import User
from app.models.operations import PilotControl, PilotEnrollment, RefreshSession
from app.utils.time import utc_now
from config import settings

auth_bp = Blueprint("auth", __name__, url_prefix="/api/auth")
bp = auth_bp  # Backward-compatible alias

REFRESH_COOKIE_MAX_AGE = 60 * 60 * 24 * 7  # 7 days
ACCESS_TOKEN_TTL = 60 * 60  # 1 hour
COOKIE_PATH = "/api/auth"
MIN_PASSWORD_LENGTH = 8


def _jti_hash(jti):
    return hashlib.sha256(jti.encode("utf-8")).hexdigest()


def _issue_refresh_token(user):
    token = create_refresh_token(
        identity=str(user.id),
        additional_claims={"sv": user.session_version or 0},
        expires_delta=timedelta(seconds=REFRESH_COOKIE_MAX_AGE),
    )
    claims = decode_token(token)
    session = RefreshSession(
        user_id=user.id,
        jti_hash=_jti_hash(claims["jti"]),
        expires_at=datetime.fromtimestamp(claims["exp"], timezone.utc).replace(tzinfo=None),
    )
    db.session.add(session)
    return token, session


def _lock_pilot_control():
    control = PilotControl.query.filter_by(key="global").with_for_update().first()
    if control is None:
        control = PilotControl(key="global", enabled=True)
        db.session.add(control)
        db.session.flush()
    return control


def _expired_session_response():
    resp = make_response(jsonify({"error": "Session expired"}), 401)
    resp.delete_cookie("refresh_token", path=COOKIE_PATH)
    return resp


def _json_body():
    data = request.get_json(silent=True)
    return data if isinstance(data, dict) else {}


def _set_refresh_cookie(resp, refresh_token):
    secure_cookie = bool(current_app.config.get("SESSION_COOKIE_SECURE", True))
    resp.set_cookie(
        "refresh_token",
        refresh_token,
        httponly=True,
        secure=secure_cookie,
        samesite="Lax",
        max_age=REFRESH_COOKIE_MAX_AGE,
        path=COOKIE_PATH,
    )
    return resp


def _auth_payload(user):
    return {
        "access_token": create_access_token(
            identity=str(user.id),
            additional_claims={"sv": user.session_version or 0},
            expires_delta=timedelta(seconds=ACCESS_TOKEN_TTL),
        ),
        "expires_in": ACCESS_TOKEN_TTL,
        "token_type": "Bearer",
        "user": user.to_dict(),
    }


@auth_bp.post("/register")
@limiter.limit("5 per minute")
def register():
    data = _json_body()
    first_name = (data.get("first_name") or "").strip()
    last_name = (data.get("last_name") or "").strip()
    email = (data.get("email") or "").strip().lower()
    password = data.get("password") or ""

    if not first_name or not last_name or not email or not password:
        return jsonify({"error": "first_name, last_name, email, and password are required"}), 400
    if len(password) < MIN_PASSWORD_LENGTH:
        return jsonify({"error": f"password must be at least {MIN_PASSWORD_LENGTH} characters"}), 400
    if User.query.filter_by(email=email).first():
        return jsonify({"error": "Email already registered"}), 409
    if settings.pilot_mode:
        pilot_control = _lock_pilot_control()
        if not pilot_control.enabled:
            return jsonify({"error": "The family pilot is temporarily paused"}), 503
        if PilotEnrollment.query.count() >= settings.pilot_family_capacity:
            return jsonify({
                "error": "The current family pilot is full",
                "pilot_capacity": settings.pilot_family_capacity,
            }), 503

    user = User(
        first_name=first_name,
        last_name=last_name,
        email=email,
        phone=(data.get("phone") or "").strip() or None,
    )
    user.set_password(password)
    db.session.add(user)
    db.session.flush()
    if settings.pilot_mode:
        db.session.add(PilotEnrollment(guardian_id=user.id))
    refresh_token, _ = _issue_refresh_token(user)
    db.session.commit()

    resp = make_response(jsonify(_auth_payload(user)), 201)
    return _set_refresh_cookie(
        resp,
        refresh_token,
    )


@auth_bp.post("/login")
@limiter.limit("5 per minute")
def login():
    data = _json_body()
    email = (data.get("email") or "").strip().lower()
    password = data.get("password") or ""
    if not email or not password:
        return jsonify({"error": "Email and password are required"}), 400

    user = User.query.filter_by(email=email).first()
    if user is None or not user.is_active or not user.check_password(password):
        return jsonify({"error": "Invalid credentials"}), 401

    refresh_token, _ = _issue_refresh_token(user)
    db.session.commit()
    resp = make_response(jsonify(_auth_payload(user)))
    return _set_refresh_cookie(
        resp,
        refresh_token,
    )


@auth_bp.post("/refresh")
@limiter.limit("10 per minute")
def refresh():
    raw = request.cookies.get("refresh_token")
    if not raw:
        return jsonify({"error": "Missing refresh token"}), 401

    try:
        claims = decode_token(raw)
        if claims.get("type") != "refresh":
            raise ValueError("invalid token type")
        user_id = int(claims["sub"])
    except Exception:
        return _expired_session_response()

    user = db.session.get(User, user_id)
    session = RefreshSession.query.filter_by(
        jti_hash=_jti_hash(claims["jti"]),
        user_id=user_id,
    ).with_for_update().first()
    if (
        user is None
        or not user.is_active
        or claims.get("sv") != (user.session_version or 0)
        or session is None
        or session.revoked_at is not None
        or session.expires_at <= utc_now()
    ):
        return _expired_session_response()

    session.revoked_at = utc_now()
    refresh_token, replacement = _issue_refresh_token(user)
    db.session.flush()
    session.replaced_by_jti_hash = replacement.jti_hash

    resp = make_response(
        jsonify(
            {
                "access_token": create_access_token(
                    identity=str(user.id),
                    additional_claims={"sv": user.session_version or 0},
                    expires_delta=timedelta(seconds=ACCESS_TOKEN_TTL),
                ),
                "expires_in": ACCESS_TOKEN_TTL,
            }
        )
    )
    db.session.commit()
    return _set_refresh_cookie(resp, refresh_token)


@auth_bp.post("/logout")
@jwt_required()
def logout():
    raw = request.cookies.get("refresh_token")
    if raw:
        try:
            claims = decode_token(raw)
            if claims.get("type") == "refresh" and claims.get("jti"):
                session = RefreshSession.query.filter_by(
                    jti_hash=_jti_hash(claims["jti"])
                ).first()
                if session:
                    session.revoked_at = utc_now()
        except Exception:
            pass
    user = db.session.get(User, int(get_jwt_identity()))
    if user:
        user.session_version = (user.session_version or 0) + 1
    db.session.commit()
    resp = make_response(jsonify({"success": True}))
    resp.delete_cookie("refresh_token", path=COOKIE_PATH)
    return resp


@auth_bp.get("/me")
@jwt_required()
def get_me():
    user = db.session.get(User, int(get_jwt_identity()))
    if user is None:
        return jsonify({"error": "User not found"}), 404
    return jsonify({"user": user.to_dict()}), 200


@auth_bp.put("/me")
@jwt_required()
def update_me():
    user = db.session.get(User, int(get_jwt_identity()))
    if user is None:
        return jsonify({"error": "User not found"}), 404

    data = _json_body()
    for field in ("first_name", "last_name", "phone"):
        if field in data:
            value = data.get(field)
            if value is not None and not isinstance(value, str):
                return jsonify({"error": f"{field} must be a string"}), 400
            setattr(user, field, value.strip() if isinstance(value, str) else None)
    db.session.commit()
    return jsonify({"user": user.to_dict()}), 200


@auth_bp.post("/change-password")
@jwt_required()
def change_password():
    user = db.session.get(User, int(get_jwt_identity()))
    if user is None:
        return jsonify({"error": "User not found"}), 404

    data = _json_body()
    current_password = data.get("current_password") or ""
    new_password = data.get("new_password") or ""
    if not current_password or not new_password:
        return jsonify({"error": "current_password and new_password are required"}), 400
    if len(new_password) < MIN_PASSWORD_LENGTH:
        return jsonify({"error": f"new_password must be at least {MIN_PASSWORD_LENGTH} characters"}), 400
    if not user.check_password(current_password):
        return jsonify({"error": "Current password is incorrect"}), 401

    user.set_password(new_password)
    user.session_version = (user.session_version or 0) + 1
    db.session.commit()
    return jsonify({"success": True}), 200
