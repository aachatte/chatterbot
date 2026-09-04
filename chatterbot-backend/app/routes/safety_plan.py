"""Guardian-managed family safety plans with teen-visible boundaries."""
from flask import Blueprint, jsonify, request
from flask_jwt_extended import get_jwt_identity, jwt_required

from app import db
from app.models.care_circle import CareCircleMember
from app.models.safety_operations import FamilySafetyPlan
from app.models.teen import Teen
from app.models.user import User
from app.utils.time import utc_now

safety_plan_bp = Blueprint("safety_plan", __name__)
ALLOWED_PLAN_KEYS = {
    "checkInTime",
    "tone",
    "paused",
    "weeklySignal",
    "circleUpdates",
    "primaryWindow",
    "backupWindow",
    "safeLocation",
    "localInstructions",
    "professionalContact",
}


def _guardian_id():
    return int(get_jwt_identity())


def _owned_teen(teen_id, guardian_id):
    return Teen.query.filter_by(id=teen_id, parent_id=guardian_id).first()


def _reachable_adults(teen, guardian):
    guardian_reachable = 1 if guardian.phone else 0
    circle_reachable = CareCircleMember.query.filter_by(
        teen_id=teen.id,
        guardian_id=guardian.id,
        status="active",
        notify_safety_alerts=True,
    ).filter(CareCircleMember.phone.isnot(None)).count()
    return guardian_reachable + circle_reachable


def teen_visible_summary(teen):
    plan = FamilySafetyPlan.query.filter_by(teen_id=teen.id).first()
    if not plan:
        return "No family safety plan is active yet. Ask your guardian to finish it in the dashboard."
    members = CareCircleMember.query.filter_by(
        teen_id=teen.id,
        guardian_id=teen.parent_id,
        status="active",
        notify_safety_alerts=True,
    ).all()
    names = [teen.parent.first_name] + [member.name for member in members]
    contacts = ", ".join(dict.fromkeys(name for name in names if name))
    return (
        f"Your safety plan is {'active' if plan.is_active else 'not active'}. "
        f"Urgent safety signals may be shared with: {contacts or 'no one configured'}. "
        "Routine conversation text is not shared. Safety detection stays on while Chatterbot is active."
    )


@safety_plan_bp.route("/<int:teen_id>", methods=["GET", "PUT"])
@jwt_required()
def safety_plan(teen_id):
    guardian_id = _guardian_id()
    teen = _owned_teen(teen_id, guardian_id)
    guardian = db.session.get(User, guardian_id)
    if not teen or not guardian:
        return jsonify({"error": "Teen not found"}), 404

    plan = FamilySafetyPlan.query.filter_by(teen_id=teen.id).first()
    reachable = _reachable_adults(teen, guardian)
    if request.method == "GET":
        return jsonify({
            "safety_plan": plan.to_dict(reachable) if plan else {
                "teen_id": teen.id,
                "plan": {},
                "is_active": False,
                "version": 0,
                "reachable_adults": reachable,
                "teen_acknowledged_at": None,
            },
            "teen_visible_summary": teen_visible_summary(teen),
        })

    payload = request.get_json(silent=True)
    if not isinstance(payload, dict) or not isinstance(payload.get("plan"), dict):
        return jsonify({"error": "plan must be an object"}), 400
    plan_data = payload["plan"]
    if set(plan_data) - ALLOWED_PLAN_KEYS:
        return jsonify({"error": "Plan contains unsupported fields"}), 400
    for value in plan_data.values():
        if isinstance(value, str) and len(value) > 1000:
            return jsonify({"error": "Plan values must be 1000 characters or fewer"}), 400

    activate = payload.get("is_active", False)
    if not isinstance(activate, bool):
        return jsonify({"error": "is_active must be true or false"}), 400
    if activate and reachable < 1:
        return jsonify({"error": "Add at least one reachable adult before activation"}), 409

    if plan is None:
        plan = FamilySafetyPlan(guardian_id=guardian_id, teen_id=teen.id)
        db.session.add(plan)
    else:
        plan.version += 1
    plan.plan_data = plan_data
    plan.is_active = activate
    plan.teen_acknowledged_at = None
    plan.updated_at = utc_now()
    db.session.commit()
    return jsonify({
        "safety_plan": plan.to_dict(reachable),
        "teen_visible_summary": teen_visible_summary(teen),
    })
