from datetime import datetime, timezone

from sqlalchemy import Column, DateTime, Float, Integer

from shared.database import Base


class Score(Base):
    __tablename__ = 'scores'
    
    id = Column(Integer, primary_key=True)
    attempt_id = Column(Integer)
    challenge_id = Column(Integer)
    value = Column(Float)
    created_at = Column(DateTime, default=datetime.now(timezone.utc))
    