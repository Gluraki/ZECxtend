from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field


class UserBase(BaseModel):
    username: str = Field(..., max_length=10)

class UserCreate(UserBase):
    password: str = Field(..., min_length=8, max_length=12)
    team_id: int | None = None

class UserUpdate(BaseModel):
    username: str | None = Field(None, max_length=10)
    password: str | None = Field(None, min_length=8, max_length=12)
    team_id: int | None = None

class UserResponse(UserBase):
    id: int
    team_id: int | None = None
    created_at: datetime | None = None
    updated_at: datetime | None = None
    model_config = ConfigDict(from_attributes=True)
