from datetime import datetime, timezone

from sqlalchemy import DateTime, ForeignKey, Integer
from sqlalchemy.orm import Mapped, mapped_column, relationship

from shared.database import Base


class Penalty(Base):
    __tablename__ = 'penalties'

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    attempt_id: Mapped[int | None] = mapped_column(Integer)
    penalty_type_id: Mapped[int | None] = mapped_column(ForeignKey('penalty_types.id'))
    count: Mapped[int | None] = mapped_column(Integer)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.now(timezone.utc))

    penalty_type = relationship('PenaltyType', back_populates='penalties')