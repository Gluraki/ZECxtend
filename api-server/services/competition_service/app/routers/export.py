from app.crud.export import (
    ATTEMPT_COLUMNS,
    LEADERBOARD_COLUMNS,
    ExportFormat,
    attempt_rows,
    file_response,
    leaderboard_rows,
)
from app.crud.leaderboard import get_leaderboard
from fastapi import APIRouter

from shared.database import SessionDep
from shared.identity import require_roles
from shared.models import TeamCategory
from shared.user_role import UserRole

router = APIRouter(dependencies=[require_roles(UserRole.ADMIN)])


@router.get("/leaderboard/{challenge_id}/category/{category}")
async def export_leaderboard(
    db: SessionDep, challenge_id: int, category: TeamCategory, format: ExportFormat = ExportFormat.csv
):
    entries = await get_leaderboard(db=db, challenge_id=challenge_id, category=category)
    filename = f"leaderboard_challenge{challenge_id}_{category.value}"
    return file_response(LEADERBOARD_COLUMNS, leaderboard_rows(entries), format, filename)


@router.get("/attempts/{challenge_id}")
async def export_attempts(
    db: SessionDep, challenge_id: int, category: TeamCategory | None = None, format: ExportFormat = ExportFormat.csv
):
    rows = await attempt_rows(db=db, challenge_id=challenge_id, category=category)
    filename = f"attempts_challenge{challenge_id}" + (f"_{category.value}" if category else "")
    return file_response(ATTEMPT_COLUMNS, rows, format, filename)
