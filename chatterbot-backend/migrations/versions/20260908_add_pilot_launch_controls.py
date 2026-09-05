"""Add SMS consent state and provider operations records."""
from alembic import op
import sqlalchemy as sa

revision = "20260908_add_pilot_launch_controls"
down_revision = "20260907_add_security_and_pilot_ops"
branch_labels = None
dependencies = None


def upgrade():
    with op.batch_alter_table("teens") as batch_op:
        batch_op.add_column(sa.Column("sms_opted_out_at", sa.DateTime(), nullable=True))
        batch_op.add_column(sa.Column("sms_opt_out_source", sa.String(30), nullable=True))
        batch_op.create_index("ix_teens_sms_opted_out_at", ["sms_opted_out_at"])

    op.create_table(
        "provider_events",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("provider", sa.String(30), nullable=False),
        sa.Column("event_id", sa.String(160), nullable=False),
        sa.Column("event_type", sa.String(100), nullable=False),
        sa.Column("status", sa.String(30), nullable=False),
        sa.Column("detail", sa.JSON(), nullable=False),
        sa.Column("received_at", sa.DateTime(), nullable=False),
        sa.Column("processed_at", sa.DateTime(), nullable=True),
        sa.UniqueConstraint("provider", "event_id", name="uq_provider_event"),
    )
    op.create_index("ix_provider_events_provider", "provider_events", ["provider"])
    op.create_index("ix_provider_events_event_type", "provider_events", ["event_type"])
    op.create_index("ix_provider_events_status", "provider_events", ["status"])
    op.create_index("ix_provider_events_received_at", "provider_events", ["received_at"])

    op.create_table(
        "operational_events",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("category", sa.String(40), nullable=False),
        sa.Column("severity", sa.String(20), nullable=False),
        sa.Column("status", sa.String(20), nullable=False),
        sa.Column("source", sa.String(80), nullable=False),
        sa.Column("code", sa.String(80), nullable=False),
        sa.Column("detail", sa.JSON(), nullable=False),
        sa.Column("created_at", sa.DateTime(), nullable=False),
        sa.Column("resolved_at", sa.DateTime(), nullable=True),
    )
    op.create_index("ix_operational_events_category", "operational_events", ["category"])
    op.create_index("ix_operational_events_severity", "operational_events", ["severity"])
    op.create_index("ix_operational_events_status", "operational_events", ["status"])
    op.create_index("ix_operational_events_created_at", "operational_events", ["created_at"])

    op.create_table(
        "guardian_notifications",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("guardian_id", sa.Integer(), nullable=False),
        sa.Column("category", sa.String(40), nullable=False),
        sa.Column("title", sa.String(120), nullable=False),
        sa.Column("body", sa.String(500), nullable=False),
        sa.Column("created_at", sa.DateTime(), nullable=False),
        sa.Column("read_at", sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(["guardian_id"], ["users.id"], ondelete="CASCADE"),
    )
    op.create_index("ix_guardian_notifications_guardian_id", "guardian_notifications", ["guardian_id"])
    op.create_index("ix_guardian_notifications_category", "guardian_notifications", ["category"])
    op.create_index("ix_guardian_notifications_created_at", "guardian_notifications", ["created_at"])


def downgrade():
    op.drop_table("guardian_notifications")
    op.drop_table("operational_events")
    op.drop_table("provider_events")
    with op.batch_alter_table("teens") as batch_op:
        batch_op.drop_index("ix_teens_sms_opted_out_at")
        batch_op.drop_column("sms_opt_out_source")
        batch_op.drop_column("sms_opted_out_at")
