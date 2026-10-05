from app.schemas.team import TeamResponse
from pydantic import BaseModel, ConfigDict


class LeaderboardResponse(BaseModel):
    rank: int
    score: float
    team: TeamResponse
    attempt_id: int
    time: float
    energy_used: float | None = None

    model_config = ConfigDict(from_attributes=True)
