from app.schemas.score import Run

import shared.exceptions as exc
from shared.models import ScoringType

TIME_MAX_POINTS = 100
ACCELERATION_MAX_POINTS = 50
ENDURANCE_TIME_MAX_POINTS = 75
ENDURANCE_ENERGY_MAX_POINTS = 175


def f_pm(run: Run) -> float:
    if run.total_mass is None or not run.mean_power or run.mean_power <= 0:
        raise exc.InvalidOperationError(
            f"Attempt {run.attempt_id}: vehicle weight, driver weight and mean power (> 0) are required"
        )
    return run.total_mass / run.mean_power


def _time_ratio(t_min: float, run: Run) -> float:
    return t_min / run.time


def score_runs(scoring_type: ScoringType, runs: list[Run]) -> dict[int, float]:
    if not runs:
        return {}
    t_min = min(run.time for run in runs)

    if scoring_type == ScoringType.time:
        return {run.attempt_id: TIME_MAX_POINTS * _time_ratio(t_min, run) for run in runs}

    if scoring_type == ScoringType.acceleration:
        points = {}
        for run in runs:
            fpm = f_pm(run)
            f_points = ACCELERATION_MAX_POINTS - fpm / 20
            points[run.attempt_id] = f_points * _time_ratio(t_min, run) + fpm / 20
        return points

    if scoring_type == ScoringType.endurance:
        energy: dict[int, float] = {}
        for run in runs:
            if run.energy_used is None or run.energy_used <= 0:
                raise exc.InvalidOperationError(f"Attempt {run.attempt_id}: energy_used must be > 0")
            energy[run.attempt_id] = run.energy_used
        w_min = min(energy.values())
        return {
            run.attempt_id: ENDURANCE_TIME_MAX_POINTS * _time_ratio(t_min, run)
            + ENDURANCE_ENERGY_MAX_POINTS * w_min / energy[run.attempt_id]
            for run in runs
        }

    raise exc.InvalidOperationError(f"Unknown scoring type {scoring_type}")
