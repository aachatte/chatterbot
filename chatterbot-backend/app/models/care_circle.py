"""Trusted adults and audit events for each teen's Care Circle."""
import hashlib
import hmac
import secrets
from datetime import timedelta

from app import db
from app.utils.time import utc_now


class CareCircleMember(db.Model):
    """A guardian-approved adult who can receive selected teen support signals."""

    __tablename__ = "care_circle_members"
    __table_args__ = (
        db.UniqueConstraint(
            "guardian_id",
            "teen_id",
            "email",
            name="uq_care_circle_member_email",
        ),
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
    name = db.Column(db.String(120), nullable=False)
    email = db.Column(db.String(255), nullable=False)
    phone = db.Column(db.String(20), nullable=True)
    role = db.Column(db.String(30), nullable=False, default="family_member")
    relationship = db.Column(db.String(100), nullable=True)
    access_level = db.Column(db.String(30), nullable=False, default="safety_only")
    status = db.Column(db.String(20), nullable=False, default="pending", index=True)
    notify_safety_alerts = db.Column(db.Boolean, nullable=False, default=True)
    notify_checkin_updates = db.Column(db.Boolean, nullable=False, default=False)
    invitation_token_hash = db.Column(db.String(64), nullable=True, unique=True, index=True)
    invitation_expires_at = db.Column(db.DateTime, nullable=True)
    invited_at = db.Column(db.DateTime, nullable=False, default=utc_now)
    accepted_at = db.Column(db.DateTime, nullable=True)
    last_notified_at = db.Column(db.DateTime, nullable=True)
    created_at = db.Column(db.DateTime, nullable=False, default=utc_now)
    updated_at = db.Column(
        db.DateTime,
        nullable=False,
        default=utc_now,
        onupdate=utc_now,
    )

    teen = db.relationship("Teen", back_populates="care_circle_members")

    def issue_invitation(self, expires_in=timedelta(days=7)) -> str:
        """Create a shareable token while retaining only its digest."""
        token = secrets.token_urlsafe(32)
        self.invitation_token_hash = hashlib.sha256(token.encode("utf-8")).hexdigest()
        self.invitation_expires_at = utc_now() + expires_in
        self.invited_at = utc_now()
        self.accepted_at = None
        self.status = "pending"
        return token

    def invitation_is_valid(self, token: str) -> bool:
        """Validate an invitation token without exposing or storing its raw value."""
        if (
            not isinstance(token, str)
            or not self.invitation_token_hash
            or not self.invitation_expires_at
            or self.invitation_expires_at < utc_now()
            or self.status != "pending"
        ):
            return False
        digest = hashlib.sha256(token.encode("utf-8")).hexdigest()
        return hmac.compare_digest(digest, self.invitation_token_hash)

    def accept_invitation(self) -> None:
        """Activate membership and invalidate the one-time invitation."""
        self.status = "active"
        self.accepted_at = utc_now()
        self.invitation_token_hash = None
        self.invitation_expires_at = None

    def to_dict(self) -> dict:
        """Return guardian-visible member data without invitation secrets."""
        return {
            "id": self.id,
            "teen_id": self.teen_id,
            "name": self.name,
            "email": self.email,
            "phone": self.phone,
            "role": self.role,
            "relationship": self.relationship,
            "access_level": self.access_level,
            "status": self.status,
            "notify_safety_alerts": bool(self.notify_safety_alerts),
            "notify_checkin_updates": bool(self.notify_checkin_updates),
            "invitation_expires_at": (
                self.invitation_expires_at.isoformat()
                if self.invitation_expires_at
                else None
            ),
            "invited_at": self.invited_at.isoformat() if self.invited_at else None,
            "accepted_at": self.accepted_at.isoformat() if self.accepted_at else None,
            "last_notified_at": (
                self.last_notified_at.isoformat() if self.last_notified_at else None
            ),
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
        }


class CareCircleActivity(db.Model):
    """Privacy-safe history of Care Circle configuration changes."""

    __tablename__ = "care_circle_activities"

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
    member_id = db.Column(db.Integer, nullable=True)
    member_name = db.Column(db.String(120), nullable=True)
    action = db.Column(db.String(40), nullable=False)
    detail = db.Column(db.String(300), nullable=False)
    actor_name = db.Column(db.String(120), nullable=False)
    created_at = db.Column(db.DateTime, nullable=False, default=utc_now, index=True)

    teen = db.relationship("Teen", back_populates="care_circle_activities")

    def to_dict(self) -> dict:
        """Serialize an audit event for the dashboard timeline."""
        return {
            "id": self.id,
            "teen_id": self.teen_id,
            "member_id": self.member_id,
            "member_name": self.member_name,
            "action": self.action,
            "detail": self.detail,
            "actor_name": self.actor_name,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }
