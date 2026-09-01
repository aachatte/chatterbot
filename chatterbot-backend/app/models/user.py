"""Guardian user model."""
from datetime import datetime

from werkzeug.security import check_password_hash, generate_password_hash

from app import db
from app.models.gamification import user_badges


class User(db.Model):
    __tablename__ = "users"

    id = db.Column(db.Integer, primary_key=True)
    first_name = db.Column(db.String(100), nullable=False)
    last_name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(255), unique=True, nullable=False, index=True)
    password_hash = db.Column(db.String(255), nullable=False)
    phone = db.Column(db.String(20), nullable=True)
    is_active = db.Column(db.Boolean, default=True, nullable=False)

    # Guardian preferences
    crisis_alerts_enabled = db.Column(db.Boolean, default=True, nullable=False)
    crisis_alert_sms_enabled = db.Column(db.Boolean, default=True, nullable=False)

    # Gamification
    points = db.Column(db.Integer, default=0, nullable=False)
    level = db.Column(db.Integer, default=1, nullable=False)
    streak_count = db.Column(db.Integer, default=0, nullable=False)
    last_login_at = db.Column(db.DateTime, nullable=True)
    gamification_enabled = db.Column(db.Boolean, default=True, nullable=False)

    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    updated_at = db.Column(
        db.DateTime,
        default=datetime.utcnow,
        onupdate=datetime.utcnow,
        nullable=False,
    )

    teens = db.relationship(
        "Teen",
        backref="parent",
        lazy="dynamic",
        cascade="all, delete-orphan",
    )
    subscriptions = db.relationship(
        "Subscription",
        backref="user",
        lazy="dynamic",
        cascade="all, delete-orphan",
    )
    point_transactions = db.relationship(
        "PointTransaction",
        back_populates="user",
        lazy="dynamic",
        cascade="all, delete-orphan",
    )
    badges = db.relationship(
        "Badge",
        secondary=user_badges,
        lazy="dynamic",
    )

    def set_password(self, password: str) -> None:
        self.password_hash = generate_password_hash(password)

    def check_password(self, password: str) -> bool:
        return check_password_hash(self.password_hash, password)

    def update_level(self) -> None:
        # 100 points per level, minimum level 1.
        self.level = max(1, (self.points // 100) + 1)

    def award_points(self, amount: int) -> None:
        self.points = max(0, (self.points or 0) + amount)
        self.update_level()

    def to_dict(self):
        return {
            "id": self.id,
            "first_name": self.first_name,
            "last_name": self.last_name,
            "email": self.email,
            "phone": self.phone,
            "is_active": self.is_active,
            "crisis_alerts_enabled": self.crisis_alerts_enabled,
            "crisis_alert_sms_enabled": self.crisis_alert_sms_enabled,
            "teen_count": self.teens.count(),
            "points": self.points or 0,
            "level": self.level or 1,
            "streak_count": self.streak_count or 0,
            "gamification_enabled": bool(self.gamification_enabled),
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }
