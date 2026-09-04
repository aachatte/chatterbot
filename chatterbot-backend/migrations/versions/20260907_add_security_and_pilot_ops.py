"""Add durable sessions, operational heartbeats, and pilot controls."""
from alembic import op
import sqlalchemy as sa

revision = "20260907_add_security_and_pilot_ops"
down_revision = "20260906_add_privacy_lifecycle"
branch_labels = None
dependencies = None


def upgrade():
    with op.batch_alter_table("users") as batch_op:
        batch_op.add_column(
            sa.Column("session_version", sa.Integer(), nullable=False, server_default="0")
        )

    op.create_table(
        "refresh_sessions",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("user_id", sa.Integer(), nullable=False),
        sa.Column("jti_hash", sa.String(64), nullable=False),
        sa.Column("expires_at", sa.DateTime(), nullable=False),
        sa.Column("revoked_at", sa.DateTime(), nullable=True),
        sa.Column("replaced_by_jti_hash", sa.String(64), nullable=True),
        sa.Column("created_at", sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"], ondelete="CASCADE"),
    )
    op.create_index("ix_refresh_sessions_user_id", "refresh_sessions", ["user_id"])
    op.create_index("ix_refresh_sessions_jti_hash", "refresh_sessions", ["jti_hash"], unique=True)
    op.create_index("ix_refresh_sessions_expires_at", "refresh_sessions", ["expires_at"])

    op.create_table(
        "operational_heartbeats",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("name", sa.String(60), nullable=False),
        sa.Column("last_success_at", sa.DateTime(), nullable=False),
        sa.Column("detail", sa.JSON(), nullable=False),
    )
    op.create_index("ix_operational_heartbeats_name", "operational_heartbeats", ["name"], unique=True)

    op.create_table(
        "pilot_controls",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("key", sa.String(60), nullable=False),
        sa.Column("enabled", sa.Boolean(), nullable=False),
        sa.Column("reason", sa.String(300), nullable=True),
        sa.Column("updated_by", sa.String(120), nullable=True),
        sa.Column("updated_at", sa.DateTime(), nullable=False),
    )
    op.create_index("ix_pilot_controls_key", "pilot_controls", ["key"], unique=True)

    op.create_table(
        "pilot_enrollments",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("guardian_id", sa.Integer(), nullable=False),
        sa.Column("cohort", sa.String(60), nullable=False),
        sa.Column("status", sa.String(30), nullable=False),
        sa.Column("readiness", sa.JSON(), nullable=False),
        sa.Column("enrolled_at", sa.DateTime(), nullable=False),
        sa.Column("ready_at", sa.DateTime(), nullable=True),
        sa.Column("paused_at", sa.DateTime(), nullable=True),
        sa.Column("completed_at", sa.DateTime(), nullable=True),
        sa.Column("updated_at", sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(["guardian_id"], ["users.id"], ondelete="CASCADE"),
    )
    op.create_index("ix_pilot_enrollments_guardian_id", "pilot_enrollments", ["guardian_id"], unique=True)
    op.create_index("ix_pilot_enrollments_status", "pilot_enrollments", ["status"])

    op.execute(
        """
        INSERT INTO pilot_controls (key, enabled, reason, updated_by, updated_at)
        VALUES ('global', true, NULL, 'migration', CURRENT_TIMESTAMP)
        """
    )
    op.execute(
        """
        INSERT INTO pilot_enrollments
            (guardian_id, cohort, status, readiness, enrolled_at, updated_at)
        SELECT id, 'family-pilot-1', 'enrolled', '{}', created_at, CURRENT_TIMESTAMP
        FROM users
        """
    )


def downgrade():
    op.drop_table("pilot_enrollments")
    op.drop_table("pilot_controls")
    op.drop_table("operational_heartbeats")
    op.drop_table("refresh_sessions")
    with op.batch_alter_table("users") as batch_op:
        batch_op.drop_column("session_version")
