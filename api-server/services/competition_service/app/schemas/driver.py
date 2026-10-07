from datetime import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict, Field


class DriverBase(BaseModel):
    name: str
    team_id: int
    weight: float = Field(..., gt=0)

class DriverCreate(DriverBase):
    pass

class DriverUpdate(BaseModel):
    name: Optional[str] = None
    team_id: Optional[int] = None
    weight: Optional[float] = Field(None, gt=0)

class DriverResponse(DriverBase):
    id: int
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)