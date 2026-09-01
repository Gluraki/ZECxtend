from app.crud.score import crud_score as crud
from app.schemas.leaderboard import LeaderboardResponse
from fastapi import APIRouter

from shared.database import SessionDep

router = APIRouter()


@router.get("/{challenge_id}/category/{category}", response_model=list[LeaderboardResponse])
async def get_leaderboard_by_category(db: SessionDep, challenge_id: int, category: str):
    leaderboard = await crud.get_leaderboard(db=db)
    return leaderboard
