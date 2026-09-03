"""Mood tracking model for teen check-ins."""
from app import db
from app.utils.time import utc_now


class MoodEntry(db.Model):
    __tablename__ = "mood_entries"

    id = db.Column(db.Integer, primary_key=True)
    teen_id = db.Column(db.Integer, db.ForeignKey("teens.id"), nullable=True, index=True)
    score = db.Column(db.Integer, nullable=True)  # 1-10
    note = db.Column(db.Text, nullable=True)
    created_at = db.Column(db.DateTime, default=utc_now, nullable=True, index=True)

    def to_dict(self):
        return {
            "id": self.id,
            "teen_id": self.teen_id,
            "score": self.score,
            "note": self.note,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }
