from datetime import datetime, timezone

from sqlalchemy import DateTime, Float, ForeignKey, Integer, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from shared.database import Base


class Driver(Base):
    __tablename__ = 'drivers'
    
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    name: Mapped[str] = mapped_column(String, nullable=False)
    team_id: Mapped[int | None] = mapped_column(ForeignKey('teams.id'))
    weight: Mapped[float | None] = mapped_column(Float)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.now(timezone.utc))
    
    team = relationship("Team", back_populates="drivers")
