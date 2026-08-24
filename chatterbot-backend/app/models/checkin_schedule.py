"""Check-in schedule model for proactive teen SMS reminders."""
from datetime import datetime
from app import db


class CheckinSchedule(db.Model):
    __tablename__ = "checkin_schedules"

    id = db.Column(db.Integer, primary_key=True)
    teen_id = db.Column(db.Integer, db.ForeignKey("teens.id"), nullable=True, unique=True, index=True)
    enabled = db.Column(db.Boolean, default=True, nullable=False)
    interval_days = db.Column(db.Integer, default=3, nullable=False)
    last_sent_at = db.Column(db.DateTime, nullable=True)
    next_send_at = db.Column(db.DateTime, nullable=True)

    def to_dict(self):
        return {
            "id": self.id,
            "teen_id": self.teen_id,
            "enabled": self.enabled,
            "interval_days": self.interval_days,
            "last_sent_at": self.last_sent_at.isoformat() if self.last_sent_at else None,
            "next_send_at": self.next_send_at.isoformat() if self.next_send_at else None,
        }
