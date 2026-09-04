"""Operational records for safety review, delivery, and family plans."""
from app import db
from app.utils.time import utc_now


class SafetyAlertEvent(db.Model):
    __tablename__ = "safety_alert_events"

    id = db.Column(db.Integer, primary_key=True)
    alert_id = db.Column(
        db.Integer,
        db.ForeignKey("crisis_alerts.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    actor_type = db.Column(db.String(30), nullable=False, default="system")
    actor_id = db.Column(db.Integer, nullable=True)
    actor_name = db.Column(db.String(120), nullable=False, default="Chatterbot")
    action = db.Column(db.String(50), nullable=False, index=True)
    from_status = db.Column(db.String(30), nullable=True)
    to_status = db.Column(db.String(30), nullable=True)
    notes = db.Column(db.String(2000), nullable=True)
    created_at = db.Column(db.DateTime, nullable=False, default=utc_now, index=True)

    def to_dict(self):
        return {
            "id": self.id,
            "action": self.action,
            "actor_type": self.actor_type,
            "actor_name": self.actor_name,
            "from_status": self.from_status,
            "to_status": self.to_status,
            "notes": self.notes,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }


class NotificationDelivery(db.Model):
    __tablename__ = "notification_deliveries"

    id = db.Column(db.Integer, primary_key=True)
    alert_id = db.Column(
        db.Integer,
        db.ForeignKey("crisis_alerts.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    recipient_type = db.Column(db.String(30), nullable=False)
    recipient_id = db.Column(db.Integer, nullable=True)
    recipient_name = db.Column(db.String(120), nullable=False)
    masked_destination = db.Column(db.String(40), nullable=True)
    channel = db.Column(db.String(20), nullable=False, default="sms")
    provider_sid = db.Column(db.String(100), nullable=True, unique=True, index=True)
    status = db.Column(db.String(30), nullable=False, default="pending", index=True)
    attempt_count = db.Column(db.Integer, nullable=False, default=1)
    last_error = db.Column(db.String(500), nullable=True)
    created_at = db.Column(db.DateTime, nullable=False, default=utc_now)
    updated_at = db.Column(db.DateTime, nullable=False, default=utc_now, onupdate=utc_now)
    delivered_at = db.Column(db.DateTime, nullable=True)

    def to_dict(self):
        return {
            "id": self.id,
            "recipient_type": self.recipient_type,
            "recipient_name": self.recipient_name,
            "masked_destination": self.masked_destination,
            "channel": self.channel,
            "status": self.status,
            "attempt_count": self.attempt_count,
            "last_error": self.last_error,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
            "delivered_at": self.delivered_at.isoformat() if self.delivered_at else None,
        }


class FamilySafetyPlan(db.Model):
    __tablename__ = "family_safety_plans"
    __table_args__ = (
        db.UniqueConstraint("teen_id", name="uq_family_safety_plan_teen"),
    )

    id = db.Column(db.Integer, primary_key=True)
    guardian_id = db.Column(
        db.Integer,
        db.ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    teen_id = db.Column(
        db.Integer,
        db.ForeignKey("teens.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    plan_data = db.Column(db.JSON, nullable=False, default=dict)
    is_active = db.Column(db.Boolean, nullable=False, default=False)
    version = db.Column(db.Integer, nullable=False, default=1)
    teen_acknowledged_at = db.Column(db.DateTime, nullable=True)
    created_at = db.Column(db.DateTime, nullable=False, default=utc_now)
    updated_at = db.Column(db.DateTime, nullable=False, default=utc_now, onupdate=utc_now)

    def to_dict(self, reachable_adults=0):
        return {
            "id": self.id,
            "teen_id": self.teen_id,
            "plan": self.plan_data or {},
            "is_active": bool(self.is_active),
            "version": self.version,
            "reachable_adults": reachable_adults,
            "teen_acknowledged_at": (
                self.teen_acknowledged_at.isoformat()
                if self.teen_acknowledged_at
                else None
            ),
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
        }
