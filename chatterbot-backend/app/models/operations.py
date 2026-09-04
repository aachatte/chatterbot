"""Durable authentication, pilot, and operational control records."""
from app import db
from app.utils.time import utc_now


class RefreshSession(db.Model):
    __tablename__ = "refresh_sessions"

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    jti_hash = db.Column(db.String(64), nullable=False, unique=True, index=True)
    expires_at = db.Column(db.DateTime, nullable=False, index=True)
    revoked_at = db.Column(db.DateTime, nullable=True)
    replaced_by_jti_hash = db.Column(db.String(64), nullable=True)
    created_at = db.Column(db.DateTime, nullable=False, default=utc_now)


class OperationalHeartbeat(db.Model):
    __tablename__ = "operational_heartbeats"

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(60), nullable=False, unique=True, index=True)
    last_success_at = db.Column(db.DateTime, nullable=False, default=utc_now)
    detail = db.Column(db.JSON, nullable=False, default=dict)


class PilotControl(db.Model):
    __tablename__ = "pilot_controls"

    id = db.Column(db.Integer, primary_key=True)
    key = db.Column(db.String(60), nullable=False, unique=True, index=True)
    enabled = db.Column(db.Boolean, nullable=False, default=True)
    reason = db.Column(db.String(300), nullable=True)
    updated_by = db.Column(db.String(120), nullable=True)
    updated_at = db.Column(db.DateTime, nullable=False, default=utc_now, onupdate=utc_now)


class PilotEnrollment(db.Model):
    __tablename__ = "pilot_enrollments"

    id = db.Column(db.Integer, primary_key=True)
    guardian_id = db.Column(db.Integer, db.ForeignKey("users.id", ondelete="CASCADE"), nullable=False, unique=True, index=True)
    cohort = db.Column(db.String(60), nullable=False, default="family-pilot-1")
    status = db.Column(db.String(30), nullable=False, default="enrolled", index=True)
    readiness = db.Column(db.JSON, nullable=False, default=dict)
    enrolled_at = db.Column(db.DateTime, nullable=False, default=utc_now)
    ready_at = db.Column(db.DateTime, nullable=True)
    paused_at = db.Column(db.DateTime, nullable=True)
    completed_at = db.Column(db.DateTime, nullable=True)
    updated_at = db.Column(db.DateTime, nullable=False, default=utc_now, onupdate=utc_now)

    def to_dict(self):
        return {
            "id": self.id,
            "guardian_id": self.guardian_id,
            "cohort": self.cohort,
            "status": self.status,
            "readiness": self.readiness or {},
            "enrolled_at": self.enrolled_at.isoformat() if self.enrolled_at else None,
            "ready_at": self.ready_at.isoformat() if self.ready_at else None,
            "paused_at": self.paused_at.isoformat() if self.paused_at else None,
            "completed_at": self.completed_at.isoformat() if self.completed_at else None,
        }
