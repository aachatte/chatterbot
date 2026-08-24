"""Authenticated guardian support-contact routes."""
from flask import Blueprint, jsonify, request
from flask_jwt_extended import get_jwt_identity, jwt_required

from app import db
from app.models.support_request import SupportRequest
from app.models.user import User


support_bp = Blueprint("support", __name__)
VALID_CATEGORIES = {"account", "billing", "general", "technical"}
MAX_SUBJECT_LENGTH = 200
MAX_MESSAGE_LENGTH = 4_000


@support_bp.route("/contact", methods=["POST"])
@jwt_required()
def create_support_request():
    """Persist an authenticated guardian's support request for staff follow-up."""
    user_id = int(get_jwt_identity())
    if not db.session.get(User, user_id):
        return jsonify({"error": "User not found"}), 404

    data = request.get_json(silent=True)
    if not isinstance(data, dict):
        return jsonify({"error": "Request body must be a JSON object"}), 400

    category = data.get("category", "general")
    subject = data.get("subject")
    message = data.get("message")
    if category not in VALID_CATEGORIES:
        return jsonify({"error": "category is not supported"}), 400
    if not isinstance(subject, str) or not subject.strip():
        return jsonify({"error": "subject is required"}), 400
    if not isinstance(message, str) or not message.strip():
        return jsonify({"error": "message is required"}), 400

    subject = subject.strip()
    message = message.strip()
    if len(subject) > MAX_SUBJECT_LENGTH:
        return jsonify({
            "error": f"subject must not exceed {MAX_SUBJECT_LENGTH} characters"
        }), 400
    if len(message) > MAX_MESSAGE_LENGTH:
        return jsonify({
            "error": f"message must not exceed {MAX_MESSAGE_LENGTH} characters"
        }), 400

    support_request = SupportRequest(
        user_id=user_id,
        category=category,
        subject=subject,
        message=message,
    )
    db.session.add(support_request)
    db.session.commit()
    return jsonify({
        "request": {
            "id": support_request.id,
            "category": support_request.category,
            "status": support_request.status,
            "created_at": support_request.created_at.isoformat(),
        }
    }), 201
