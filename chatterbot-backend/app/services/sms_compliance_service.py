"""SMS consent command handling for enrolled teen numbers."""
import re

from app import db
from app.services.operations_service import claim_provider_event, complete_provider_event
from app.services.privacy_service import record_privacy_event
from app.utils.time import utc_now

STOP_COMMANDS = {"STOP", "STOPALL", "UNSUBSCRIBE", "CANCEL", "END", "QUIT"}
START_COMMANDS = {"START", "YES", "UNSTOP"}
HELP_COMMANDS = {"HELP", "INFO"}


def normalize_sms_command(body):
    if not isinstance(body, str):
        return ""
    return re.sub(r"[^A-Z]", "", body.strip().upper())


def handle_sms_command(teen, body, message_sid):
    """Apply a recognized consent command and return a response, or None."""
    command = normalize_sms_command(body)
    if command not in STOP_COMMANDS | START_COMMANDS | HELP_COMMANDS:
        return None

    receipt = claim_provider_event(
        "twilio",
        message_sid,
        f"sms_command.{command.lower()}",
        {"teen_id": teen.id},
    )
    if receipt is None:
        return ""
    complete_provider_event(receipt)

    if command in STOP_COMMANDS:
        if teen.sms_opted_out_at is None:
            teen.sms_opted_out_at = utc_now()
            teen.sms_opt_out_source = "teen_keyword"
            record_privacy_event(
                teen.parent_id,
                "sms_opted_out",
                teen.id,
                {"source": "teen_keyword"},
            )
        db.session.commit()
        return (
            "You are unsubscribed from Chatterbot messages. "
            "Reply START to opt in again or HELP for support."
        )

    if command in START_COMMANDS:
        if teen.sms_opted_out_at is not None:
            teen.sms_opted_out_at = None
            teen.sms_opt_out_source = None
            record_privacy_event(
                teen.parent_id,
                "sms_opted_in",
                teen.id,
                {"source": "teen_keyword"},
            )
        db.session.commit()
        if teen.consent_verified and teen.phone_verification_status == "verified":
            return "Chatterbot messages are active again. Reply STOP at any time to opt out."
        return (
            "Your SMS preference is active, but your guardian must complete "
            "consent and phone verification before conversations can begin."
        )

    db.session.commit()
    return (
        "Chatterbot is a supportive teen companion, not an emergency service. "
        "Reply STOP to unsubscribe. In immediate danger, call 911. "
        "Call or text 988 for crisis support."
    )
