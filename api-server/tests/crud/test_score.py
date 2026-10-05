import pytest

import shared.exceptions as exc
from shared.models import ScoringType


@pytest.fixture
def score():
    from conftest import _load_service_app

    _load_service_app("competition_service")
    import app.crud.score as score

    return score


@pytest.fixture
def run(score):
    from app.schemas.score import Run

    return Run


def test_time_scoring_is_relative_to_fastest(score, run):
    runs = [run(attempt_id=1, time=60), run(attempt_id=2, time=80)]

    assert score.score_runs(ScoringType.time, runs) == {1: 100, 2: 75}


def test_acceleration_fastest_gets_exactly_50(score, run):
    runs = [
        run(attempt_id=1, time=4, total_mass=220, mean_power=10),  # f_pm 22
        run(attempt_id=2, time=5, total_mass=280, mean_power=7),  # f_pm 40
    ]

    points = score.score_runs(ScoringType.acceleration, runs)

    assert points[1] == pytest.approx(50)
    assert points[2] == pytest.approx((50 - 40 / 20) * 4 / 5 + 40 / 20)


def test_endurance_adds_time_and_energy_parts(score, run):
    runs = [run(attempt_id=1, time=100, energy_used=10), run(attempt_id=2, time=125, energy_used=8)]

    points = score.score_runs(ScoringType.endurance, runs)

    assert points[1] == pytest.approx(75 + 175 * 8 / 10)
    assert points[2] == pytest.approx(75 * 100 / 125 + 175)


@pytest.mark.parametrize("run_kwargs", [{"total_mass": None, "mean_power": 10}, {"total_mass": 200, "mean_power": 0}])
def test_acceleration_requires_mass_and_power(score, run, run_kwargs):
    with pytest.raises(exc.InvalidOperationError):
        score.score_runs(ScoringType.acceleration, [run(attempt_id=1, time=4, **run_kwargs)])


@pytest.mark.parametrize("energy", [None, 0, -1])
def test_endurance_requires_positive_energy(score, run, energy):
    with pytest.raises(exc.InvalidOperationError):
        score.score_runs(ScoringType.endurance, [run(attempt_id=1, time=100, energy_used=energy)])
