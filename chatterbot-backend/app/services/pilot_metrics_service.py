"""Privacy safe activation, engagement, safety, and reliability metrics."""
from datetime import timedelta
from statistics import median

from app.models.conversation import Conversation, Message
from app.models.crisis_alert import CrisisAlert
from app.models.operations import OperationalEvent, PilotEnrollment, ProviderEvent
from app.models.teen import Teen
from app.utils.time import utc_now


def _rate(numerator, denominator):
    return round((numerator / denominator) * 100, 1) if denominator else 0.0


def build_pilot_metrics(days=30, now=None):
    """Return aggregate pilot measures without names, messages, or phone data."""
    now = now or utc_now()
    since = now - timedelta(days=days)

    enrollments = PilotEnrollment.query.all()
    teens = Teen.query.all()
    enrolled = len(enrollments)
    ready = sum(item.status == "ready" for item in enrollments)
    consented = sum(bool(teen.consent_verified) for teen in teens)
    verified = sum(teen.phone_verification_status == "verified" for teen in teens)
    sms_active = sum(teen.can_receive_sms() for teen in teens)

    inbound = Message.query.join(Conversation).filter(
        Message.direction == "inbound",
        Message.created_at >= since,
    ).all()
    engaged_teens = len({message.conversation.teen_id for message in inbound})

    alerts = CrisisAlert.query.filter(CrisisAlert.created_at >= since).all()
    resolved = [alert for alert in alerts if alert.resolved_at is not None]
    resolution_minutes = [
        (alert.resolved_at - alert.created_at).total_seconds() / 60
        for alert in resolved
        if alert.created_at and alert.resolved_at
    ]

    provider_failures = ProviderEvent.query.filter(
        ProviderEvent.status == "failed",
        ProviderEvent.received_at >= since,
    ).count()
    open_events = OperationalEvent.query.filter_by(status="open").count()
    critical_events = OperationalEvent.query.filter_by(
        status="open", severity="critical"
    ).count()

    return {
        "window": {"days": days, "starts_at": since.isoformat()},
        "activation": {
            "families_enrolled": enrolled,
            "families_ready": ready,
            "family_readiness_rate": _rate(ready, enrolled),
            "teens_added": len(teens),
            "teens_with_consent": consented,
            "teens_phone_verified": verified,
            "teens_sms_active": sms_active,
            "sms_activation_rate": _rate(sms_active, len(teens)),
        },
        "engagement": {
            "engaged_teens": engaged_teens,
            "inbound_messages": len(inbound),
            "teen_engagement_rate": _rate(engaged_teens, sms_active),
        },
        "safety": {
            "alerts_created": len(alerts),
            "critical_alerts": sum(alert.severity == "critical" for alert in alerts),
            "alerts_resolved": len(resolved),
            "resolution_rate": _rate(len(resolved), len(alerts)),
            "median_resolution_minutes": (
                round(median(resolution_minutes), 1) if resolution_minutes else None
            ),
        },
        "reliability": {
            "provider_failures": provider_failures,
            "open_operational_events": open_events,
            "open_critical_events": critical_events,
            "sms_opt_outs": sum(teen.sms_opted_out_at is not None for teen in teens),
        },
    }
