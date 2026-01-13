import pytest
from fastapi.testclient import TestClient
from app.main import app
import requests

@pytest.fixture
def override_admin():
    app.dependency_overrides[
        __import__("app.database.dependency", fromlist=["AdminUser"]).AdminUser
    ] = lambda: {
        "sub": "1",
        "email": "admin@test.com",
        "username": "admin",
        "roles": ["admin"],
    }
    yield
    app.dependency_overrides.clear()


@pytest.fixture
def override_teamlead():
    app.dependency_overrides[
        __import__("app.database.dependency", fromlist=["TeamLeadUser"]).TeamLeadUser
    ] = lambda: {
        "sub": "2",
        "email": "teamlead@test.com",
        "username": "teamlead",
        "roles": ["teamlead"],
    }
    yield
    app.dependency_overrides.clear()


@pytest.fixture
def override_viewer():
    app.dependency_overrides[
        __import__("app.database.dependency", fromlist=["ViewerUser"]).ViewerUser
    ] = lambda: {
        "sub": "3",
        "email": "viewer@test.com",
        "username": "viewer",
        "roles": ["viewer"],
    }
    yield
    app.dependency_overrides.clear()

def test_login_success(client, mocker):
    mocker.patch(
        "app.crud.auth.requests.post",
        return_value=mocker.Mock(
            status_code=200,
            json=lambda: {"access_token": "token"},
            raise_for_status=lambda: None,
        ),
    )
    response = client.post(
        "/api/auth/login",
        data={"username": "test", "password": "pass"},
    )

    assert response.status_code == 200
    assert response.json()["access_token"] == "token"


def test_refresh_success(client, mocker):
    mocker.patch(
        "app.crud.auth.requests.post",
        return_value=mocker.Mock(
            status_code=200,
            json=lambda: {"access_token": "new-token"},
            raise_for_status=lambda: None,
        ),
    )

    response = client.post(
        "/api/auth/refresh",
        data={"refresh_token": "refresh"},
    )

    assert response.status_code == 200
    assert response.json()["access_token"] == "new-token"


def test_verify_admin_success(client, override_admin):
    resp = client.get(
        "/api/auth/internal/verify/admin",
        headers={"Authorization": "Bearer token"},
    )

    assert resp.status_code == 200
    assert resp.json()["active"] is True
    assert "admin" in resp.json()["roles"]


def test_verify_teamlead_success(client, override_teamlead):
    resp = client.get(
        "/api/auth/internal/verify/teamlead",
        headers={"Authorization": "Bearer token"},
    )

    assert resp.status_code == 200
    assert "teamlead" in resp.json()["roles"]


def test_verify_viewer_success(client, override_viewer):
    resp = client.get(
        "/api/auth/internal/verify/viewer",
        headers={"Authorization": "Bearer token"},
    )

    assert resp.status_code == 200
    assert "viewer" in resp.json()["roles"]


def test_get_admin_token_success(client, mocker):
    mocker.patch(
        "app.crud.auth.requests.post",
        return_value=mocker.Mock(
            status_code=200,
            json=lambda: {"access_token": "admin-token"},
            raise_for_status=lambda: None,
        ),
    )

    response = client.get("/api/auth/internal/get-admin-token")

    assert response.status_code == 200
    assert response.json() == "admin-token"


def test_login_missing_fields_returns_400(client):
    response = client.post("/api/auth/login", data={})
    assert response.status_code == 422  # FastAPI validation


def test_login_invalid_credentials_returns_401(client, mocker):
    class FakeResponse:
        def raise_for_status(self):
            err = requests.HTTPError()
            err.response = type("R", (), {"status_code": 401})()
            raise err

    mocker.patch("app.crud.auth.requests.post", return_value=FakeResponse())

    response = client.post(
        "/api/auth/login",
        data={"username": "bad", "password": "creds"},
    )

    assert response.status_code == 401


def test_login_keycloak_unavailable_returns_503(client, mocker):
    mocker.patch(
        "app.crud.auth.requests.post",
        side_effect=requests.ConnectionError(),
    )

    response = client.post(
        "/api/auth/login",
        data={"username": "x", "password": "y"},
    )

    assert response.status_code == 503


def test_refresh_missing_token_returns_422(client):
    response = client.post("/api/auth/refresh", data={})
    assert response.status_code == 422


def test_refresh_failure_returns_401(client, mocker):
    class FakeResponse:
        def raise_for_status(self):
            raise requests.HTTPError()

    mocker.patch("app.crud.auth.requests.post", return_value=FakeResponse())

    response = client.post(
        "/api/auth/refresh",
        data={"refresh_token": "bad"},
    )

    assert response.status_code == 401


def test_verify_missing_token_returns_401(client):
    resp = client.get("/api/auth/internal/verify/admin")
    assert resp.status_code == 401


def test_verify_insufficient_permissions_returns_403(
    client,
    override_viewer,
):
    resp = client.get(
        "/api/auth/internal/verify/admin",
        headers={"Authorization": "Bearer token"},
    )

    assert resp.status_code == 403
