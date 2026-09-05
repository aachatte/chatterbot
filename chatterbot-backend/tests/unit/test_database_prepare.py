"""Database preparation guards for new and ambiguous environments."""
import pytest
from flask import Flask
from sqlalchemy import text

from app import db
from scripts.prepare_database import prepare_database


def test_prepare_database_rejects_unversioned_application_schema(monkeypatch):
    app = Flask(__name__)
    app.config.update(
        TESTING=True,
        SQLALCHEMY_DATABASE_URI="sqlite://",
        SQLALCHEMY_TRACK_MODIFICATIONS=False,
    )
    db.init_app(app)
    with app.app_context():
        db.session.execute(text("CREATE TABLE users (id INTEGER PRIMARY KEY)"))
        db.session.commit()

    monkeypatch.setattr("scripts.prepare_database.create_app", lambda: app)
    with pytest.raises(RuntimeError, match="no Alembic version"):
        prepare_database()
