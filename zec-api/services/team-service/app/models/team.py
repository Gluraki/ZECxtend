from datetime import datetime, timezone
from enum import Enum

from sqlalchemy import Column, DateTime, Float, Integer, String
from sqlalchemy import Enum as SQLEnum
from sqlalchemy.orm import relationship

from app.database.session import Base


class team_category(Enum):
    close_to_series = "close_to_series"
    advanced_class = "advanced_class"
    professional_class = "professional_class"

class Team(Base):
    __tablename__ = 'teams'
    
    id = Column(Integer, primary_key=True)
    category = Column(SQLEnum(team_category), nullable=False)
    name = Column(String, nullable=False)
    vehicle_weight = Column(Float)
    mean_power = Column(Float)
    rfid_identifier = Column(String)
    created_at = Column(DateTime, default=datetime.now(timezone.utc))
    
    drivers = relationship("Driver", back_populates="team", cascade="all, delete-orphan")
