"""challenge scoring type

Revision ID: 2c47a6163936
Revises: c12de48f333c
Create Date: 2026-10-01 14:39:23.367211

"""
from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op

revision: str = '2c47a6163936'
down_revision: Union[str, Sequence[str], None] = 'c12de48f333c'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

scoring_type = sa.Enum('time', 'acceleration', 'endurance', name='scoringtype')

BACKFILL = {'Skidpad': 'time', 'Slalom': 'time', 'Acceleration': 'acceleration', 'Endurance': 'endurance'}


def upgrade() -> None:
    scoring_type.create(op.get_bind(), checkfirst=True)
    op.add_column('challenges', sa.Column('scoring_type', scoring_type, nullable=True))

    challenges = sa.table('challenges', sa.column('name', sa.String), sa.column('scoring_type', scoring_type))
    for name, value in BACKFILL.items():
        op.execute(challenges.update().where(challenges.c.name == name).values(scoring_type=value))


def downgrade() -> None:
    op.drop_column('challenges', 'scoring_type')
    scoring_type.drop(op.get_bind(), checkfirst=True)
