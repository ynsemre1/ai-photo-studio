"""Add realized_loss_rr column to setup_journal.

Revision ID: 001_add_realized_loss_rr
"""

from alembic import op
import sqlalchemy as sa

revision = "001_add_realized_loss_rr"
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column(
        "setup_journal",
        sa.Column(
            "realized_loss_rr",
            sa.Float(),
            nullable=True,
            comment="Actual loss magnitude in R-multiples. NULL for legacy rows (treated as 1.0R).",
        ),
    )


def downgrade() -> None:
    op.drop_column("setup_journal", "realized_loss_rr")
