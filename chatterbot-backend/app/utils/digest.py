"""Weekly digest payload builder."""
from datetime import datetime, timedelta
from app import db
from app.models.teen import Teen
from app.models.mood_entry import MoodEntry
from app.models.crisis_alert import CrisisAlert
from app.models.user import User


def build_digest_payload(guardian_id: int) -> dict:
    guardian = User.query.get(guardian_id)
    if not guardian:
        return {}

    teens = Teen.query.filter_by(guardian_id=guardian_id).all()
    week_ago = datetime.utcnow() - timedelta(days=7)

    teen_summaries = []
    all_scores = []
    for teen in teens:
        entries = MoodEntry.query.filter(
            MoodEntry.teen_id == teen.id,
            MoodEntry.created_at >= week_ago,
        ).all()
        scores = [e.score for e in entries if e.score is not None]
        avg = round(sum(scores) / len(scores), 1) if scores else None
        all_scores.extend(scores)
        teen_summaries.append({
            "teen_id": teen.id,
            "name": teen.name,
            "mood_avg": avg,
            "mood_entries": len(entries),
            "conversation_count": 0,  # stub
        })

    alert_count = db.session.query(CrisisAlert).join(Teen).filter(
        Teen.guardian_id == guardian_id,
        CrisisAlert.created_at >= week_ago,
    ).count()

    overall_avg = round(sum(all_scores) / len(all_scores), 1) if all_scores else None

    return {
        "guardian_name": guardian.name if hasattr(guardian, 'name') else guardian.email,
        "period": "last 7 days",
        "teens": teen_summaries,
        "alert_count": alert_count,
        "mood_avg": overall_avg,
    }
