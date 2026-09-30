import pytest
from conftest import teamlead_headers


@pytest.mark.asyncio
async def test_teamlead_manages_drivers_of_own_team(competition_client, make_team):
    team = await make_team()
    headers = teamlead_headers(team["id"])

    created = await competition_client.post(
        "/drivers/", headers=headers, json={"name": "Max", "team_id": team["id"], "weight": 70}
    )
    driver_id = created.json()["id"]
    updated = await competition_client.put(f"/drivers/{driver_id}", headers=headers, json={"weight": 72})
    deleted = await competition_client.delete(f"/drivers/{driver_id}", headers=headers)

    assert created.status_code == 200
    assert updated.json()["weight"] == 72
    assert deleted.status_code == 200


@pytest.mark.asyncio
async def test_teamlead_cannot_touch_other_teams_drivers(competition_client, make_team, make_driver):
    team = await make_team()
    other = await make_team("Team B")
    foreign_driver = await make_driver(other["id"])
    headers = teamlead_headers(team["id"])

    create = await competition_client.post(
        "/drivers/", headers=headers, json={"name": "Max", "team_id": other["id"], "weight": 70}
    )
    update = await competition_client.put(f"/drivers/{foreign_driver['id']}", headers=headers, json={"weight": 1})
    delete = await competition_client.delete(f"/drivers/{foreign_driver['id']}", headers=headers)

    assert (create.status_code, update.status_code, delete.status_code) == (403, 403, 403)


@pytest.mark.asyncio
async def test_teamlead_cannot_move_driver_to_other_team(competition_client, make_team, make_driver):
    team = await make_team()
    other = await make_team("Team B")
    driver = await make_driver(team["id"])

    response = await competition_client.put(
        f"/drivers/{driver['id']}", headers=teamlead_headers(team["id"]), json={"team_id": other["id"]}
    )

    assert response.status_code == 403


@pytest.mark.asyncio
async def test_user_role_cannot_write_drivers(competition_client, make_team):
    team = await make_team()
    headers = {"X-User-Id": "3", "X-Username": "u", "X-Role": "USER", "X-Team-Id": str(team["id"])}

    response = await competition_client.post(
        "/drivers/", headers=headers, json={"name": "Max", "team_id": team["id"], "weight": 70}
    )

    assert response.status_code == 403


@pytest.mark.asyncio
async def test_filter_drivers_by_team(competition_client, make_team, make_driver):
    team = await make_team()
    other = await make_team("Team B")
    await make_driver(team["id"], name="A")
    await make_driver(other["id"], name="B")

    drivers = (await competition_client.get(f"/drivers/?team_id={team['id']}")).json()

    assert [d["name"] for d in drivers] == ["A"]
