"""SMS webhook and messaging routes."""
from flask import Blueprint, request, jsonify
from flask_jwt_extended import get_jwt_identity, jwt_required
from twilio.request_validator import RequestValidator
from config import settings
from app import db
from app.models.teen import Teen
from app.models.conversation import Conversation, Message
from app.models.crisis_alert import CrisisAlert
from app.services.twilio_service import TwilioService
from app.services.openai_service import OpenAIService
from app.services.crisis_service import CrisisDetectionService
from app.services.context_service import ContextMemoryService
from app.services.scheduler_service import SchedulerService
import logging

sms_bp = Blueprint("sms", __name__)
twilio_svc = TwilioService()
openai_svc = OpenAIService()
crisis_svc = CrisisDetectionService()
context_svc = ContextMemoryService()
scheduler_svc = SchedulerService()

logger = logging.getLogger(__name__)


def _valid_twilio_signature() -> bool:
    """Validate that an inbound SMS request was sent by Twilio."""
    signature = request.headers.get("X-Twilio-Signature")
    if not settings.twilio_auth_token or not signature:
        return False
    return RequestValidator(settings.twilio_auth_token).validate(
        request.url, request.form, signature
    )


def _get_json_object():
    """Return a JSON object request body, if one was supplied."""
    data = request.get_json(silent=True)
    return data if isinstance(data, dict) else None


@sms_bp.route("/webhook", methods=["POST"])
def twilio_webhook():
    """Handle inbound SMS from Twilio."""
    if not _valid_twilio_signature():
        logger.warning("Rejected SMS webhook with an invalid Twilio signature")
        return jsonify({"error": "Invalid Twilio signature"}), 403

    data = request.form.to_dict()
    inbound = twilio_svc.parse_inbound_webhook(data)

    from_number = inbound["from_number"]
    body = inbound["body"]
    message_sid = inbound["message_sid"]

    logger.info(f"Inbound SMS from {from_number}: {body[:50]}...")

    # Find teen by phone
    teen = Teen.query.filter_by(phone=from_number).first()

    if not teen:
        logger.warning(f"No teen found for phone {from_number}")
        # Send welcome message for unknown numbers
        twilio_svc.send_sms(from_number, "Hi! This is Chatterbot. It looks like you\'re not registered yet. Ask your parent to sign up at chatterbot.app")
        return twilio_svc.create_empty_response(), 200

    if not teen.is_active:
        logger.warning(f"Inactive teen {teen.id} attempted to message")
        return twilio_svc.create_empty_response(), 200

    # Update teen stats
    teen.last_interaction_at = db.func.now()
    teen.message_count += 1

    # Get or create active conversation
    conversation = Conversation.query.filter_by(teen_id=teen.id, is_active=True).first()
    if not conversation:
        conversation = Conversation(teen_id=teen.id)
        db.session.add(conversation)
        db.session.commit()

    # Store inbound message
    inbound_msg = Message(
        conversation_id=conversation.id,
        direction="inbound",
        content=body,
        twilio_sid=message_sid,
    )
    db.session.add(inbound_msg)
    db.session.commit()

    # Crisis detection
    crisis_result = crisis_svc.scan_message(body)

    if crisis_result["is_crisis"]:
        inbound_msg.is_crisis_flagged = True
        inbound_msg.crisis_keywords_matched = crisis_result["keywords_matched"]
        db.session.commit()

        # Escalate
        alert = crisis_svc.escalate(teen, inbound_msg, crisis_result)
        conversation.is_crisis_flagged = True
        db.session.commit()

        # Generate crisis-aware response
        conv_history = context_svc.get_conversation_history(teen.id, limit=10)
        context_facts = context_svc.get_context_for_teen(teen.id)

        ai_response = openai_svc.generate_response(
            user_message=body,
            conversation_history=conv_history,
            context_facts=context_facts,
            teen_name=teen.first_name,
            trigger_type="crisis",
        )

        reply_text = ai_response["text"]

        # Send response
        twilio_svc.send_sms(teen.phone, reply_text)

        # Store outbound
        outbound_msg = Message(
            conversation_id=conversation.id,
            direction="outbound",
            content=reply_text,
            is_crisis_flagged=True,
        )
        db.session.add(outbound_msg)
        conversation.last_message_at = db.func.now()
        conversation.message_count += 1
        db.session.commit()

        return twilio_svc.create_empty_response(), 200

    # Normal flow: Generate AI response
    conv_history = context_svc.get_conversation_history(teen.id, limit=10)
    context_facts = context_svc.get_context_for_teen(teen.id)

    ai_response = openai_svc.generate_response(
        user_message=body,
        conversation_history=conv_history,
        context_facts=context_facts,
        teen_name=teen.first_name,
        trigger_type="reactive",
    )

    reply_text = ai_response["text"]

    # Send response
    twilio_svc.send_sms(teen.phone, reply_text)

    # Store outbound
    outbound_msg = Message(
        conversation_id=conversation.id,
        direction="outbound",
        content=reply_text,
    )
    db.session.add(outbound_msg)
    conversation.last_message_at = db.func.now()
    conversation.message_count += 1
    db.session.commit()

    # Extract and store context memories
    context_svc.extract_and_store(teen, inbound_msg)

    # Analyze sentiment
    sentiment = openai_svc.analyze_sentiment(body)
    inbound_msg.sentiment_score = sentiment
    db.session.commit()

    return twilio_svc.create_empty_response(), 200


@sms_bp.route("/send", methods=["POST"])
@jwt_required()
def send_manual_sms():
    """Send a manual message to one of the authenticated parent's teens."""
    user_id = int(get_jwt_identity())
    data = _get_json_object()
    if data is None:
        return jsonify({"error": "Request body must be a JSON object"}), 400
    phone = data.get("phone")
    message = data.get("message")

    if not isinstance(phone, str) or not phone.strip() or not isinstance(message, str) or not message.strip():
        return jsonify({"error": "phone and message are required"}), 400

    teen = Teen.query.filter_by(phone=phone.strip(), parent_id=user_id).first()
    if not teen:
        return jsonify({"error": "Teen not found"}), 404

    result = twilio_svc.send_sms(teen.phone, message.strip())

    if result["success"]:
        return jsonify({"message": "SMS sent", "sid": result["sid"]}), 200
    else:
        return jsonify({"error": "Failed to send SMS", "details": result.get("error")}), 500


@sms_bp.route("/nudge/<int:teen_id>", methods=["POST"])
@jwt_required()
def trigger_nudge(teen_id):
    """Manually trigger a proactive nudge for a teen."""
    user_id = int(get_jwt_identity())
    teen = Teen.query.filter_by(id=teen_id, parent_id=user_id).first()
    if not teen:
        return jsonify({"error": "Teen not found"}), 404

    data = _get_json_object()
    if data is None:
        return jsonify({"error": "Request body must be a JSON object"}), 400
    message = data.get("message", f"Hey {teen.first_name}! Just checking in. How are you doing?")
    if not isinstance(message, str) or not message.strip():
        return jsonify({"error": "message must be a non-empty string"}), 400
    message = message.strip()

    result = twilio_svc.send_proactive_nudge(teen.phone, message)

    if result["success"]:
        # Store as outbound message
        conv = Conversation.query.filter_by(teen_id=teen.id, is_active=True).first()
        if not conv:
            conv = Conversation(teen_id=teen.id)
            db.session.add(conv)
            db.session.commit()

        msg = Message(
            conversation_id=conv.id,
            direction="outbound",
            content=message,
            twilio_sid=result.get("sid"),
        )
        db.session.add(msg)
        conv.last_message_at = db.func.now()
        conv.message_count += 1
        db.session.commit()

        return jsonify({"message": "Nudge sent", "sid": result["sid"]}), 200
    else:
        return jsonify({"error": "Failed to send nudge"}), 500
