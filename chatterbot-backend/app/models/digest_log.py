"""Weekly digest log model."""
from app import db
from app.utils.time import utc_now


class DigestLog(db.Model):
    __tablename__ = "digest_logs"

    id = db.Column(db.Integer, primary_key=True)
    guardian_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=True, index=True)
    sent_at = db.Column(db.DateTime, default=utc_now, nullable=True)
    teen_count = db.Column(db.Integer, default=0)
    alert_count = db.Column(db.Integer, default=0)
    mood_avg = db.Column(db.Float, nullable=True)

    def to_dict(self):
        return {
            "id": self.id,
            "guardian_id": self.guardian_id,
            "sent_at": self.sent_at.isoformat() if self.sent_at else None,
            "teen_count": self.teen_count,
            "alert_count": self.alert_count,
            "mood_avg": self.mood_avg,
        }
