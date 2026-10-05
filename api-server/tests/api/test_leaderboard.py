from datetime import datetime, timedelta

import pytest
from conftest import ADMIN_HEADERS, START

from shared.models import ScoringType


def end_after(seconds: float) -> str:
    return (datetime.fromisoformat(START) + timedelta(seconds=seconds)).isoformat()


@pytest.fixture
def run(make_attempt):
    async def _run(team_id, driver_id, challenge_id, seconds, **extra):
        return await make_attempt(team_id, driver_id, challenge_id, end_time=end_after(seconds), **extra)

    return _run


@pytest.fixture
def team_with_driver(make_team, make_driver):
    async def _team_with_driver(name, category="close_to_series", driver_weight=70.0, **team):
        created = await make_team(name, category=category, **team)
        driver = await make_driver(created["id"], name=f"{name} driver", weight=driver_weight)
        return created["id"], driver["id"]

    return _team_with_driver


async def leaderboard(client, challenge_id, category="close_to_series"):
    response = await client.get(f"/leaderboard/{challenge_id}/category/{category}")
    assert response.status_code == 200, response.text
    return response.json()


@pytest.mark.asyncio
async def test_time_scoring_ranks_within_category(competition_client, make_challenge, team_with_driver, run):
    challenge = await make_challenge()
    a = await team_with_driver("A")
    b = await team_with_driver("B")
    other = await team_with_driver("C", category="professional_class")
    await run(*a, challenge, 60)
    await run(*b, challenge, 80)
    await run(*other, challenge, 50)

    rows = await leaderboard(competition_client, challenge)

    assert [(r["rank"], r["team"]["name"], r["score"]) for r in rows] == [(1, "A", 100.0), (2, "B", 75.0)]


@pytest.mark.asyncio
async def test_penalties_are_added_before_t_min(
    competition_client, make_challenge, make_penalty_type, team_with_driver, run
):
    challenge = await make_challenge()
    penalty_type = await make_penalty_type(amount=10)
    a = await team_with_driver("A")
    b = await team_with_driver("B")
    await run(*a, challenge, 60, penalty_type=penalty_type, penalty_count=3)  # 90s
    await run(*b, challenge, 80)

    rows = await leaderboard(competition_client, challenge)

    assert [(r["team"]["name"], r["score"], r["time"]) for r in rows] == [
        ("B", 100.0, pytest.approx(80, abs=1e-3)),
        ("A", round(100 * 80 / 90, 2), pytest.approx(90, abs=1e-3)),
    ]


@pytest.mark.asyncio
async def test_best_valid_attempt_per_team_counts(competition_client, make_challenge, team_with_driver, run):
    challenge = await make_challenge()
    a = await team_with_driver("A")
    b = await team_with_driver("B")
    await run(*a, challenge, 70)
    best = await run(*a, challenge, 60)
    invalid = await run(*b, challenge, 30)
    await run(*b, challenge, 120)
    await competition_client.patch(
        f"/attempts/{invalid['id']}/validity", headers=ADMIN_HEADERS, json={"is_valid": False}
    )

    rows = await leaderboard(competition_client, challenge)

    assert [(r["team"]["name"], r["attempt_id"], r["score"]) for r in rows] == [
        ("A", best["id"], 100.0),
        ("B", rows[1]["attempt_id"], 50.0),
    ]
    assert rows[1]["attempt_id"] != invalid["id"]


@pytest.mark.asyncio
async def test_acceleration_rank_one_gets_50(competition_client, make_challenge, team_with_driver, run):
    challenge = await make_challenge("Acceleration", scoring_type=ScoringType.acceleration)
    a = await team_with_driver("A", vehicle_weight=150.0, mean_power=10.0, driver_weight=70.0)  # f_pm 22
    b = await team_with_driver("B", vehicle_weight=200.0, mean_power=7.0, driver_weight=80.0)  # f_pm 40
    await run(*a, challenge, 4)
    await run(*b, challenge, 5)

    rows = await leaderboard(competition_client, challenge)

    assert [(r["team"]["name"], r["score"], r["energy_used"]) for r in rows] == [
        ("A", 50.0, None),
        ("B", round((50 - 40 / 20) * 4 / 5 + 40 / 20, 2), None),
    ]


@pytest.mark.asyncio
async def test_endurance_combines_time_and_energy(competition_client, make_challenge, team_with_driver, run):
    challenge = await make_challenge("Endurance", scoring_type=ScoringType.endurance)
    a = await team_with_driver("A")
    b = await team_with_driver("B")
    await run(*a, challenge, 100, energy_used=10)
    await run(*b, challenge, 125, energy_used=8)

    rows = await leaderboard(competition_client, challenge)

    assert [(r["team"]["name"], r["score"], r["energy_used"]) for r in rows] == [
        ("B", round(75 * 100 / 125 + 175, 2), 8),
        ("A", round(75 + 175 * 8 / 10, 2), 10),
    ]


@pytest.mark.asyncio
async def test_challenge_without_scoring_type_is_400(competition_client, make_challenge, team_with_driver, run):
    challenge = await make_challenge("Other", scoring_type=None)

    response = await competition_client.get(f"/leaderboard/{challenge}/category/close_to_series")

    assert response.status_code == 400


@pytest.mark.asyncio
async def test_unknown_challenge_is_404(competition_client):
    assert (await competition_client.get("/leaderboard/999/category/close_to_series")).status_code == 404


@pytest.mark.asyncio
async def test_acceleration_with_zero_power_is_400(competition_client, make_challenge, team_with_driver, run):
    challenge = await make_challenge("Acceleration", scoring_type=ScoringType.acceleration)
    a = await team_with_driver("A", mean_power=0.0)
    await run(*a, challenge, 4)

    response = await competition_client.get(f"/leaderboard/{challenge}/category/close_to_series")

    assert response.status_code == 400


@pytest.mark.asyncio
async def test_admin_can_set_scoring_type(competition_client, make_challenge):
    challenge = await make_challenge("Other", scoring_type=None)

    response = await competition_client.put(
        f"/challenges/{challenge}", headers=ADMIN_HEADERS, json={"scoring_type": "endurance"}
    )

    assert response.json()["scoring_type"] == "endurance"
