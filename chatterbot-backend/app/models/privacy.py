"""Privacy lifecycle records for consent, exports, retention, and deletion."""
from app import db
from app.utils.time import utc_now


class PrivacyEvent(db.Model):
    __tablename__ = "privacy_events"

    id = db.Column(db.Integer, primary_key=True)
    guardian_id = db.Column(db.Integer, nullable=False, index=True)
    teen_id = db.Column(db.Integer, nullable=True, index=True)
    event_type = db.Column(db.String(50), nullable=False, index=True)
    policy_version = db.Column(db.String(40), nullable=False)
    detail = db.Column(db.JSON, nullable=False, default=dict)
    created_at = db.Column(db.DateTime, nullable=False, default=utc_now, index=True)

    def to_dict(self):
        return {
            "id": self.id,
            "teen_id": self.teen_id,
            "event_type": self.event_type,
            "policy_version": self.policy_version,
            "detail": self.detail or {},
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }


class DataDeletionRequest(db.Model):
    __tablename__ = "data_deletion_requests"

    id = db.Column(db.Integer, primary_key=True)
    guardian_id = db.Column(db.Integer, nullable=False, index=True)
    teen_id = db.Column(db.Integer, nullable=True, index=True)
    teen_name = db.Column(db.String(100), nullable=False)
    status = db.Column(db.String(30), nullable=False, default="scheduled", index=True)
    requested_at = db.Column(db.DateTime, nullable=False, default=utc_now)
    scheduled_for = db.Column(db.DateTime, nullable=False, index=True)
    canceled_at = db.Column(db.DateTime, nullable=True)
    completed_at = db.Column(db.DateTime, nullable=True)

    def to_dict(self):
        return {
            "id": self.id,
            "teen_id": self.teen_id,
            "teen_name": self.teen_name,
            "status": self.status,
            "requested_at": self.requested_at.isoformat(),
            "scheduled_for": self.scheduled_for.isoformat(),
            "canceled_at": self.canceled_at.isoformat() if self.canceled_at else None,
            "completed_at": self.completed_at.isoformat() if self.completed_at else None,
        }
