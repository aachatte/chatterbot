"""Alembic migration: add gamification preference to users."""
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = '20260902_add_gamification_pref'
# This is the first migration committed to the repository. Earlier deployments
# created the base schema with SQLAlchemy's create_all().
down_revision = None
branch_labels = None
dependencies = None


def upgrade():
    op.add_column('users', sa.Column('gamification_enabled', sa.Boolean(), nullable=False, server_default=sa.text('1')))


def downgrade():
    op.drop_column('users', 'gamification_enabled')
