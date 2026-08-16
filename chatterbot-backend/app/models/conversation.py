"""Conversation and message models."""
from datetime import datetime
from app import db


class Conversation(db.Model):
    __tablename__ = "conversations"

    id = db.Column(db.Integer, primary_key=True)
    teen_id = db.Column(db.Integer, db.ForeignKey("teens.id"), nullable=False, index=True)

    # Metadata
    started_at = db.Column(db.DateTime, default=datetime.utcnow)
    last_message_at = db.Column(db.DateTime, default=datetime.utcnow)
    message_count = db.Column(db.Integer, default=0)

    # Status
    is_active = db.Column(db.Boolean, default=True)
    is_crisis_flagged = db.Column(db.Boolean, default=False)

    # Relationships
    messages = db.relationship("Message", backref="conversation", lazy="dynamic", cascade="all, delete-orphan", order_by="Message.created_at")

    def to_dict(self):
        return {
            "id": self.id,
            "teen_id": self.teen_id,
            "started_at": self.started_at.isoformat() if self.started_at else None,
            "last_message_at": self.last_message_at.isoformat() if self.last_message_at else None,
            "message_count": self.message_count,
            "is_crisis_flagged": self.is_crisis_flagged,
        }


class Message(db.Model):
    __tablename__ = "messages"

    id = db.Column(db.Integer, primary_key=True)
    conversation_id = db.Column(db.Integer, db.ForeignKey("conversations.id"), nullable=False, index=True)

    # Direction: "inbound" (teen -> bot) or "outbound" (bot -> teen)
    direction = db.Column(db.String(20), nullable=False, index=True)

    # Content
    content = db.Column(db.Text, nullable=False)

    # Safety
    is_crisis_flagged = db.Column(db.Boolean, default=False)
    crisis_keywords_matched = db.Column(db.JSON, default=list)

    # Analytics
    sentiment_score = db.Column(db.Float, nullable=True)  # -1.0 to 1.0

    # Metadata
    created_at = db.Column(db.DateTime, default=datetime.utcnow, index=True)
    twilio_sid = db.Column(db.String(100), nullable=True)  # Twilio message SID for audit

    def to_dict(self, include_content=True):
        data = {
            "id": self.id,
            "conversation_id": self.conversation_id,
            "direction": self.direction,
            "is_crisis_flagged": self.is_crisis_flagged,
            "sentiment_score": self.sentiment_score,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }
        if include_content:
            data["content"] = self.content
        return data
