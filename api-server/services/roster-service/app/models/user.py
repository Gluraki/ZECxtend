from datetime import datetime, timezone
from enum import Enum

from sqlalchemy import Column, DateTime, Integer, String

from shared.database import Base


class UserRole(Enum):
    ADMIN = "ADMIN"
    TEAM_LEAD = "TEAM_LEAD"
    VIEWER = "VIEWER"

class User(Base):
    __tablename__ = 'users'

    id = Column(Integer, primary_key=True)
    kc_id = Column(String, unique=True, nullable=False)
    username = Column(String, unique=True, nullable=False)
    team_id = Column(Integer, nullable=True)
    created_at = Column(DateTime, default=datetime.now(timezone.utc))
    