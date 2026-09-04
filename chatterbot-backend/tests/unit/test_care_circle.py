"""Care Circle ownership, permissions, and invitation security tests."""
import pytest
from flask import Flask
from flask_jwt_extended import JWTManager, create_access_token

from app import db
from app.models.care_circle import CareCircleActivity, CareCircleMember
from app.models.crisis_alert import CrisisAlert, CrisisStatus
from app.models.teen import Teen
from app.models.user import User
from app.routes.care_circle import care_circle_bp
from app.services.crisis_service import CrisisDetectionService


@pytest.fixture()
def app():
    app = Flask(__name__)
    app.config.update(
        TESTING=True,
        SQLALCHEMY_DATABASE_URI="sqlite://",
        SQLALCHEMY_TRACK_MODIFICATIONS=False,
        JWT_SECRET_KEY="care-circle-test-secret-at-least-32-characters",
        JWT_ACCESS_TOKEN_EXPIRES=False,
    )
    db.init_app(app)
    JWTManager(app)
    app.register_blueprint(care_circle_bp, url_prefix="/api/care-circle")

    with app.app_context():
        db.create_all()
        guardian = User(
            email="guardian@example.com",
            password_hash="unused",
            first_name="Alex",
            last_name="Rivera",
        )
        other_guardian = User(
            email="other@example.com",
            password_hash="unused",
            first_name="Morgan",
            last_name="Lee",
        )
        db.session.add_all([guardian, other_guardian])
        db.session.flush()
        teen = Teen(
            parent_id=guardian.id,
            first_name="Maya",
            phone="+15555550111",
        )
        other_teen = Teen(
            parent_id=other_guardian.id,
            first_name="Taylor",
            phone="+15555550112",
        )
        db.session.add_all([teen, other_teen])
        db.session.commit()
        app.config.update(
            guardian_id=guardian.id,
            other_guardian_id=other_guardian.id,
            teen_id=teen.id,
            other_teen_id=other_teen.id,
        )

    yield app

    with app.app_context():
        db.session.remove()
        db.drop_all()


@pytest.fixture()
def client(app):
    return app.test_client()


def _headers(app, user_id):
    with app.app_context():
        token = create_access_token(identity=str(user_id))
    return {"Authorization": f"Bearer {token}"}


def _create_member(app, client, **overrides):
    payload = {
        "teen_id": app.config["teen_id"],
        "name": "Sam Carter",
        "email": "sam@example.com",
        "role": "counselor",
        "relationship": "School counselor",
        "access_level": "signals",
        "notify_safety_alerts": True,
        "notify_checkin_updates": True,
    }
    payload.update(overrides)
    return client.post(
        "/api/care-circle/members",
        json=payload,
        headers=_headers(app, app.config["guardian_id"]),
    )


def test_overview_and_members_are_scoped_to_the_owning_guardian(app, client):
    created = _create_member(app, client)
    assert created.status_code == 201
    body = created.get_json()
    assert body["member"]["status"] == "pending"
    assert body["member"]["access_level"] == "signals"
    assert "invitation_token_hash" not in body["member"]
    assert len(body["invite_token"]) >= 20
    assert created.headers["Cache-Control"] == "no-store"

    overview = client.get(
        f"/api/care-circle?teen_id={app.config['teen_id']}",
        headers=_headers(app, app.config["guardian_id"]),
    )
    assert overview.status_code == 200
    payload = overview.get_json()
    assert payload["selected_teen"]["first_name"] == "Maya"
    assert payload["owner"]["name"] == "Alex Rivera"
    assert [member["email"] for member in payload["members"]] == ["sam@example.com"]
    assert payload["activity"][0]["action"] == "member_invited"

    forbidden_teen = client.get(
        f"/api/care-circle?teen_id={app.config['teen_id']}",
        headers=_headers(app, app.config["other_guardian_id"]),
    )
    assert forbidden_teen.status_code == 404

    forbidden_create = client.post(
        "/api/care-circle/members",
        json={
            "teen_id": app.config["teen_id"],
            "name": "Wrong Guardian",
            "email": "wrong@example.com",
            "role": "mentor",
            "access_level": "safety_only",
        },
        headers=_headers(app, app.config["other_guardian_id"]),
    )
    assert forbidden_create.status_code == 404


def test_invitation_is_one_time_and_activates_the_member(app, client):
    created = _create_member(app, client)
    body = created.get_json()
    token = body["invite_token"]
    member_id = body["member"]["id"]

    details = client.get(f"/api/care-circle/invitations/{token}")
    assert details.status_code == 200
    assert details.headers["Cache-Control"] == "no-store"
    invitation = details.get_json()["invitation"]
    assert invitation["teen_first_name"] == "Maya"
    assert invitation["guardian_first_name"] == "Alex"
    assert "email" not in invitation

    accepted = client.post(f"/api/care-circle/invitations/{token}/accept")
    assert accepted.status_code == 200
    assert accepted.get_json()["member"]["status"] == "active"

    reused = client.post(f"/api/care-circle/invitations/{token}/accept")
    assert reused.status_code == 404

    with app.app_context():
        member = db.session.get(CareCircleMember, member_id)
        assert member.status == "active"
        assert member.invitation_token_hash is None
        assert member.accepted_at is not None
        assert CareCircleActivity.query.filter_by(
            action="invitation_accepted",
            member_id=member_id,
        ).count() == 1


def test_permissions_pause_and_removal_are_audited(app, client):
    created = _create_member(app, client)
    token = created.get_json()["invite_token"]
    member_id = created.get_json()["member"]["id"]
    client.post(f"/api/care-circle/invitations/{token}/accept")
    headers = _headers(app, app.config["guardian_id"])

    updated = client.patch(
        f"/api/care-circle/members/{member_id}",
        json={
            "access_level": "safety_only",
            "notify_checkin_updates": False,
            "status": "paused",
        },
        headers=headers,
    )
    assert updated.status_code == 200
    assert updated.get_json()["member"]["status"] == "paused"
    assert updated.get_json()["member"]["notify_checkin_updates"] is False

    forbidden = client.patch(
        f"/api/care-circle/members/{member_id}",
        json={"status": "active"},
        headers=_headers(app, app.config["other_guardian_id"]),
    )
    assert forbidden.status_code == 404

    removed = client.delete(
        f"/api/care-circle/members/{member_id}",
        headers=headers,
    )
    assert removed.status_code == 200
    with app.app_context():
        assert db.session.get(CareCircleMember, member_id) is None
        actions = [activity.action for activity in CareCircleActivity.query.all()]
        assert "member_updated" in actions
        assert "member_removed" in actions


def test_member_validation_rejects_duplicates_and_unsafe_values(app, client):
    first = _create_member(app, client)
    assert first.status_code == 201
    duplicate = _create_member(app, client, name="Same Email")
    assert duplicate.status_code == 409

    bad_email = _create_member(app, client, email="not-an-email")
    assert bad_email.status_code == 400
    bad_access = _create_member(
        app,
        client,
        email="other@example.com",
        access_level="full_transcripts",
    )
    assert bad_access.status_code == 400


def test_accepted_safety_contacts_receive_minimal_sms_signal(app, client, monkeypatch):
    created = _create_member(app, client, phone="+14155552671")
    token = created.get_json()["invite_token"]
    member_id = created.get_json()["member"]["id"]
    client.post(f"/api/care-circle/invitations/{token}/accept")

    sent_messages = []
    with app.app_context():
        teen = db.session.get(Teen, app.config["teen_id"])
        alert = CrisisAlert(
            teen_id=teen.id,
            status=CrisisStatus.TRIGGERED.value,
            severity="high",
        )
        db.session.add(alert)
        db.session.commit()

        service = CrisisDetectionService()
        monkeypatch.setattr(
            service.twilio,
            "send_sms",
            lambda phone, body, **_kwargs: sent_messages.append((phone, body))
            or {"success": True, "sid": "SM-care-circle"},
        )
        service._notify_parent(teen, alert)

        member = db.session.get(CareCircleMember, member_id)
        assert member.last_notified_at is not None
        assert CareCircleActivity.query.filter_by(
            action="safety_signal_routed",
            member_id=member_id,
        ).count() == 1

    assert sent_messages[0][0] == "+14155552671"
    assert "safety signal" in sent_messages[0][1]
    assert "No conversation text" in sent_messages[0][1]
