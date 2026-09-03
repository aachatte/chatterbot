"""Gamification routes."""
import hmac
from datetime import timedelta

from flask import Blueprint, jsonify, request
from flask_jwt_extended import get_jwt_identity, jwt_required

from app import db
from app.models.gamification import PointTransaction
from app.models.user import User
from app.utils.time import utc_now
from config import settings

gam_bp = Blueprint("gamification", __name__)


def _is_admin_request() -> bool:
    admin_key = request.headers.get("X-Admin-API-Key", "")
    return bool(settings.admin_api_key) and hmac.compare_digest(
        admin_key, settings.admin_api_key
    )


def _get_current_user():
    user_id = int(get_jwt_identity())
    return db.session.get(User, user_id)


def _feature_enabled_for(user: User) -> bool:
    return bool(settings.enable_gamification and user and user.gamification_enabled)


def _badges_payload(user: User):
    return [
        {
            "code": badge.code,
            "name": badge.name,
            "description": badge.description,
            "icon": badge.icon,
        }
        for badge in user.badges.order_by("id").all()
    ]


@gam_bp.route("/me", methods=["GET"])
@jwt_required()
def my_gamification():
    user = _get_current_user()
    if not user:
        return jsonify({"error": "User not found"}), 404

    return jsonify(
        {
            "points": user.points or 0,
            "level": user.level or 1,
            "streak_count": user.streak_count or 0,
            "badges": _badges_payload(user),
            "gamification_enabled": bool(user.gamification_enabled),
        }
    )


@gam_bp.route("/award-login", methods=["POST"])
@jwt_required()
def award_login():
    user = _get_current_user()
    if not user:
        return jsonify({"error": "User not found"}), 404
    if not _feature_enabled_for(user):
        return jsonify({"message": "Gamification is disabled for this account"}), 403

    now = utc_now()
    today = now.date()
    last_login_date = user.last_login_at.date() if user.last_login_at else None

    if last_login_date == today:
        return jsonify(
            {
                "message": "Daily login reward already claimed",
                "points": user.points or 0,
                "level": user.level or 1,
                "streak_count": user.streak_count or 0,
            }
        ), 200

    if last_login_date == (today - timedelta(days=1)):
        user.streak_count = (user.streak_count or 0) + 1
    else:
        user.streak_count = 1

    amount = 10 + min(user.streak_count, 7)
    user.award_points(amount)
    user.last_login_at = now
    db.session.add(
        PointTransaction(
            user_id=user.id,
            amount=amount,
            reason="daily_login",
            meta={"streak_count": user.streak_count},
        )
    )
    db.session.commit()

    return jsonify(
        {
            "message": "Daily login reward claimed",
            "awarded": amount,
            "points": user.points,
            "level": user.level,
            "streak_count": user.streak_count,
        }
    ), 200


@gam_bp.route("/award", methods=["POST"])
@jwt_required()
def admin_award_points():
    if not _is_admin_request():
        return jsonify({"error": "Unauthorized"}), 401
    if not settings.enable_gamification:
        return jsonify({"error": "Gamification is disabled"}), 503

    payload = request.get_json(silent=True)
    if not isinstance(payload, dict):
        return jsonify({"error": "Request body must be a JSON object"}), 400

    user_id = payload.get("user_id")
    amount = payload.get("amount")
    reason = (payload.get("reason") or "").strip()
    meta = payload.get("metadata")

    if not isinstance(user_id, int):
        return jsonify({"error": "user_id must be an integer"}), 400
    if not isinstance(amount, int):
        return jsonify({"error": "amount must be an integer"}), 400
    if not reason:
        return jsonify({"error": "reason is required"}), 400
    if meta is not None and not isinstance(meta, dict):
        return jsonify({"error": "metadata must be an object"}), 400

    user = db.session.get(User, user_id)
    if not user:
        return jsonify({"error": "User not found"}), 404
    if not user.gamification_enabled:
        return jsonify({"message": "Gamification is disabled for this account"}), 403

    user.award_points(amount)
    db.session.add(
        PointTransaction(
            user_id=user.id,
            amount=amount,
            reason=reason,
            meta=meta or {},
        )
    )
    db.session.commit()

    return jsonify({"user_id": user.id, "points": user.points, "level": user.level}), 200


@gam_bp.route("/transactions", methods=["GET"])
@jwt_required()
def list_transactions():
    user = _get_current_user()
    if not user:
        return jsonify({"error": "User not found"}), 404

    txs = (
        PointTransaction.query.filter_by(user_id=user.id)
        .order_by(PointTransaction.created_at.desc())
        .limit(100)
        .all()
    )
    return jsonify(
        [
            {
                "id": t.id,
                "amount": t.amount,
                "reason": t.reason,
                "metadata": t.meta or {},
                "created_at": t.created_at.isoformat() if t.created_at else None,
            }
            for t in txs
        ]
    )


@gam_bp.route("/preferences", methods=["GET", "POST"])
@jwt_required()
def gamification_preferences():
    """Get or set user-level gamification preference (opt-out/opt-in)."""
    user = _get_current_user()
    if not user:
        return jsonify({"error": "User not found"}), 404

    if request.method == "GET":
        return jsonify({"gamification_enabled": bool(user.gamification_enabled)})

    payload = request.get_json(silent=True)
    if not isinstance(payload, dict):
        return jsonify({"error": "Request body must be a JSON object"}), 400

    val = payload.get("gamification_enabled")
    if not isinstance(val, bool):
        return jsonify({"error": "gamification_enabled must be a boolean"}), 400

    user.gamification_enabled = val
    db.session.commit()
    return jsonify(
        {
            "message": "Preference updated",
            "gamification_enabled": user.gamification_enabled,
        }
    )
