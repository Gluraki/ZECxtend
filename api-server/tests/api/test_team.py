import pytest
from conftest import ADMIN_HEADERS, teamlead_headers


@pytest.mark.asyncio
async def test_team_create_and_delete_are_admin_only(competition_client, make_team):
    team = await make_team()
    headers = teamlead_headers(team["id"])
    body = {"name": "B", "category": "close_to_series", "mean_power": 1, "vehicle_weight": 1, "rfid_identifier": "x"}

    assert (await competition_client.post("/teams/", headers=headers, json=body)).status_code == 403
    assert (await competition_client.delete(f"/teams/{team['id']}", headers=headers)).status_code == 403


@pytest.mark.asyncio
async def test_teamlead_can_rename_own_team_only(competition_client, make_team):
    team = await make_team()
    other = await make_team("Team B")
    headers = teamlead_headers(team["id"])

    own = await competition_client.put(f"/teams/{team['id']}", headers=headers, json={"name": "Renamed"})
    foreign = await competition_client.put(f"/teams/{other['id']}", headers=headers, json={"name": "Hijacked"})

    assert own.status_code == 200
    assert own.json()["name"] == "Renamed"
    assert foreign.status_code == 403


@pytest.mark.asyncio
async def test_teamlead_can_edit_vehicle_details(competition_client, make_team):
    team = await make_team()
    body = {"name": "Renamed", "vehicle_weight": 140.0, "mean_power": 6.5, "rfid_identifier": "new-tag"}

    response = await competition_client.put(f"/teams/{team['id']}", headers=teamlead_headers(team["id"]), json=body)

    assert response.status_code == 200
    assert {k: response.json()[k] for k in body} == body


@pytest.mark.asyncio
async def test_teamlead_cannot_change_category(competition_client, make_team):
    team = await make_team()

    response = await competition_client.put(
        f"/teams/{team['id']}", headers=teamlead_headers(team["id"]), json={"category": "professional_class"}
    )

    assert response.status_code == 403


@pytest.mark.asyncio
async def test_admin_can_change_category(competition_client, make_team):
    team = await make_team()

    response = await competition_client.put(
        f"/teams/{team['id']}", headers=ADMIN_HEADERS, json={"category": "professional_class"}
    )

    assert response.status_code == 200
    assert response.json()["category"] == "professional_class"


@pytest.mark.asyncio
async def test_team_with_attempts_cannot_be_deleted(competition_client, make_attempt, setup):
    await make_attempt(setup["team"], setup["driver"], setup["challenge"])

    response = await competition_client.delete(f"/teams/{setup['team']}", headers=ADMIN_HEADERS)

    assert response.status_code == 400


@pytest.mark.asyncio
async def test_team_without_attempts_deletes_with_its_drivers(competition_client, make_team, make_driver):
    team = await make_team()
    await make_driver(team["id"])

    response = await competition_client.delete(f"/teams/{team['id']}", headers=ADMIN_HEADERS)

    assert response.status_code == 200
    assert (await competition_client.get("/drivers/")).json() == []
