"""Stripe subscription model."""
from datetime import datetime
from app import db


class Subscription(db.Model):
    __tablename__ = "subscriptions"

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False, index=True)

    # Stripe data
    stripe_customer_id = db.Column(db.String(100), nullable=False, index=True)
    stripe_subscription_id = db.Column(db.String(100), unique=True, nullable=True)
    stripe_price_id = db.Column(db.String(100), nullable=True)

    # Plan details
    plan_name = db.Column(db.String(50), default="Guardian Premium")
    plan_tier = db.Column(db.String(20), default="premium")  # free, premium, family
    amount = db.Column(db.Integer, nullable=True)  # cents
    currency = db.Column(db.String(3), default="usd")
    interval = db.Column(db.String(20), default="month")  # month, year

    # Status
    status = db.Column(db.String(30), default="incomplete")  # active, canceled, past_due, unpaid
    current_period_start = db.Column(db.DateTime, nullable=True)
    current_period_end = db.Column(db.DateTime, nullable=True)
    cancel_at_period_end = db.Column(db.Boolean, default=False)

    # Metadata
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    def is_active(self) -> bool:
        return self.status == "active" and (
            self.current_period_end is None or 
            self.current_period_end > datetime.utcnow()
        )

    def to_dict(self):
        return {
            "id": self.id,
            "plan_name": self.plan_name,
            "plan_tier": self.plan_tier,
            "status": self.status,
            "amount": self.amount,
            "currency": self.currency,
            "interval": self.interval,
            "current_period_end": self.current_period_end.isoformat() if self.current_period_end else None,
            "cancel_at_period_end": self.cancel_at_period_end,
            "is_active": self.is_active(),
        }
