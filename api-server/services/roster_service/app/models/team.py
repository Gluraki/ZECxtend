from datetime import datetime, timezone
from enum import Enum

from sqlalchemy import DateTime, Float, String
from sqlalchemy import Enum as SQLEnum
from sqlalchemy.orm import Mapped, mapped_column, relationship

from shared.database import Base


class TeamCategory(Enum):
    close_to_series = "close_to_series"
    advanced_class = "advanced_class"
    professional_class = "professional_class"


class Team(Base):
    __tablename__ = 'teams'

    id: Mapped[int] = mapped_column(primary_key=True)
    category: Mapped[TeamCategory] = mapped_column(SQLEnum(TeamCategory), nullable=False)
    name: Mapped[str] = mapped_column(String, nullable=False)
    vehicle_weight: Mapped[float | None] = mapped_column(Float)
    mean_power: Mapped[float | None] = mapped_column(Float)
    rfid_identifier: Mapped[str | None] = mapped_column(String)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.now(timezone.utc))

    drivers = relationship("Driver", back_populates="team", cascade="all, delete-orphan")