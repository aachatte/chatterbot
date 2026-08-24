"""Parent user model."""
from datetime import datetime
from app import db
import bcrypt


class User(db.Model):
    __tablename__ = "users"

    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(255), unique=True, nullable=False, index=True)
    password_hash = db.Column(db.String(255), nullable=False)
    first_name = db.Column(db.String(100), nullable=False)
    last_name = db.Column(db.String(100), nullable=False)
    phone = db.Column(db.String(20), nullable=True)
    is_active = db.Column(db.Boolean, default=True)
    is_verified = db.Column(db.Boolean, default=False)
    crisis_alerts_enabled = db.Column(db.Boolean, default=True, nullable=False)
    crisis_alert_sms_enabled = db.Column(db.Boolean, default=True, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    teens = db.relationship("Teen", backref="parent", lazy="dynamic", cascade="all, delete-orphan")
    subscriptions = db.relationship("Subscription", backref="user", lazy="dynamic")

    def set_password(self, password: str):
        """Hash and store password."""
        self.password_hash = bcrypt.hashpw(
            password.encode("utf-8"), 
            bcrypt.gensalt(rounds=12)
        ).decode("utf-8")

    def check_password(self, password: str) -> bool:
        """Verify password against stored hash."""
        return bcrypt.checkpw(
            password.encode("utf-8"), 
            self.password_hash.encode("utf-8")
        )

    def to_dict(self):
        return {
            "id": self.id,
            "email": self.email,
            "first_name": self.first_name,
            "last_name": self.last_name,
            "phone": self.phone,
            "is_active": self.is_active,
            "is_verified": self.is_verified,
            "crisis_alerts_enabled": self.crisis_alerts_enabled,
            "crisis_alert_sms_enabled": self.crisis_alert_sms_enabled,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "teen_count": self.teens.count(),
        }
