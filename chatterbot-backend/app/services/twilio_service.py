"""Twilio SMS gateway service."""
from twilio.rest import Client
from twilio.twiml.messaging_response import MessagingResponse
from config import settings
import logging

logger = logging.getLogger(__name__)


class TwilioService:
    def __init__(self):
        self.client = Client(settings.twilio_account_sid, settings.twilio_auth_token)
        self.from_number = settings.twilio_phone_number

    def send_sms(self, to_number: str, body: str) -> dict:
        """Send an SMS message via Twilio."""
        try:
            message = self.client.messages.create(
                body=body,
                from_=self.from_number,
                to=to_number,
            )
            logger.info(f"SMS sent to {to_number}: SID={message.sid}")
            return {
                "success": True,
                "sid": message.sid,
                "status": message.status,
            }
        except Exception as e:
            logger.error(f"Failed to send SMS to {to_number}: {e}")
            return {"success": False, "error": str(e)}

    def parse_inbound_webhook(self, form_data: dict) -> dict:
        """Parse Twilio inbound message webhook data."""
        return {
            "from_number": form_data.get("From", ""),
            "to_number": form_data.get("To", ""),
            "body": form_data.get("Body", ""),
            "message_sid": form_data.get("MessageSid", ""),
            "num_media": int(form_data.get("NumMedia", 0)),
        }

    def create_empty_response(self) -> str:
        """Create empty TwiML response (for async handling)."""
        return str(MessagingResponse())

    def send_crisis_alert(self, parent_phone: str, teen_name: str, alert_id: int) -> dict:
        """Send crisis escalation SMS to parent."""
        body = (
            f"\u26a0\ufe0f Chatterbot Crisis Alert\n\n"
            f"We detected concerning language from {teen_name}. "
            f"Please check in with them immediately.\n\n"
            f"Alert ID: {alert_id}\n"
            f"Dashboard: {settings.app_url}/dashboard/alerts/{alert_id}"
        )
        return self.send_sms(parent_phone, body)

    def send_proactive_nudge(self, to_number: str, message: str) -> dict:
        """Send a proactive nudge SMS."""
        return self.send_sms(to_number, message)
