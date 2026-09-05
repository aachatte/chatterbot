"""Privacy safe provider receipts and operational incident signals."""
import logging

from app import db
from app.models.operations import OperationalEvent, ProviderEvent
from app.utils.time import utc_now

logger = logging.getLogger(__name__)


def claim_provider_event(provider, event_id, event_type, detail=None):
    """Claim a provider event once. Return None when it was already processed."""
    if not event_id:
        return ProviderEvent(
            provider=provider,
            event_id=f"missing:{utc_now().isoformat()}",
            event_type=event_type,
            detail=detail or {},
            processed_at=utc_now(),
        )
    existing = ProviderEvent.query.filter_by(
        provider=provider, event_id=event_id
    ).first()
    if existing:
        if existing.status in {"processing", "processed"}:
            return None
        existing.status = "processing"
        existing.detail = detail or {}
        existing.processed_at = None
        return existing
    event = ProviderEvent(
        provider=provider,
        event_id=event_id,
        event_type=event_type,
        status="processing",
        detail=detail or {},
    )
    db.session.add(event)
    return event


def complete_provider_event(event):
    event.status = "processed"
    event.processed_at = utc_now()
    return event


def record_operational_event(
    category, source, code, severity="warning", detail=None
):
    """Add an operational event without message text, phone numbers, or secrets."""
    event = OperationalEvent(
        category=category,
        severity=severity,
        source=source,
        code=code,
        detail=detail or {},
    )
    db.session.add(event)
    return event


def emit_operational_event(
    category, source, code, severity="warning", detail=None
):
    """Persist a standalone signal without breaking the user facing fallback."""
    try:
        event = record_operational_event(
            category, source, code, severity=severity, detail=detail
        )
        db.session.commit()
        return event
    except Exception as exc:
        db.session.rollback()
        logger.error("Could not persist operational event: %s", type(exc).__name__)
        return None
