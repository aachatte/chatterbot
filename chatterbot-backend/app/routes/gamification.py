from flask import Blueprint, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app import db
from app.models.user import User
from app.models.gamification import Badge, PointTransaction
from datetime import datetime, timedelta

gam_bp = Blueprint('gamification', __name__)


def _award_points(user: User, amount: int, reason: str, metadata: dict | None = None):
    user.points = (user.points or 0) + amount
    tx = PointTransaction(user_id=user.id, amount=amount, reason=reason, metadata=metadata)
    db.session.add(tx)
    db.session.commit()
    return tx


@gam_bp.route('/me', methods=['GET'])
@jwt_required()
def get_my_gamification():
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    if not user:
        return jsonify({'error': 'Not found'}), 404

    badges = [
        {'code': b.code, 'name': b.name, 'description': b.description, 'icon': b.icon}
        for b in (user.badges or [])
    ]

    return jsonify({
        'points': user.points or 0,
        'level': user.level or 1,
        'streak_count': user.streak_count or 0,
        'badges': badges,
    })


@gam_bp.route('/award-login', methods=['POST'])
@jwt_required()
def award_login():
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    if not user:
        return jsonify({'error': 'Not found'}), 404

    now = datetime.utcnow()
    today = now.date()

    # idempotent: if already awarded today, return existing points
    if user.last_login_at and user.last_login_at.date() == today:
        return jsonify({'message': 'Already awarded for today', 'points': user.points or 0})

    # streak handling: if last login was yesterday, increment streak, else reset
    if user.last_login_at and user.last_login_at.date() == (today - timedelta(days=1)):
        user.streak_count = (user.streak_count or 0) + 1
    else:
        user.streak_count = 1

    user.last_login_at = now

    points_awarded = 10  # default rule; make configurable later
    _award_points(user, points_awarded, reason='daily_login')

    return jsonify({'message': 'Login reward awarded', 'points_awarded': points_awarded, 'points': user.points or 0})
