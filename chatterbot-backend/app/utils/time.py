"""Time helpers for the application's UTC-naive database columns."""
from datetime import datetime, timezone


def utc_now() -> datetime:
    """Return the current UTC time without tzinfo for legacy DateTime columns."""
    return datetime.now(timezone.utc).replace(tzinfo=None)
