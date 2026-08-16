"""Celery task definitions for background processing."""
from celery import Celery
from config import settings
from app import create_app
from app.services.scheduler_service import SchedulerService
from app.services.openai_service import OpenAIService
import logging

logger = logging.getLogger(__name__)

# Create Celery app
celery_app = Celery("chatterbot")
celery_app.conf.broker_url = settings.redis_url
celery_app.conf.result_backend = settings.redis_url

# Beat schedule
celery_app.conf.beat_schedule = {
    "process-due-nudges": {
        "task": "tasks.process_nudges",
        "schedule": 60.0,  # Every minute
    },
    "cleanup-old-messages": {
        "task": "tasks.cleanup_old_data",
        "schedule": 86400.0,  # Daily
    },
}

# Create Flask app context for tasks
flask_app = create_app()


@celery_app.task
def process_nudges():
    """Process all due proactive nudges."""
    with flask_app.app_context():
        try:
            scheduler = SchedulerService()
            scheduler.process_due_nudges()
            logger.info("Nudge processing completed")
        except Exception as e:
            logger.error(f"Nudge processing failed: {e}")


@celery_app.task
def cleanup_old_data():
    """Clean up old data for GDPR compliance."""
    with flask_app.app_context():
        from datetime import datetime, timedelta
        from app import db
        from app.models.message import Message
        from app.models.context_memory import ContextMemory

        try:
            # Delete messages older than 90 days for inactive teens
            cutoff = datetime.utcnow() - timedelta(days=90)

            old_messages = Message.query.join(Conversation).join(Teen).filter(
                Teen.is_active == False,
                Message.created_at < cutoff,
            ).all()

            count = len(old_messages)
            for msg in old_messages:
                db.session.delete(msg)

            db.session.commit()
            logger.info(f"Cleaned up {count} old messages")

            # Clean expired context memories
            expired_memories = ContextMemory.query.filter(
                ContextMemory.expires_at < datetime.utcnow(),
            ).all()

            for mem in expired_memories:
                db.session.delete(mem)

            db.session.commit()
            logger.info(f"Cleaned up {len(expired_memories)} expired memories")

        except Exception as e:
            logger.error(f"Cleanup failed: {e}")
            db.session.rollback()


@celery_app.task
def generate_weekly_report(teen_id: int):
    """Generate weekly summary report for a teen."""
    with flask_app.app_context():
        from app.models.teen import Teen
        from app.models.conversation import Message

        teen = Teen.query.get(teen_id)
        if not teen:
            return

        # This would generate and email a weekly report
        logger.info(f"Weekly report generated for teen {teen_id}")
