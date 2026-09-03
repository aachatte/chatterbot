"""Check-in schedule routes."""
from datetime import timedelta
from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required, get_jwt_identity
from app import db
from app.models.checkin_schedule import CheckinSchedule
from app.models.teen import Teen
from app.utils.time import utc_now

checkin_bp = Blueprint("checkin", __name__)


@checkin_bp.route("/api/teens/<int:teen_id>/checkin-schedule", methods=["GET"])
@jwt_required()
def get_schedule(teen_id):
    teen = Teen.query.get_or_404(teen_id)
    if teen.parent_id != int(get_jwt_identity()):
        return jsonify({"error": "Forbidden"}), 403
    schedule = CheckinSchedule.query.filter_by(teen_id=teen_id).first()
    if not schedule:
        return jsonify(None)
    return jsonify(schedule.to_dict())


@checkin_bp.route("/api/teens/<int:teen_id>/checkin-schedule", methods=["POST"])
@jwt_required()
def upsert_schedule(teen_id):
    teen = Teen.query.get_or_404(teen_id)
    if teen.parent_id != int(get_jwt_identity()):
        return jsonify({"error": "Forbidden"}), 403
    data = request.get_json() or {}
    schedule = CheckinSchedule.query.filter_by(teen_id=teen_id).first()
    if not schedule:
        schedule = CheckinSchedule(teen_id=teen_id)
        db.session.add(schedule)
    if "enabled" in data:
        schedule.enabled = bool(data["enabled"])
    if "interval_days" in data:
        schedule.interval_days = max(1, int(data["interval_days"]))
    if not schedule.next_send_at:
        schedule.next_send_at = utc_now() + timedelta(days=schedule.interval_days)
    db.session.commit()
    return jsonify(schedule.to_dict()), 201


@checkin_bp.route("/api/checkins/send-due", methods=["POST"])
@jwt_required()
def send_due_checkins():
    now = utc_now()
    due = CheckinSchedule.query.filter(
        CheckinSchedule.enabled == True,
        CheckinSchedule.next_send_at <= now,
    ).all()
    teen_ids = []
    for s in due:
        s.last_sent_at = now
        s.next_send_at = now + timedelta(days=s.interval_days)
        teen_ids.append(s.teen_id)
    db.session.commit()
    return jsonify({"due_teen_ids": teen_ids, "count": len(teen_ids)})
