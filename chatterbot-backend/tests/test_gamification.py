"""Gamification route tests."""
import pytest
from flask import Flask
from flask_jwt_extended import JWTManager, create_access_token

from app import db
from app.models.gamification import PointTransaction
from app.models.user import User
from app.routes.gamification import gam_bp
from config import settings


@pytest.fixture()
def app():
    app = Flask(__name__)
    app.config.update(
        TESTING=True,
        SQLALCHEMY_DATABASE_URI="sqlite://",
        SQLALCHEMY_TRACK_MODIFICATIONS=False,
        JWT_SECRET_KEY="test-jwt-secret-must-be-at-least-32-characters",
        JWT_ACCESS_TOKEN_EXPIRES=False,
    )
    db.init_app(app)
    JWTManager(app)
    app.register_blueprint(gam_bp, url_prefix="/api/gamification")

    with app.app_context():
        db.create_all()

    yield app

    with app.app_context():
        db.session.remove()
        db.drop_all()


@pytest.fixture()
def client(app):
    return app.test_client()


def create_user():
    user = User(
        first_name="Test",
        last_name="Guardian",
        email="test@example.com",
        password_hash="not-used-in-tests",
    )
    db.session.add(user)
    db.session.commit()
    return user


def get_token(user_id: int) -> str:
    return create_access_token(identity=str(user_id))


def test_admin_award_points(client, app, monkeypatch):
    monkeypatch.setattr(settings, "admin_api_key", "test-admin-key")
    monkeypatch.setattr(settings, "enable_gamification", True)

    with app.app_context():
        user = create_user()
        token = get_token(user.id)

    res = client.post(
        "/api/gamification/award",
        json={"user_id": user.id, "amount": 50, "reason": "test"},
        headers={
            "Authorization": f"******",
            "X-Admin-API-Key": "test-admin-key",
        },
    )
    assert res.status_code == 200
    data = res.get_json()
    assert data["points"] == 50

    with app.app_context():
        stored = db.session.get(User, user.id)
        assert stored.points == 50
        tx = PointTransaction.query.filter_by(user_id=user.id).all()
        assert len(tx) == 1
        assert tx[0].reason == "test"


def test_opt_out_prevents_award(client, app, monkeypatch):
    monkeypatch.setattr(settings, "enable_gamification", True)

    with app.app_context():
        user = create_user()
        token = get_token(user.id)

    res = client.post(
        "/api/gamification/preferences",
        json={"gamification_enabled": False},
        headers={"Authorization": f"******"},
    )
    assert res.status_code == 200
    assert res.get_json()["gamification_enabled"] is False

    res2 = client.post(
        "/api/gamification/award-login",
        headers={"Authorization": f"******"},
    )
    assert res2.status_code == 403
    assert "disabled" in res2.get_json().get("message", "").lower()
