"""Privacy exports and scheduled data lifecycle jobs."""
from datetime import timedelta

from app import db
from app.models.checkin_schedule import CheckinSchedule
from app.models.conversation import Conversation, Message
from app.models.mood_entry import MoodEntry
from app.models.privacy import DataDeletionRequest, PrivacyEvent
from app.models.safety_operations import FamilySafetyPlan
from app.models.teen import Teen
from app.utils.time import utc_now
from config import settings

REDACTED_CONTENT = "[redacted by retention policy]"


def record_privacy_event(guardian_id, event_type, teen_id=None, detail=None):
    event = PrivacyEvent(
        guardian_id=guardian_id,
        teen_id=teen_id,
        event_type=event_type,
        policy_version=settings.privacy_policy_version,
        detail=detail or {},
    )
    db.session.add(event)
    return event


def build_guardian_export(guardian):
    """Build a guardian-owned export without exposing teen message text."""
    teens = []
    for teen in guardian.teens.order_by(Teen.created_at.asc()).all():
        conversations = Conversation.query.filter_by(teen_id=teen.id).all()
        safety_plan = FamilySafetyPlan.query.filter_by(teen_id=teen.id).first()
        teens.append({
            "profile": teen.to_dict(),
            "enrollment": teen.enrollment_to_dict(),
            "conversations": [conversation.to_dict() for conversation in conversations],
            "message_export_boundary": "Message text is excluded to protect teen privacy.",
            "alerts": [alert.to_dict() for alert in teen.crisis_alerts.all()],
            "care_circle": [member.to_dict() for member in teen.care_circle_members.all()],
            "safety_plan": safety_plan.to_dict() if safety_plan else None,
        })
    return {
        "generated_at": utc_now().isoformat(),
        "policy_version": settings.privacy_policy_version,
        "guardian": guardian.to_dict(),
        "teens": teens,
    }


def redact_expired_messages(now=None):
    now = now or utc_now()
    cutoff = now - timedelta(days=settings.message_retention_days)
    messages = Message.query.filter(
        Message.created_at < cutoff,
        Message.content != REDACTED_CONTENT,
    ).all()
    for message in messages:
        message.content = REDACTED_CONTENT
        message.twilio_sid = None
        message.crisis_keywords_matched = []
    return len(messages)


def purge_due_deletions(now=None):
    now = now or utc_now()
    requests = DataDeletionRequest.query.filter(
        DataDeletionRequest.status == "scheduled",
        DataDeletionRequest.scheduled_for <= now,
    ).all()
    completed = 0
    for deletion in requests:
        teen = db.session.get(Teen, deletion.teen_id) if deletion.teen_id else None
        if teen:
            MoodEntry.query.filter_by(teen_id=teen.id).delete()
            CheckinSchedule.query.filter_by(teen_id=teen.id).delete()
            FamilySafetyPlan.query.filter_by(teen_id=teen.id).delete()
            db.session.delete(teen)
        deletion.teen_id = None
        deletion.status = "completed"
        deletion.completed_at = now
        record_privacy_event(
            deletion.guardian_id,
            "deletion_completed",
            detail={"request_id": deletion.id, "teen_name": deletion.teen_name},
        )
        completed += 1
    return completed


def run_privacy_jobs(now=None):
    result = {
        "messages_redacted": redact_expired_messages(now),
        "deletions_completed": purge_due_deletions(now),
    }
    db.session.commit()
    return result
