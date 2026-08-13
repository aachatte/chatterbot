"""Crisis alert model — tracks safety escalations."""
from datetime import datetime
from enum import Enum as PyEnum
from app import db


class CrisisStatus(PyEnum):
    TRIGGERED = "triggered"
    PARENT_NOTIFIED = "parent_notified"
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

    # Context (privacy-safe summary, NOT raw message)
    context_summary = db.Column(db.Text, nullable=True)

    # Notifications sent
    parent_notified_at = db.Column(db.DateTime, nullable=True)
    parent_notification_method = db.Column(db.String(50), nullable=True)  # sms, email, push
    authority_notified_at = db.Column(db.DateTime, nullable=True)

    # Resolution
    resolved_at = db.Column(db.DateTime, nullable=True)
    resolved_by = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=True)
    resolution_notes = db.Column(db.Text, nullable=True)

    # Metadata
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    def to_dict(self):
        return {
            "id": self.id,
            "teen_id": self.teen_id,
            "teen_name": self.teen.first_name if self.teen else None,
            "status": self.status,
            "severity": self.severity,
            "keywords_matched": self.keywords_matched or [],
            "context_summary": self.context_summary,
            "parent_notified_at": self.parent_notified_at.isoformat() if self.parent_notified_at else None,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "resolved_at": self.resolved_at.isoformat() if self.resolved_at else None,
        }
