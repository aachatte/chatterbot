"""Unit tests for the authenticated dashboard chat endpoint."""
import pytest
from flask import Flask
from flask_jwt_extended import JWTManager, create_access_token

from app.routes.dashboard_chat import MAX_MESSAGE_LENGTH, ai_service, dashboard_chat_bp


@pytest.fixture()
def client():
    """Create the smallest app needed to exercise the dashboard chat blueprint."""
    app = Flask(__name__)
    app.config.update(
        TESTING=True,
        JWT_SECRET_KEY="test-jwt-secret-must-be-at-least-32-characters",
        JWT_ACCESS_TOKEN_EXPIRES=False,
    )
    JWTManager(app)
    app.register_blueprint(dashboard_chat_bp, url_prefix="/api/dashboard-chat")
    return app.test_client()


@pytest.fixture()
def auth_headers():
    """Create an authorization header for the protected endpoint."""
    app = Flask(__name__)
    app.config.update(
        TESTING=True,
        JWT_SECRET_KEY="test-jwt-secret-must-be-at-least-32-characters",
        JWT_ACCESS_TOKEN_EXPIRES=False,
    )
    JWTManager(app)
    with app.app_context():
        token = create_access_token(identity="1")
    return {"Authorization": f"Bearer {token}"}


def test_dashboard_chat_requires_authentication(client):
    """Anonymous requests cannot invoke the parent assistant."""
    response = client.post("/api/dashboard-chat/", json={"message": "Hello"})

    assert response.status_code == 401


@pytest.mark.parametrize(
    "body, expected_error",
    [
        ([], "Request body must be a JSON object"),
        ({}, "Message must be a string"),
        ({"message": "   "}, "Message is required"),
        ({"message": 123}, "Message must be a string"),
        (
            {"message": "x" * (MAX_MESSAGE_LENGTH + 1)},
            f"Message must not exceed {MAX_MESSAGE_LENGTH} characters",
        ),
    ],
)
def test_dashboard_chat_rejects_invalid_messages(client, auth_headers, body, expected_error):
    """Only bounded, non-empty string messages reach the AI service."""
    response = client.post("/api/dashboard-chat/", json=body, headers=auth_headers)

    assert response.status_code == 400
    assert response.get_json()["error"] == expected_error


def test_dashboard_chat_returns_ai_reply(client, auth_headers, monkeypatch):
    """A valid authenticated request preserves the response contract."""
    monkeypatch.setattr(ai_service, "generate_parent_reply", lambda message: f"Reply: {message}")

    response = client.post(
        "/api/dashboard-chat/",
        json={"message": "  How do I view alerts?  "},
        headers=auth_headers,
    )

    assert response.status_code == 200
    assert response.get_json() == {"reply": "Reply: How do I view alerts?"}


def test_dashboard_chat_accepts_frontend_path_without_trailing_slash(
    client, auth_headers, monkeypatch
):
    """The frontend's documented endpoint must not depend on a redirect."""
    monkeypatch.setattr(ai_service, "generate_parent_reply", lambda message: message)

    response = client.post(
        "/api/dashboard-chat",
        json={"message": "Hello"},
        headers=auth_headers,
    )

    assert response.status_code == 200
    assert response.get_json() == {"reply": "Hello"}
