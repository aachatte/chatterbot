"""Celery task definitions for background processing."""
import logging
from datetime import datetime, timedelta
from celery import Celery
from celery.utils.log import get_task_logger
from config import settings
from app import create_app, db
from app.services.scheduler_service import SchedulerService
from app.services.openai_service import OpenAIService

logger = get_task_logger(__name__)

# Create Celery app
celery_app = Celery("chatterbot")
celery_app.conf.broker_url = settings.redis_url
celery_app.conf.result_backend = settings.redis_url
celery_app.conf.task_serializer = "json"
celery_app.conf.accept_content = ["json"]
celery_app.conf.result_serializer = "json"
celery_app.conf.timezone = "UTC"

# Beat schedule configuration
celery_app.conf.beat_schedule = {
    "process-due-nudges": {
        "task": "tasks.process_nudges",
        "schedule": 60.0,  # Every minute
    },
    "cleanup-old-messages": {
        "task": "tasks.cleanup_old_data",
        "schedule": 86400.0,  # Daily at midnight
    },
    "generate-weekly-reports": {
        "task": "tasks.generate_weekly_reports",
        "schedule": 604800.0,  # Weekly (7 days)
    },
}

# Create Flask app context for tasks
flask_app = create_app()


@celery_app.task(bind=True, max_retries=3, default_retry_delay=60)
def process_nudges(self):
    """Process all due proactive nudges with retry logic.
    
    Args:
        self: Celery task instance for retry functionality
    """
    with flask_app.app_context():
        try:
            scheduler = SchedulerService()
            count = scheduler.process_due_nudges()
            logger.info(f"Nudge processing completed. Processed {count} nudges.")
            return {"status": "success", "nudges_processed": count}
        except Exception as e:
            logger.error(f"Nudge processing failed: {e}", exc_info=True)
            # Retry with exponential backoff
            try:
                self.retry(exc=e, countdown=2 ** self.request.retries)
            except self.MaxRetriesExceededError:
                logger.error(f"Max retries exceeded for nudge processing: {e}")
                return {"status": "failed", "error": str(e)}


@celery_app.task(bind=True, max_retries=3, default_retry_delay=60)
def cleanup_old_data(self):
    """Clean up old data for GDPR compliance with error handling.
    
    Args:
        self: Celery task instance for retry functionality
    """
    with flask_app.app_context():
        try:
            from app.models.message import Message
            from app.models.context_memory import ContextMemory
            from app.models.conversation import Conversation
            from app.models.teen import Teen
            
            # Delete messages older than 90 days for inactive teens
            cutoff_date = datetime.utcnow() - timedelta(days=90)
            
            # Query and delete old messages
            old_messages = db.session.query(Message).join(Conversation).join(Teen).filter(
                Teen.is_active == False,
                Message.created_at < cutoff_date,
            ).all()
            
            message_count = len(old_messages)
            for msg in old_messages:
                db.session.delete(msg)
            
            db.session.commit()
            logger.info(f"Cleaned up {message_count} old messages from inactive teens")
            
            # Clean expired context memories
            expired_memories = db.session.query(ContextMemory).filter(
                ContextMemory.expires_at < datetime.utcnow(),
            ).all()
            
            memory_count = len(expired_memories)
            for mem in expired_memories:
                db.session.delete(mem)
            
            db.session.commit()
            logger.info(f"Cleaned up {memory_count} expired context memories")
            
            return {
                "status": "success",
                "messages_deleted": message_count,
                "memories_deleted": memory_count
            }
        
        except Exception as e:
            db.session.rollback()
            logger.error(f"Cleanup task failed: {e}", exc_info=True)
            # Retry with exponential backoff
            try:
                self.retry(exc=e, countdown=2 ** self.request.retries)
            except self.MaxRetriesExceededError:
                logger.error(f"Max retries exceeded for cleanup task: {e}")
                return {"status": "failed", "error": str(e)}


@celery_app.task(bind=True, max_retries=2, default_retry_delay=120)
def generate_weekly_reports(self):
    """Generate weekly summary reports for all active teens.
    
    Args:
        self: Celery task instance for retry functionality
    """
    with flask_app.app_context():
        try:
            from app.models.teen import Teen
            
            # Get all active teens
            active_teens = db.session.query(Teen).filter(
                Teen.is_active == True
            ).all()
            
            report_count = 0
            for teen in active_teens:
                try:
                    generate_teen_weekly_report.delay(teen.id)
                    report_count += 1
                except Exception as e:
                    logger.error(f"Failed to queue report for teen {teen.id}: {e}")
            
            logger.info(f"Queued {report_count} weekly reports for generation")
            return {"status": "success", "reports_queued": report_count}
        
        except Exception as e:
            logger.error(f"Weekly report generation failed: {e}", exc_info=True)
            try:
                self.retry(exc=e, countdown=2 ** self.request.retries)
            except self.MaxRetriesExceededError:
                logger.error(f"Max retries exceeded for report generation: {e}")
                return {"status": "failed", "error": str(e)}


@celery_app.task(bind=True, max_retries=2, default_retry_delay=60)
def generate_teen_weekly_report(self, teen_id: int):
    """Generate weekly summary report for a specific teen.
    
    Args:
        self: Celery task instance for retry functionality
        teen_id: ID of the teen to generate report for
    """
    with flask_app.app_context():
        try:
            from app.models.teen import Teen
            from app.models.message import Message
            
            teen = db.session.query(Teen).get(teen_id)
            if not teen:
                logger.warning(f"Teen {teen_id} not found")
                return {"status": "failed", "error": "Teen not found"}
            
            # Calculate week range
            today = datetime.utcnow().date()
            week_start = today - timedelta(days=today.weekday())
            week_end = week_start + timedelta(days=7)
            
            # Get messages from this week
            messages = db.session.query(Message).filter(
                Message.teen_id == teen_id,
                Message.created_at >= week_start,
                Message.created_at < week_end
            ).all()
            
            logger.info(f"Generated weekly report for teen {teen_id} with {len(messages)} messages")
            
            # TODO: Email report to guardian
            # send_weekly_report_email.delay(teen_id, report_data)
            
            return {
                "status": "success",
                "teen_id": teen_id,
                "message_count": len(messages),
                "week_start": week_start.isoformat(),
                "week_end": week_end.isoformat()
            }
        
        except Exception as e:
            logger.error(f"Report generation failed for teen {teen_id}: {e}", exc_info=True)
            try:
                self.retry(exc=e, countdown=2 ** self.request.retries)
            except self.MaxRetriesExceededError:
                logger.error(f"Max retries exceeded for teen {teen_id} report: {e}")
                return {"status": "failed", "teen_id": teen_id, "error": str(e)}
