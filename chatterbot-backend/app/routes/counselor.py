"""School counselor contact routes."""
from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required, get_jwt_identity
from app import db
from app.models.counselor_contact import CounselorContact

counselor_bp = Blueprint("counselor", __name__)


@counselor_bp.route("/api/counselors", methods=["GET"])
@jwt_required()
def list_counselors():
    guardian_id = int(get_jwt_identity())
    contacts = CounselorContact.query.filter_by(guardian_id=guardian_id).all()
    return jsonify([c.to_dict() for c in contacts])


@counselor_bp.route("/api/counselors", methods=["POST"])
@jwt_required()
def add_counselor():
    guardian_id = int(get_jwt_identity())
    data = request.get_json() or {}
    if not data.get("counselor_name") or not data.get("counselor_email"):
        return jsonify({"error": "counselor_name and counselor_email required"}), 400
    contact = CounselorContact(
        guardian_id=guardian_id,
        counselor_name=data["counselor_name"],
        counselor_email=data["counselor_email"],
        school_name=data.get("school_name"),
        cc_on_crisis=bool(data.get("cc_on_crisis", False)),
    )
    db.session.add(contact)
    db.session.commit()
    return jsonify(contact.to_dict()), 201


@counselor_bp.route("/api/counselors/<int:contact_id>", methods=["DELETE"])
@jwt_required()
def delete_counselor(contact_id):
    guardian_id = int(get_jwt_identity())
    contact = CounselorContact.query.get_or_404(contact_id)
    if contact.guardian_id != guardian_id:
        return jsonify({"error": "Forbidden"}), 403
    db.session.delete(contact)
    db.session.commit()
    return jsonify({"deleted": True})
