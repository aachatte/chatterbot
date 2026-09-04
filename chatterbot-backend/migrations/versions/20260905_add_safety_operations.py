"""Add safety operations, delivery evidence, and family plans."""
from alembic import op
import sqlalchemy as sa

revision = "20260905_add_safety_operations"
down_revision = "20260904_harden_safety_flow"
branch_labels = None
dependencies = None


def upgrade():
    with op.batch_alter_table("crisis_alerts") as batch_op:
        batch_op.add_column(sa.Column("assigned_to", sa.String(120), nullable=True))
        batch_op.add_column(sa.Column("response_due_at", sa.DateTime(), nullable=True))
        batch_op.add_column(sa.Column("follow_up_at", sa.DateTime(), nullable=True))
        batch_op.add_column(sa.Column("resolution_reason", sa.String(50), nullable=True))
        batch_op.add_column(sa.Column("false_positive_reason", sa.String(500), nullable=True))
        batch_op.create_index("ix_crisis_alerts_assigned_to", ["assigned_to"])
        batch_op.create_index("ix_crisis_alerts_response_due_at", ["response_due_at"])

    op.create_table(
        "safety_alert_events",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("alert_id", sa.Integer(), nullable=False),
        sa.Column("actor_type", sa.String(30), nullable=False),
        sa.Column("actor_id", sa.Integer(), nullable=True),
        sa.Column("actor_name", sa.String(120), nullable=False),
        sa.Column("action", sa.String(50), nullable=False),
        sa.Column("from_status", sa.String(30), nullable=True),
        sa.Column("to_status", sa.String(30), nullable=True),
        sa.Column("notes", sa.String(2000), nullable=True),
        sa.Column("created_at", sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(["alert_id"], ["crisis_alerts.id"], ondelete="CASCADE"),
    )
    op.create_index("ix_safety_alert_events_alert_id", "safety_alert_events", ["alert_id"])
    op.create_index("ix_safety_alert_events_action", "safety_alert_events", ["action"])
    op.create_index("ix_safety_alert_events_created_at", "safety_alert_events", ["created_at"])

    op.create_table(
        "notification_deliveries",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("alert_id", sa.Integer(), nullable=False),
        sa.Column("recipient_type", sa.String(30), nullable=False),
        sa.Column("recipient_id", sa.Integer(), nullable=True),
        sa.Column("recipient_name", sa.String(120), nullable=False),
        sa.Column("masked_destination", sa.String(40), nullable=True),
        sa.Column("channel", sa.String(20), nullable=False),
        sa.Column("provider_sid", sa.String(100), nullable=True),
        sa.Column("status", sa.String(30), nullable=False),
        sa.Column("attempt_count", sa.Integer(), nullable=False),
        sa.Column("last_error", sa.String(500), nullable=True),
        sa.Column("created_at", sa.DateTime(), nullable=False),
        sa.Column("updated_at", sa.DateTime(), nullable=False),
        sa.Column("delivered_at", sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(["alert_id"], ["crisis_alerts.id"], ondelete="CASCADE"),
    )
    op.create_index("ix_notification_deliveries_alert_id", "notification_deliveries", ["alert_id"])
    op.create_index("ix_notification_deliveries_status", "notification_deliveries", ["status"])
    op.create_index(
        "ix_notification_deliveries_provider_sid",
        "notification_deliveries",
        ["provider_sid"],
        unique=True,
    )

    op.create_table(
        "family_safety_plans",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("guardian_id", sa.Integer(), nullable=False),
        sa.Column("teen_id", sa.Integer(), nullable=False),
        sa.Column("plan_data", sa.JSON(), nullable=False),
        sa.Column("is_active", sa.Boolean(), nullable=False),
        sa.Column("version", sa.Integer(), nullable=False),
        sa.Column("teen_acknowledged_at", sa.DateTime(), nullable=True),
        sa.Column("created_at", sa.DateTime(), nullable=False),
        sa.Column("updated_at", sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(["guardian_id"], ["users.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["teen_id"], ["teens.id"], ondelete="CASCADE"),
        sa.UniqueConstraint("teen_id", name="uq_family_safety_plan_teen"),
    )
    op.create_index("ix_family_safety_plans_guardian_id", "family_safety_plans", ["guardian_id"])
    op.create_index("ix_family_safety_plans_teen_id", "family_safety_plans", ["teen_id"])


def downgrade():
    op.drop_table("family_safety_plans")
    op.drop_table("notification_deliveries")
    op.drop_table("safety_alert_events")
    with op.batch_alter_table("crisis_alerts") as batch_op:
        batch_op.drop_index("ix_crisis_alerts_response_due_at")
        batch_op.drop_index("ix_crisis_alerts_assigned_to")
        batch_op.drop_column("false_positive_reason")
        batch_op.drop_column("resolution_reason")
        batch_op.drop_column("follow_up_at")
        batch_op.drop_column("response_due_at")
        batch_op.drop_column("assigned_to")
