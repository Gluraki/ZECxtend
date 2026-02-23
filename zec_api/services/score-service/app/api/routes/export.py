from fastapi import APIRouter, Query
from fastapi.responses import StreamingResponse
from app.database.dependency import SessionDep
from app.crud import leaderboard as crud
import pandas as pd
import io

router = APIRouter()

def stream_response(df: pd.DataFrame, format: str, filename: str) -> StreamingResponse:
    if format == "xlsx":
        buffer = io.BytesIO()
        df.to_excel(buffer, index=False, engine="openpyxl")
        buffer.seek(0)
        return StreamingResponse(
            buffer,
            media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            headers={"Content-Disposition": f"attachment; filename={filename}.xlsx"}
        )
    buffer = io.StringIO()
    df.to_csv(buffer, index=False)
    buffer.seek(0)
    return StreamingResponse(
        buffer,
        media_type="text/csv",
        headers={"Content-Disposition": f"attachment; filename={filename}.csv"}
    )

@router.get("/leaderboard/{challenge_id}/category/{category}")
def export_leaderboard(
    challenge_id: int,
    category: str,
    format: str = Query("csv", enum=["csv", "xlsx"]),
    db: SessionDep = None,
):
    leaderboard = crud.get_leaderboard(db, challenge_id, category=category)
    rows = []
    for rank, entry in enumerate(leaderboard, start=1):
        rows.append({
            "rank":           rank,
            "team_name":      entry.team.name,
            "category":       entry.team.category,
            "vehicle_weight": entry.team.vehicle_weight,
            "score_value":    entry.score.value,
            "challenge_id":   entry.score.challenge_id,
            "attempt_id":     entry.score.attempt_id,
            "scored_at":      entry.score.created_at,
        })
    df = pd.DataFrame(rows)
    filename = f"leaderboard_challenge{challenge_id}_{category}"
    return stream_response(df, format, filename)
