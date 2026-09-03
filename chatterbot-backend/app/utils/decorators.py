"""Custom Flask decorators."""
from functools import wraps
from flask import jsonify
from flask_jwt_extended import verify_jwt_in_request, get_jwt_identity
from app import db
from app.models.user import User
from app.models.subscription import Subscription


def require_premium(f):
    """Decorator to require active premium subscription."""
    @wraps(f)
    def decorated_function(*args, **kwargs):
        verify_jwt_in_request()
        user_id = int(get_jwt_identity())

        user = db.session.get(User, user_id)
        if not user:
            return jsonify({"error": "User not found"}), 404

        sub = Subscription.query.filter_by(user_id=user_id).order_by(Subscription.created_at.desc()).first()
        if not sub or not sub.is_active() or sub.plan_tier not in ["premium", "family"]:
            return jsonify({"error": "Premium subscription required"}), 403

        return f(*args, **kwargs)
    return decorated_function


def require_active_user(f):
    """Decorator to require active user account."""
    @wraps(f)
    def decorated_function(*args, **kwargs):
        verify_jwt_in_request()
        user_id = int(get_jwt_identity())

        user = db.session.get(User, user_id)
        if not user or not user.is_active:
            return jsonify({"error": "Account is deactivated"}), 403

        return f(*args, **kwargs)
    return decorated_function
