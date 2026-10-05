import pytest
from conftest import ADMIN_HEADERS, teamlead_headers


@pytest.mark.asyncio
async def test_penalty_types_are_listed(competition_client, make_penalty_type):
    await make_penalty_type("Strecke verlassen", 10)
    await make_penalty_type("Hütchen", 5)

    response = await competition_client.get("/penalties/types/")

    assert response.status_code == 200
    assert [(t["type"], t["amount"]) for t in response.json()] == [("Strecke verlassen", 10), ("Hütchen", 5)]


@pytest.mark.asyncio
async def test_penalty_writes_are_admin_only(competition_client, make_attempt, make_penalty_type, setup):
    penalty_type = await make_penalty_type()
    attempt = await make_attempt(setup["team"], setup["driver"], setup["challenge"])
    body = {"attempt_id": attempt["id"], "penalty_type_id": penalty_type, "count": 1}

    as_lead = await competition_client.post("/penalties/", headers=teamlead_headers(setup["team"]), json=body)
    as_admin = await competition_client.post("/penalties/", headers=ADMIN_HEADERS, json=body)

    assert as_lead.status_code == 403
    assert as_admin.status_code == 200


@pytest.mark.asyncio
async def test_penalty_for_unknown_attempt_is_400(competition_client, make_penalty_type):
    penalty_type = await make_penalty_type()
    body = {"attempt_id": 999, "penalty_type_id": penalty_type, "count": 1}

    assert (await competition_client.post("/penalties/", headers=ADMIN_HEADERS, json=body)).status_code == 400


@pytest.mark.asyncio
async def test_challenge_update_is_admin_only(competition_client, make_team, make_challenge):
    team = await make_team()
    challenge_id = await make_challenge()

    as_lead = await competition_client.put(
        f"/challenges/{challenge_id}", headers=teamlead_headers(team["id"]), json={"max_attempts": 10}
    )
    as_admin = await competition_client.put(
        f"/challenges/{challenge_id}", headers=ADMIN_HEADERS, json={"max_attempts": 4}
    )

    assert as_lead.status_code == 403
    assert as_admin.json()["max_attempts"] == 4


@pytest.mark.asyncio
async def test_scores_resource_is_gone(competition_client):
    assert (await competition_client.get("/scores/")).status_code == 404


@pytest.mark.asyncio
async def test_leaderboard_without_attempts_is_empty(competition_client, make_challenge):
    challenge_id = await make_challenge()

    ok = await competition_client.get(f"/leaderboard/{challenge_id}/category/close_to_series")
    bad_category = await competition_client.get(f"/leaderboard/{challenge_id}/category/nope")

    assert ok.status_code == 200
    assert ok.json() == []
    assert bad_category.status_code == 422


@pytest.mark.asyncio
async def test_error_detail_names_the_service(competition_client):
    response = await competition_client.get("/teams/999")

    assert response.status_code == 404
    assert response.json()["detail"] == "Team with id 999 does not exist - Competition-Service"
