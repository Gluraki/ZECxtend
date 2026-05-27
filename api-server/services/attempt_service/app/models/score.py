from datetime import datetime, timezone

from sqlalchemy import DateTime, Float, Integer
from sqlalchemy.orm import Mapped, mapped_column

from shared.database import Base


class Score(Base):
    __tablename__ = 'scores'
    
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    attempt_id: Mapped[int | None] = mapped_column(Integer)
    challenge_id: Mapped[int | None] = mapped_column(Integer)
    value: Mapped[float | None] = mapped_column(Float)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.now(timezone.utc))
    