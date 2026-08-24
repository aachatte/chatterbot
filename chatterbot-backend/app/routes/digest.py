"""Weekly digest routes."""
from flask import Blueprint, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app import db
from app.models.digest_log import DigestLog
from app.utils.digest import build_digest_payload

digest_bp = Blueprint("digest", __name__)


@digest_bp.route("/api/digest/send", methods=["POST"])
@jwt_required()
def send_digest():
    guardian_id = int(get_jwt_identity())
    payload = build_digest_payload(guardian_id)
    log = DigestLog(
        guardian_id=guardian_id,
        teen_count=len(payload.get("teens", [])),
        alert_count=payload.get("alert_count", 0),
        mood_avg=payload.get("mood_avg"),
    )
    db.session.add(log)
    db.session.commit()
    payload["digest_log_id"] = log.id
    return jsonify(payload)
