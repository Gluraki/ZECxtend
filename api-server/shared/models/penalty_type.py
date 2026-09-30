from sqlalchemy import Integer, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from shared.database import Base


class PenaltyType(Base):
    __tablename__ = 'penalty_types'

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    type: Mapped[str | None] = mapped_column(String(50))
    amount: Mapped[int | None] = mapped_column(Integer)

    penalties = relationship('Penalty', back_populates='penalty_type')