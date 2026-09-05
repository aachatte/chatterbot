"""Twilio SMS gateway service."""
from twilio.rest import Client
from twilio.http.http_client import TwilioHttpClient
from twilio.twiml.messaging_response import MessagingResponse
from config import settings
import logging

logger = logging.getLogger(__name__)


class TwilioService:
    def __init__(self):
        self.client = None
        if settings.twilio_account_sid and settings.twilio_auth_token:
            self.client = Client(
                settings.twilio_account_sid,
                settings.twilio_auth_token,
                http_client=TwilioHttpClient(
                    timeout=settings.provider_timeout_seconds,
                    max_retries=settings.provider_max_retries,
                ),
            )
        self.from_number = settings.twilio_phone_number

    def send_sms(self, to_number: str, body: str, status_callback: str | None = None) -> dict:
        """Send an SMS message via Twilio."""
        if not self.client or not self.from_number:
            logger.error("Twilio credentials or sender phone number are not configured")
            return {"success": False, "error": "SMS delivery is not configured"}

        try:
            payload = dict(
                body=body,
                from_=self.from_number,
                to=to_number,
            )
            if status_callback:
                payload["status_callback"] = status_callback
            message = self.client.messages.create(**payload)
            logger.info("SMS accepted by provider sid=%s", message.sid)
            return {
                "success": True,
                "sid": message.sid,
                "status": message.status,
            }
        except Exception as exc:
            logger.error("SMS provider request failed: %s", type(exc).__name__)
            return {"success": False, "error": "SMS provider request failed"}

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
            f"Dashboard: {settings.frontend_url}/dashboard/alerts/{alert_id}"
        )
        return self.send_sms(
            parent_phone,
            body,
            status_callback=f"{settings.app_url}/api/sms/delivery-status",
        )

    def send_proactive_nudge(self, to_number: str, message: str) -> dict:
        """Send a proactive nudge SMS."""
        return self.send_sms(to_number, message)
