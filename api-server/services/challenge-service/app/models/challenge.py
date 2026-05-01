from datetime import datetime, timezone

from sqlalchemy import Column, DateTime, Integer, String

from shared.database import Base


class Challenge(Base):
    __tablename__ = 'challenges'
    
    id = Column(Integer, primary_key=True)
    name = Column(String, nullable=False)
    max_attempts = Column(Integer)
    esp_mac_start1 = Column(String)
    esp_mac_start2 = Column(String)
    esp_mac_finish1 = Column(String)
    esp_mac_finish2 = Column(String)
    created_at = Column(DateTime, default=datetime.now(timezone.utc))
