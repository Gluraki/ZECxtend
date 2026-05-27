from datetime import datetime, timezone

from sqlalchemy import DateTime, Integer, String
from sqlalchemy import Enum as SQLEnum
from sqlalchemy.orm import Mapped, mapped_column

from shared.database import Base
from shared.user_role import UserRole


class User(Base):
    __tablename__ = 'users'

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    username: Mapped[str] = mapped_column(String, unique=True, nullable=False)
    password_hash: Mapped[str] = mapped_column(String, nullable=False)
    team_id: Mapped[int | None] = mapped_column(Integer, nullable=True)
    role: Mapped[UserRole] = mapped_column(SQLEnum(UserRole), nullable=False, default=UserRole.USER)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.now(timezone.utc))
    updated_at: Mapped[datetime | None] = mapped_column(DateTime, onupdate=datetime.now(timezone.utc), nullable=True)