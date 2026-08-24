"""Admin routes for internal operations."""
import hmac
from datetime import datetime

from flask import Blueprint, request, jsonify
from sqlalchemy import text
from config import settings
from app import db
from app.models.user import User
from app.models.teen import Teen
from app.models.conversation import Conversation, Message
from app.models.crisis_alert import CrisisAlert
from app.models.subscription import Subscription
from app.services.scheduler_service import SchedulerService
from app.services.twilio_service import TwilioService
import logging

admin_bp = Blueprint("admin", __name__)
logger = logging.getLogger(__name__)

def _check_admin_auth():
    """Check admin API key."""
    auth_header = request.headers.get("X-Admin-API-Key", "")
    return bool(settings.admin_api_key) and hmac.compare_digest(
        auth_header, settings.admin_api_key
    )


@admin_bp.before_request
def require_admin():
    if not _check_admin_auth():
        return jsonify({"error": "Unauthorized"}), 401


@admin_bp.route("/stats", methods=["GET"])
def get_stats():
    """Get platform-wide statistics."""
    stats = {
        "users": {
            "total": User.query.count(),
            "active": User.query.filter_by(is_active=True).count(),
        },
        "teens": {
            "total": Teen.query.count(),
            "active": Teen.query.filter_by(is_active=True).count(),
            "with_consent": Teen.query.filter_by(consent_verified=True).count(),
        },
        "messages": {
            "total": Message.query.count(),
            "inbound": Message.query.filter_by(direction="inbound").count(),
            "outbound": Message.query.filter_by(direction="outbound").count(),
        },
        "conversations": {
            "total": Conversation.query.count(),
            "crisis_flagged": Conversation.query.filter_by(is_crisis_flagged=True).count(),
        },
        "crisis_alerts": {
            "total": CrisisAlert.query.count(),
            "active": CrisisAlert.query.filter(CrisisAlert.status.in_(["triggered", "parent_notified"])).count(),
            "resolved": CrisisAlert.query.filter_by(status="resolved").count(),
        },
        "subscriptions": {
            "total": Subscription.query.count(),
            "active_premium": Subscription.query.filter(
                Subscription.status == "active",
                Subscription.plan_tier.in_(["premium", "family"]),
            ).count(),
        },
    }
    return jsonify(stats), 200


@admin_bp.route("/users", methods=["GET"])
def list_users():
    """List all users."""
    page = request.args.get("page", 1, type=int)
    per_page = request.args.get("per_page", 20, type=int)

    users = User.query.paginate(page=page, per_page=per_page, error_out=False)

    return jsonify({
        "users": [u.to_dict() for u in users.items],
        "total": users.total,
        "pages": users.pages,
        "current_page": page,
    }), 200


@admin_bp.route("/teens", methods=["GET"])
def list_all_teens():
    """List all teens across all parents."""
    page = request.args.get("page", 1, type=int)
    per_page = request.args.get("per_page", 20, type=int)

    teens = Teen.query.paginate(page=page, per_page=per_page, error_out=False)

    return jsonify({
        "teens": [t.to_dict() for t in teens.items],
        "total": teens.total,
        "pages": teens.pages,
        "current_page": page,
    }), 200


@admin_bp.route("/alerts", methods=["GET"])
def list_all_alerts():
    """List all crisis alerts."""
    status = request.args.get("status")
    severity = request.args.get("severity")

    query = CrisisAlert.query

    if status:
        query = query.filter_by(status=status)
    if severity:
        query = query.filter_by(severity=severity)

    alerts = query.order_by(CrisisAlert.created_at.desc()).all()

    return jsonify({"alerts": [a.to_dict() for a in alerts]}), 200


@admin_bp.route("/alerts/<int:alert_id>", methods=["PUT"])
def update_alert(alert_id):
    """Update alert status (human-in-the-loop)."""
    alert = CrisisAlert.query.get(alert_id)
    if not alert:
        return jsonify({"error": "Alert not found"}), 404

    data = request.get_json()

    if "status" in data:
        alert.status = data["status"]
    if "resolution_notes" in data:
        alert.resolution_notes = data["resolution_notes"]
    if "severity" in data:
        alert.severity = data["severity"]

    db.session.commit()

    return jsonify({"alert": alert.to_dict()}), 200


@admin_bp.route("/run-scheduler", methods=["POST"])
def run_scheduler():
    """Manually trigger scheduler to process due nudges."""
    try:
        scheduler = SchedulerService()
        scheduler.process_due_nudges()
        return jsonify({"message": "Scheduler processed successfully"}), 200
    except Exception as e:
        logger.error(f"Scheduler run failed: {e}")
        return jsonify({"error": str(e)}), 500


@admin_bp.route("/send-broadcast", methods=["POST"])
def send_broadcast():
    """Send broadcast SMS to all active teens (emergency use only)."""
    data = request.get_json()
    message = data.get("message")

    if not message:
        return jsonify({"error": "message is required"}), 400

    teens = Teen.query.filter_by(is_active=True).all()
    twilio = TwilioService()

    results = []
    for teen in teens:
        result = twilio.send_sms(teen.phone, message)
        results.append({
            "teen_id": teen.id,
            "phone": teen.phone,
            "success": result["success"],
        })

    return jsonify({
        "message": "Broadcast sent",
        "total": len(results),
        "successful": sum(1 for r in results if r["success"]),
        "results": results,
    }), 200


@admin_bp.route("/health", methods=["GET"])
def admin_health():
    """Extended health check with DB connectivity."""
    try:
        db.session.execute(text("SELECT 1"))
        db_status = "connected"
    except Exception as e:
        db_status = f"error: {str(e)}"

    return jsonify({
        "status": "ok",
        "database": db_status,
        "timestamp": datetime.utcnow().isoformat(),
    }), 200
