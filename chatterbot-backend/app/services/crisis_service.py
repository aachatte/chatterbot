"""Deterministic safety detection, response, and escalation services."""
import logging
import re

from app import db
from app.models.care_circle import CareCircleActivity, CareCircleMember
from app.models.crisis_alert import CrisisAlert, CrisisStatus
from app.services.twilio_service import TwilioService
from app.utils.time import utc_now

logger = logging.getLogger(__name__)
DETECTION_VERSION = "rules-2026-09-04"

RISK_PATTERNS = {
    "self_harm": [
        r"\b(?:hurt|cut|harm)\s+myself\b",
        r"\bself[-\s]?harm\b",
        r"\bend\s+(?:my\s+life|it\s+all)\b",
        r"\bkill\s+myself\b",
        r"\b(?:suicide|suicidal)\b",
        r"\bdon['’]?t\s+want\s+to\s+(?:be\s+here|live|exist)\b",
        r"\bbetter\s+off\s+dead\b",
        r"\bno\s+point\s+in\s+living\b",
    ],
    "overdose": [
        r"\boverdose(?:d)?\b",
        r"\btook\s+too\s+many\s+(?:pills|tablets|meds|medications)\b",
        r"\b(?:swallowed|drank)\s+(?:a\s+)?(?:bottle|handful)\b",
    ],
    "violence": [
        r"\b(?:want|going|gonna|plan)\s+to\s+(?:hurt|kill)\s+(?:someone|them|everyone)\b",
        r"\bbring\s+(?:a\s+)?(?:gun|weapon)\b",
        r"\bshoot\s+up\b",
    ],
    "severe_distress": [
        r"\bcan['’]?t\s+take\s+it\s+anymore\b",
        r"\bno\s+one\s+(?:would|will)\s+miss\s+me\b",
        r"\bnobody\s+cares\s+(?:about\s+me)?\b",
    ],
}

IMMINENCE_PATTERNS = [
    r"\b(?:right\s+now|tonight|today|this\s+minute)\b",
    r"\b(?:have|made|got)\s+(?:a\s+)?plan\b",
    r"\b(?:have|got|holding|with)\s+(?:the|a|my)?\s*(?:gun|knife|pills|rope|weapon)\b",
    r"\b(?:already|just)\s+(?:cut|hurt|took|swallowed|drank)\b",
    r"\bgoodbye\b",
]

THIRD_PARTY_PATTERNS = [
    r"\bmy\s+(?:friend|sibling|brother|sister|classmate)\b.{0,50}\b(?:suicid|kill\s+(?:himself|herself|themself)|self[-\s]?harm)",
]


def _matches(patterns, text):
    return [pattern for pattern in patterns if re.search(pattern, text, re.IGNORECASE)]


class CrisisDetectionService:
    def __init__(self):
        self.twilio = TwilioService()

    def scan_message(self, text: str) -> dict:
        """Classify a message and return an auditable safety decision."""
        normalized = " ".join((text or "").strip().split())
        matched_categories = []
        matched_rules = []
        for category, patterns in RISK_PATTERNS.items():
            hits = _matches(patterns, normalized)
            if hits:
                matched_categories.append(category)
                matched_rules.extend(hits)

        third_party = bool(_matches(THIRD_PARTY_PATTERNS, normalized))
        if third_party and "self_harm" not in matched_categories:
            matched_categories.append("self_harm")
        imminent = bool(_matches(IMMINENCE_PATTERNS, normalized))
        severity = self._calculate_severity(matched_categories, imminent, third_party)
        requires_escalation = severity in {"high", "critical"} and not third_party
        return {
            "is_crisis": bool(matched_categories),
            "requires_escalation": requires_escalation,
            "categories": matched_categories,
            "matched_rules": matched_rules,
            "keywords_matched": matched_rules,
            "severity": severity,
            "confidence": self._confidence(matched_categories, imminent, third_party),
            "imminent": imminent,
            "third_party": third_party,
            "detection_version": DETECTION_VERSION,
        }

    @staticmethod
    def _calculate_severity(categories, imminent, third_party):
        if not categories:
            return "none"
        if third_party:
            return "medium"
        if "overdose" in categories or imminent:
            return "critical"
        if "self_harm" in categories or "violence" in categories:
            return "high"
        return "medium"

    @staticmethod
    def _confidence(categories, imminent, third_party):
        if not categories:
            return 0.0
        score = 0.62 + (0.12 if imminent else 0) + (0.06 if len(categories) > 1 else 0)
        if third_party:
            score -= 0.12
        return round(min(0.95, max(0.5, score)), 2)

    def safe_response(self, teen_name: str, result: dict) -> str:
        """Return deterministic crisis copy that does not depend on a model call."""
        name = (teen_name or "there").strip()
        categories = set(result.get("categories", []))
        if result.get("third_party"):
            return (
                f"{name}, I’m glad you told me. If someone else may be in immediate danger, "
                "call 911 now. You can also call or text 988 for guidance. Please tell a "
                "trusted adult right away. Don’t try to handle this alone."
            )
        if result.get("severity") == "critical":
            return (
                f"{name}, I’m really glad you told me. Please move away from anything you "
                "could use to hurt yourself or someone else and go to a trusted adult now. "
                "Call or text 988 in the U.S. If danger is immediate or you already took "
                "something, call 911 now. I’m an AI, not emergency support."
            )
        if "self_harm" in categories or "violence" in categories:
            return (
                f"{name}, I’m glad you told me. You deserve support from a real person right "
                "now. Please go to a trusted adult and tell them you need them to stay with "
                "you. You can call or text 988 in the U.S.; call 911 if danger becomes immediate."
            )
        return (
            f"{name}, that sounds like a lot to carry. Are you safe right now? Please tell a "
            "trusted adult how intense this feels. If you might hurt yourself or someone else, "
            "call or text 988 in the U.S. or call 911 for immediate danger."
        )

    def escalate(self, teen, message, detection_result: dict) -> CrisisAlert:
        """Create one privacy-safe alert and route permitted notifications."""
        alert = CrisisAlert(
            teen_id=teen.id,
            message_id=message.id if message else None,
            status=CrisisStatus.TRIGGERED.value,
            severity=detection_result["severity"],
            categories=detection_result.get("categories", []),
            keywords_matched=detection_result.get("matched_rules", []),
            confidence=detection_result.get("confidence"),
            detection_version=detection_result.get("detection_version", DETECTION_VERSION),
            context_summary=self._generate_context_summary(teen, detection_result),
        )
        db.session.add(alert)
        teen.crisis_alert_count += 1
        db.session.commit()
        self._notify_guardian_and_care_circle(teen, alert)
        logger.critical(
            "Safety alert %s created for teen %s at severity %s",
            alert.id,
            teen.id,
            alert.severity,
        )
        return alert

    @staticmethod
    def _generate_context_summary(teen, result: dict) -> str:
        categories = set(result.get("categories", []))
        if "overdose" in categories:
            concern = "possible poisoning or overdose"
        elif "self_harm" in categories:
            concern = "possible self-harm or suicidal thoughts"
        elif "violence" in categories:
            concern = "possible immediate harm to another person"
        else:
            concern = "severe emotional distress"
        timing = " and signs of immediate danger" if result.get("imminent") else ""
        return (
            f"Chatterbot detected language suggesting {concern}{timing} from "
            f"{teen.first_name}. Check in directly now and follow the family safety plan. "
            "The conversation text is intentionally not shown."
        )

    def _notify_guardian_and_care_circle(self, teen, alert):
        guardian = teen.parent
        if not guardian.crisis_alerts_enabled:
            logger.warning("Safety notifications disabled for guardian %s", guardian.id)
            return
        if guardian.crisis_alert_sms_enabled and guardian.phone:
            result = self.twilio.send_crisis_alert(
                parent_phone=guardian.phone,
                teen_name=teen.first_name,
                alert_id=alert.id,
            )
            if result.get("success"):
                alert.parent_notified_at = utc_now()
                alert.parent_notification_method = "sms"
                alert.status = CrisisStatus.PARENT_NOTIFIED.value
        alert.care_circle_notified_count = self._notify_care_circle(teen, alert)
        db.session.commit()

    def _notify_parent(self, teen, alert):
        """Compatibility wrapper for the existing Care Circle integration."""
        return self._notify_guardian_and_care_circle(teen, alert)

    def _notify_care_circle(self, teen, alert: CrisisAlert) -> int:
        members = CareCircleMember.query.filter_by(
            guardian_id=teen.parent_id,
            teen_id=teen.id,
            status="active",
            notify_safety_alerts=True,
        ).all()
        notified = 0
        for member in members:
            if not member.phone:
                continue
            body = (
                "Chatterbot Care Circle safety alert\n\n"
                f"A safety signal for {teen.first_name} may need attention. "
                "Please follow your agreed support plan or contact their guardian.\n\n"
                "No conversation text is included in this alert."
            )
            result = self.twilio.send_sms(member.phone, body)
            if not result.get("success"):
                logger.warning("Care Circle delivery failed for member %s", member.id)
                continue
            notified += 1
            member.last_notified_at = utc_now()
            db.session.add(CareCircleActivity(
                guardian_id=teen.parent_id,
                teen_id=teen.id,
                member_id=member.id,
                member_name=member.name,
                action="safety_signal_routed",
                detail=f"A safety signal was routed to {member.name}.",
                actor_name="Chatterbot",
            ))
        return notified

    def resolve_alert(self, alert_id: int, user_id: int, notes: str = "") -> bool:
        alert = db.session.get(CrisisAlert, alert_id)
        if not alert:
            return False
        alert.status = CrisisStatus.RESOLVED.value
        alert.resolved_at = utc_now()
        alert.resolved_by = user_id
        alert.resolution_notes = notes
        db.session.commit()
        logger.info("Safety alert %s resolved by user %s", alert_id, user_id)
        return True
