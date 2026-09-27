from datetime import datetime

from app.crud.auth import BCRYPT_MAX_PASSWORD_BYTES
from pydantic import BaseModel, ConfigDict, Field, field_validator

from shared.user_role import UserRole

USERNAME_MIN_LENGTH = 3
USERNAME_MAX_LENGTH = 64
PASSWORD_MIN_LENGTH = 10


def _check_password_bytes(password: str | None) -> str | None:
    if password is not None and len(password.encode("utf-8")) > BCRYPT_MAX_PASSWORD_BYTES:
        raise ValueError(f"password must be at most {BCRYPT_MAX_PASSWORD_BYTES} bytes")
    return password


class UserBase(BaseModel):
    username: str = Field(..., min_length=USERNAME_MIN_LENGTH, max_length=USERNAME_MAX_LENGTH)

class UserCreate(UserBase):
    password: str = Field(..., min_length=PASSWORD_MIN_LENGTH)
    team_id: int | None = None
    role: UserRole = UserRole.USER
    must_change_password: bool = False

    _password_bytes = field_validator("password")(_check_password_bytes)

class UserUpdate(BaseModel):
    username: str | None = Field(None, min_length=USERNAME_MIN_LENGTH, max_length=USERNAME_MAX_LENGTH)
    password: str | None = Field(None, min_length=PASSWORD_MIN_LENGTH)
    team_id: int | None = None
    role: UserRole | None = None

    _password_bytes = field_validator("password")(_check_password_bytes)

class UserResponse(UserBase):
    id: int
    team_id: int | None = None
    role: UserRole
    must_change_password: bool
    created_at: datetime | None = None
    updated_at: datetime | None = None
    model_config = ConfigDict(from_attributes=True)
