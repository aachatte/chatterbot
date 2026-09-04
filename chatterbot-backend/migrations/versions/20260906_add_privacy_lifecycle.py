"""Add auditable privacy events and recoverable deletion requests."""
from alembic import op
import sqlalchemy as sa

revision = "20260906_add_privacy_lifecycle"
down_revision = "20260905_add_safety_operations"
branch_labels = None
dependencies = None


def upgrade():
    op.create_table(
        "privacy_events",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("guardian_id", sa.Integer(), nullable=False),
        sa.Column("teen_id", sa.Integer(), nullable=True),
        sa.Column("event_type", sa.String(50), nullable=False),
        sa.Column("policy_version", sa.String(40), nullable=False),
        sa.Column("detail", sa.JSON(), nullable=False),
        sa.Column("created_at", sa.DateTime(), nullable=False),
    )
    op.create_index("ix_privacy_events_guardian_id", "privacy_events", ["guardian_id"])
    op.create_index("ix_privacy_events_teen_id", "privacy_events", ["teen_id"])
    op.create_index("ix_privacy_events_event_type", "privacy_events", ["event_type"])
    op.create_index("ix_privacy_events_created_at", "privacy_events", ["created_at"])

    op.create_table(
        "data_deletion_requests",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("guardian_id", sa.Integer(), nullable=False),
        sa.Column("teen_id", sa.Integer(), nullable=True),
        sa.Column("teen_name", sa.String(100), nullable=False),
        sa.Column("status", sa.String(30), nullable=False),
        sa.Column("requested_at", sa.DateTime(), nullable=False),
        sa.Column("scheduled_for", sa.DateTime(), nullable=False),
        sa.Column("canceled_at", sa.DateTime(), nullable=True),
        sa.Column("completed_at", sa.DateTime(), nullable=True),
    )
    op.create_index("ix_data_deletion_requests_guardian_id", "data_deletion_requests", ["guardian_id"])
    op.create_index("ix_data_deletion_requests_teen_id", "data_deletion_requests", ["teen_id"])
    op.create_index("ix_data_deletion_requests_status", "data_deletion_requests", ["status"])
    op.create_index("ix_data_deletion_requests_scheduled_for", "data_deletion_requests", ["scheduled_for"])

    op.execute(
        """
        INSERT INTO privacy_events
            (guardian_id, teen_id, event_type, policy_version, detail, created_at)
        SELECT parent_id, id, 'consent_record_imported',
               'privacy-2026-09-05-draft', '{}',
               COALESCE(consent_verified_at, created_at)
        FROM teens
        WHERE consent_verified = true
        """
    )


def downgrade():
    op.drop_table("data_deletion_requests")
    op.drop_table("privacy_events")
