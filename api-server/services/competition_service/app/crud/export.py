import csv
import io
from enum import Enum
from typing import Any

from app.crud.challenge import crud_challenge
from app.crud.leaderboard import penalty_seconds, raw_time
from app.schemas.leaderboard import LeaderboardResponse
from fastapi import Response
from openpyxl import Workbook
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from shared.models import Attempt, Driver, Team, TeamCategory

LEADERBOARD_COLUMNS = ["rank", "team", "category", "score", "attempt_id", "time_s", "energy_used"]
ATTEMPT_COLUMNS = [
    "attempt_id", "team", "category", "driver", "start_time", "end_time",
    "time_s", "penalty_s", "time_with_penalties_s", "energy_used", "is_valid", "created_at",
]


class ExportFormat(str, Enum):
    csv = "csv"
    xlsx = "xlsx"


def leaderboard_rows(entries: list[LeaderboardResponse]) -> list[list[Any]]:
    return [
        [e.rank, e.team.name, e.team.category.value, e.score, e.attempt_id, e.time, e.energy_used]
        for e in entries
    ]


async def attempt_rows(db: AsyncSession, challenge_id: int, category: TeamCategory | None) -> list[list[Any]]:
    await crud_challenge.get(db=db, id=challenge_id)

    query = (
        select(Attempt, Team, Driver.name)
        .join(Team, Attempt.team_id == Team.id)
        .join(Driver, Attempt.driver_id == Driver.id)
        .where(Attempt.challenge_id == challenge_id)
        .order_by(Attempt.id)
    )
    if category is not None:
        query = query.where(Team.category == category)
    rows = (await db.execute(query)).all()
    penalties = await penalty_seconds(db, [attempt.id for attempt, _, _ in rows])

    result = []
    for attempt, team, driver_name in rows:
        time = raw_time(attempt)
        penalty = penalties.get(attempt.id, 0.0)
        result.append([
            attempt.id, team.name, team.category.value, driver_name, attempt.start_time, attempt.end_time,
            time, penalty, time + penalty, attempt.energy_used, attempt.is_valid, attempt.created_at,
        ])
    return result


def _csv(columns: list[str], rows: list[list[Any]]) -> bytes:
    buffer = io.StringIO()
    writer = csv.writer(buffer)
    writer.writerow(columns)
    writer.writerows(rows)
    return buffer.getvalue().encode("utf-8-sig")


def _xlsx(columns: list[str], rows: list[list[Any]]) -> bytes:
    workbook = Workbook()
    sheet = workbook.worksheets[0]
    sheet.append(columns)
    for row in rows:
        sheet.append(row)
    for cells in sheet.iter_rows(min_row=2):
        for cell in cells:
            if isinstance(cell.value, str):
                cell.data_type = "s"
    buffer = io.BytesIO()
    workbook.save(buffer)
    return buffer.getvalue()


def file_response(columns: list[str], rows: list[list[Any]], format: ExportFormat, filename: str) -> Response:
    if format == ExportFormat.xlsx:
        content = _xlsx(columns, rows)
        media_type = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    else:
        content = _csv(columns, rows)
        media_type = "text/csv; charset=utf-8"
    return Response(
        content=content,
        media_type=media_type,
        headers={"Content-Disposition": f'attachment; filename="{filename}.{format.value}"'},
    )
