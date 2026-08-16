"""Scheduled proactive nudge model."""
from datetime import datetime
from app import db


class ScheduledNudge(db.Model):
    __tablename__ = "scheduled_nudges"

    id = db.Column(db.Integer, primary_key=True)
    teen_id = db.Column(db.Integer, db.ForeignKey("teens.id"), nullable=False, index=True)

    # Schedule
    nudge_type = db.Column(db.String(50), nullable=False)  # reminder, check_in, goal, event
    trigger_condition = db.Column(db.String(200), nullable=False)  # "time:16:30", "event:lacrosse", "silence:24h"

    # Content
    template_message = db.Column(db.Text, nullable=False)

    # Status
    is_active = db.Column(db.Boolean, default=True)
    last_sent_at = db.Column(db.DateTime, nullable=True)
    next_send_at = db.Column(db.DateTime, nullable=True, index=True)
    send_count = db.Column(db.Integer, default=0)
    max_sends = db.Column(db.Integer, default=1)  # 0 = unlimited

    # Metadata
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            "id": self.id,
            "nudge_type": self.nudge_type,
            "trigger_condition": self.trigger_condition,
            "template_message": self.template_message,
            "is_active": self.is_active,
            "last_sent_at": self.last_sent_at.isoformat() if self.last_sent_at else None,
            "next_send_at": self.next_send_at.isoformat() if self.next_send_at else None,
            "send_count": self.send_count,
        }
