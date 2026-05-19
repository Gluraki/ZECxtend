from fastapi import APIRouter, Query

from shared.database import SessionDep

router = APIRouter()

#TODO Implement actual logic
@router.get("/attempts")
def export_attempts(
    db: SessionDep,
    challenge_id: int = Query(...),
    category: str = Query(None),
    format: str = Query("csv", enum=["csv", "xlsx"])
):
    return {"challenge_id": challenge_id, "category": category, "format": format}

@router.get("/leaderboard")
def export_leaderboard(
    db: SessionDep,
    challenge_id: int = Query(...),
    category: str = Query(None),
    format: str = Query("csv", enum=["csv", "xlsx"])
):
    return {"challenge_id": challenge_id, "category": category, "format": format}
