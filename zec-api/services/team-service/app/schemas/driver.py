from datetime import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict


class DriverBase(BaseModel):
    name: str
    team_id: int
    weight: float

class DriverCreate(DriverBase):
    pass

class DriverUpdate(BaseModel):
    name: Optional[str] = None
    team_id: Optional[int] = None
    weight: Optional[float] = None

class DriverResponse(DriverBase):
    id: int
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)