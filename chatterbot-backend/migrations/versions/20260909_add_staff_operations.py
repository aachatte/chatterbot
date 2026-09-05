"""Add accountable staff access and operational audit records."""
from alembic import op
import sqlalchemy as sa


revision = "20260909_add_staff_operations"
down_revision = "20260908_add_pilot_launch_controls"
branch_labels = None
dependencies = None


def upgrade():
    op.create_table(
        "staff_users",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("name", sa.String(120), nullable=False),
        sa.Column("email", sa.String(255), nullable=False),
        sa.Column("password_hash", sa.String(255), nullable=False),
        sa.Column("role", sa.String(30), nullable=False),
        sa.Column("is_active", sa.Boolean(), nullable=False),
        sa.Column("failed_login_count", sa.Integer(), nullable=False),
        sa.Column("locked_until", sa.DateTime(), nullable=True),
        sa.Column("last_login_at", sa.DateTime(), nullable=True),
        sa.Column("created_at", sa.DateTime(), nullable=False),
        sa.Column("updated_at", sa.DateTime(), nullable=False),
    )
    op.create_index("ix_staff_users_email", "staff_users", ["email"], unique=True)
    op.create_index("ix_staff_users_role", "staff_users", ["role"])

    op.create_table(
        "staff_sessions",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("staff_user_id", sa.Integer(), nullable=False),
        sa.Column("token_hash", sa.String(64), nullable=False),
        sa.Column("expires_at", sa.DateTime(), nullable=False),
        sa.Column("revoked_at", sa.DateTime(), nullable=True),
        sa.Column("created_at", sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(
            ["staff_user_id"], ["staff_users.id"], ondelete="CASCADE"
        ),
    )
    op.create_index(
        "ix_staff_sessions_staff_user_id", "staff_sessions", ["staff_user_id"]
    )
    op.create_index(
        "ix_staff_sessions_token_hash",
        "staff_sessions",
        ["token_hash"],
        unique=True,
    )
    op.create_index(
        "ix_staff_sessions_expires_at", "staff_sessions", ["expires_at"]
    )

    op.create_table(
        "staff_audit_logs",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("staff_user_id", sa.Integer(), nullable=True),
        sa.Column("actor_name", sa.String(120), nullable=False),
        sa.Column("action", sa.String(80), nullable=False),
        sa.Column("resource_type", sa.String(60), nullable=False),
        sa.Column("resource_id", sa.String(80), nullable=True),
        sa.Column("detail", sa.JSON(), nullable=False),
        sa.Column("created_at", sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(
            ["staff_user_id"], ["staff_users.id"], ondelete="SET NULL"
        ),
    )
    op.create_index(
        "ix_staff_audit_logs_staff_user_id",
        "staff_audit_logs",
        ["staff_user_id"],
    )
    op.create_index(
        "ix_staff_audit_logs_action", "staff_audit_logs", ["action"]
    )
    op.create_index(
        "ix_staff_audit_logs_created_at", "staff_audit_logs", ["created_at"]
    )


def downgrade():
    op.drop_table("staff_audit_logs")
    op.drop_table("staff_sessions")
    op.drop_table("staff_users")
