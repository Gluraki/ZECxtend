from datetime import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict, Field, field_validator, model_validator


def validate_naive_datetime_with_microseconds(v):
    if v is None:
        return v
    
    if isinstance(v, str):
        try:
            dt = datetime.fromisoformat(v)
        except ValueError as e:
            raise ValueError(
                "timestamp must be: YYYY-MM-DDTHH:MM:SS.ffffff"
            ) from e
    else:
        dt = v
    
    if dt.tzinfo is not None:
        raise ValueError("timestamp must have no timezone")
    if dt.microsecond == 0:
        raise ValueError("microseconds are required")
    return dt

class AttemptBase(BaseModel):
    team_id: int
    driver_id: int
    challenge_id: int
    start_time: datetime
    end_time: datetime
    energy_used: float

    @field_validator("start_time", "end_time", mode="before")
    @classmethod
    def enforce_iso_naive_with_microseconds(cls, v):
        return validate_naive_datetime_with_microseconds(v)

class AttemptCreate(AttemptBase):
    penalty_count: Optional[int] = Field(0, ge=0)
    penalty_type: Optional[int] = None

    @model_validator(mode="after")
    def end_after_start(self):
        if self.end_time <= self.start_time:
            raise ValueError("end_time must be after start_time")
        return self

class AttemptUpdate(BaseModel):
    team_id: Optional[int] = None
    driver_id: Optional[int] = None
    challenge_id: Optional[int] = None
    start_time: Optional[datetime] = None
    end_time: Optional[datetime] = None
    energy_used: Optional[float] = None

    @field_validator("start_time", "end_time", mode="before")
    @classmethod
    def enforce_iso_naive_with_microseconds(cls, v):
        return validate_naive_datetime_with_microseconds(v)

class AttemptValidityUpdate(BaseModel):
    is_valid: bool

class AttemptResponse(AttemptBase):
    id: int
    created_at: datetime
    is_valid: bool

    model_config = ConfigDict(from_attributes=True)
