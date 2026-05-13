from datetime import datetime, timezone

from sqlalchemy import Column, DateTime, Integer, String

from shared.database import Base


class User(Base):
    __tablename__ = 'users'

    id = Column(Integer, primary_key=True)
    kc_id = Column(String, unique=True, nullable=False)
    username = Column(String, unique=True, nullable=False)
    team_id = Column(Integer, nullable=True)
    created_at = Column(DateTime, default=datetime.now(timezone.utc))
    