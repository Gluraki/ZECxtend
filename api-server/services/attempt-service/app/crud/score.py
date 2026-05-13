from app.models.score import Score
from app.schemas.score import ScoreCreate, ScoreUpdate

from shared.crud_base import CRUDBase


class CRUDScore(CRUDBase[Score, ScoreCreate, ScoreUpdate]):
    async def get_leaderboard(self, db):
        return {"In progress": "Leaderboard data"}

crud_score = CRUDScore(Score)
