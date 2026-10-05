from collections.abc import Sequence

from app.crud.challenge import crud_challenge
from app.crud.score import score_runs
from app.schemas.leaderboard import LeaderboardResponse
from app.schemas.score import Run
from app.schemas.team import TeamResponse
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

import shared.exceptions as exc
from shared.models import Attempt, Driver, Penalty, PenaltyType, ScoringType, Team, TeamCategory


async def penalty_seconds(db: AsyncSession, attempt_ids: Sequence[int]) -> dict[int, float]:
    if not attempt_ids:
        return {}
    result = await db.execute(
        select(Penalty.attempt_id, func.sum(PenaltyType.amount * func.coalesce(Penalty.count, 0)))
        .join(PenaltyType, Penalty.penalty_type_id == PenaltyType.id)
        .where(Penalty.attempt_id.in_(attempt_ids))
        .group_by(Penalty.attempt_id)
    )
    return {attempt_id: float(seconds or 0) for attempt_id, seconds in result.all()}


def raw_time(attempt: Attempt) -> float:
    if attempt.start_time is None or attempt.end_time is None:
        raise exc.InvalidOperationError(f"Attempt {attempt.id} has no start or end time")
    return (attempt.end_time - attempt.start_time).total_seconds()


async def get_scoring_type(db: AsyncSession, challenge_id: int) -> ScoringType:
    challenge = await crud_challenge.get(db=db, id=challenge_id)
    if challenge.scoring_type is None:
        raise exc.InvalidOperationError(f"Challenge {challenge_id} has no scoring_type set")
    return challenge.scoring_type


async def get_leaderboard(db: AsyncSession, challenge_id: int, category: TeamCategory) -> list[LeaderboardResponse]:
    scoring_type = await get_scoring_type(db, challenge_id)

    result = await db.execute(
        select(Attempt, Team, Driver.weight)
        .join(Team, Attempt.team_id == Team.id)
        .join(Driver, Attempt.driver_id == Driver.id)
        .where(Attempt.challenge_id == challenge_id, Attempt.is_valid.is_(True), Team.category == category)
    )
    rows = result.all()
    penalties = await penalty_seconds(db, [attempt.id for attempt, _, _ in rows])

    runs = {}
    for attempt, team, driver_weight in rows:
        total_mass = None
        if team.vehicle_weight is not None and driver_weight is not None:
            total_mass = team.vehicle_weight + driver_weight
        runs[attempt.id] = Run(
            attempt_id=attempt.id,
            time=raw_time(attempt) + penalties.get(attempt.id, 0.0),
            energy_used=attempt.energy_used,
            total_mass=total_mass,
            mean_power=team.mean_power,
        )
    points = score_runs(scoring_type, list(runs.values()))

    ordered = sorted(rows, key=lambda row: (-points[row[0].id], row[0].created_at, row[0].id))
    best = {}
    for attempt, team, _ in ordered:
        best.setdefault(team.id, (attempt, team))

    show_energy = scoring_type == ScoringType.endurance
    return [
        LeaderboardResponse(
            rank=rank,
            score=round(points[attempt.id], 2),
            team=TeamResponse.model_validate(team),
            attempt_id=attempt.id,
            time=runs[attempt.id].time,
            energy_used=attempt.energy_used if show_energy else None,
        )
        for rank, (attempt, team) in enumerate(best.values(), start=1)
    ]
