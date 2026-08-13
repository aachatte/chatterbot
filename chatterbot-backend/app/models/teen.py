"""Teen user model — the end-user Chatterbot texts."""
from datetime import datetime
from app import db


class Teen(db.Model):
    __tablename__ = "teens"

    id = db.Column(db.Integer, primary_key=True)
    parent_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False, index=True)

    # Identity
    first_name = db.Column(db.String(100), nullable=False)
    phone = db.Column(db.String(20), unique=True, nullable=False, index=True)

    # Profile data (COPPA-compliant, minimal)
    age = db.Column(db.Integer, nullable=True)
    school = db.Column(db.String(200), nullable=True)
    grade = db.Column(db.String(20), nullable=True)

    # Preferences
    interests = db.Column(db.JSON, default=list)  # ["lacrosse", "debate", "music"]
    schedule = db.Column(db.JSON, default=dict)   # {"lacrosse": "Mon/Wed 4:30pm", ...}

    # Safety settings
    crisis_keywords_enabled = db.Column(db.Boolean, default=True)
    proactive_nudges_enabled = db.Column(db.Boolean, default=True)
    nudge_frequency = db.Column(db.String(20), default="moderate")  # low, moderate, high

    # Status
    is_active = db.Column(db.Boolean, default=True)
    consent_verified = db.Column(db.Boolean, default=False)  # Parental consent for COPPA
    consent_verified_at = db.Column(db.DateTime, nullable=True)

    # Analytics
    last_interaction_at = db.Column(db.DateTime, nullable=True)
    message_count = db.Column(db.Integer, default=0)
    crisis_alert_count = db.Column(db.Integer, default=0)

    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    conversations = db.relationship("Conversation", backref="teen", lazy="dynamic", cascade="all, delete-orphan")
    context_memories = db.relationship("ContextMemory", backref="teen", lazy="dynamic", cascade="all, delete-orphan")
    scheduled_nudges = db.relationship("ScheduledNudge", backref="teen", lazy="dynamic", cascade="all, delete-orphan")
    crisis_alerts = db.relationship("CrisisAlert", backref="teen", lazy="dynamic", cascade="all, delete-orphan")

    def to_dict(self):
        return {
            "id": self.id,
            "parent_id": self.parent_id,
            "first_name": self.first_name,
            "phone": self.phone,
            "age": self.age,
            "grade": self.grade,
            "interests": self.interests or [],
            "is_active": self.is_active,
            "consent_verified": self.consent_verified,
            "last_interaction_at": self.last_interaction_at.isoformat() if self.last_interaction_at else None,
            "message_count": self.message_count,
            "crisis_alert_count": self.crisis_alert_count,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }

    def to_dashboard_summary(self):
        """Privacy-safe summary for parent dashboard."""
        # Calculate mood score from recent messages (last 7 days)
        from app.models.conversation import Message
        recent_msgs = Message.query.filter(
            Message.conversation.has(teen_id=self.id),
            Message.created_at >= datetime.utcnow().replace(day=datetime.utcnow().day - 7)
        ).order_by(Message.created_at.desc()).limit(50).all()

        # Simple sentiment heuristic
        positive_words = ["happy", "excited", "great", "awesome", "won", "love", "fun", "good"]
        negative_words = ["sad", "stressed", "anxious", "tired", "angry", "upset", "worried", "scared"]

        pos_count = sum(1 for m in recent_msgs if any(w in m.content.lower() for w in positive_words))
        neg_count = sum(1 for m in recent_msgs if any(w in m.content.lower() for w in negative_words))
        total = len(recent_msgs) or 1

        mood_score = max(0, min(100, int(((pos_count - neg_count + total/2) / total) * 100)))

        # Activity by day (last 7 days)
        activity = {}
        for msg in recent_msgs:
            day = msg.created_at.strftime("%a")
            activity[day] = activity.get(day, 0) + 1

        return {
            "id": self.id,
            "first_name": self.first_name,
            "age": self.age,
            "grade": self.grade,
            "mood_score": mood_score,
            "mood_label": self._mood_label(mood_score),
            "message_count_7d": len(recent_msgs),
            "activity_by_day": activity,
            "last_interaction_at": self.last_interaction_at.isoformat() if self.last_interaction_at else None,
            "crisis_alert_count": self.crisis_alert_count,
            "interests": self.interests or [],
        }

    def _mood_label(self, score: int) -> str:
        if score >= 70: return "positive"
        if score >= 40: return "neutral"
        return "concerning"
