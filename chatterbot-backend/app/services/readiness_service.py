"""Production dependency and schema readiness checks."""
from datetime import timedelta

import redis
from sqlalchemy import text

from app import db
from app.models.operations import OperationalHeartbeat
from app.utils.time import utc_now
from config import settings

EXPECTED_SCHEMA_REVISION = "20260907_add_security_and_pilot_ops"


def readiness_report(check_migration=True, check_redis=True):
    checks = {}
    try:
        db.session.execute(text("SELECT 1"))
        checks["database"] = {"ok": True}
    except Exception:
        db.session.rollback()
        checks["database"] = {"ok": False, "error": "database unavailable"}

    if check_migration and checks["database"]["ok"]:
        try:
            revision = db.session.execute(text("SELECT version_num FROM alembic_version")).scalar()
            checks["migration"] = {
                "ok": revision == EXPECTED_SCHEMA_REVISION,
                "current": revision,
                "expected": EXPECTED_SCHEMA_REVISION,
            }
        except Exception:
            db.session.rollback()
            checks["migration"] = {"ok": False, "error": "migration state unavailable"}

    if check_redis:
        try:
            redis.from_url(settings.redis_url, socket_connect_timeout=1).ping()
            checks["redis"] = {"ok": True}
        except Exception:
            checks["redis"] = {"ok": False, "error": "redis unavailable"}

    try:
        heartbeat = OperationalHeartbeat.query.filter_by(name="privacy_jobs").first()
        freshness_limit = utc_now() - timedelta(hours=26)
        checks["privacy_jobs"] = {
            "ok": bool(heartbeat and heartbeat.last_success_at >= freshness_limit),
            "last_success_at": (
                heartbeat.last_success_at.isoformat() if heartbeat else None
            ),
        }
    except Exception:
        db.session.rollback()
        checks["privacy_jobs"] = {"ok": False, "error": "heartbeat unavailable"}
    return {
        "ready": all(item["ok"] for item in checks.values()),
        "checks": checks,
    }
