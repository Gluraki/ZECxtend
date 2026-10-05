import pytest
from fastapi import FastAPI
from httpx import ASGITransport, AsyncClient

from shared.exceptions import register_exception_handlers
from shared.identity import CurrentUserDep, require_roles
from shared.user_role import UserRole


@pytest.fixture
def identity_client():
    app = FastAPI()
    register_exception_handlers(app, "Test-Service")

    @app.get("/me")
    async def me(user: CurrentUserDep):
        return {
            "id": user.id,
            "username": user.username,
            "role": user.role.value,
            "team_id": user.team_id,
            "is_admin": user.is_admin,
        }

    @app.get("/admin", dependencies=[require_roles(UserRole.ADMIN)])
    async def admin_only():
        return {"ok": True}

    return AsyncClient(transport=ASGITransport(app=app), base_url="http://test")


HEADERS = {"X-User-Id": "5", "X-Username": "alice", "X-Role": "TEAMLEAD", "X-Team-Id": "2"}


@pytest.mark.asyncio
async def test_parses_identity_headers(identity_client):
    response = await identity_client.get("/me", headers=HEADERS)

    assert response.status_code == 200
    assert response.json() == {"id": 5, "username": "alice", "role": "TEAMLEAD", "team_id": 2, "is_admin": False}


@pytest.mark.asyncio
async def test_empty_team_id_is_none(identity_client):
    response = await identity_client.get("/me", headers={**HEADERS, "X-Team-Id": ""})

    assert response.json()["team_id"] is None


@pytest.mark.asyncio
@pytest.mark.parametrize("headers", [
    {},
    {k: v for k, v in HEADERS.items() if k != "X-Role"},
    {**HEADERS, "X-Role": "SUPERUSER"},
    {**HEADERS, "X-User-Id": "abc"},
    {**HEADERS, "X-Team-Id": "abc"},
])
async def test_missing_or_malformed_headers_are_401(identity_client, headers):
    assert (await identity_client.get("/me", headers=headers)).status_code == 401


@pytest.mark.asyncio
async def test_require_roles(identity_client):
    assert (await identity_client.get("/admin", headers=HEADERS)).status_code == 403
    assert (await identity_client.get("/admin", headers={**HEADERS, "X-Role": "ADMIN"})).status_code == 200


@pytest.mark.asyncio
async def test_is_admin(identity_client):
    response = await identity_client.get("/me", headers={**HEADERS, "X-Role": "ADMIN"})

    assert response.json()["is_admin"] is True
