"""Care Circle membership, permissions, invitations, and activity routes."""
import hashlib

from flask import Blueprint, jsonify, request
from flask_jwt_extended import get_jwt_identity, jwt_required

from app import db
from app.models.care_circle import CareCircleActivity, CareCircleMember
from app.models.teen import Teen
from app.models.user import User
from app.utils.time import utc_now
from app.utils.validators import validate_email, validate_phone

care_circle_bp = Blueprint("care_circle", __name__)

VALID_ROLES = {"co_guardian", "counselor", "family_member", "mentor"}
VALID_ACCESS_LEVELS = {"safety_only", "signals", "coordination"}
VALID_STATUSES = {"active", "paused"}
ROLE_LABELS = {
    "co_guardian": "co-guardian",
    "counselor": "counselor",
    "family_member": "family member",
    "mentor": "mentor",
}


def _json_body():
    data = request.get_json(silent=True)
    return data if isinstance(data, dict) else {}


def _guardian_id() -> int:
    return int(get_jwt_identity())


def _guardian_name(guardian: User) -> str:
    full_name = f"{guardian.first_name} {guardian.last_name}".strip()
    return full_name or guardian.email


def _owned_teen(teen_id: int, guardian_id: int) -> Teen:
    return Teen.query.filter_by(id=teen_id, parent_id=guardian_id).first_or_404()


def _owned_member(member_id: int, guardian_id: int) -> CareCircleMember:
    return CareCircleMember.query.filter_by(
        id=member_id,
        guardian_id=guardian_id,
    ).first_or_404()


def _record_activity(
    guardian: User,
    teen_id: int,
    action: str,
    detail: str,
    member=None,
) -> CareCircleActivity:
    activity = CareCircleActivity(
        guardian_id=guardian.id,
        teen_id=teen_id,
        member_id=member.id if member else None,
        member_name=member.name if member else None,
        action=action,
        detail=detail[:300],
        actor_name=_guardian_name(guardian),
    )
    db.session.add(activity)
    return activity


def _parse_teen_id(data):
    try:
        teen_id = int(data.get("teen_id"))
    except (TypeError, ValueError):
        return None
    return teen_id if teen_id > 0 else None


def _boolean_value(data, field, default):
    if field not in data:
        return default, None
    if not isinstance(data[field], bool):
        return None, f"{field} must be true or false"
    return data[field], None


def _invitation_member(token: str):
    if not isinstance(token, str) or len(token) < 20:
        return None
    token_hash = hashlib.sha256(token.encode("utf-8")).hexdigest()
    return CareCircleMember.query.filter_by(invitation_token_hash=token_hash).first()


@care_circle_bp.get("")
@jwt_required()
def overview():
    """Return a guardian's selected teen, members, and configuration history."""
    guardian_id = _guardian_id()
    guardian = db.session.get(User, guardian_id)
    if guardian is None:
        return jsonify({"error": "Guardian not found"}), 404

    teens = Teen.query.filter_by(parent_id=guardian_id).order_by(Teen.created_at.asc()).all()
    selected_teen = None
    raw_teen_id = request.args.get("teen_id")
    if raw_teen_id:
        try:
            selected_teen = _owned_teen(int(raw_teen_id), guardian_id)
        except ValueError:
            return jsonify({"error": "teen_id must be an integer"}), 400
    elif teens:
        selected_teen = teens[0]

    members = []
    activities = []
    if selected_teen:
        members = (
            CareCircleMember.query.filter_by(
                guardian_id=guardian_id,
                teen_id=selected_teen.id,
            )
            .order_by(CareCircleMember.created_at.asc())
            .all()
        )
        activities = (
            CareCircleActivity.query.filter_by(
                guardian_id=guardian_id,
                teen_id=selected_teen.id,
            )
            .order_by(CareCircleActivity.created_at.desc())
            .limit(30)
            .all()
        )

    return jsonify(
        {
            "teens": [
                {
                    "id": teen.id,
                    "first_name": teen.first_name,
                    "consent_verified": bool(teen.consent_verified),
                }
                for teen in teens
            ],
            "selected_teen": (
                {
                    "id": selected_teen.id,
                    "first_name": selected_teen.first_name,
                    "consent_verified": bool(selected_teen.consent_verified),
                }
                if selected_teen
                else None
            ),
            "owner": {
                "id": guardian.id,
                "name": _guardian_name(guardian),
                "email": guardian.email,
                "role": "account_guardian",
                "status": "active",
            },
            "members": [member.to_dict() for member in members],
            "activity": [activity.to_dict() for activity in activities],
        }
    )


@care_circle_bp.post("/members")
@jwt_required()
def create_member():
    """Create a teen-specific invitation and return its one-time share token."""
    guardian_id = _guardian_id()
    guardian = db.session.get(User, guardian_id)
    if guardian is None:
        return jsonify({"error": "Guardian not found"}), 404

    data = _json_body()
    teen_id = _parse_teen_id(data)
    if teen_id is None:
        return jsonify({"error": "teen_id is required"}), 400
    teen = _owned_teen(teen_id, guardian_id)

    name = str(data.get("name") or "").strip()
    email = str(data.get("email") or "").strip().lower()
    phone = str(data.get("phone") or "").strip()
    role = str(data.get("role") or "family_member").strip()
    relationship = str(data.get("relationship") or "").strip() or None
    access_level = str(data.get("access_level") or "safety_only").strip()

    if not name or len(name) > 120:
        return jsonify({"error": "name is required and must be 120 characters or fewer"}), 400
    if not validate_email(email) or len(email) > 255:
        return jsonify({"error": "Enter a valid email address"}), 400
    formatted_phone = None
    if phone:
        phone_is_valid, formatted_phone = validate_phone(phone)
        if not phone_is_valid:
            return jsonify({"error": "Enter a valid mobile phone number"}), 400
    if role not in VALID_ROLES:
        return jsonify({"error": "Choose a valid Care Circle role"}), 400
    if access_level not in VALID_ACCESS_LEVELS:
        return jsonify({"error": "Choose a valid access level"}), 400
    if relationship and len(relationship) > 100:
        return jsonify({"error": "relationship must be 100 characters or fewer"}), 400

    notify_safety_alerts, boolean_error = _boolean_value(
        data, "notify_safety_alerts", True
    )
    if boolean_error:
        return jsonify({"error": boolean_error}), 400
    notify_checkin_updates, boolean_error = _boolean_value(
        data, "notify_checkin_updates", False
    )
    if boolean_error:
        return jsonify({"error": boolean_error}), 400
    if access_level == "safety_only":
        notify_checkin_updates = False

    duplicate = CareCircleMember.query.filter_by(
        guardian_id=guardian_id,
        teen_id=teen.id,
        email=email,
    ).first()
    if duplicate:
        return jsonify({"error": "This person is already in the Care Circle"}), 409

    member = CareCircleMember(
        guardian_id=guardian_id,
        teen_id=teen.id,
        name=name,
        email=email,
        phone=formatted_phone,
        role=role,
        relationship=relationship,
        access_level=access_level,
        notify_safety_alerts=notify_safety_alerts,
        notify_checkin_updates=notify_checkin_updates,
    )
    invitation_token = member.issue_invitation()
    db.session.add(member)
    db.session.flush()
    _record_activity(
        guardian,
        teen.id,
        "member_invited",
        f"{name} was invited as a {ROLE_LABELS[role]}.",
        member,
    )
    db.session.commit()
    response = jsonify(
        {
            "message": "Invitation ready to share.",
            "member": member.to_dict(),
            "invite_token": invitation_token,
        }
    )
    response.headers["Cache-Control"] = "no-store"
    return response, 201


@care_circle_bp.patch("/members/<int:member_id>")
@jwt_required()
def update_member(member_id):
    """Update role, signal access, notifications, or active state."""
    guardian_id = _guardian_id()
    guardian = db.session.get(User, guardian_id)
    member = _owned_member(member_id, guardian_id)
    data = _json_body()

    if "role" in data:
        role = str(data.get("role") or "").strip()
        if role not in VALID_ROLES:
            return jsonify({"error": "Choose a valid Care Circle role"}), 400
        member.role = role
    if "relationship" in data:
        relationship = str(data.get("relationship") or "").strip() or None
        if relationship and len(relationship) > 100:
            return jsonify({"error": "relationship must be 100 characters or fewer"}), 400
        member.relationship = relationship
    if "phone" in data:
        phone = str(data.get("phone") or "").strip()
        if phone:
            phone_is_valid, formatted_phone = validate_phone(phone)
            if not phone_is_valid:
                return jsonify({"error": "Enter a valid mobile phone number"}), 400
            member.phone = formatted_phone
        else:
            member.phone = None
    if "access_level" in data:
        access_level = str(data.get("access_level") or "").strip()
        if access_level not in VALID_ACCESS_LEVELS:
            return jsonify({"error": "Choose a valid access level"}), 400
        member.access_level = access_level
    for field in ("notify_safety_alerts", "notify_checkin_updates"):
        if field in data:
            if not isinstance(data[field], bool):
                return jsonify({"error": f"{field} must be true or false"}), 400
            setattr(member, field, data[field])
    if member.access_level == "safety_only":
        member.notify_checkin_updates = False
    if "status" in data:
        status = str(data.get("status") or "").strip()
        if status not in VALID_STATUSES:
            return jsonify({"error": "status must be active or paused"}), 400
        if member.status == "pending":
            return jsonify({"error": "A pending member must accept their invitation first"}), 409
        member.status = status

    _record_activity(
        guardian,
        member.teen_id,
        "member_updated",
        f"{member.name}'s Care Circle permissions were updated.",
        member,
    )
    db.session.commit()
    return jsonify({"message": "Care Circle updated.", "member": member.to_dict()})


@care_circle_bp.delete("/members/<int:member_id>")
@jwt_required()
def delete_member(member_id):
    """Remove a member while retaining a privacy-safe audit event."""
    guardian_id = _guardian_id()
    guardian = db.session.get(User, guardian_id)
    member = _owned_member(member_id, guardian_id)
    teen_id = member.teen_id
    member_name = member.name
    db.session.delete(member)
    _record_activity(
        guardian,
        teen_id,
        "member_removed",
        f"{member_name} was removed from the Care Circle.",
    )
    db.session.commit()
    return jsonify({"deleted": True, "message": "Member removed from the Care Circle."})


@care_circle_bp.post("/members/<int:member_id>/invitation")
@jwt_required()
def refresh_invitation(member_id):
    """Replace a pending member's invitation with a new seven-day link."""
    guardian_id = _guardian_id()
    guardian = db.session.get(User, guardian_id)
    member = _owned_member(member_id, guardian_id)
    if member.status != "pending":
        return jsonify({"error": "Only pending invitations can be refreshed"}), 409

    invitation_token = member.issue_invitation()
    _record_activity(
        guardian,
        member.teen_id,
        "invitation_refreshed",
        f"A fresh invitation was created for {member.name}.",
        member,
    )
    db.session.commit()
    response = jsonify(
        {
            "message": "A fresh invitation is ready to share.",
            "member": member.to_dict(),
            "invite_token": invitation_token,
        }
    )
    response.headers["Cache-Control"] = "no-store"
    return response


@care_circle_bp.get("/invitations/<token>")
def invitation_details(token):
    """Return the minimum context needed to review a secret invitation link."""
    member = _invitation_member(token)
    if member is None:
        return jsonify({"error": "Invitation not found"}), 404
    if not member.invitation_is_valid(token):
        return jsonify({"error": "This invitation has expired"}), 410

    guardian = db.session.get(User, member.guardian_id)
    teen = db.session.get(Teen, member.teen_id)
    if guardian is None or teen is None:
        return jsonify({"error": "Invitation not found"}), 404

    response = jsonify(
        {
            "invitation": {
                "member_name": member.name,
                "guardian_first_name": guardian.first_name,
                "teen_first_name": teen.first_name,
                "role": member.role,
                "relationship": member.relationship,
                "access_level": member.access_level,
                "notify_safety_alerts": bool(member.notify_safety_alerts),
                "notify_checkin_updates": bool(member.notify_checkin_updates),
                "expires_at": member.invitation_expires_at.isoformat(),
            }
        }
    )
    response.headers["Cache-Control"] = "no-store"
    return response


@care_circle_bp.post("/invitations/<token>/accept")
def accept_invitation(token):
    """Accept a valid invitation and activate the Care Circle member."""
    member = _invitation_member(token)
    if member is None:
        return jsonify({"error": "Invitation not found"}), 404
    if not member.invitation_is_valid(token):
        return jsonify({"error": "This invitation has expired"}), 410

    guardian = db.session.get(User, member.guardian_id)
    if guardian is None:
        return jsonify({"error": "Invitation not found"}), 404
    member.accept_invitation()
    activity = CareCircleActivity(
        guardian_id=guardian.id,
        teen_id=member.teen_id,
        member_id=member.id,
        member_name=member.name,
        action="invitation_accepted",
        detail=f"{member.name} joined the Care Circle.",
        actor_name=member.name,
    )
    db.session.add(activity)
    db.session.commit()
    return jsonify(
        {
            "message": "You are now part of the Care Circle.",
            "member": {
                "name": member.name,
                "role": member.role,
                "status": member.status,
            },
        }
    )
