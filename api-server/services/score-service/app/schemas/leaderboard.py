from app.schemas.score import ScoreResponse
from app.schemas.team import TeamResponse
from pydantic import BaseModel, ConfigDict


class LeaderboardResponse(BaseModel):
    score: ScoreResponse
    team: TeamResponse

    model_config = ConfigDict(from_attributes=True)
