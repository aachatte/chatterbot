"""Controlled family pilot enrollment and readiness checks."""
from app import db
from app.models.operations import PilotControl, PilotEnrollment
from app.models.safety_operations import FamilySafetyPlan
from app.models.teen import Teen
from app.utils.time import utc_now
from config import settings


def get_pilot_control():
    control = PilotControl.query.filter_by(key="global").first()
    if control is None:
        control = PilotControl(key="global", enabled=True)
        db.session.add(control)
    return control


def refresh_pilot_enrollment(guardian_id):
    if not settings.pilot_mode:
        return None
    enrollment = PilotEnrollment.query.filter_by(guardian_id=guardian_id).first()
    if enrollment is None:
        enrollment = PilotEnrollment(guardian_id=guardian_id)
        db.session.add(enrollment)
        db.session.flush()
    teens = Teen.query.filter_by(parent_id=guardian_id).all()
    ready_teen_ids = []
    for teen in teens:
        plan = FamilySafetyPlan.query.filter_by(teen_id=teen.id, is_active=True).first()
        if teen.is_active and teen.consent_verified and teen.phone_verification_status == "verified" and plan:
            ready_teen_ids.append(teen.id)
    enrollment.readiness = {
        "teen_count": len(teens),
        "ready_teen_count": len(ready_teen_ids),
        "ready_teen_ids": ready_teen_ids,
    }
    control = get_pilot_control()
    if not control.enabled:
        enrollment.status = "paused"
        enrollment.paused_at = enrollment.paused_at or utc_now()
    elif ready_teen_ids:
        enrollment.status = "ready"
        enrollment.ready_at = enrollment.ready_at or utc_now()
        enrollment.paused_at = None
    else:
        enrollment.status = "enrolled"
        enrollment.ready_at = None
        enrollment.paused_at = None
    return enrollment


def pilot_allows_guardian(guardian_id):
    if not settings.pilot_mode:
        return True
    control = get_pilot_control()
    enrollment = PilotEnrollment.query.filter_by(guardian_id=guardian_id).first()
    return bool(control.enabled and enrollment and enrollment.status == "ready")
