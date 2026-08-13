"""Guardian Dashboard API routes."""
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app import db
from app.models.user import User
from app.models.teen import Teen
from app.models.conversation import Conversation, Message
from app.models.crisis_alert import CrisisAlert
from app.models.subscription import Subscription
from app.services.crisis_service import CrisisDetectionService

dashboard_bp = Blueprint("dashboard", __name__)


@dashboard_bp.route("/overview", methods=["GET"])
@jwt_required()
def dashboard_overview():
    """Get parent dashboard overview."""
    user_id = int(get_jwt_identity())
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
            "active_alerts": sum(1 for a in recent_alerts if a.status in ["triggered", "parent_notified"]),
        },
        "recent_alerts": [a.to_dict() for a in recent_alerts],
    }), 200


@dashboard_bp.route("/teens", methods=["GET"])
@jwt_required()
def list_teens():
    """List all teens for the parent."""
    user_id = int(get_jwt_identity())
    teens = Teen.query.filter_by(parent_id=user_id).all()

    return jsonify({
        "teens": [t.to_dict() for t in teens],
    }), 200


@dashboard_bp.route("/teens", methods=["POST"])
@jwt_required()
def create_teen():
    """Add a new teen to the parent account."""
    user_id = int(get_jwt_identity())
    data = request.get_json()

    required = ["first_name", "phone"]
    for field in required:
        if not data.get(field):
            return jsonify({"error": f"{field} is required"}), 400

    # Check if phone already registered
    if Teen.query.filter_by(phone=data["phone"]).first():
        return jsonify({"error": "Phone number already registered"}), 409

    teen = Teen(
        parent_id=user_id,
        first_name=data["first_name"],
        phone=data["phone"],
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
    user_id = int(get_jwt_identity())
    teen = Teen.query.filter_by(id=teen_id, parent_id=user_id).first()

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
    user_id = int(get_jwt_identity())
    teen = Teen.query.filter_by(id=teen_id, parent_id=user_id).first()

    if not teen:
        return jsonify({"error": "Teen not found"}), 404

    data = request.get_json()

    if "interests" in data:
        teen.interests = data["interests"]
    if "schedule" in data:
        teen.schedule = data["schedule"]
    if "proactive_nudges_enabled" in data:
        teen.proactive_nudges_enabled = data["proactive_nudges_enabled"]
    if "nudge_frequency" in data:
        teen.nudge_frequency = data["nudge_frequency"]
    if "crisis_keywords_enabled" in data:
        teen.crisis_keywords_enabled = data["crisis_keywords_enabled"]
    if "is_active" in data:
        teen.is_active = data["is_active"]

    db.session.commit()

    return jsonify({"teen": teen.to_dict()}), 200


@dashboard_bp.route("/teens/<int:teen_id>", methods=["DELETE"])
@jwt_required()
def delete_teen(teen_id):
    """Delete a teen and all associated data (GDPR/COPPA compliance)."""
    user_id = int(get_jwt_identity())
    teen = Teen.query.filter_by(id=teen_id, parent_id=user_id).first()

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
    user_id = int(get_jwt_identity())

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
    user_id = int(get_jwt_identity())

    alert = CrisisAlert.query.join(Teen).filter(
        CrisisAlert.id == alert_id,
        Teen.parent_id == user_id,
    ).first()

    if not alert:
        return jsonify({"error": "Alert not found"}), 404

    return jsonify({"alert": alert.to_dict()}), 200


@dashboard_bp.route("/alerts/<int:alert_id>/resolve", methods=["POST"])
@jwt_required()
def resolve_alert(alert_id):
    """Mark an alert as resolved."""
    user_id = int(get_jwt_identity())

    alert = CrisisAlert.query.join(Teen).filter(
        CrisisAlert.id == alert_id,
        Teen.parent_id == user_id,
    ).first()

    if not alert:
        return jsonify({"error": "Alert not found"}), 404

    data = request.get_json() or {}
    notes = data.get("notes", "")

    crisis_svc = CrisisDetectionService()
    success = crisis_svc.resolve_alert(alert_id, user_id, notes)

    if success:
        return jsonify({"message": "Alert resolved"}), 200
    else:
        return jsonify({"error": "Failed to resolve alert"}), 500
