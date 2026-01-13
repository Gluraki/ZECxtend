import os
import pytest
from fastapi.testclient import TestClient

os.environ.setdefault("KEYCLOAK_URL", "http://keycloak")
os.environ.setdefault("KEYCLOAK_TOKEN_URL", "http://keycloak/token")
os.environ.setdefault("KEYCLOAK_JWKS_URL", "http://keycloak/jwks")
os.environ.setdefault("ENVIRONMENT", "testing")
os.environ.setdefault("PROJECT_NAME", "test")
os.environ.setdefault("POSTGRES_SERVER", "localhost")
os.environ.setdefault("POSTGRES_USER", "test")
os.environ.setdefault("POSTGRES_PASSWORD", "test")
os.environ.setdefault("POSTGRES_DB", "test")
os.environ.setdefault("KEYCLOAK_CLIENT_ID", "admin-client")
os.environ.setdefault("KEYCLOAK_CLIENT_SECRET", "secret")
os.environ.setdefault("KEYCLOAK_ADMIN_CLIENT_ID", "admin-client")
os.environ.setdefault("KEYCLOAK_ADMIN_CLIENT_SECRET", "admin-secret")

from app.main import app

@pytest.fixture(scope="function")
def client():
    with TestClient(app) as c:
        yield c

# Provide a fallback 'mocker' fixture if pytest-mock is not installed
try:
    import pytest_mock  # type: ignore
except Exception:
    from unittest import mock as _unittest_mock

    @pytest.fixture
    def mocker(monkeypatch):
        """A minimal substitute for pytest-mock's 'mocker' fixture."""
        class _Mocker:
            Mock = _unittest_mock.Mock

            def __init__(self):
                self._patchers = []

            def patch(self, target, **kwargs):
                patcher = _unittest_mock.patch(target, **kwargs)
                started = patcher.start()
                self._patchers.append(patcher)
                return started

            def stopall(self):
                for p in self._patchers:
                    p.stop()
                self._patchers = []

        m = _Mocker()
        yield m
        m.stopall()

@pytest.fixture
def mock_jwks(mocker):
    jwks = {
        "keys": [
            {
                "kty": "RSA",
                "kid": "test-kid",
                "use": "sig",
                "n": "abc",
                "e": "AQAB",
            }
        ]
    }

    mocker.patch(
        "app.crud.auth.get_cached_jwks",
        return_value=jwks,
    )

    mocker.patch(
        "app.crud.auth.jwk.construct",
        return_value=mocker.Mock(public_key=lambda: "public-key"),
    )

    mocker.patch(
        "app.crud.auth.jwt.get_unverified_header",
        return_value={"kid": "test-kid"},
    )

    mocker.patch(
        "app.crud.auth.jwt.decode",
        return_value={
            "sub": "123",
            "email": "test@test.com",
            "preferred_username": "test",
            "resource_access": {
                "admin-client": {"roles": ["admin"]}
            },
        },
    )
