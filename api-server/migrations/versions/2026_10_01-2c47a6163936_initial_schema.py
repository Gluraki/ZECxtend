from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op

revision: str = '2c47a6163936'
down_revision: Union[str, Sequence[str], None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table('challenges',
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('name', sa.String(), nullable=False),
    sa.Column('max_attempts', sa.Integer(), nullable=True),
    sa.Column('esp_mac_start1', sa.String(), nullable=True),
    sa.Column('esp_mac_start2', sa.String(), nullable=True),
    sa.Column('esp_mac_finish1', sa.String(), nullable=True),
    sa.Column('esp_mac_finish2', sa.String(), nullable=True),
    sa.Column('created_at', sa.DateTime(), nullable=False),
    sa.Column('scoring_type', sa.Enum('time', 'acceleration', 'endurance', name='scoringtype'), nullable=True),
    sa.PrimaryKeyConstraint('id')
    )
    op.create_table('penalty_types',
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('type', sa.String(length=50), nullable=True),
    sa.Column('amount', sa.Integer(), nullable=True),
    sa.PrimaryKeyConstraint('id')
    )
    op.create_table('teams',
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column(
        'category',
        sa.Enum('close_to_series', 'advanced_class', 'professional_class', name='teamcategory'),
        nullable=False,
    ),
    sa.Column('name', sa.String(), nullable=False),
    sa.Column('vehicle_weight', sa.Float(), nullable=False),
    sa.Column('mean_power', sa.Float(), nullable=False),
    sa.Column('rfid_identifier', sa.String(), nullable=False),
    sa.Column('created_at', sa.DateTime(), nullable=False),
    sa.PrimaryKeyConstraint('id')
    )
    op.create_table('drivers',
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('name', sa.String(), nullable=False),
    sa.Column('team_id', sa.Integer(), nullable=False),
    sa.Column('weight', sa.Float(), nullable=False),
    sa.Column('created_at', sa.DateTime(), nullable=False),
    sa.ForeignKeyConstraint(['team_id'], ['teams.id'], ),
    sa.PrimaryKeyConstraint('id')
    )
    op.create_table('users',
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('username', sa.String(), nullable=False),
    sa.Column('password_hash', sa.String(), nullable=False),
    sa.Column('team_id', sa.Integer(), nullable=True),
    sa.Column('role', sa.Enum('ADMIN', 'TEAMLEAD', 'USER', name='userrole'), nullable=False),
    sa.Column('token_version', sa.Integer(), server_default='0', nullable=False),
    sa.Column('must_change_password', sa.Boolean(), server_default=sa.text('false'), nullable=False),
    sa.Column('created_at', sa.DateTime(), nullable=False),
    sa.Column('updated_at', sa.DateTime(), nullable=True),
    sa.ForeignKeyConstraint(['team_id'], ['teams.id'], ondelete='RESTRICT'),
    sa.PrimaryKeyConstraint('id'),
    sa.UniqueConstraint('username')
    )
    op.create_table('attempts',
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('team_id', sa.Integer(), nullable=False),
    sa.Column('driver_id', sa.Integer(), nullable=False),
    sa.Column('challenge_id', sa.Integer(), nullable=False),
    sa.Column('is_valid', sa.Boolean(), nullable=False),
    sa.Column('start_time', sa.DateTime(), nullable=False),
    sa.Column('end_time', sa.DateTime(), nullable=False),
    sa.Column('energy_used', sa.Float(), nullable=False),
    sa.Column('created_at', sa.DateTime(), nullable=False),
    sa.ForeignKeyConstraint(['challenge_id'], ['challenges.id'], ondelete='RESTRICT'),
    sa.ForeignKeyConstraint(['driver_id'], ['drivers.id'], ondelete='RESTRICT'),
    sa.ForeignKeyConstraint(['team_id'], ['teams.id'], ondelete='RESTRICT'),
    sa.PrimaryKeyConstraint('id')
    )
    op.create_index('ix_attempts_challenge_team', 'attempts', ['challenge_id', 'team_id'], unique=False)
    op.create_table('penalties',
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('attempt_id', sa.Integer(), nullable=False),
    sa.Column('penalty_type_id', sa.Integer(), nullable=False),
    sa.Column('count', sa.Integer(), nullable=False),
    sa.Column('created_at', sa.DateTime(), nullable=False),
    sa.ForeignKeyConstraint(['attempt_id'], ['attempts.id'], ondelete='CASCADE'),
    sa.ForeignKeyConstraint(['penalty_type_id'], ['penalty_types.id'], ),
    sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_penalties_attempt_id'), 'penalties', ['attempt_id'], unique=False)


def downgrade() -> None:
    op.drop_index(op.f('ix_penalties_attempt_id'), table_name='penalties')
    op.drop_table('penalties')
    op.drop_index('ix_attempts_challenge_team', table_name='attempts')
    op.drop_table('attempts')
    op.drop_table('users')
    op.drop_table('drivers')
    op.drop_table('teams')
    op.drop_table('penalty_types')
    op.drop_table('challenges')
    sa.Enum(name='userrole').drop(op.get_bind(), checkfirst=True)
    sa.Enum(name='teamcategory').drop(op.get_bind(), checkfirst=True)
    sa.Enum(name='scoringtype').drop(op.get_bind(), checkfirst=True)
