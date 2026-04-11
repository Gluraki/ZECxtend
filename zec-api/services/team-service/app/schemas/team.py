from datetime import datetime
from typing import Optional

from app.models.team import team_category
from pydantic import BaseModel, ConfigDict


class TeamBase(BaseModel):
    category: team_category
    name: str
    mean_power: float
    vehicle_weight: float
    rfid_identifier: str

class TeamCreate(TeamBase):
    pass

class TeamUpdate(BaseModel):
    name: Optional[str] = None
    vehicle_weight: Optional[float] = None
    mean_power: Optional[float] = None
    rfid_identifier: Optional[str] = None
    category: Optional[team_category] = None

class TeamResponse(TeamBase):
    id: int
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
