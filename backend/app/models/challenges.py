# tba
from sqlalchemy import (
    Column, Integer, String, Float, DateTime, Boolean,
    Enum as SQLEnum, ForeignKey,
)
from datetime import datetime, timezone
from sqlalchemy.orm import relationship
from sqlalchemy.dialects.postgresql import UUID
import uuid

from app.db.session import Base

class Challenge(Base):
    __tablename__ = "challenges"

    pass