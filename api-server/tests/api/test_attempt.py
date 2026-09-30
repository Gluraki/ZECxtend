import pytest
from conftest import ADMIN_HEADERS, END, START, teamlead_headers


@pytest.mark.asyncio
async def test_admin_creates_attempt_valid_by_default(make_attempt, setup):
    attempt = await make_attempt(setup["team"], setup["driver"], setup["challenge"])

    assert attempt["is_valid"] is True
    assert attempt["team_id"] == setup["team"]


@pytest.mark.asyncio
async def test_attempt_writes_are_admin_only(competition_client, make_attempt, attempt_body, setup):
    headers = teamlead_headers(setup["team"])
    attempt = await make_attempt(setup["team"], setup["driver"], setup["challenge"])
    body = attempt_body(setup["team"], setup["driver"], setup["challenge"])

    assert (await competition_client.post("/attempts/", headers=headers, json=body)).status_code == 403
    assert (await competition_client.put(f"/attempts/{attempt['id']}", headers=headers, json={})).status_code == 403
    assert (await competition_client.delete(f"/attempts/{attempt['id']}", headers=headers)).status_code == 403
    validity = await competition_client.patch(
        f"/attempts/{attempt['id']}/validity", headers=headers, json={"is_valid": False}
    )
    assert validity.status_code == 403


@pytest.mark.asyncio
async def test_writes_without_identity_are_401(competition_client, attempt_body, setup):
    body = attempt_body(setup["team"], setup["driver"], setup["challenge"])

    assert (await competition_client.post("/attempts/", json=body)).status_code == 401


@pytest.mark.asyncio
async def test_is_valid_cannot_be_set_on_create_or_update(competition_client, make_attempt, attempt_body, setup):
    body = attempt_body(setup["team"], setup["driver"], setup["challenge"], is_valid=False)
    created = await competition_client.post("/attempts/", headers=ADMIN_HEADERS, json=body)
    updated = await competition_client.put(
        f"/attempts/{created.json()['id']}", headers=ADMIN_HEADERS, json={"is_valid": False}
    )

    assert created.json()["is_valid"] is True
    assert updated.json()["is_valid"] is True


@pytest.mark.asyncio
async def test_driver_must_belong_to_team(competition_client, make_team, make_driver, attempt_body, setup):
    other_team = await make_team("Team B")
    other_driver = await make_driver(other_team["id"])

    body = attempt_body(setup["team"], other_driver["id"], setup["challenge"])
    response = await competition_client.post("/attempts/", headers=ADMIN_HEADERS, json=body)

    assert response.status_code == 400


@pytest.mark.asyncio
@pytest.mark.parametrize("field", ["driver_id", "challenge_id"])
async def test_unknown_references_are_400(competition_client, attempt_body, setup, field):
    body = {**attempt_body(setup["team"], setup["driver"], setup["challenge"]), field: 999}

    assert (await competition_client.post("/attempts/", headers=ADMIN_HEADERS, json=body)).status_code == 400


@pytest.mark.asyncio
async def test_end_must_be_after_start(competition_client, make_attempt, attempt_body, setup):
    body = attempt_body(setup["team"], setup["driver"], setup["challenge"], start_time=END, end_time=START)
    attempt = await make_attempt(setup["team"], setup["driver"], setup["challenge"])

    created = await competition_client.post("/attempts/", headers=ADMIN_HEADERS, json=body)
    updated = await competition_client.put(
        f"/attempts/{attempt['id']}", headers=ADMIN_HEADERS, json={"end_time": START}
    )

    assert created.status_code == 422
    assert updated.status_code == 400


@pytest.mark.asyncio
async def test_update_rejects_null_references(competition_client, make_attempt, setup):
    attempt = await make_attempt(setup["team"], setup["driver"], setup["challenge"])

    response = await competition_client.put(f"/attempts/{attempt['id']}", headers=ADMIN_HEADERS, json={"team_id": None})

    assert response.status_code == 400


@pytest.mark.asyncio
async def test_max_attempts_counts_only_valid_attempts(
    competition_client, make_attempt, attempt_body, make_challenge, setup
):
    challenge_id = await make_challenge("Slalom", max_attempts=2)
    first = await make_attempt(setup["team"], setup["driver"], challenge_id)
    await make_attempt(setup["team"], setup["driver"], challenge_id)
    body = attempt_body(setup["team"], setup["driver"], challenge_id)

    blocked = await competition_client.post("/attempts/", headers=ADMIN_HEADERS, json=body)
    await competition_client.patch(f"/attempts/{first['id']}/validity", headers=ADMIN_HEADERS, json={"is_valid": False})
    allowed = await competition_client.post("/attempts/", headers=ADMIN_HEADERS, json=body)

    assert blocked.status_code == 400
    assert allowed.status_code == 200


@pytest.mark.asyncio
async def test_revalidating_over_the_limit_is_rejected(competition_client, make_attempt, make_challenge, setup):
    challenge_id = await make_challenge("Slalom", max_attempts=1)
    first = await make_attempt(setup["team"], setup["driver"], challenge_id)
    await competition_client.patch(f"/attempts/{first['id']}/validity", headers=ADMIN_HEADERS, json={"is_valid": False})
    await make_attempt(setup["team"], setup["driver"], challenge_id)

    response = await competition_client.patch(
        f"/attempts/{first['id']}/validity", headers=ADMIN_HEADERS, json={"is_valid": True}
    )

    assert response.status_code == 400


@pytest.mark.asyncio
async def test_moving_attempt_into_full_challenge_is_rejected(competition_client, make_attempt, make_challenge, setup):
    full_challenge = await make_challenge("Slalom", max_attempts=1)
    await make_attempt(setup["team"], setup["driver"], full_challenge)
    attempt = await make_attempt(setup["team"], setup["driver"], setup["challenge"])

    response = await competition_client.put(
        f"/attempts/{attempt['id']}", headers=ADMIN_HEADERS, json={"challenge_id": full_challenge}
    )

    assert response.status_code == 400


@pytest.mark.asyncio
async def test_create_with_penalty_and_delete_cascades(competition_client, make_attempt, make_penalty_type, setup):
    penalty_type = await make_penalty_type()
    attempt = await make_attempt(
        setup["team"], setup["driver"], setup["challenge"], penalty_type=penalty_type, penalty_count=2
    )

    penalties = (await competition_client.get(f"/penalties/?attempt_id={attempt['id']}")).json()
    await competition_client.delete(f"/attempts/{attempt['id']}", headers=ADMIN_HEADERS)
    after_delete = (await competition_client.get("/penalties/")).json()

    assert [(p["penalty_type_id"], p["count"]) for p in penalties] == [(penalty_type, 2)]
    assert after_delete == []


@pytest.mark.asyncio
async def test_negative_penalty_count_is_rejected(competition_client, attempt_body, make_penalty_type, setup):
    penalty_type = await make_penalty_type()
    body = attempt_body(setup["team"], setup["driver"], setup["challenge"], penalty_type=penalty_type, penalty_count=-1)

    assert (await competition_client.post("/attempts/", headers=ADMIN_HEADERS, json=body)).status_code == 422


@pytest.mark.asyncio
async def test_list_filters_and_pagination(competition_client, make_attempt, make_challenge, setup):
    other_challenge = await make_challenge("Slalom")
    for _ in range(2):
        await make_attempt(setup["team"], setup["driver"], setup["challenge"])
    await make_attempt(setup["team"], setup["driver"], other_challenge)

    filtered = (await competition_client.get(f"/attempts/?challenge_id={other_challenge}")).json()
    by_driver = (await competition_client.get(f"/attempts/?driver_id={setup['driver']}")).json()
    page = (await competition_client.get("/attempts/?skip=1&limit=1")).json()

    assert [a["challenge_id"] for a in filtered] == [other_challenge]
    assert len(by_driver) == 3
    assert len(page) == 1
    assert (await competition_client.get("/attempts/?limit=0")).status_code == 422
