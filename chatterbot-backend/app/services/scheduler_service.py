"""Proactive nudge scheduling service."""
from datetime import datetime, timedelta
from app import db
from app.models.scheduled_nudge import ScheduledNudge
from app.models.teen import Teen
from app.services.twilio_service import TwilioService
from app.services.openai_service import OpenAIService
from app.services.context_service import ContextMemoryService
from app.utils.time import utc_now
import logging

logger = logging.getLogger(__name__)


class SchedulerService:
    def __init__(self):
        self.twilio = TwilioService()
        self.openai = OpenAIService()
        self.context = ContextMemoryService()

    def create_nudge(
        self,
        teen_id: int,
        nudge_type: str,
        trigger_condition: str,
        template_message: str,
        max_sends: int = 1,
    ) -> ScheduledNudge:
        """Create a new scheduled nudge."""
        nudge = ScheduledNudge(
            teen_id=teen_id,
            nudge_type=nudge_type,
            trigger_condition=trigger_condition,
            template_message=template_message,
            max_sends=max_sends,
        )
        db.session.add(nudge)
        db.session.commit()
        return nudge

    def process_due_nudges(self):
        """Process all nudges that are due to be sent. Called by Celery beat."""
        now = utc_now()

        due_nudges = ScheduledNudge.query.filter(
            ScheduledNudge.is_active == True,
            ScheduledNudge.next_send_at <= now,
            (ScheduledNudge.max_sends == 0) | (ScheduledNudge.send_count < ScheduledNudge.max_sends),
        ).all()

        for nudge in due_nudges:
            self._send_nudge(nudge)

    def _send_nudge(self, nudge: ScheduledNudge):
        """Send a single nudge and update state."""
        teen = db.session.get(Teen, nudge.teen_id)
        if not teen or not teen.is_active:
            nudge.is_active = False
            db.session.commit()
            return

        # Personalize message with context
        context_facts = self.context.get_context_for_teen(teen.id, limit=10)

        # Use LLM to personalize the template
        personalized = self._personalize_nudge(nudge.template_message, teen, context_facts)

        # Send via Twilio
        result = self.twilio.send_proactive_nudge(teen.phone, personalized)

        if result["success"]:
            nudge.send_count += 1
            nudge.last_sent_at = utc_now()

            # Schedule next send based on trigger condition
            nudge.next_send_at = self._calculate_next_send(nudge)

            # Store as outbound message
            from app.models.conversation import Conversation, Message
            conv = Conversation.query.filter_by(teen_id=teen.id, is_active=True).first()
            if not conv:
                conv = Conversation(teen_id=teen.id)
                db.session.add(conv)
                db.session.commit()

            msg = Message(
                conversation_id=conv.id,
                direction="outbound",
                content=personalized,
                twilio_sid=result.get("sid"),
            )
            db.session.add(msg)
            conv.last_message_at = utc_now()
            conv.message_count += 1

            db.session.commit()
            logger.info(f"Nudge sent to teen {teen.id}: {personalized[:50]}...")
        else:
            logger.error(f"Failed to send nudge to teen {teen.id}: {result.get('error')}")

    def _personalize_nudge(self, template: str, teen, context_facts: list) -> str:
        """Use LLM to personalize a nudge template."""
        context_str = "\n".join(context_facts) if context_facts else "No context available."

        prompt = f"""Personalize this nudge message for {teen.first_name}. Use their name and reference relevant context. Keep it to 1-2 sentences, casual and friendly.

Template: "{template}"

Context:
{context_str}

Personalized message:"""

        try:
            response = self.openai.client.chat.completions.create(
                model=self.openai.model,
                messages=[{"role": "user", "content": prompt}],
                max_tokens=100,
                temperature=0.7,
            )
            return response.choices[0].message.content.strip()
        except Exception as e:
            logger.error(f"Nudge personalization failed: {e}")
            return template.replace("{name}", teen.first_name)

    def _calculate_next_send(self, nudge: ScheduledNudge) -> datetime:
        """Calculate next send time based on trigger condition."""
        condition = nudge.trigger_condition

        if condition.startswith("time:"):
            # Daily at specific time: "time:16:30"
            time_str = condition.split(":", 1)[1]
            hour, minute = map(int, time_str.split(":"))
            next_day = utc_now() + timedelta(days=1)
            return next_day.replace(hour=hour, minute=minute, second=0, microsecond=0)

        elif condition.startswith("interval:"):
            # Every X hours: "interval:24"
            hours = int(condition.split(":", 1)[1])
            return utc_now() + timedelta(hours=hours)

        elif condition.startswith("silence:"):
            # After X hours of no response: "silence:24"
            hours = int(condition.split(":", 1)[1])
            return utc_now() + timedelta(hours=hours)

        else:
            # Default: next day
            return utc_now() + timedelta(days=1)

    def schedule_default_nudges(self, teen_id: int):
        """Schedule default proactive nudges for a new teen."""
        defaults = [
            {
                "type": "check_in",
                "trigger": "time:16:00",
                "message": "Hey {name}! How was school today? Anything exciting happen?",
            },
            {
                "type": "reminder",
                "trigger": "time:20:00",
                "message": "Evening check-in! Do not forget to wind down a bit before bed. How are you feeling?",
            },
            {
                "type": "goal",
                "trigger": "interval:48",
                "message": "Hey {name}, just checking in on your goals. Any progress this week?",
            },
        ]

        for nudge in defaults:
            self.create_nudge(
                teen_id=teen_id,
                nudge_type=nudge["type"],
                trigger_condition=nudge["trigger"],
                template_message=nudge["message"],
                max_sends=0,  # Unlimited
            )

        logger.info(f"Default nudges scheduled for teen {teen_id}")
