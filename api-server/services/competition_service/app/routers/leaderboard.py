from app.crud.leaderboard import get_leaderboard
from app.schemas.leaderboard import LeaderboardResponse
from fastapi import APIRouter

from shared.database import SessionDep
from shared.models import TeamCategory

router = APIRouter()


@router.get("/{challenge_id}/category/{category}", response_model=list[LeaderboardResponse])
async def get_leaderboard_by_category(db: SessionDep, challenge_id: int, category: TeamCategory):
    leaderboard = await get_leaderboard(db=db, challenge_id=challenge_id, category=category)
    return leaderboard
