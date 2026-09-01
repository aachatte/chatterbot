from datetime import datetime
from app import db

# association table between users and badges
user_badges = db.Table(
    'user_badges',
    db.Column('user_id', db.Integer, db.ForeignKey('users.id'), primary_key=True),
    db.Column('badge_id', db.Integer, db.ForeignKey('badges.id'), primary_key=True),
    db.Column('awarded_at', db.DateTime, default=datetime.utcnow)
)


class Badge(db.Model):
    __tablename__ = 'badges'

    id = db.Column(db.Integer, primary_key=True)
    code = db.Column(db.String(80), unique=True, nullable=False)
    name = db.Column(db.String(120), nullable=False)
    description = db.Column(db.String(300))
    icon = db.Column(db.String(300))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)


class PointTransaction(db.Model):
    __tablename__ = 'point_transactions'

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    amount = db.Column(db.Integer, nullable=False)
    reason = db.Column(db.String(200))
    meta = db.Column('metadata', db.JSON, nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    # relationship set on User via back_populates
    user = db.relationship('User', back_populates='point_transactions')
