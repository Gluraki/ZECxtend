from datetime import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict, Field


class PenaltyTypeResponse(BaseModel):
    id: int
    type: str
    amount: int

    model_config = ConfigDict(from_attributes=True)

class PenaltyBase(BaseModel):
    attempt_id: int
    count: int = Field(..., ge=0)
    penalty_type_id: int

class PenaltyCreate(PenaltyBase):
    pass

class PenaltyUpdate(BaseModel):
    attempt_id: Optional[int] = None
    count: Optional[int] = Field(None, ge=0)
    penalty_type_id: Optional[int] = None

class PenaltyResponse(PenaltyBase):
    id: int
    created_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)
