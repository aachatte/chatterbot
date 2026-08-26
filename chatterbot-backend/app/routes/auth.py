"""Authentication routes for guardian accounts."""
from datetime import timedelta
from flask import Blueprint, jsonify, make_response, request
from flask_jwt_extended import (
    create_access_token,
    create_refresh_token,
    decode_token,
    get_jwt_identity,
    jwt_required,
)

from app import db, limiter
from app.models.user import User

auth_bp = Blueprint("auth", __name__, url_prefix="/api/auth")
bp = auth_bp  # Backward-compatible alias

REFRESH_COOKIE_MAX_AGE = 60 * 60 * 24 * 7  # 7 days
ACCESS_TOKEN_TTL = 60 * 60  # 1 hour
COOKIE_PATH = "/api/auth"
MIN_PASSWORD_LENGTH = 8


def _json_body():
    data = request.get_json(silent=True)
    return data if isinstance(data, dict) else {}


def _set_refresh_cookie(resp, refresh_token):
    is_secure = bool(request.is_secure or request.headers.get("X-Forwarded-Proto") == "https")
    resp.set_cookie(
        "refresh_token",
        refresh_token,
        httponly=True,
        secure=is_secure,
        samesite="Lax",
        max_age=REFRESH_COOKIE_MAX_AGE,
        path=COOKIE_PATH,
    )
    return resp


def _auth_payload(user):
    return {
        "access_token": create_access_token(
            identity=str(user.id),
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

    user = User(
        first_name=first_name,
        last_name=last_name,
        email=email,
        phone=(data.get("phone") or "").strip() or None,
    )
    user.set_password(password)
    db.session.add(user)
    db.session.commit()

    resp = make_response(jsonify(_auth_payload(user)), 201)
    return _set_refresh_cookie(
        resp,
        create_refresh_token(
            identity=str(user.id),
            expires_delta=timedelta(seconds=REFRESH_COOKIE_MAX_AGE),
        ),
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
    if user is None or not user.check_password(password):
        return jsonify({"error": "Invalid credentials"}), 401

    resp = make_response(jsonify(_auth_payload(user)))
    return _set_refresh_cookie(
        resp,
        create_refresh_token(
            identity=str(user.id),
            expires_delta=timedelta(seconds=REFRESH_COOKIE_MAX_AGE),
        ),
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
        resp = make_response(jsonify({"error": "Session expired"}), 401)
        resp.delete_cookie("refresh_token", path=COOKIE_PATH)
        return resp

    user = db.session.get(User, user_id)
    if user is None:
        return jsonify({"error": "Unknown user"}), 401

    resp = make_response(
        jsonify(
            {
                "access_token": create_access_token(
                    identity=str(user.id),
                    expires_delta=timedelta(seconds=ACCESS_TOKEN_TTL),
                ),
                "expires_in": ACCESS_TOKEN_TTL,
            }
        )
    )
    return _set_refresh_cookie(
        resp,
        create_refresh_token(
            identity=str(user.id),
            expires_delta=timedelta(seconds=REFRESH_COOKIE_MAX_AGE),
        ),
    )


@auth_bp.post("/logout")
def logout():
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
    db.session.commit()
    return jsonify({"success": True}), 200
