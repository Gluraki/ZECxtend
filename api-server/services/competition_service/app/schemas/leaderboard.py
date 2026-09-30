from app.schemas.team import TeamResponse
from pydantic import BaseModel, ConfigDict


class LeaderboardResponse(BaseModel):
    score: float
    team: TeamResponse

    model_config = ConfigDict(from_attributes=True)
