"""Crisis detection and escalation service."""
import re
from config import settings
from app import db
from app.models.crisis_alert import CrisisAlert, CrisisStatus
from app.services.twilio_service import TwilioService
from app.utils.time import utc_now
import logging

logger = logging.getLogger(__name__)

# Crisis keyword patterns (expandable)
CRISIS_KEYWORDS = {
    "self_harm": [
        r"hurt\s*myself",
        r"cut\s*myself",
        r"self[-\s]?harm",
        r"end\s*it\s*all",
        r"kill\s*myself",
        r"suicide",
        r"suicidal",
        r"don\'t\s*want\s*to\s*(?:be\s*here|live|exist)",
        r"better\s*off\s*dead",
        r"no\s*point\s*in\s*living",
    ],
    "severe_bullying": [
        r"everyone\s*hates\s*me",
        r"nobody\s*cares",
        r"can\'t\s*take\s*it\s*anymore",
        r"being\s*bullied",
        r"harassed\s*every\s*day",
    ],
    "substance_abuse": [
        r"overdose",
        r"took\s*too\s*many\s*pills",
        r"drinking\s*to\s*forget",
    ],
    "violence": [
        r"want\s*to\s*hurt\s*(?:someone|them|everyone)",
        r"gonna\s*bring\s*a\s*(?:gun|weapon)",
        r"shoot\s*up",
    ],
}


class CrisisDetectionService:
    def __init__(self):
        self.twilio = TwilioService()

    def scan_message(self, text: str) -> dict:
        """Scan a message for crisis keywords. Returns detection result."""
        text_lower = text.lower()
        matched_categories = {}
        matched_keywords = []

        for category, patterns in CRISIS_KEYWORDS.items():
            for pattern in patterns:
                if re.search(pattern, text_lower):
                    matched_categories[category] = True
                    matched_keywords.append(pattern)

        severity = self._calculate_severity(matched_categories, text)

        return {
            "is_crisis": len(matched_categories) > 0,
            "categories": list(matched_categories.keys()),
            "keywords_matched": matched_keywords,
            "severity": severity,
            "confidence": min(1.0, len(matched_keywords) * 0.3 + 0.2),
        }

    def _calculate_severity(self, categories: dict, text: str) -> str:
        """Calculate severity based on categories and message context."""
        if "self_harm" in categories or "violence" in categories:
            return "critical"
        if "substance_abuse" in categories:
            return "high"
        if "severe_bullying" in categories:
            return "high"
        return "medium"

    def escalate(
        self,
        teen,
        message,
        detection_result: dict,
    ) -> CrisisAlert:
        """Create crisis alert and notify parent."""

        # Create alert record
        alert = CrisisAlert(
            teen_id=teen.id,
            message_id=message.id if message else None,
            status=CrisisStatus.TRIGGERED.value,
            severity=detection_result["severity"],
            keywords_matched=detection_result["keywords_matched"],
            context_summary=self._generate_context_summary(teen, detection_result),
        )

        db.session.add(alert)
        db.session.commit()

        # Update teen stats
        teen.crisis_alert_count += 1
        db.session.commit()

        # Notify parent
        self._notify_parent(teen, alert)

        logger.critical(
            f"CRISIS ALERT #{alert.id}: {detection_result['severity']} severity "
            f"for teen {teen.id} ({teen.first_name}). Categories: {detection_result['categories']}"
        )

        return alert

    def _generate_context_summary(self, teen, detection_result: dict) -> str:
        """Generate privacy-safe context summary for parent dashboard."""
        categories = detection_result.get("categories", [])
        if "self_harm" in categories:
            return (
                f"Chatterbot detected language related to self-harm from {teen.first_name}. "
                f"Immediate parental check-in is strongly recommended. "
                f"The exact message content is not displayed to protect {teen.first_name}\'s privacy, "
                f"but the conversation has been flagged for safety review."
            )
        elif "severe_bullying" in categories:
            return (
                f"Chatterbot detected signs of severe distress or bullying from {teen.first_name}. "
                f"Consider having an open conversation about school and peer relationships."
            )
        elif "violence" in categories:
            return (
                f"Chatterbot detected concerning language related to violence from {teen.first_name}. "
                f"This requires immediate attention and possibly school/counselor involvement."
            )
        else:
            return (
                f"Chatterbot detected concerning language from {teen.first_name}. "
                f"A general wellness check-in is recommended."
            )

    def _notify_parent(self, teen, alert: CrisisAlert):
        """Send notification to parent via SMS and/or email."""
        parent = teen.parent

        if not parent.crisis_alerts_enabled:
            logger.info("Crisis notifications disabled for guardian %s", parent.id)
            return

        if parent.crisis_alert_sms_enabled and parent.phone:
            result = self.twilio.send_crisis_alert(
                parent_phone=parent.phone,
                teen_name=teen.first_name,
                alert_id=alert.id,
            )
            if result["success"]:
                alert.parent_notified_at = utc_now()
                alert.parent_notification_method = "sms"
                alert.status = CrisisStatus.PARENT_NOTIFIED.value
                db.session.commit()

        # TODO: Add email notification via SendGrid/AWS SES
        # TODO: Add push notification via Firebase/OneSignal

        # For critical alerts, consider notifying authorities
        if alert.severity == "critical":
            # This would integrate with crisis hotline APIs or local authorities
            # NEVER do this without clear legal framework and user consent
            logger.critical(f"CRITICAL alert #{alert.id}: Authority notification protocol would trigger here.")

    def resolve_alert(self, alert_id: int, user_id: int, notes: str = "") -> bool:
        """Mark a crisis alert as resolved."""
        alert = db.session.get(CrisisAlert, alert_id)
        if not alert:
            return False

        alert.status = CrisisStatus.RESOLVED.value
        alert.resolved_at = utc_now()
        alert.resolved_by = user_id
        alert.resolution_notes = notes
        db.session.commit()

        logger.info(f"Crisis alert #{alert_id} resolved by user {user_id}")
        return True
