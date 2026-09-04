"""Crisis alert model — tracks safety escalations."""
from enum import Enum as PyEnum
from app import db
from app.utils.time import utc_now


class CrisisStatus(PyEnum):
    TRIGGERED = "triggered"
    PARENT_NOTIFIED = "parent_notified"
    ACKNOWLEDGED = "acknowledged"
    AUTHORITY_NOTIFIED = "authority_notified"
    RESOLVED = "resolved"
    FALSE_POSITIVE = "false_positive"


class CrisisAlert(db.Model):
    __tablename__ = "crisis_alerts"

    id = db.Column(db.Integer, primary_key=True)
    teen_id = db.Column(db.Integer, db.ForeignKey("teens.id"), nullable=False, index=True)
    message_id = db.Column(db.Integer, db.ForeignKey("messages.id"), nullable=True)

    # Alert details
    status = db.Column(db.String(30), default=CrisisStatus.TRIGGERED.value, index=True)
    severity = db.Column(db.String(20), default="high")  # low, medium, high, critical
    keywords_matched = db.Column(db.JSON, default=list)
    categories = db.Column(db.JSON, default=list)
    confidence = db.Column(db.Float, nullable=True)
    detection_version = db.Column(db.String(40), nullable=True)
    care_circle_notified_count = db.Column(db.Integer, default=0, nullable=False)

    # Context (privacy-safe summary, NOT raw message)
    context_summary = db.Column(db.Text, nullable=True)

    # Notifications sent
    parent_notified_at = db.Column(db.DateTime, nullable=True)
    parent_notification_method = db.Column(db.String(50), nullable=True)  # sms, email, push
    authority_notified_at = db.Column(db.DateTime, nullable=True)

    # Guardian acknowledgement
    acknowledged_at = db.Column(db.DateTime, nullable=True)
    acknowledged_by = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=True)
    acknowledgement_notes = db.Column(db.Text, nullable=True)

    # Resolution
    resolved_at = db.Column(db.DateTime, nullable=True)
    resolved_by = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=True)
    resolution_notes = db.Column(db.Text, nullable=True)

    # Metadata
    created_at = db.Column(db.DateTime, default=utc_now)
    updated_at = db.Column(db.DateTime, default=utc_now, onupdate=utc_now)

    def to_dict(self):
        return {
            "id": self.id,
            "teen_id": self.teen_id,
            "teen_name": self.teen.first_name if self.teen else None,
            "status": self.status,
            "severity": self.severity,
            "categories": self.categories or [],
            "confidence": self.confidence,
            "detection_version": self.detection_version,
            "care_circle_notified_count": self.care_circle_notified_count or 0,
            "context_summary": self.context_summary,
            "parent_notified_at": self.parent_notified_at.isoformat() if self.parent_notified_at else None,
            "acknowledged_at": self.acknowledged_at.isoformat() if self.acknowledged_at else None,
            "acknowledged_by": self.acknowledged_by,
            "acknowledgement_notes": self.acknowledgement_notes,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "resolved_at": self.resolved_at.isoformat() if self.resolved_at else None,
            "resolved_by": self.resolved_by,
            "resolution_notes": self.resolution_notes,
            "recommended_actions": self.recommended_actions(),
        }

    def recommended_actions(self):
        """Return non-clinical next steps without revealing conversation content."""
        actions = ["Contact the teen directly and ask whether they are safe right now."]
        if self.severity == "critical":
            actions.append("If danger is immediate, call 911 or local emergency services.")
        actions.append("Call or text 988 in the U.S. for crisis support and guidance.")
        actions.append("Follow the family safety plan and keep a trusted adult with the teen.")
        return actions
