import pytest
from conftest import ADMIN_HEADERS


@pytest.mark.asyncio
async def test_role_can_be_set_on_create_and_update(auth_client, create_user, team_id):
    user = await create_user("bob")
    assert user["role"] == "USER"

    response = await auth_client.put(
        f"/users/{user['id']}", headers=ADMIN_HEADERS, json={"role": "TEAMLEAD", "team_id": team_id}
    )

    assert response.status_code == 200
    assert response.json()["role"] == "TEAMLEAD"


@pytest.mark.asyncio
async def test_team_can_be_cleared_but_role_cannot_be_null(auth_client, create_user, team_id):
    user = await create_user("bob")
    assigned = await auth_client.put(f"/users/{user['id']}", headers=ADMIN_HEADERS, json={"team_id": team_id})

    cleared = await auth_client.put(f"/users/{user['id']}", headers=ADMIN_HEADERS, json={"team_id": None})
    null_role = await auth_client.put(f"/users/{user['id']}", headers=ADMIN_HEADERS, json={"role": None})

    assert assigned.json()["team_id"] == team_id
    assert cleared.status_code == 200
    assert cleared.json()["team_id"] is None
    assert null_role.status_code == 400


@pytest.mark.asyncio
async def test_last_admin_cannot_be_demoted_or_deleted(auth_client, create_user):
    admin = await create_user("root", role="ADMIN")

    assert (
        await auth_client.put(f"/users/{admin['id']}", headers=ADMIN_HEADERS, json={"role": "USER"})
    ).status_code == 400
    assert (await auth_client.delete(f"/users/{admin['id']}", headers=ADMIN_HEADERS)).status_code == 400


@pytest.mark.asyncio
async def test_admin_can_be_demoted_while_another_admin_exists(auth_client, create_user):
    admin = await create_user("root", role="ADMIN")
    await create_user("root2", role="ADMIN")

    assert (
        await auth_client.put(f"/users/{admin['id']}", headers=ADMIN_HEADERS, json={"role": "USER"})
    ).status_code == 200
    assert (await auth_client.delete(f"/users/{admin['id']}", headers=ADMIN_HEADERS)).status_code == 200


@pytest.mark.asyncio
@pytest.mark.parametrize("password", ["short", "x" * 73, "ü" * 37])
async def test_rejects_passwords_too_short_or_over_bcrypt_limit(auth_client, password):
    response = await auth_client.post("/users/", headers=ADMIN_HEADERS, json={"username": "bob", "password": password})

    assert response.status_code == 422


@pytest.mark.asyncio
async def test_accepts_long_password_within_bcrypt_limit(auth_client):
    response = await auth_client.post("/users/", headers=ADMIN_HEADERS, json={"username": "bob", "password": "x" * 72})

    assert response.status_code == 200


@pytest.mark.asyncio
async def test_role_sub_resource_is_gone(auth_client, create_user):
    user = await create_user("bob")

    assert (await auth_client.post(f"/users/{user['id']}/roles", headers=ADMIN_HEADERS)).status_code in (404, 405)


@pytest.mark.asyncio
async def test_teamlead_requires_team_on_create(auth_client, password, team_id):
    body = {"username": "lead", "password": password, "role": "TEAMLEAD"}

    without_team = await auth_client.post("/users/", headers=ADMIN_HEADERS, json=body)
    with_team = await auth_client.post("/users/", headers=ADMIN_HEADERS, json={**body, "team_id": team_id})

    assert without_team.status_code == 400
    assert with_team.status_code == 200


@pytest.mark.asyncio
async def test_teamlead_requires_team_on_update(auth_client, create_user, team_id):
    user = await create_user("bob")

    promote_without_team = await auth_client.put(
        f"/users/{user['id']}", headers=ADMIN_HEADERS, json={"role": "TEAMLEAD"}
    )
    await auth_client.put(f"/users/{user['id']}", headers=ADMIN_HEADERS, json={"role": "TEAMLEAD", "team_id": team_id})
    clear_team = await auth_client.put(f"/users/{user['id']}", headers=ADMIN_HEADERS, json={"team_id": None})
    demote_and_clear = await auth_client.put(
        f"/users/{user['id']}", headers=ADMIN_HEADERS, json={"role": "USER", "team_id": None}
    )

    assert promote_without_team.status_code == 400
    assert clear_team.status_code == 400
    assert demote_and_clear.status_code == 200
    assert demote_and_clear.json()["team_id"] is None


@pytest.mark.asyncio
async def test_password_change_clears_must_change_and_new_password_works(auth_client, create_user, login):
    user = await create_user("bob", must_change_password=True)

    updated = await auth_client.put(
        f"/users/{user['id']}", headers=ADMIN_HEADERS, json={"password": "new-password-456"}
    )

    assert updated.status_code == 200
    assert updated.json()["must_change_password"] is False
    assert "password" not in updated.json()
    assert (await login("bob", "new-password-456")).status_code == 200


@pytest.mark.asyncio
async def test_create_user_response(create_user):
    data = await create_user("testuser")

    assert data["username"] == "testuser"
    assert data["id"] is not None
    assert data["team_id"] is None
    assert data["role"] == "USER"
    assert "password" not in data
    assert "password_hash" not in data


@pytest.mark.asyncio
async def test_get_user_by_id_and_list(auth_client, create_user):
    bob = await create_user("bob")
    carol = await create_user("carol")

    single = await auth_client.get(f"/users/{bob['id']}", headers=ADMIN_HEADERS)
    listing = await auth_client.get("/users/", headers=ADMIN_HEADERS)

    assert single.status_code == 200
    assert single.json()["username"] == "bob"
    assert listing.status_code == 200
    assert [u["id"] for u in listing.json()] == [bob["id"], carol["id"]]


@pytest.mark.asyncio
@pytest.mark.parametrize("method", ["get", "put", "delete"])
async def test_unknown_user_is_404(auth_client, method):
    kwargs = {"json": {"username": "nobody"}} if method == "put" else {}

    response = await getattr(auth_client, method)("/users/999", headers=ADMIN_HEADERS, **kwargs)

    assert response.status_code == 404


@pytest.mark.asyncio
async def test_delete_user(auth_client, create_user):
    user = await create_user("bob")

    deleted = await auth_client.delete(f"/users/{user['id']}", headers=ADMIN_HEADERS)

    assert deleted.status_code == 200
    assert (await auth_client.get(f"/users/{user['id']}", headers=ADMIN_HEADERS)).status_code == 404


@pytest.mark.asyncio
async def test_duplicate_username_is_409(auth_client, create_user, password):
    await create_user("bob")
    carol = await create_user("carol")

    duplicate_create = await auth_client.post(
        "/users/", headers=ADMIN_HEADERS, json={"username": "bob", "password": password}
    )
    duplicate_rename = await auth_client.put(f"/users/{carol['id']}", headers=ADMIN_HEADERS, json={"username": "bob"})

    assert duplicate_create.status_code == 409
    assert duplicate_rename.status_code == 409


@pytest.mark.asyncio
async def test_unknown_team_is_rejected_on_create_and_update(auth_client, create_user, password):
    user = await create_user("bob")

    created = await auth_client.post(
        "/users/", headers=ADMIN_HEADERS, json={"username": "lead", "password": password, "team_id": 999}
    )
    updated = await auth_client.put(f"/users/{user['id']}", headers=ADMIN_HEADERS, json={"team_id": 999})

    assert created.status_code == 400
    assert updated.status_code == 400


@pytest.mark.asyncio
async def test_error_detail_names_the_service(auth_client):
    response = await auth_client.get("/users/999", headers=ADMIN_HEADERS)

    assert response.status_code == 404
    assert response.json()["detail"] == "User with id 999 does not exist - Auth-Service"
