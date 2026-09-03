"""Referral program model."""
import secrets
import string
from app import db
from app.utils.time import utc_now


def _generate_code():
    alphabet = string.ascii_uppercase + string.digits
    return ''.join(secrets.choice(alphabet) for _ in range(8))


class Referral(db.Model):
    __tablename__ = "referrals"

    id = db.Column(db.Integer, primary_key=True)
    referrer_guardian_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=True, index=True)
    referree_email = db.Column(db.String(200), nullable=True)
    code = db.Column(db.String(20), unique=True, nullable=False, default=_generate_code)
    used = db.Column(db.Boolean, default=False, nullable=False)
    used_at = db.Column(db.DateTime, nullable=True)
    created_at = db.Column(db.DateTime, default=utc_now, nullable=True)

    def to_dict(self):
        return {
            "id": self.id,
            "referrer_guardian_id": self.referrer_guardian_id,
            "referree_email": self.referree_email,
            "code": self.code,
            "used": self.used,
            "used_at": self.used_at.isoformat() if self.used_at else None,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }
