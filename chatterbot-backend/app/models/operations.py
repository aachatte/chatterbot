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


class ProviderEvent(db.Model):
    __tablename__ = "provider_events"
    __table_args__ = (
        db.UniqueConstraint("provider", "event_id", name="uq_provider_event"),
    )

    id = db.Column(db.Integer, primary_key=True)
    provider = db.Column(db.String(30), nullable=False, index=True)
    event_id = db.Column(db.String(160), nullable=False)
    event_type = db.Column(db.String(100), nullable=False, index=True)
    status = db.Column(db.String(30), nullable=False, default="processed", index=True)
    detail = db.Column(db.JSON, nullable=False, default=dict)
    received_at = db.Column(db.DateTime, nullable=False, default=utc_now, index=True)
    processed_at = db.Column(db.DateTime, nullable=True)


class OperationalEvent(db.Model):
    __tablename__ = "operational_events"

    id = db.Column(db.Integer, primary_key=True)
    category = db.Column(db.String(40), nullable=False, index=True)
    severity = db.Column(db.String(20), nullable=False, default="warning", index=True)
    status = db.Column(db.String(20), nullable=False, default="open", index=True)
    source = db.Column(db.String(80), nullable=False)
    code = db.Column(db.String(80), nullable=False)
    detail = db.Column(db.JSON, nullable=False, default=dict)
    created_at = db.Column(db.DateTime, nullable=False, default=utc_now, index=True)
    resolved_at = db.Column(db.DateTime, nullable=True)

    def to_dict(self):
        return {
            "id": self.id,
            "category": self.category,
            "severity": self.severity,
            "status": self.status,
            "source": self.source,
            "code": self.code,
            "detail": self.detail or {},
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "resolved_at": self.resolved_at.isoformat() if self.resolved_at else None,
        }


class GuardianNotification(db.Model):
    __tablename__ = "guardian_notifications"

    id = db.Column(db.Integer, primary_key=True)
    guardian_id = db.Column(
        db.Integer,
        db.ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    category = db.Column(db.String(40), nullable=False, index=True)
    title = db.Column(db.String(120), nullable=False)
    body = db.Column(db.String(500), nullable=False)
    created_at = db.Column(db.DateTime, nullable=False, default=utc_now, index=True)
    read_at = db.Column(db.DateTime, nullable=True)

    def to_dict(self):
        return {
            "id": self.id,
            "category": self.category,
            "title": self.title,
            "body": self.body,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "read_at": self.read_at.isoformat() if self.read_at else None,
        }
