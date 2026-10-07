from datetime import datetime
from enum import Enum

from sqlalchemy import DateTime, Float, String
from sqlalchemy import Enum as SQLEnum
from sqlalchemy.orm import Mapped, mapped_column, relationship

from shared.database import Base, utcnow


class TeamCategory(Enum):
    close_to_series = "close_to_series"
    advanced_class = "advanced_class"
    professional_class = "professional_class"


class Team(Base):
    __tablename__ = 'teams'

    id: Mapped[int] = mapped_column(primary_key=True)
    category: Mapped[TeamCategory] = mapped_column(SQLEnum(TeamCategory), nullable=False)
    name: Mapped[str] = mapped_column(String, nullable=False)
    vehicle_weight: Mapped[float] = mapped_column(Float, nullable=False)
    mean_power: Mapped[float] = mapped_column(Float, nullable=False)
    rfid_identifier: Mapped[str] = mapped_column(String, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=utcnow)

    drivers = relationship("Driver", back_populates="team", cascade="all, delete-orphan")