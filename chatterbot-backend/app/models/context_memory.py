"""Context memory model — stores conversation context for LLM recall."""
from app import db
from app.utils.time import utc_now


class ContextMemory(db.Model):
    __tablename__ = "context_memories"

    id = db.Column(db.Integer, primary_key=True)
    teen_id = db.Column(db.Integer, db.ForeignKey("teens.id"), nullable=False, index=True)

    # Memory content
    memory_type = db.Column(db.String(50), nullable=False)  # fact, preference, event, goal, concern
    key = db.Column(db.String(200), nullable=False)  # e.g., "lacrosse_practice_time"
    value = db.Column(db.Text, nullable=False)  # e.g., "Mon/Wed 4:30pm at Central Field"

    # Relevance scoring
    importance = db.Column(db.Integer, default=5)  # 1-10
    confidence = db.Column(db.Float, default=0.8)  # 0.0-1.0

    # Temporal
    first_observed_at = db.Column(db.DateTime, default=utc_now)
    last_confirmed_at = db.Column(db.DateTime, default=utc_now)
    expires_at = db.Column(db.DateTime, nullable=True)  # Some memories expire (e.g., temp events)

    # Source
    source_message_id = db.Column(db.Integer, db.ForeignKey("messages.id"), nullable=True)

    def to_dict(self):
        return {
            "id": self.id,
            "memory_type": self.memory_type,
            "key": self.key,
            "value": self.value,
            "importance": self.importance,
            "confidence": self.confidence,
            "last_confirmed_at": self.last_confirmed_at.isoformat() if self.last_confirmed_at else None,
        }

    def to_prompt_context(self) -> str:
        """Format for LLM system prompt injection."""
        return f"- {self.key}: {self.value}"
