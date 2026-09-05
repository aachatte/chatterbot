"""Accountable staff access and audit records for pilot operations."""
import hashlib
import hmac
import secrets
from datetime import timedelta

from werkzeug.security import check_password_hash, generate_password_hash

from app import db
from app.utils.time import utc_now


STAFF_ROLES = {"viewer", "operator", "safety_lead", "admin"}


class StaffUser(db.Model):
    __tablename__ = "staff_users"

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(120), nullable=False)
    email = db.Column(db.String(255), nullable=False, unique=True, index=True)
    password_hash = db.Column(db.String(255), nullable=False)
    role = db.Column(db.String(30), nullable=False, default="viewer", index=True)
    is_active = db.Column(db.Boolean, nullable=False, default=True)
    failed_login_count = db.Column(db.Integer, nullable=False, default=0)
    locked_until = db.Column(db.DateTime, nullable=True)
    last_login_at = db.Column(db.DateTime, nullable=True)
    created_at = db.Column(db.DateTime, nullable=False, default=utc_now)
    updated_at = db.Column(
        db.DateTime, nullable=False, default=utc_now, onupdate=utc_now
    )

    def set_password(self, password):
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.password_hash, password)

    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "email": self.email,
            "role": self.role,
            "is_active": bool(self.is_active),
            "last_login_at": (
                self.last_login_at.isoformat() if self.last_login_at else None
            ),
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }


class StaffSession(db.Model):
    __tablename__ = "staff_sessions"

    id = db.Column(db.Integer, primary_key=True)
    staff_user_id = db.Column(
        db.Integer,
        db.ForeignKey("staff_users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    token_hash = db.Column(db.String(64), nullable=False, unique=True, index=True)
    expires_at = db.Column(db.DateTime, nullable=False, index=True)
    revoked_at = db.Column(db.DateTime, nullable=True)
    created_at = db.Column(db.DateTime, nullable=False, default=utc_now)

    staff_user = db.relationship("StaffUser")

    @classmethod
    def issue(cls, staff_user, lifetime=timedelta(hours=8)):
        token = secrets.token_urlsafe(32)
        session = cls(
            staff_user_id=staff_user.id,
            token_hash=hashlib.sha256(token.encode("utf-8")).hexdigest(),
            expires_at=utc_now() + lifetime,
        )
        return token, session

    def matches(self, token):
        digest = hashlib.sha256(token.encode("utf-8")).hexdigest()
        return hmac.compare_digest(digest, self.token_hash)


class StaffAuditLog(db.Model):
    __tablename__ = "staff_audit_logs"

    id = db.Column(db.Integer, primary_key=True)
    staff_user_id = db.Column(
        db.Integer,
        db.ForeignKey("staff_users.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
    )
    actor_name = db.Column(db.String(120), nullable=False)
    action = db.Column(db.String(80), nullable=False, index=True)
    resource_type = db.Column(db.String(60), nullable=False)
    resource_id = db.Column(db.String(80), nullable=True)
    detail = db.Column(db.JSON, nullable=False, default=dict)
    created_at = db.Column(db.DateTime, nullable=False, default=utc_now, index=True)

    def to_dict(self):
        return {
            "id": self.id,
            "staff_user_id": self.staff_user_id,
            "actor_name": self.actor_name,
            "action": self.action,
            "resource_type": self.resource_type,
            "resource_id": self.resource_id,
            "detail": self.detail or {},
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }
