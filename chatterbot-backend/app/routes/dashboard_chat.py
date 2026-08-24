from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required
from app.services.openai_service import OpenAIService

dashboard_chat_bp = Blueprint('dashboard_chat', __name__)
ai_service = OpenAIService()
MAX_MESSAGE_LENGTH = 4_000


@dashboard_chat_bp.route("", methods=["POST"])
@dashboard_chat_bp.route("/", methods=["POST"])
@jwt_required()
def chat_with_bot():
    """Generate an authenticated parent's dashboard-assistant response."""
    data = request.get_json(silent=True)
    if not isinstance(data, dict):
        return jsonify({"error": "Request body must be a JSON object"}), 400

    user_message = data.get("message")
    if not isinstance(user_message, str):
        return jsonify({"error": "Message must be a string"}), 400

    user_message = user_message.strip()
    if not user_message:
        return jsonify({"error": "Message is required"}), 400
    if len(user_message) > MAX_MESSAGE_LENGTH:
        return jsonify({
            "error": f"Message must not exceed {MAX_MESSAGE_LENGTH} characters"
        }), 400

    reply = ai_service.generate_parent_reply(user_message)

    return jsonify({"reply": reply}), 200
