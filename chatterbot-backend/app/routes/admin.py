"""Admin routes for accountable internal pilot operations."""
import hashlib
import hmac
from datetime import datetime, timedelta

from flask import Blueprint, g, request, jsonify
from sqlalchemy import text
from config import settings
from app import db, limiter
from app.models.user import User
from app.models.teen import Teen
from app.models.conversation import Conversation, Message
from app.models.crisis_alert import CrisisAlert
from app.models.safety_operations import SafetyAlertEvent
from app.models.privacy import DataDeletionRequest, PrivacyEvent
from app.models.operations import (
    OperationalEvent,
    OperationalHeartbeat,
    PilotEnrollment,
    ProviderEvent,
)
from app.models.subscription import Subscription
from app.models.staff import STAFF_ROLES, StaffAuditLog, StaffSession, StaffUser
from app.services.pilot_metrics_service import build_pilot_metrics
from app.services.scheduler_service import SchedulerService
from app.services.twilio_service import TwilioService
from app.services.privacy_service import REDACTED_CONTENT
from app.services.pilot_service import get_pilot_control, refresh_pilot_enrollment
from app.services.readiness_service import readiness_report
from app.utils.time import utc_now
from app.utils.validators import validate_email
import logging

admin_bp = Blueprint("admin", __name__)
logger = logging.getLogger(__name__)
VALID_ALERT_STATUSES = {
    "triggered",
    "parent_notified",
    "acknowledged",
    "resolved",
    "false_positive",
}
VALID_RESOLUTION_REASONS = {
    "guardian_follow_up",
    "care_circle_follow_up",
    "professional_handoff",
    "false_positive",
}
STAFF_SESSION_HOURS = 8
STAFF_LOCK_MINUTES = 15
STAFF_MAX_LOGIN_FAILURES = 5
MIN_STAFF_PASSWORD_LENGTH = 12


def _json_body():
    data = request.get_json(silent=True)
    return data if isinstance(data, dict) else {}


def _record_staff_audit(action, resource_type, resource_id=None, detail=None):
    db.session.add(StaffAuditLog(
        staff_user_id=getattr(g, "staff_user_id", None),
        actor_name=getattr(g, "admin_actor", "Unknown staff member"),
        action=action,
        resource_type=resource_type,
        resource_id=str(resource_id) if resource_id is not None else None,
        detail=detail or {},
    ))


def _require_roles(*roles):
    if getattr(g, "admin_role", None) not in roles:
        return jsonify({"error": "Insufficient staff permissions"}), 403
    return None


def _staff_from_bearer_token():
    authorization = request.headers.get("Authorization", "")
    if not authorization.startswith("Bearer "):
        return None, None
    token = authorization.removeprefix("Bearer ").strip()
    if not token:
        return None, None
    token_hash = hashlib.sha256(token.encode("utf-8")).hexdigest()
    session = StaffSession.query.filter_by(token_hash=token_hash).first()
    if (
        session is None
        or session.revoked_at is not None
        or session.expires_at <= utc_now()
        or not session.staff_user.is_active
    ):
        return None, None
    return session.staff_user, session


@admin_bp.route("/privacy-readiness", methods=["GET"])
def privacy_readiness():
    """Return non-identifying privacy job and pilot capacity signals."""
    cutoff = utc_now() - timedelta(days=settings.message_retention_days)
    pending_redaction = Message.query.filter(
        Message.created_at < cutoff,
        Message.content != REDACTED_CONTENT,
    ).count()
    overdue_deletions = DataDeletionRequest.query.filter(
        DataDeletionRequest.status == "scheduled",
        DataDeletionRequest.scheduled_for <= utc_now(),
    ).count()
    active_families = User.query.filter_by(is_active=True).count()
    heartbeat = OperationalHeartbeat.query.filter_by(name="privacy_jobs").first()
    return jsonify({
        "policy_version": settings.privacy_policy_version,
        "pending_message_redactions": pending_redaction,
        "overdue_deletions": overdue_deletions,
        "privacy_events": PrivacyEvent.query.count(),
        "privacy_job_last_success_at": (
            heartbeat.last_success_at.isoformat() if heartbeat else None
        ),
        "pilot": {
            "enabled": settings.pilot_mode,
            "active_families": active_families,
            "capacity": settings.pilot_family_capacity,
            "at_capacity": active_families >= settings.pilot_family_capacity,
        },
    })


@admin_bp.route("/pilot", methods=["GET", "PATCH"])
def pilot_operations():
    """Inspect or pause the controlled family pilot without a deployment."""
    control = get_pilot_control()
    if request.method == "PATCH":
        denied = _require_roles("admin")
        if denied:
            return denied
        data = request.get_json(silent=True)
        if not isinstance(data, dict) or not isinstance(data.get("enabled"), bool):
            return jsonify({"error": "enabled must be true or false"}), 400
        reason = data.get("reason")
        if reason is not None and (not isinstance(reason, str) or len(reason.strip()) > 300):
            return jsonify({"error": "reason must be 300 characters or fewer"}), 400
        control.enabled = data["enabled"]
        control.reason = reason.strip() if reason else None
        control.updated_by = g.admin_actor
        for enrollment in PilotEnrollment.query.all():
            refresh_pilot_enrollment(enrollment.guardian_id)
        _record_staff_audit(
            "pilot_control_updated",
            "pilot",
            "global",
            {"enabled": control.enabled, "reason": control.reason},
        )
        db.session.commit()
    enrollments = PilotEnrollment.query.order_by(PilotEnrollment.enrolled_at.asc()).all()
    return jsonify({
        "enabled": control.enabled,
        "reason": control.reason,
        "updated_by": control.updated_by,
        "capacity": settings.pilot_family_capacity,
        "enrollments": [item.to_dict() for item in enrollments],
    })


def _check_admin_auth():
    """Check admin API key."""
    auth_header = request.headers.get("X-Admin-API-Key", "")
    return bool(settings.admin_api_key) and hmac.compare_digest(
        auth_header, settings.admin_api_key
    )


@admin_bp.before_request
@limiter.limit("30 per minute")
def require_admin():
    if request.endpoint == "admin.create_staff_session":
        return None

    staff_user, staff_session = _staff_from_bearer_token()
    if staff_user is not None:
        g.staff_user_id = staff_user.id
        g.staff_session = staff_session
        g.admin_actor = staff_user.name
        g.admin_role = staff_user.role
        return None

    if _check_admin_auth():
        g.staff_user_id = None
        g.admin_role = "admin"
        g.admin_actor = "Legacy admin key"
    else:
        return jsonify({"error": "Unauthorized"}), 401

    if request.method not in {"GET", "HEAD", "OPTIONS"}:
        actor = request.headers.get("X-Admin-Actor", "").strip()
        if not 2 <= len(actor) <= 120:
            return jsonify({"error": "X-Admin-Actor is required for changes"}), 400
        g.admin_actor = actor


@admin_bp.after_request
def prevent_admin_response_storage(response):
    """Prevent staff and operational responses from being cached."""
    response.headers["Cache-Control"] = "no-store"
    response.headers["Pragma"] = "no-cache"
    return response


@admin_bp.post("/session")
@limiter.limit("5 per minute")
def create_staff_session():
    """Authenticate a named staff member and issue an expiring opaque token."""
    data = _json_body()
    email = str(data.get("email") or "").strip().lower()
    password = data.get("password") or ""
    staff_user = StaffUser.query.filter_by(email=email).first() if email else None
    if staff_user is None or not staff_user.is_active:
        return jsonify({"error": "Invalid staff credentials"}), 401
    if staff_user.locked_until and staff_user.locked_until > utc_now():
        return jsonify({"error": "Staff account temporarily locked"}), 423
    if not staff_user.check_password(password):
        staff_user.failed_login_count = (staff_user.failed_login_count or 0) + 1
        if staff_user.failed_login_count >= STAFF_MAX_LOGIN_FAILURES:
            staff_user.locked_until = utc_now() + timedelta(minutes=STAFF_LOCK_MINUTES)
            db.session.add(StaffAuditLog(
                staff_user_id=staff_user.id,
                actor_name="Authentication system",
                action="staff_account_locked",
                resource_type="staff_user",
                resource_id=str(staff_user.id),
                detail={"lock_minutes": STAFF_LOCK_MINUTES},
            ))
        db.session.commit()
        return jsonify({"error": "Invalid staff credentials"}), 401

    staff_user.failed_login_count = 0
    staff_user.locked_until = None
    staff_user.last_login_at = utc_now()
    token, session = StaffSession.issue(
        staff_user, lifetime=timedelta(hours=STAFF_SESSION_HOURS)
    )
    db.session.add(session)
    db.session.add(StaffAuditLog(
        staff_user_id=staff_user.id,
        actor_name=staff_user.name,
        action="staff_session_created",
        resource_type="staff_session",
        detail={"role": staff_user.role},
    ))
    db.session.commit()
    response = jsonify({
        "access_token": token,
        "expires_in": STAFF_SESSION_HOURS * 60 * 60,
        "token_type": "Bearer",
        "staff": staff_user.to_dict(),
    })
    response.headers["Cache-Control"] = "no-store"
    return response, 200


@admin_bp.delete("/session")
def revoke_staff_session():
    """Revoke the current named staff session."""
    session = getattr(g, "staff_session", None)
    if session is None:
        return jsonify({"error": "A staff session is required"}), 400
    session.revoked_at = utc_now()
    _record_staff_audit("staff_session_revoked", "staff_session", session.id)
    db.session.commit()
    return jsonify({"success": True}), 200


@admin_bp.route("/staff", methods=["GET", "POST"])
def staff_accounts():
    """List staff or create an individually attributable pilot operator."""
    denied = _require_roles("admin")
    if denied:
        return denied
    if request.method == "GET":
        staff = StaffUser.query.order_by(StaffUser.created_at.asc()).all()
        return jsonify({"staff": [item.to_dict() for item in staff]}), 200

    data = _json_body()
    name = str(data.get("name") or "").strip()
    email = str(data.get("email") or "").strip().lower()
    password = data.get("password") or ""
    role = str(data.get("role") or "viewer").strip()
    if not 2 <= len(name) <= 120:
        return jsonify({"error": "name must be between 2 and 120 characters"}), 400
    if not validate_email(email) or len(email) > 255:
        return jsonify({"error": "Enter a valid staff email"}), 400
    if len(password) < MIN_STAFF_PASSWORD_LENGTH:
        return jsonify({
            "error": f"password must be at least {MIN_STAFF_PASSWORD_LENGTH} characters"
        }), 400
    if role not in STAFF_ROLES:
        return jsonify({"error": "Choose a valid staff role"}), 400
    if StaffUser.query.filter_by(email=email).first():
        return jsonify({"error": "Staff email already exists"}), 409

    staff_user = StaffUser(name=name, email=email, role=role)
    staff_user.set_password(password)
    db.session.add(staff_user)
    db.session.flush()
    _record_staff_audit(
        "staff_account_created",
        "staff_user",
        staff_user.id,
        {"role": staff_user.role},
    )
    db.session.commit()
    return jsonify({"staff": staff_user.to_dict()}), 201


@admin_bp.patch("/staff/<int:staff_id>")
def update_staff_account(staff_id):
    """Change staff role or access while retaining an audit record."""
    denied = _require_roles("admin")
    if denied:
        return denied
    staff_user = db.session.get(StaffUser, staff_id)
    if staff_user is None:
        return jsonify({"error": "Staff account not found"}), 404
    data = _json_body()
    role = data.get("role", staff_user.role)
    is_active = data.get("is_active", staff_user.is_active)
    if role not in STAFF_ROLES:
        return jsonify({"error": "Choose a valid staff role"}), 400
    if not isinstance(is_active, bool):
        return jsonify({"error": "is_active must be true or false"}), 400
    if staff_user.id == getattr(g, "staff_user_id", None) and not is_active:
        return jsonify({"error": "You cannot disable your current account"}), 409
    staff_user.role = role
    staff_user.is_active = is_active
    if not is_active:
        for session in StaffSession.query.filter_by(
            staff_user_id=staff_user.id, revoked_at=None
        ).all():
            session.revoked_at = utc_now()
    _record_staff_audit(
        "staff_account_updated",
        "staff_user",
        staff_user.id,
        {"role": role, "is_active": is_active},
    )
    db.session.commit()
    return jsonify({"staff": staff_user.to_dict()}), 200


@admin_bp.get("/audit-log")
def staff_audit_log():
    """Return the latest staff actions without family message content."""
    denied = _require_roles("safety_lead", "admin")
    if denied:
        return denied
    entries = StaffAuditLog.query.order_by(StaffAuditLog.created_at.desc()).limit(200).all()
    return jsonify({"events": [entry.to_dict() for entry in entries]}), 200


@admin_bp.get("/pilot/metrics")
def pilot_metrics():
    """Return aggregate launch metrics for the controlled pilot."""
    days = request.args.get("days", 30, type=int)
    if not 1 <= days <= 90:
        return jsonify({"error": "days must be between 1 and 90"}), 400
    return jsonify(build_pilot_metrics(days=days)), 200


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
    denied = _require_roles("operator", "safety_lead", "admin")
    if denied:
        return denied
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
    denied = _require_roles("operator", "safety_lead", "admin")
    if denied:
        return denied
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
    denied = _require_roles("operator", "safety_lead", "admin")
    if denied:
        return denied
    status = request.args.get("status")
    severity = request.args.get("severity")
    assigned_to = request.args.get("assigned_to")

    query = CrisisAlert.query

    if status:
        query = query.filter_by(status=status)
    if severity:
        query = query.filter_by(severity=severity)
    if assigned_to:
        query = query.filter_by(assigned_to=assigned_to)

    alerts = query.order_by(CrisisAlert.created_at.desc()).all()

    return jsonify({"alerts": [a.to_dict() for a in alerts]}), 200


@admin_bp.route("/alerts/<int:alert_id>", methods=["PUT"])
def update_alert(alert_id):
    """Apply a validated staff workflow transition and retain an audit event."""
    denied = _require_roles("operator", "safety_lead", "admin")
    if denied:
        return denied
    alert = db.session.get(CrisisAlert, alert_id)
    if not alert:
        return jsonify({"error": "Alert not found"}), 404

    data = request.get_json(silent=True)
    if not isinstance(data, dict):
        return jsonify({"error": "Request body must be a JSON object"}), 400
    status = data.get("status", alert.status)
    if status not in VALID_ALERT_STATUSES:
        return jsonify({"error": "Choose a valid alert status"}), 400
    reason = data.get("resolution_reason")
    if status in {"resolved", "false_positive"} and reason not in VALID_RESOLUTION_REASONS:
        return jsonify({"error": "A valid resolution_reason is required"}), 400
    notes = data.get("notes", "")
    if not isinstance(notes, str) or len(notes.strip()) > 2000:
        return jsonify({"error": "notes must be 2000 characters or fewer"}), 400
    assigned_to = data.get("assigned_to", alert.assigned_to)
    if assigned_to is not None and (
        not isinstance(assigned_to, str) or not 1 <= len(assigned_to.strip()) <= 120
    ):
        return jsonify({"error": "assigned_to must be 120 characters or fewer"}), 400

    follow_up_at = data.get("follow_up_at")
    if follow_up_at:
        try:
            alert.follow_up_at = datetime.fromisoformat(follow_up_at.replace("Z", "+00:00")).replace(tzinfo=None)
        except (TypeError, ValueError):
            return jsonify({"error": "follow_up_at must be an ISO 8601 datetime"}), 400

    previous = alert.status
    alert.status = status
    alert.assigned_to = assigned_to.strip() if assigned_to else None
    alert.resolution_reason = reason
    alert.resolution_notes = notes.strip() or None
    if status == "false_positive":
        alert.false_positive_reason = notes.strip() or "No reason provided"
        alert.resolved_at = utc_now()
    elif status == "resolved":
        alert.resolved_at = utc_now()
    db.session.add(SafetyAlertEvent(
        alert_id=alert.id,
        actor_type="staff",
        actor_name=g.get("admin_actor", "Safety staff"),
        action="workflow_updated",
        from_status=previous,
        to_status=status,
        notes=notes.strip() or None,
    ))
    _record_staff_audit(
        "safety_alert_updated",
        "crisis_alert",
        alert.id,
        {"from_status": previous, "to_status": status},
    )

    db.session.commit()

    return jsonify({"alert": alert.to_dict()}), 200


@admin_bp.route("/run-scheduler", methods=["POST"])
def run_scheduler():
    """Manually trigger scheduler to process due nudges."""
    denied = _require_roles("admin")
    if denied:
        return denied
    try:
        scheduler = SchedulerService()
        scheduler.process_due_nudges()
        _record_staff_audit("scheduler_run", "scheduler")
        db.session.commit()
        return jsonify({"message": "Scheduler processed successfully"}), 200
    except Exception as e:
        logger.error(f"Scheduler run failed: {e}")
        return jsonify({"error": str(e)}), 500


@admin_bp.route("/send-broadcast", methods=["POST"])
def send_broadcast():
    """Send broadcast SMS to all active teens (emergency use only)."""
    denied = _require_roles("admin")
    if denied:
        return denied
    if not settings.enable_admin_broadcast:
        return jsonify({"error": "Administrative broadcasts are disabled"}), 403
    data = request.get_json()
    message = data.get("message")

    if not message:
        return jsonify({"error": "message is required"}), 400

    teens = [
        teen for teen in Teen.query.filter_by(is_active=True).all()
        if teen.can_receive_sms()
    ]
    twilio = TwilioService()

    results = []
    for teen in teens:
        result = twilio.send_sms(teen.phone, message)
        results.append({
            "teen_id": teen.id,
            "success": result["success"],
        })

    _record_staff_audit(
        "broadcast_sent",
        "sms_broadcast",
        detail={
            "recipient_count": len(results),
            "successful_count": sum(1 for item in results if item["success"]),
        },
    )
    db.session.commit()

    return jsonify({
        "message": "Broadcast sent",
        "total": len(results),
        "successful": sum(1 for r in results if r["success"]),
        "results": results,
    }), 200


@admin_bp.route("/health", methods=["GET"])
def admin_health():
    """Extended dependency readiness without exposing connection details."""
    report = readiness_report(
        check_migration=settings.flask_env == "production",
        check_redis=settings.flask_env == "production",
    )
    report["timestamp"] = utc_now().isoformat()
    return jsonify(report), 200 if report["ready"] else 503


@admin_bp.route("/operations", methods=["GET"])
def operations_summary():
    """Return privacy safe pilot signals and recent operational events."""
    since = utc_now() - timedelta(hours=24)
    status = request.args.get("status", "open")
    query = OperationalEvent.query
    if status != "all":
        query = query.filter_by(status=status)
    events = query.order_by(OperationalEvent.created_at.desc()).limit(100).all()
    provider_failures = ProviderEvent.query.filter(
        ProviderEvent.status == "failed",
        ProviderEvent.received_at >= since,
    ).count()
    return jsonify({
        "window_hours": 24,
        "open_critical": OperationalEvent.query.filter_by(
            status="open", severity="critical"
        ).count(),
        "provider_failures": provider_failures,
        "sms_opt_outs": Teen.query.filter(
            Teen.sms_opted_out_at.isnot(None)
        ).count(),
        "events": [event.to_dict() for event in events],
    }), 200


@admin_bp.route("/operations/<int:event_id>/resolve", methods=["PATCH"])
def resolve_operational_event(event_id):
    """Resolve an operational signal with an attributed operator note."""
    denied = _require_roles("operator", "safety_lead", "admin")
    if denied:
        return denied
    event = db.session.get(OperationalEvent, event_id)
    if not event:
        return jsonify({"error": "Operational event not found"}), 404
    data = request.get_json(silent=True)
    if not isinstance(data, dict):
        return jsonify({"error": "Request body must be a JSON object"}), 400
    note = data.get("note", "")
    if not isinstance(note, str) or not 2 <= len(note.strip()) <= 500:
        return jsonify({"error": "note must be between 2 and 500 characters"}), 400
    detail = dict(event.detail or {})
    detail["resolution"] = {
        "actor": g.admin_actor,
        "note": note.strip(),
    }
    event.detail = detail
    event.status = "resolved"
    event.resolved_at = utc_now()
    _record_staff_audit(
        "operational_event_resolved",
        "operational_event",
        event.id,
        {"code": event.code},
    )
    db.session.commit()
    return jsonify({"event": event.to_dict()}), 200
