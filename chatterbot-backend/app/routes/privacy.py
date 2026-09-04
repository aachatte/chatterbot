"""Authenticated guardian privacy controls."""
from datetime import timedelta

from flask import Blueprint, jsonify, request
from flask_jwt_extended import get_jwt_identity, jwt_required

from app import db
from app.models.privacy import DataDeletionRequest, PrivacyEvent
from app.models.teen import Teen
from app.models.user import User
from app.services.privacy_service import build_guardian_export, record_privacy_event
from app.utils.time import utc_now
from config import settings

privacy_bp = Blueprint("privacy", __name__)


def _guardian_id():
    identity = str(get_jwt_identity()).strip()
    return int(identity) if identity.isdigit() else None


@privacy_bp.get("/overview")
@jwt_required()
def overview():
    guardian_id = _guardian_id()
    if guardian_id is None:
        return jsonify({"error": "Invalid authentication token"}), 401
    active_families = User.query.filter_by(is_active=True).count()
    requests = DataDeletionRequest.query.filter_by(guardian_id=guardian_id).order_by(
        DataDeletionRequest.requested_at.desc()
    ).all()
    events = PrivacyEvent.query.filter_by(guardian_id=guardian_id).order_by(
        PrivacyEvent.created_at.desc()
    ).limit(50).all()
    return jsonify({
        "policy_version": settings.privacy_policy_version,
        "message_retention_days": settings.message_retention_days,
        "deletion_grace_days": settings.deletion_grace_days,
        "exports_exclude_message_text": True,
        "deletion_requests": [item.to_dict() for item in requests],
        "events": [event.to_dict() for event in events],
        "pilot": {
            "enabled": settings.pilot_mode,
            "family_capacity": settings.pilot_family_capacity,
            "active_families": active_families,
            "remaining_capacity": max(settings.pilot_family_capacity - active_families, 0),
        },
    })


@privacy_bp.post("/export")
@jwt_required()
def export_data():
    guardian_id = _guardian_id()
    guardian = db.session.get(User, guardian_id) if guardian_id else None
    if not guardian:
        return jsonify({"error": "Guardian not found"}), 404
    payload = build_guardian_export(guardian)
    record_privacy_event(
        guardian.id,
        "export_generated",
        detail={"message_text_included": False},
    )
    db.session.commit()
    return jsonify({"export": payload})


@privacy_bp.post("/teens/<int:teen_id>/deletion-requests")
@jwt_required()
def request_deletion(teen_id):
    guardian_id = _guardian_id()
    teen = Teen.query.filter_by(id=teen_id, parent_id=guardian_id).first()
    if not teen:
        return jsonify({"error": "Teen not found"}), 404
    data = request.get_json(silent=True)
    if not isinstance(data, dict) or data.get("confirmation") != teen.first_name:
        return jsonify({"error": f'Type "{teen.first_name}" to confirm deletion'}), 400
    existing = DataDeletionRequest.query.filter_by(
        teen_id=teen.id, status="scheduled"
    ).first()
    if existing:
        return jsonify({"deletion_request": existing.to_dict()}), 200
    deletion = DataDeletionRequest(
        guardian_id=guardian_id,
        teen_id=teen.id,
        teen_name=teen.first_name,
        scheduled_for=utc_now() + timedelta(days=settings.deletion_grace_days),
    )
    teen.is_active = False
    db.session.add(deletion)
    db.session.flush()
    record_privacy_event(
        guardian_id,
        "deletion_scheduled",
        teen.id,
        {"request_id": deletion.id, "scheduled_for": deletion.scheduled_for.isoformat()},
    )
    db.session.commit()
    return jsonify({"deletion_request": deletion.to_dict()}), 202


@privacy_bp.delete("/deletion-requests/<int:request_id>")
@jwt_required()
def cancel_deletion(request_id):
    guardian_id = _guardian_id()
    deletion = DataDeletionRequest.query.filter_by(
        id=request_id, guardian_id=guardian_id, status="scheduled"
    ).first()
    if not deletion:
        return jsonify({"error": "Scheduled deletion not found"}), 404
    deletion.status = "canceled"
    deletion.canceled_at = utc_now()
    teen = db.session.get(Teen, deletion.teen_id) if deletion.teen_id else None
    if teen:
        teen.is_active = True
    record_privacy_event(
        guardian_id,
        "deletion_canceled",
        deletion.teen_id,
        {"request_id": deletion.id},
    )
    db.session.commit()
    return jsonify({"deletion_request": deletion.to_dict()})


@privacy_bp.delete("/teens/<int:teen_id>/consent")
@jwt_required()
def withdraw_consent(teen_id):
    guardian_id = _guardian_id()
    teen = Teen.query.filter_by(id=teen_id, parent_id=guardian_id).first()
    if not teen:
        return jsonify({"error": "Teen not found"}), 404
    teen.consent_verified = False
    teen.consent_verified_at = None
    teen.consent_status = "withdrawn"
    teen.is_active = False
    record_privacy_event(guardian_id, "consent_withdrawn", teen.id)
    db.session.commit()
    return jsonify({"enrollment": teen.enrollment_to_dict()})
