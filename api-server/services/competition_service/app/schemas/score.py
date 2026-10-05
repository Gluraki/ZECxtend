from typing import Optional

from pydantic import BaseModel, ConfigDict


class Run(BaseModel):
    attempt_id: int
    time: float
    energy_used: Optional[float] = None
    total_mass: Optional[float] = None
    mean_power: Optional[float] = None

    model_config = ConfigDict(frozen=True)
