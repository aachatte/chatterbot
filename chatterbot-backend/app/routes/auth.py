import datetime as dt

from flask import Blueprint, current_app, jsonify, make_response, request
from flask_login import current_user, login_required

from app import db, limiter
from app.models import User
from app.utils.auth_tokens import (
    TokenError,
    create_access_token,
    create_refresh_token,
    revoke_refresh_token,
    verify_refresh_token,
)
from app.utils.errors import UnauthorizedError, ValidationError
from werkzeug.security import check_password_hash

bp = Blueprint("auth", __name__, url_prefix="/api/auth")

REFRESH_COOKIE_MAX_AGE = 60 * 60 * 24 * 7  # 7 days
ACCESS_TOKEN_TTL = 60 * 60  # 1 hour access token
COOKIE_PATH = "/api/auth"


def _set_refresh_cookie(resp, refresh_token):
    resp.set_cookie(
        "refresh_token",
        refresh_token,
        httponly=True,
        secure=True,
        samesite="Lax",
        max_age=REFRESH_COOKIE_MAX_AGE,
        path=COOKIE_PATH,
    )
    return resp


@bp.post("/login")
@limiter.limit("5 per minute")
def login():
    data = request.get_json(silent=True) or {}
    email = data.get("email")
    password = data.get("password")
    if not email or not password:
        raise ValidationError("Email and password are required")

    user = User.query.filter_by(email=email.lower()).first()
    # Same response regardless of which factor failed.
    if user is None or not check_password_hash(user.password_hash, password):
        current_app.logger.warning("Failed login", extra={"ip": request.remote_addr})
        raise UnauthorizedError("Invalid credentials")

    user.last_login_at = dt.datetime.utcnow()
    db.session.commit()

    resp = make_response(
        jsonify(
            {
                "access_token": create_access_token(user, ttl=ACCESS_TOKEN_TTL),
                "expires_in": ACCESS_TOKEN_TTL,
                "token_type": "Bearer",
                "user": user.to_dict(),
            }
        )
    )
    return _set_refresh_cookie(resp, create_refresh_token(user, ttl=REFRESH_COOKIE_MAX_AGE))


@bp.post("/refresh")
@limiter.limit("10 per minute")
def refresh():
    """Silent refresh - reads httpOnly cookie, returns a new access token."""
    raw = request.cookies.get("refresh_token")
    if not raw:
        raise UnauthorizedError("Missing refresh token")

    try:
        user_id = verify_refresh_token(raw)
    except TokenError:
        resp = make_response(jsonify({"error": "Session expired"}), 401)
        resp.delete_cookie("refresh_token", path=COOKIE_PATH)
        return resp

    user = db.session.get(User, user_id)
    if user is None:
        raise UnauthorizedError("Unknown user")

    resp = make_response(
        jsonify(
            {
                "access_token": create_access_token(user, ttl=ACCESS_TOKEN_TTL),
                "expires_in": ACCESS_TOKEN_TTL,
            }
        )
    )
    # Rotate on every use (detects replay/theft via revocation store).
    return _set_refresh_cookie(resp, create_refresh_token(user, ttl=REFRESH_COOKIE_MAX_AGE))


@bp.post("/logout")
@login_required
def logout():
    revoke_refresh_token(request.cookies.get("refresh_token"))
    resp = make_response(jsonify({"success": True}))
    resp.delete_cookie("refresh_token", path=COOKIE_PATH)
    return resp
