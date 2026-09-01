"""Guardian Dashboard API routes."""
from datetime import datetime

from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app import db
from app.models.user import User
from app.models.teen import Teen
from app.models.conversation import Conversation, Message
from app.models.crisis_alert import CrisisAlert, CrisisStatus
from app.models.subscription import Subscription
from app.services.crisis_service import CrisisDetectionService
from app.services.twilio_service import TwilioService

dashboard_bp = Blueprint("dashboard", __name__)
MAX_AUDIT_NOTES_LENGTH = 2_000
VALID_NUDGE_FREQUENCIES = {"low", "moderate", "high"}


def _get_json_object():
    """Return a JSON object request body, if one was supplied."""
    data = request.get_json(silent=True)
    return data if isinstance(data, dict) else None


def _get_owned_teen(teen_id, user_id):
    """Fetch a teen only when it belongs to the authenticated guardian."""
    return Teen.query.filter_by(id=teen_id, parent_id=user_id).first()


def _get_authenticated_user_id():
    """Return a normalized guardian user id from the JWT identity."""
    identity = get_jwt_identity()
    if isinstance(identity, int):
        return identity
    if isinstance(identity, str):
        normalized = identity.strip()
        if normalized.isdigit():
            return int(normalized)
        user = User.query.filter_by(email=normalized.lower()).first()
        if user:
            return user.id
    return None


def _get_owned_alert(alert_id, user_id):
    """Fetch an alert only when its teen belongs to the authenticated guardian."""
    return CrisisAlert.query.join(Teen).filter(
        CrisisAlert.id == alert_id,
        Teen.parent_id == user_id,
    ).first()


def _validated_notes(data):
    """Validate optional, bounded audit notes."""
    notes = data.get("notes", "")
    if not isinstance(notes, str):
        return None, "notes must be a string"
    notes = notes.strip()
    if len(notes) > MAX_AUDIT_NOTES_LENGTH:
        return None, f"notes must not exceed {MAX_AUDIT_NOTES_LENGTH} characters"
    return notes, None


@dashboard_bp.route("/overview", methods=["GET"])
@jwt_required()
def dashboard_overview():
    """Get parent dashboard overview."""
    user_id = _get_authenticated_user_id()
    if user_id is None:
        return jsonify({"error": "Invalid authentication token"}), 401
    user = User.query.get(user_id)

    if not user:
        return jsonify({"error": "User not found"}), 404

    # Check subscription
    sub = Subscription.query.filter_by(user_id=user_id).order_by(Subscription.created_at.desc()).first()
    has_premium = sub and sub.is_active() and sub.plan_tier in ["premium", "family"]

    teens = Teen.query.filter_by(parent_id=user_id).all()

    teen_summaries = []
    total_messages = 0
    total_alerts = 0

    for teen in teens:
        summary = teen.to_dashboard_summary()
        teen_summaries.append(summary)
        total_messages += summary["message_count_7d"]
        total_alerts += summary["crisis_alert_count"]

    # Recent alerts
    recent_alerts = CrisisAlert.query.join(Teen).filter(
        Teen.parent_id == user_id,
    ).order_by(CrisisAlert.created_at.desc()).limit(5).all()

    return jsonify({
        "parent": user.to_dict(),
        "subscription": sub.to_dict() if sub else None,
        "has_premium": has_premium,
        "teens": teen_summaries,
        "summary": {
            "teen_count": len(teens),
            "total_messages_7d": total_messages,
            "total_crisis_alerts": total_alerts,
            "active_alerts": sum(
                1
                for a in recent_alerts
                if a.status
                in [
                    CrisisStatus.TRIGGERED.value,
                    CrisisStatus.PARENT_NOTIFIED.value,
                    CrisisStatus.ACKNOWLEDGED.value,
                ]
            ),
        },
        "recent_alerts": [a.to_dict() for a in recent_alerts],
    }), 200


@dashboard_bp.route("/teens", methods=["GET"])
@jwt_required()
def list_teens():
    """List all teens for the parent."""
    user_id = _get_authenticated_user_id()
    if user_id is None:
        return jsonify({"error": "Invalid authentication token"}), 401
    teens = Teen.query.filter_by(parent_id=user_id).all()

    return jsonify({
        "teens": [t.to_dict() for t in teens],
    }), 200


@dashboard_bp.route("/teens", methods=["POST"])
@jwt_required()
def create_teen():
    """Add a new teen to the parent account."""
    user_id = _get_authenticated_user_id()
    if user_id is None:
        return jsonify({"error": "Invalid authentication token"}), 401
    data = _get_json_object()
    if data is None:
        return jsonify({"error": "Request body must be a JSON object"}), 400

    required = ["first_name", "phone"]
    for field in required:
        if not isinstance(data.get(field), str) or not data[field].strip():
            return jsonify({"error": f"{field} is required"}), 400

    if "interests" in data and not isinstance(data["interests"], list):
        return jsonify({"error": "interests must be an array"}), 400
    if "schedule" in data and not isinstance(data["schedule"], dict):
        return jsonify({"error": "schedule must be an object"}), 400

    phone = data["phone"].strip()
    # Check if phone already registered
    if Teen.query.filter_by(phone=phone).first():
        return jsonify({"error": "Phone number already registered"}), 409

    teen = Teen(
        parent_id=user_id,
        first_name=data["first_name"].strip(),
        phone=phone,
        age=data.get("age"),
        grade=data.get("grade"),
        school=data.get("school"),
        interests=data.get("interests", []),
        schedule=data.get("schedule", {}),
    )

    db.session.add(teen)
    db.session.commit()

    # Schedule default nudges
    from app.services.scheduler_service import SchedulerService
    SchedulerService().schedule_default_nudges(teen.id)

    return jsonify({"teen": teen.to_dict()}), 201


@dashboard_bp.route("/teens/<int:teen_id>", methods=["GET"])
@jwt_required()
def get_teen_detail(teen_id):
    """Get detailed info for a specific teen."""
    user_id = _get_authenticated_user_id()
    if user_id is None:
        return jsonify({"error": "Invalid authentication token"}), 401
    teen = _get_owned_teen(teen_id, user_id)

    if not teen:
        return jsonify({"error": "Teen not found"}), 404

    # Get conversation summaries (no raw message content for privacy)
    conversations = Conversation.query.filter_by(teen_id=teen_id).order_by(Conversation.last_message_at.desc()).all()
    conv_summaries = []

    for conv in conversations:
        conv_summaries.append({
            "id": conv.id,
            "started_at": conv.started_at.isoformat() if conv.started_at else None,
            "last_message_at": conv.last_message_at.isoformat() if conv.last_message_at else None,
            "message_count": conv.message_count,
            "is_crisis_flagged": conv.is_crisis_flagged,
        })

    # Get all alerts
    alerts = CrisisAlert.query.filter_by(teen_id=teen_id).order_by(CrisisAlert.created_at.desc()).all()

    return jsonify({
        "teen": teen.to_dict(),
        "dashboard_summary": teen.to_dashboard_summary(),
        "conversations": conv_summaries,
        "alerts": [a.to_dict() for a in alerts],
    }), 200


@dashboard_bp.route("/teens/<int:teen_id>", methods=["PUT"])
@jwt_required()
def update_teen(teen_id):
    """Update teen settings."""
    user_id = _get_authenticated_user_id()
    if user_id is None:
        return jsonify({"error": "Invalid authentication token"}), 401
    teen = _get_owned_teen(teen_id, user_id)

    if not teen:
        return jsonify({"error": "Teen not found"}), 404

    data = _get_json_object()
    if data is None:
        return jsonify({"error": "Request body must be a JSON object"}), 400

    if "interests" in data:
        if not isinstance(data["interests"], list):
            return jsonify({"error": "interests must be an array"}), 400
        teen.interests = data["interests"]
    if "schedule" in data:
        if not isinstance(data["schedule"], dict):
            return jsonify({"error": "schedule must be an object"}), 400
        teen.schedule = data["schedule"]
    if "proactive_nudges_enabled" in data:
        if not isinstance(data["proactive_nudges_enabled"], bool):
            return jsonify({"error": "proactive_nudges_enabled must be a boolean"}), 400
        teen.proactive_nudges_enabled = data["proactive_nudges_enabled"]
    if "nudge_frequency" in data:
        if (
            not isinstance(data["nudge_frequency"], str)
            or data["nudge_frequency"] not in VALID_NUDGE_FREQUENCIES
        ):
            return jsonify({
                "error": "nudge_frequency must be low, moderate, or high"
            }), 400
        teen.nudge_frequency = data["nudge_frequency"]
    if "crisis_keywords_enabled" in data:
        if not isinstance(data["crisis_keywords_enabled"], bool):
            return jsonify({"error": "crisis_keywords_enabled must be a boolean"}), 400
        teen.crisis_keywords_enabled = data["crisis_keywords_enabled"]
    if "is_active" in data:
        if not isinstance(data["is_active"], bool):
            return jsonify({"error": "is_active must be a boolean"}), 400
        teen.is_active = data["is_active"]

    db.session.commit()

    return jsonify({"teen": teen.to_dict()}), 200


@dashboard_bp.route("/teens/<int:teen_id>", methods=["DELETE"])
@jwt_required()
def delete_teen(teen_id):
    """Delete a teen and all associated data (GDPR/COPPA compliance)."""
    user_id = _get_authenticated_user_id()
    if user_id is None:
        return jsonify({"error": "Invalid authentication token"}), 401
    teen = _get_owned_teen(teen_id, user_id)

    if not teen:
        return jsonify({"error": "Teen not found"}), 404

    # Delete all associated data (cascade handles most)
    db.session.delete(teen)
    db.session.commit()

    return jsonify({"message": "Teen and all data deleted successfully"}), 200


@dashboard_bp.route("/alerts", methods=["GET"])
@jwt_required()
def list_alerts():
    """List all crisis alerts for parent\'s teens."""
    user_id = _get_authenticated_user_id()
    if user_id is None:
        return jsonify({"error": "Invalid authentication token"}), 401

    status_filter = request.args.get("status")

    query = CrisisAlert.query.join(Teen).filter(Teen.parent_id == user_id)

    if status_filter:
        query = query.filter(CrisisAlert.status == status_filter)

    alerts = query.order_by(CrisisAlert.created_at.desc()).all()

    return jsonify({"alerts": [a.to_dict() for a in alerts]}), 200


@dashboard_bp.route("/alerts/<int:alert_id>", methods=["GET"])
@jwt_required()
def get_alert_detail(alert_id):
    """Get detailed info for a specific alert."""
    user_id = _get_authenticated_user_id()
    if user_id is None:
        return jsonify({"error": "Invalid authentication token"}), 401

    alert = _get_owned_alert(alert_id, user_id)

    if not alert:
        return jsonify({"error": "Alert not found"}), 404

    return jsonify({"alert": alert.to_dict()}), 200


@dashboard_bp.route("/alerts/<int:alert_id>/resolve", methods=["POST"])
@jwt_required()
def resolve_alert(alert_id):
    """Mark an alert as resolved."""
    user_id = _get_authenticated_user_id()
    if user_id is None:
        return jsonify({"error": "Invalid authentication token"}), 401

    alert = _get_owned_alert(alert_id, user_id)

    if not alert:
        return jsonify({"error": "Alert not found"}), 404

    data = request.get_json(silent=True)
    if data is None and not request.data:
        data = {}
    if not isinstance(data, dict):
        return jsonify({"error": "Request body must be a JSON object"}), 400
    notes, error = _validated_notes(data)
    if error:
        return jsonify({"error": error}), 400

    crisis_svc = CrisisDetectionService()
    success = crisis_svc.resolve_alert(alert_id, user_id, notes)

    if success:
        return jsonify({"message": "Alert resolved"}), 200
    else:
        return jsonify({"error": "Failed to resolve alert"}), 500


@dashboard_bp.route("/teens/<int:teen_id>/enrollment", methods=["GET"])
@jwt_required()
def get_teen_enrollment(teen_id):
    """Get the authenticated guardian's enrollment state for a teen."""
    user_id = _get_authenticated_user_id()
    if user_id is None:
        return jsonify({"error": "Invalid authentication token"}), 401
    teen = _get_owned_teen(teen_id, user_id)
    if not teen:
        return jsonify({"error": "Teen not found"}), 404

    return jsonify({"enrollment": teen.enrollment_to_dict()}), 200


@dashboard_bp.route("/teens/<int:teen_id>/consent", methods=["POST"])
@jwt_required()
def confirm_teen_consent(teen_id):
    """Record an authenticated guardian's explicit enrollment confirmation."""
    user_id = _get_authenticated_user_id()
    if user_id is None:
        return jsonify({"error": "Invalid authentication token"}), 401
    teen = _get_owned_teen(teen_id, user_id)
    if not teen:
        return jsonify({"error": "Teen not found"}), 404

    data = _get_json_object()
    if data is None or data.get("guardian_confirmation") is not True:
        return jsonify({"error": "guardian_confirmation must be true"}), 400

    if not teen.consent_verified:
        teen.consent_verified = True
        teen.consent_verified_at = datetime.utcnow()
        teen.consent_status = "guardian_confirmed"
        db.session.commit()

    return jsonify({"enrollment": teen.enrollment_to_dict()}), 200


@dashboard_bp.route("/teens/<int:teen_id>/phone-verification/request", methods=["POST"])
@dashboard_bp.route("/teens/<int:teen_id>/begin-verification", methods=["POST"])
@jwt_required()
def request_phone_verification(teen_id):
    """Deliver a one-time phone-verification token without exposing it in the API."""
    user_id = _get_authenticated_user_id()
    if user_id is None:
        return jsonify({"error": "Invalid authentication token"}), 401
    teen = _get_owned_teen(teen_id, user_id)
    if not teen:
        return jsonify({"error": "Teen not found"}), 404

    token = teen.begin_phone_verification()
    result = TwilioService().send_sms(
        teen.phone,
        f"Your Chatterbot phone verification code is: {token}",
    )
    if not result["success"]:
        db.session.rollback()
        return jsonify({"error": "Unable to send verification message"}), 503

    db.session.commit()
    return jsonify({
        "enrollment": teen.enrollment_to_dict(),
        "delivery_method": "sms",
    }), 202


@dashboard_bp.route("/teens/<int:teen_id>/phone-verification/confirm", methods=["POST"])
@dashboard_bp.route("/teens/<int:teen_id>/verify-phone", methods=["POST"])
@jwt_required()
def confirm_phone_verification(teen_id):
    """Complete a pending phone verification using a previously delivered token."""
    user_id = _get_authenticated_user_id()
    if user_id is None:
        return jsonify({"error": "Invalid authentication token"}), 401
    teen = _get_owned_teen(teen_id, user_id)
    if not teen:
        return jsonify({"error": "Teen not found"}), 404

    data = _get_json_object()
    token = data.get("token") if data else None
    if not isinstance(token, str) or not 20 <= len(token) <= 200:
        return jsonify({"error": "token must be a valid verification token"}), 400
    if not teen.verify_phone_token(token):
        return jsonify({"error": "Verification token is invalid or expired"}), 400

    db.session.commit()
    return jsonify({"enrollment": teen.enrollment_to_dict()}), 200


@dashboard_bp.route("/teens/<int:teen_id>/preferences", methods=["GET", "PUT"])
@jwt_required()
def teen_preferences(teen_id):
    """Inspect or update safety and proactive messaging preferences for one teen."""
    user_id = _get_authenticated_user_id()
    if user_id is None:
        return jsonify({"error": "Invalid authentication token"}), 401
    teen = _get_owned_teen(teen_id, user_id)
    if not teen:
        return jsonify({"error": "Teen not found"}), 404

    if request.method == "GET":
        return jsonify({"preferences": {
            "proactive_nudges_enabled": teen.proactive_nudges_enabled,
            "nudge_frequency": teen.nudge_frequency,
            "crisis_keywords_enabled": teen.crisis_keywords_enabled,
        }}), 200

    data = _get_json_object()
    if data is None:
        return jsonify({"error": "Request body must be a JSON object"}), 400
    allowed = {
        "proactive_nudges_enabled",
        "nudge_frequency",
        "crisis_keywords_enabled",
    }
    if not data or set(data) - allowed:
        return jsonify({"error": "Provide one or more supported preferences"}), 400
    for field in ("proactive_nudges_enabled", "crisis_keywords_enabled"):
        if field in data and not isinstance(data[field], bool):
            return jsonify({"error": f"{field} must be a boolean"}), 400
    if (
        "nudge_frequency" in data
        and (
            not isinstance(data["nudge_frequency"], str)
            or data["nudge_frequency"] not in VALID_NUDGE_FREQUENCIES
        )
    ):
        return jsonify({"error": "nudge_frequency must be low, moderate, or high"}), 400

    for field in allowed:
        if field in data:
            setattr(teen, field, data[field])
    db.session.commit()
    return jsonify({"preferences": {
        "proactive_nudges_enabled": teen.proactive_nudges_enabled,
        "nudge_frequency": teen.nudge_frequency,
        "crisis_keywords_enabled": teen.crisis_keywords_enabled,
    }}), 200


@dashboard_bp.route("/preferences", methods=["GET", "PUT"])
@jwt_required()
def guardian_preferences():
    """Inspect or update a guardian's crisis-alert delivery preferences."""
    user_id = _get_authenticated_user_id()
    if user_id is None:
        return jsonify({"error": "Invalid authentication token"}), 401
    user = db.session.get(User, user_id)
    if not user:
        return jsonify({"error": "User not found"}), 404

    if request.method == "GET":
        return jsonify({"preferences": {
            "crisis_alerts_enabled": user.crisis_alerts_enabled,
            "crisis_alert_sms_enabled": user.crisis_alert_sms_enabled,
        }}), 200

    data = _get_json_object()
    allowed = {"crisis_alerts_enabled", "crisis_alert_sms_enabled"}
    if data is None or not data or set(data) - allowed:
        return jsonify({"error": "Provide one or more supported preferences"}), 400
    for field in allowed:
        if field in data:
            if not isinstance(data[field], bool):
                return jsonify({"error": f"{field} must be a boolean"}), 400
            setattr(user, field, data[field])
    db.session.commit()

    return jsonify({"preferences": {
        "crisis_alerts_enabled": user.crisis_alerts_enabled,
        "crisis_alert_sms_enabled": user.crisis_alert_sms_enabled,
    }}), 200


@dashboard_bp.route("/alerts/<int:alert_id>/acknowledge", methods=["POST"])
@jwt_required()
def acknowledge_alert(alert_id):
    """Record the owning guardian's acknowledgement of an open alert."""
    user_id = _get_authenticated_user_id()
    if user_id is None:
        return jsonify({"error": "Invalid authentication token"}), 401
    alert = _get_owned_alert(alert_id, user_id)
    if not alert:
        return jsonify({"error": "Alert not found"}), 404
    if alert.status == CrisisStatus.RESOLVED.value:
        return jsonify({"error": "Resolved alerts cannot be acknowledged"}), 409

    data = request.get_json(silent=True)
    if data is None and not request.data:
        data = {}
    if not isinstance(data, dict):
        return jsonify({"error": "Request body must be a JSON object"}), 400
    notes, error = _validated_notes(data)
    if error:
        return jsonify({"error": error}), 400

    if not alert.acknowledged_at:
        alert.acknowledged_at = datetime.utcnow()
        alert.acknowledged_by = user_id
    if notes:
        alert.acknowledgement_notes = notes
    alert.status = CrisisStatus.ACKNOWLEDGED.value
    db.session.commit()
    return jsonify({"alert": alert.to_dict()}), 200
