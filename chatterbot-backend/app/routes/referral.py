"""Referral program routes."""
from datetime import datetime
from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required, get_jwt_identity
from app import db
from app.models.referral import Referral

referral_bp = Blueprint("referral", __name__)


@referral_bp.route("/api/referrals/generate", methods=["POST"])
@jwt_required()
def generate_referral():
    guardian_id = int(get_jwt_identity())
    referral = Referral(referrer_guardian_id=guardian_id)
    db.session.add(referral)
    db.session.commit()
    return jsonify(referral.to_dict()), 201


@referral_bp.route("/api/referrals", methods=["GET"])
@jwt_required()
def list_referrals():
    guardian_id = int(get_jwt_identity())
    referrals = Referral.query.filter_by(referrer_guardian_id=guardian_id).all()
    return jsonify([r.to_dict() for r in referrals])


@referral_bp.route("/api/referrals/redeem", methods=["POST"])
def redeem_referral():
    data = request.get_json() or {}
    code = data.get("code", "").strip().upper()
    email = data.get("email", "").strip()
    if not code or not email:
        return jsonify({"error": "code and email required"}), 400
    referral = Referral.query.filter_by(code=code, used=False).first()
    if not referral:
        return jsonify({"error": "Invalid or already used referral code"}), 404
    referral.used = True
    referral.used_at = datetime.utcnow()
    referral.referree_email = email
    db.session.commit()
    return jsonify({"success": True, "message": "Referral redeemed! You both get one free month."})
