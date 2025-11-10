from sqlalchemy import (
    Column, String, DateTime
)
from sqlalchemy.dialects.postgresql import UUID
import uuid
from app.database.session import Base
from datetime import datetime
class User(Base):
    __tablename__ = 'users'
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    email = Column(String, unique=True, nullable=False)
    username = Column(String, nullable=False)
    created_at = Column(DateTime, default=datetime.now)
    updated_at = Column(DateTime, default=datetime.now, onupdate=datetime.now)