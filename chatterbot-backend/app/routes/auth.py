"""Authentication routes for parent accounts."""
from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
from app import db
from app.models.user import User
from app.models.subscription import Subscription
import re

auth_bp = Blueprint("auth", __name__)


def _get_json_object():
    """Return a JSON object request body, if one was supplied."""
    data = request.get_json(silent=True)
    return data if isinstance(data, dict) else None


@auth_bp.route("/register", methods=["POST"])
def register():
    """Register a new parent account."""
    data = _get_json_object()
    if data is None:
        return jsonify({"error": "Request body must be a JSON object"}), 400

    # Validation
    required = ["email", "password", "first_name", "last_name"]
    for field in required:
        if not isinstance(data.get(field), str) or not data[field].strip():
            return jsonify({"error": f"{field} is required"}), 400

    email = data["email"].strip().lower()
    password = data["password"]
    first_name = data["first_name"].strip()
    last_name = data["last_name"].strip()
    phone = data.get("phone")
    if phone is not None and not isinstance(phone, str):
        return jsonify({"error": "phone must be a string"}), 400

    if len(password) < 8:
        return jsonify({"error": "Password must be at least 8 characters"}), 400

    if not re.match(r"^[^@]+@[^@]+\.[^@]+$", email):
        return jsonify({"error": "Invalid email format"}), 400

    if User.query.filter_by(email=email).first():
        return jsonify({"error": "Email already registered"}), 409

    user = User(
        email=email,
        first_name=first_name,
        last_name=last_name,
        phone=phone.strip() if phone else None,
    )
    user.set_password(password)

    db.session.add(user)
    db.session.commit()

    # Create free subscription record
    sub = Subscription(
        user_id=user.id,
        stripe_customer_id="pending",
        plan_tier="free",
        status="active",
    )
    db.session.add(sub)
    db.session.commit()

    token = create_access_token(identity=str(user.id))

    return jsonify({
        "message": "Registration successful",
        "user": user.to_dict(),
        "access_token": token,
    }), 201


@auth_bp.route("/login", methods=["POST"])
def login():
    """Login and receive JWT token."""
    data = _get_json_object()
    if data is None:
        return jsonify({"error": "Request body must be a JSON object"}), 400

    email = data.get("email", "")
    password = data.get("password", "")

    if not isinstance(email, str) or not isinstance(password, str) or not email.strip() or not password:
        return jsonify({"error": "Email and password are required"}), 400
    email = email.strip().lower()

    user = User.query.filter_by(email=email).first()

    if not user or not user.check_password(password):
        return jsonify({"error": "Invalid credentials"}), 401

    if not user.is_active:
        return jsonify({"error": "Account is deactivated"}), 403

    token = create_access_token(identity=str(user.id))

    return jsonify({
        "message": "Login successful",
        "user": user.to_dict(),
        "access_token": token,
    }), 200


@auth_bp.route("/me", methods=["GET"])
@jwt_required()
def get_current_user():
    """Get current authenticated user."""
    user_id = int(get_jwt_identity())
    user = User.query.get(user_id)

    if not user:
        return jsonify({"error": "User not found"}), 404

    return jsonify({"user": user.to_dict()}), 200


@auth_bp.route("/me", methods=["PUT"])
@jwt_required()
def update_current_user():
    """Update current user profile."""
    user_id = int(get_jwt_identity())
    user = User.query.get(user_id)

    if not user:
        return jsonify({"error": "User not found"}), 404

    data = _get_json_object()
    if data is None:
        return jsonify({"error": "Request body must be a JSON object"}), 400

    if "first_name" in data:
        if not isinstance(data["first_name"], str) or not data["first_name"].strip():
            return jsonify({"error": "first_name must be a non-empty string"}), 400
        user.first_name = data["first_name"].strip()
    if "last_name" in data:
        if not isinstance(data["last_name"], str) or not data["last_name"].strip():
            return jsonify({"error": "last_name must be a non-empty string"}), 400
        user.last_name = data["last_name"].strip()
    if "phone" in data:
        if data["phone"] is not None and not isinstance(data["phone"], str):
            return jsonify({"error": "phone must be a string"}), 400
        user.phone = data["phone"].strip() if data["phone"] else None

    db.session.commit()

    return jsonify({"user": user.to_dict()}), 200


@auth_bp.route("/change-password", methods=["POST"])
@jwt_required()
def change_password():
    """Change user password."""
    user_id = int(get_jwt_identity())
    user = User.query.get(user_id)

    if not user:
        return jsonify({"error": "User not found"}), 404

    data = _get_json_object()
    if data is None:
        return jsonify({"error": "Request body must be a JSON object"}), 400
    current = data.get("current_password", "")
    new = data.get("new_password", "")

    if not isinstance(current, str) or not isinstance(new, str):
        return jsonify({"error": "Passwords must be strings"}), 400

    if not user.check_password(current):
        return jsonify({"error": "Current password is incorrect"}), 401

    if len(new) < 8:
        return jsonify({"error": "New password must be at least 8 characters"}), 400

    user.set_password(new)
    db.session.commit()

    return jsonify({"message": "Password updated successfully"}), 200
