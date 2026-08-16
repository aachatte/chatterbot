"""Context memory management service."""
from app import db
from app.models.context_memory import ContextMemory
from app.models.conversation import Message
from app.services.openai_service import OpenAIService
import logging

logger = logging.getLogger(__name__)


class ContextMemoryService:
    def __init__(self):
        self.openai = OpenAIService()

    def get_context_for_teen(self, teen_id: int, limit: int = 20) -> list:
        """Retrieve relevant context memories for a teen."""
        memories = ContextMemory.query.filter_by(teen_id=teen_id)\
            .filter(ContextMemory.expires_at.is_(None) | (ContextMemory.expires_at > db.func.now()))\
            .order_by(ContextMemory.importance.desc(), ContextMemory.last_confirmed_at.desc())\
            .limit(limit)\
            .all()

        return [m.to_prompt_context() for m in memories]

    def add_memory(
        self,
        teen_id: int,
        memory_type: str,
        key: str,
        value: str,
        importance: int = 5,
        confidence: float = 0.8,
        source_message_id: int = None,
        expires_at=None,
    ) -> ContextMemory:
        """Add a new context memory."""
        # Check if memory already exists
        existing = ContextMemory.query.filter_by(teen_id=teen_id, key=key).first()

        if existing:
            existing.value = value
            existing.confidence = max(existing.confidence, confidence)
            existing.last_confirmed_at = db.func.now()
            if importance > existing.importance:
                existing.importance = importance
            db.session.commit()
            return existing

        memory = ContextMemory(
            teen_id=teen_id,
            memory_type=memory_type,
            key=key,
            value=value,
            importance=importance,
            confidence=confidence,
            source_message_id=source_message_id,
            expires_at=expires_at,
        )
        db.session.add(memory)
        db.session.commit()

        logger.info(f"Context memory added for teen {teen_id}: {key}={value}")
        return memory

    def extract_and_store(self, teen, message: Message) -> list:
        """Extract facts from a message and store as context memories."""
        facts = self.openai.extract_context_facts(message.content, teen.first_name)
        stored = []

        for fact in facts:
            try:
                memory = self.add_memory(
                    teen_id=teen.id,
                    memory_type=fact.get("type", "fact"),
                    key=fact.get("key", "unknown"),
                    value=fact.get("value", ""),
                    importance=fact.get("importance", 5),
                    confidence=fact.get("confidence", 0.7),
                    source_message_id=message.id,
                )
                stored.append(memory)
            except Exception as e:
                logger.error(f"Failed to store context memory: {e}")

        return stored

    def get_conversation_history(self, teen_id: int, limit: int = 10) -> list:
        """Get recent conversation history for LLM context."""
        from app.models.conversation import Conversation, Message

        messages = Message.query.join(Conversation)\
            .filter(Conversation.teen_id == teen_id)\
            .order_by(Message.created_at.desc())\
            .limit(limit)\
            .all()

        return [
            {
                "direction": m.direction,
                "content": m.content,
                "created_at": m.created_at.isoformat(),
            }
            for m in reversed(messages)
        ]
