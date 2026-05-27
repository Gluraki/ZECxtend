from datetime import datetime, timezone

from sqlalchemy import Boolean, DateTime, Float, Integer
from sqlalchemy.orm import Mapped, mapped_column

from shared.database import Base


class Attempt(Base):
    __tablename__ = 'attempts'
    
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    team_id: Mapped[int | None] = mapped_column(Integer)
    driver_id: Mapped[int | None] = mapped_column(Integer)
    challenge_id: Mapped[int | None] = mapped_column(Integer)
    is_valid: Mapped[bool | None] = mapped_column(Boolean, default=True)
    start_time: Mapped[datetime | None] = mapped_column(DateTime)
    end_time: Mapped[datetime | None] = mapped_column(DateTime)
    energy_used: Mapped[float | None] = mapped_column(Float)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.now(timezone.utc))
