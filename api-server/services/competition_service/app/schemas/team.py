from datetime import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict, Field

from shared.models import TeamCategory


class TeamBase(BaseModel):
    category: TeamCategory
    name: str
    mean_power: float = Field(..., gt=0)
    vehicle_weight: float = Field(..., gt=0)
    rfid_identifier: str

class TeamCreate(TeamBase):
    pass

class TeamUpdate(BaseModel):
    name: Optional[str] = None
    vehicle_weight: Optional[float] = Field(None, gt=0)
    mean_power: Optional[float] = Field(None, gt=0)
    rfid_identifier: Optional[str] = None
    category: Optional[TeamCategory] = None

class TeamResponse(TeamBase):
    id: int
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
