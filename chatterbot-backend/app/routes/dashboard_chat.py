from flask import Blueprint, request, jsonify
from app.services.openai_service import OpenAIService

dashboard_chat_bp = Blueprint('dashboard_chat', __name__)
ai_service = OpenAIService()

@dashboard_chat_bp.route('/', methods=['POST'])
def chat_with_bot():
    data = request.json
    user_message = data.get('message')
    
    if not user_message:
        return jsonify({"error": "Message is required"}), 400

    reply = ai_service.generate_parent_reply(user_message)
    
    return jsonify({"reply": reply}), 200
