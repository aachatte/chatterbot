"""Add auditable safety metadata and SMS retry idempotency."""
from alembic import op
import sqlalchemy as sa

revision = "20260904_harden_safety_flow"
down_revision = "20260903_add_care_circle"
branch_labels = None
dependencies = None


def upgrade():
    with op.batch_alter_table("crisis_alerts") as batch_op:
        batch_op.add_column(sa.Column("categories", sa.JSON(), nullable=True))
        batch_op.add_column(sa.Column("confidence", sa.Float(), nullable=True))
        batch_op.add_column(sa.Column("detection_version", sa.String(length=40), nullable=True))
        batch_op.add_column(
            sa.Column(
                "care_circle_notified_count",
                sa.Integer(),
                nullable=False,
                server_default="0",
            )
        )

    with op.batch_alter_table("messages") as batch_op:
        # Preserve historical messages while clearing replayed identifiers before
        # enforcing one inbound record per Twilio delivery.
        op.execute(
            """
            UPDATE messages
            SET twilio_sid = NULL
            WHERE id IN (
                SELECT id
                FROM (
                    SELECT id,
                           ROW_NUMBER() OVER (
                               PARTITION BY twilio_sid ORDER BY id
                           ) AS row_num
                    FROM messages
                    WHERE twilio_sid IS NOT NULL
                ) ranked
                WHERE row_num > 1
            )
            """
        )
        batch_op.create_index("ix_messages_twilio_sid", ["twilio_sid"], unique=True)


def downgrade():
    with op.batch_alter_table("messages") as batch_op:
        batch_op.drop_index("ix_messages_twilio_sid")

    with op.batch_alter_table("crisis_alerts") as batch_op:
        batch_op.drop_column("care_circle_notified_count")
        batch_op.drop_column("detection_version")
        batch_op.drop_column("confidence")
        batch_op.drop_column("categories")
