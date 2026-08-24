"""Mood tracking routes."""
from datetime import datetime
from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required, get_jwt_identity
from app import db
from app.models.mood_entry import MoodEntry
from app.models.teen import Teen

mood_bp = Blueprint("mood", __name__)


@mood_bp.route("/api/teens/<int:teen_id>/mood", methods=["GET"])
@jwt_required()
def get_mood_history(teen_id):
    teen = Teen.query.get_or_404(teen_id)
    guardian_id = int(get_jwt_identity())
    if teen.guardian_id != guardian_id:
        return jsonify({"error": "Forbidden"}), 403
    entries = (
        MoodEntry.query
        .filter_by(teen_id=teen_id)
        .order_by(MoodEntry.created_at.desc())
        .limit(30)
        .all()
    )
    return jsonify([e.to_dict() for e in entries])


@mood_bp.route("/api/teens/<int:teen_id>/mood", methods=["POST"])
@jwt_required()
def log_mood(teen_id):
    teen = Teen.query.get_or_404(teen_id)
    guardian_id = int(get_jwt_identity())
    if teen.guardian_id != guardian_id:
        return jsonify({"error": "Forbidden"}), 403
    data = request.get_json() or {}
    score = data.get("score")
    if not isinstance(score, int) or not (1 <= score <= 10):
        return jsonify({"error": "score must be an integer 1-10"}), 400
    entry = MoodEntry(teen_id=teen_id, score=score, note=data.get("note"))
    db.session.add(entry)
    db.session.commit()
    return jsonify(entry.to_dict()), 201
