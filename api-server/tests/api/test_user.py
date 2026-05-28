import pytest


@pytest.mark.asyncio
async def test_create_user(auth_client):
    response = await auth_client.post("/users/", json={
        "username": "testuser",
        "password": "password1",
    })
    assert response.status_code == 200
    data = response.json()
    assert data["username"] == "testuser"
    assert data["id"] is not None
    assert data["team_id"] is None
    assert "password" not in data
