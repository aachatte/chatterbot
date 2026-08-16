"""Authentication routes for parent accounts."""
from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
from app import db
from app.models.user import User
from app.models.subscription import Subscription
import re

auth_bp = Blueprint("auth", __name__)


@auth_bp.route("/register", methods=["POST"])
def register():
    """Register a new parent account."""
    data = request.get_json()

    # Validation
    required = ["email", "password", "first_name", "last_name"]
    for field in required:
        if not data.get(field):
            return jsonify({"error": f"{field} is required"}), 400

    if len(data["password"]) < 8:
        return jsonify({"error": "Password must be at least 8 characters"}), 400

    if not re.match(r"^[^@]+@[^@]+\.[^@]+$", data["email"]):
        return jsonify({"error": "Invalid email format"}), 400

    if User.query.filter_by(email=data["email"].lower()).first():
        return jsonify({"error": "Email already registered"}), 409

    user = User(
        email=data["email"].lower(),
        first_name=data["first_name"],
        last_name=data["last_name"],
        phone=data.get("phone"),
    )
    user.set_password(data["password"])

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
    data = request.get_json()

    email = data.get("email", "").lower()
    password = data.get("password", "")

    if not email or not password:
        return jsonify({"error": "Email and password are required"}), 400

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

    data = request.get_json()

    if "first_name" in data:
        user.first_name = data["first_name"]
    if "last_name" in data:
        user.last_name = data["last_name"]
    if "phone" in data:
        user.phone = data["phone"]

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

    data = request.get_json()
    current = data.get("current_password", "")
    new = data.get("new_password", "")

    if not user.check_password(current):
        return jsonify({"error": "Current password is incorrect"}), 401

    if len(new) < 8:
        return jsonify({"error": "New password must be at least 8 characters"}), 400

    user.set_password(new)
    db.session.commit()

    return jsonify({"message": "Password updated successfully"}), 200
