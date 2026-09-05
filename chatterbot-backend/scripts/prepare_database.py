"""Safely prepare either a fresh or already versioned Chatterbot database."""
from flask_migrate import stamp, upgrade
from sqlalchemy import inspect

from app import create_app, db


def prepare_database():
    app = create_app()
    with app.app_context():
        tables = set(inspect(db.engine).get_table_names())
        if not tables:
            db.create_all()
            stamp(revision="head")
            return "created"
        if "alembic_version" not in tables:
            raise RuntimeError(
                "Database has application tables but no Alembic version. "
                "Review and stamp its verified schema before deployment."
            )
        upgrade()
        return "upgraded"


if __name__ == "__main__":
    result = prepare_database()
    print(f"Database {result} and is at the current migration.")
