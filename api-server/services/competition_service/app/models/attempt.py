from datetime import datetime

from sqlalchemy import Boolean, DateTime, Float, ForeignKey, Index, Integer
from sqlalchemy.orm import Mapped, mapped_column, relationship

from shared.database import Base, utcnow


class Attempt(Base):
    __tablename__ = 'attempts'
    __table_args__ = (Index('ix_attempts_challenge_team', 'challenge_id', 'team_id'),)

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    team_id: Mapped[int] = mapped_column(ForeignKey('teams.id', ondelete='RESTRICT'), nullable=False)
    driver_id: Mapped[int] = mapped_column(ForeignKey('drivers.id', ondelete='RESTRICT'), nullable=False)
    challenge_id: Mapped[int] = mapped_column(ForeignKey('challenges.id', ondelete='RESTRICT'), nullable=False)
    is_valid: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True)
    start_time: Mapped[datetime | None] = mapped_column(DateTime)
    end_time: Mapped[datetime | None] = mapped_column(DateTime)
    energy_used: Mapped[float | None] = mapped_column(Float)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=utcnow)

    penalties = relationship('Penalty', back_populates='attempt', cascade='all, delete-orphan', passive_deletes=True)
