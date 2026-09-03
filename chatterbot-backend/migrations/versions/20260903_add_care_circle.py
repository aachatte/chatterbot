"""Add teen-specific Care Circle members and activity history."""
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = "20260903_add_care_circle"
down_revision = "20260902_add_gamification_pref"
branch_labels = None
dependencies = None


def upgrade():
    op.create_table(
        "care_circle_members",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("guardian_id", sa.Integer(), nullable=False),
        sa.Column("teen_id", sa.Integer(), nullable=False),
        sa.Column("name", sa.String(length=120), nullable=False),
        sa.Column("email", sa.String(length=255), nullable=False),
        sa.Column("phone", sa.String(length=20), nullable=True),
        sa.Column("role", sa.String(length=30), nullable=False),
        sa.Column("relationship", sa.String(length=100), nullable=True),
        sa.Column("access_level", sa.String(length=30), nullable=False),
        sa.Column("status", sa.String(length=20), nullable=False),
        sa.Column("notify_safety_alerts", sa.Boolean(), nullable=False),
        sa.Column("notify_checkin_updates", sa.Boolean(), nullable=False),
        sa.Column("invitation_token_hash", sa.String(length=64), nullable=True),
        sa.Column("invitation_expires_at", sa.DateTime(), nullable=True),
        sa.Column("invited_at", sa.DateTime(), nullable=False),
        sa.Column("accepted_at", sa.DateTime(), nullable=True),
        sa.Column("last_notified_at", sa.DateTime(), nullable=True),
        sa.Column("created_at", sa.DateTime(), nullable=False),
        sa.Column("updated_at", sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(["guardian_id"], ["users.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["teen_id"], ["teens.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint(
            "guardian_id",
            "teen_id",
            "email",
            name="uq_care_circle_member_email",
        ),
    )
    op.create_index(
        "ix_care_circle_members_guardian_id",
        "care_circle_members",
        ["guardian_id"],
    )
    op.create_index(
        "ix_care_circle_members_teen_id", "care_circle_members", ["teen_id"]
    )
    op.create_index(
        "ix_care_circle_members_status", "care_circle_members", ["status"]
    )
    op.create_index(
        "ix_care_circle_members_invitation_token_hash",
        "care_circle_members",
        ["invitation_token_hash"],
        unique=True,
    )

    op.create_table(
        "care_circle_activities",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("guardian_id", sa.Integer(), nullable=False),
        sa.Column("teen_id", sa.Integer(), nullable=False),
        sa.Column("member_id", sa.Integer(), nullable=True),
        sa.Column("member_name", sa.String(length=120), nullable=True),
        sa.Column("action", sa.String(length=40), nullable=False),
        sa.Column("detail", sa.String(length=300), nullable=False),
        sa.Column("actor_name", sa.String(length=120), nullable=False),
        sa.Column("created_at", sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(["guardian_id"], ["users.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["teen_id"], ["teens.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(
        "ix_care_circle_activities_guardian_id",
        "care_circle_activities",
        ["guardian_id"],
    )
    op.create_index(
        "ix_care_circle_activities_teen_id",
        "care_circle_activities",
        ["teen_id"],
    )
    op.create_index(
        "ix_care_circle_activities_created_at",
        "care_circle_activities",
        ["created_at"],
    )


def downgrade():
    op.drop_index(
        "ix_care_circle_activities_created_at",
        table_name="care_circle_activities",
    )
    op.drop_index(
        "ix_care_circle_activities_teen_id",
        table_name="care_circle_activities",
    )
    op.drop_index(
        "ix_care_circle_activities_guardian_id",
        table_name="care_circle_activities",
    )
    op.drop_table("care_circle_activities")

    op.drop_index(
        "ix_care_circle_members_invitation_token_hash",
        table_name="care_circle_members",
    )
    op.drop_index("ix_care_circle_members_status", table_name="care_circle_members")
    op.drop_index("ix_care_circle_members_teen_id", table_name="care_circle_members")
    op.drop_index(
        "ix_care_circle_members_guardian_id",
        table_name="care_circle_members",
    )
    op.drop_table("care_circle_members")
