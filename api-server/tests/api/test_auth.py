from datetime import timedelta

import jwt
import pytest


def refresh_cookie(response) -> str:
    header = response.headers["set-cookie"]
    assert "HttpOnly" in header
    assert "Path=/refresh" in header
    assert "SameSite=strict" in header
    return header.split(";", 1)[0].split("=", 1)[1]


async def refresh(client, token: str | None):
    headers = {"Cookie": f"refresh_token={token}"} if token else {}
    return await client.post("/refresh", headers=headers)


@pytest.mark.asyncio
async def test_login_returns_short_lived_access_token_and_refresh_cookie(create_user, login, claims):
    user = await create_user(role="TEAMLEAD", team_id=7)

    response = await login()

    assert response.status_code == 200
    body = response.json()
    assert body["token_type"] == "bearer"
    assert body["expires_in"] == 15 * 60
    access = claims(body["access_token"])
    assert access["typ"] == "access"
    assert access["sub"] == "alice"
    assert access["id"] == user["id"]
    assert access["role"] == "TEAMLEAD"
    assert access["team_id"] == 7
    assert claims(refresh_cookie(response))["typ"] == "refresh"


@pytest.mark.asyncio
async def test_login_failure_is_identical_for_unknown_user_and_wrong_password(create_user, login):
    await create_user()

    wrong_password = await login(password="wrong-password")
    unknown_user = await login(username="nobody")

    assert wrong_password.status_code == unknown_user.status_code == 401
    assert wrong_password.json() == unknown_user.json()


@pytest.mark.asyncio
async def test_refresh_issues_new_access_token(auth_client, create_user, login, claims):
    await create_user()
    token = refresh_cookie(await login())

    response = await refresh(auth_client, token)

    assert response.status_code == 200
    assert claims(response.json()["access_token"])["typ"] == "access"


@pytest.mark.asyncio
async def test_refresh_picks_up_role_change_but_old_token_is_revoked(auth_client, create_user, login, claims):
    user = await create_user()
    token = refresh_cookie(await login())

    await auth_client.put(f"/users/{user['id']}", json={"role": "TEAMLEAD", "team_id": 1})

    assert (await refresh(auth_client, token)).status_code == 401
    relogin = await login()
    assert claims(relogin.json()["access_token"])["role"] == "TEAMLEAD"


@pytest.mark.asyncio
async def test_refresh_rejected_after_password_change(auth_client, create_user, login):
    user = await create_user()
    token = refresh_cookie(await login())

    response = await auth_client.put(f"/users/{user['id']}", json={"password": "new-password-456"})
    assert response.status_code == 200

    assert (await refresh(auth_client, token)).status_code == 401
    assert (await login()).status_code == 401
    assert (await login(password="new-password-456")).status_code == 200


@pytest.mark.asyncio
async def test_username_change_keeps_refresh_token_valid(auth_client, create_user, login, claims):
    user = await create_user()
    token = refresh_cookie(await login())

    await auth_client.put(f"/users/{user['id']}", json={"username": "alice2"})

    response = await refresh(auth_client, token)
    assert response.status_code == 200
    assert claims(response.json()["access_token"])["sub"] == "alice2"


@pytest.mark.asyncio
async def test_refresh_rejected_for_deleted_user(auth_client, create_user, login):
    user = await create_user()
    token = refresh_cookie(await login())

    await auth_client.delete(f"/users/{user['id']}")

    assert (await refresh(auth_client, token)).status_code == 401


@pytest.mark.asyncio
async def test_refresh_rejects_missing_access_and_forged_tokens(auth_client, create_user, login, claims):
    await create_user()
    access = (await login()).json()["access_token"]
    forged = jwt.encode(
        {**claims(access), "typ": "refresh", "ver": 0, "exp": claims(access)["exp"]},
        "some-other-secret-that-is-at-least-32-bytes",
        algorithm="HS256",
    )

    assert (await refresh(auth_client, None)).status_code == 401
    assert (await refresh(auth_client, access)).status_code == 401
    assert (await refresh(auth_client, forged)).status_code == 401


@pytest.mark.asyncio
async def test_refresh_rejects_expired_token(auth_client, create_user, auth_crud):
    user = await create_user()

    expired = auth_crud.create_refresh_token("alice", user["id"], 0, timedelta(seconds=-1))

    assert (await refresh(auth_client, expired)).status_code == 401


@pytest.mark.asyncio
async def test_logout_clears_refresh_cookie(auth_client):
    response = await auth_client.post("/logout")

    assert response.status_code == 204
    header = response.headers["set-cookie"]
    assert header.startswith("refresh_token=")
    assert "Max-Age=0" in header
    assert "Path=/refresh" in header


@pytest.mark.asyncio
async def test_pwd_change_claim_until_password_is_changed(auth_client, create_user, login, claims):
    user = await create_user("root", role="ADMIN", must_change_password=True)
    assert user["must_change_password"] is True
    assert claims((await login("root")).json()["access_token"])["pwd_change"] is True

    updated = await auth_client.put(f"/users/{user['id']}", json={"password": "new-password-456"})

    assert updated.json()["must_change_password"] is False
    relogin = await login("root", "new-password-456")
    assert "pwd_change" not in claims(relogin.json()["access_token"])


@pytest.mark.asyncio
async def test_no_pwd_change_claim_by_default(create_user, login, claims):
    await create_user()

    assert "pwd_change" not in claims((await login()).json()["access_token"])
