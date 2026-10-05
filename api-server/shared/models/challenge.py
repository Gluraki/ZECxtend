from datetime import datetime
from enum import Enum

from sqlalchemy import DateTime, Integer, String
from sqlalchemy import Enum as SQLEnum
from sqlalchemy.orm import Mapped, mapped_column

from shared.database import Base, utcnow


class ScoringType(Enum):
    time = "time"
    acceleration = "acceleration"
    endurance = "endurance"


class Challenge(Base):
    __tablename__ = 'challenges'
    
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    name: Mapped[str] = mapped_column(String, nullable=False)
    max_attempts: Mapped[int | None] = mapped_column(Integer)
    scoring_type: Mapped[ScoringType | None] = mapped_column(SQLEnum(ScoringType))
    esp_mac_start1: Mapped[str | None] = mapped_column(String)
    esp_mac_start2: Mapped[str | None] = mapped_column(String)
    esp_mac_finish1: Mapped[str | None] = mapped_column(String)
    esp_mac_finish2: Mapped[str | None] = mapped_column(String)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=utcnow)
