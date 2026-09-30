import importlib
import os
import sys
from pathlib import Path

import pytest
import pytest_asyncio
from fastapi import FastAPI
from httpx import ASGITransport, AsyncClient
from sqlalchemy import event
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine

ROOT = Path(__file__).resolve().parents[1]
TEST_DATABASE_URL = "sqlite+aiosqlite:///./test.db"
_SERVICE_APPS: dict[str, FastAPI] = {}

os.environ.setdefault("DATABASE_URL", TEST_DATABASE_URL)
os.environ.setdefault("SECRET_KEY", "test-only-secret-key-that-is-at-least-32-bytes")

from shared.models import Challenge, PenaltyType, Team, TeamCategory  # noqa: E402


def _load_service_app(service_name: str) -> FastAPI:
    if service_name in _SERVICE_APPS:
        return _SERVICE_APPS[service_name]

    service_root = ROOT / "services" / service_name
    service_path = str(service_root)

    for module_name in [name for name in sys.modules if name == "app" or name.startswith("app.")]:
        sys.modules.pop(module_name, None)

    if service_path in sys.path:
        sys.path.remove(service_path)
    sys.path.insert(0, service_path)

    app = importlib.import_module("app.main").app
    _SERVICE_APPS[service_name] = app
    return app


@pytest.fixture(scope="session", autouse=True)
def import_all_models():
    _load_service_app("competition_service")
    _load_service_app("auth_service")


@pytest_asyncio.fixture(scope="function")
async def db_engine(import_all_models):
    from shared.database import Base

    engine = create_async_engine(TEST_DATABASE_URL, connect_args={"check_same_thread": False})

    @event.listens_for(engine.sync_engine, "connect")
    def _enable_sqlite_foreign_keys(dbapi_connection, _):
        cursor = dbapi_connection.cursor()
        cursor.execute("PRAGMA foreign_keys=ON")
        cursor.close()

    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    yield engine
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)
    await engine.dispose()


@pytest_asyncio.fixture(scope="function")
async def db(db_engine):
    session_factory = async_sessionmaker(db_engine, expire_on_commit=False)
    async with session_factory() as session:
        yield session
        await session.rollback()


@pytest_asyncio.fixture(scope="function")
async def competition_client(db: AsyncSession):
    app = _load_service_app("competition_service")
    from shared.database import get_db

    async def override_get_db():
        yield db

    app.dependency_overrides[get_db] = override_get_db
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        yield ac
    app.dependency_overrides.clear()


@pytest_asyncio.fixture(scope="function")
async def auth_client(db: AsyncSession):
    app = _load_service_app("auth_service")
    from shared.database import get_db

    async def override_get_db():
        yield db

    app.dependency_overrides[get_db] = override_get_db
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        yield ac
    app.dependency_overrides.clear()


PASSWORD = "password123"


@pytest.fixture
def password() -> str:
    return PASSWORD


@pytest.fixture
def create_user(auth_client):
    async def _create_user(username="alice", role="USER", team_id=None, **extra):
        response = await auth_client.post("/users/", json={
            "username": username,
            "password": PASSWORD,
            "role": role,
            "team_id": team_id,
            **extra,
        })
        assert response.status_code == 200, response.text
        return response.json()

    return _create_user


@pytest_asyncio.fixture
async def team_id(db) -> int:
    team = Team(name="Team", category=TeamCategory.close_to_series)
    db.add(team)
    await db.commit()
    return team.id


@pytest.fixture
def login(auth_client):
    async def _login(username="alice", password=PASSWORD):
        return await auth_client.post("/login", data={"username": username, "password": password})

    return _login


@pytest.fixture
def crud_user(db):
    _load_service_app("auth_service")
    from app.crud.user import crud_user

    return crud_user


@pytest.fixture
def auth_crud():
    _load_service_app("auth_service")
    import app.crud.auth as auth_crud

    return auth_crud


@pytest.fixture
def claims(auth_crud):
    import jwt
    from app.config import settings

    def _claims(token: str) -> dict:
        return jwt.decode(token, settings.SECRET_KEY, algorithms=[auth_crud.ALGORITHM])

    return _claims


ADMIN_HEADERS = {"X-User-Id": "1", "X-Username": "admin", "X-Role": "ADMIN"}


def teamlead_headers(team_id: int) -> dict[str, str]:
    return {"X-User-Id": "2", "X-Username": "lead", "X-Role": "TEAMLEAD", "X-Team-Id": str(team_id)}


START = "2026-06-01T10:00:00.000001"
END = "2026-06-01T10:01:30.500000"


@pytest.fixture
def make_team(competition_client):
    async def _make_team(name="Team A", category="close_to_series", **extra):
        response = await competition_client.post("/teams/", headers=ADMIN_HEADERS, json={
            "name": name,
            "category": category,
            "mean_power": 5.0,
            "vehicle_weight": 150.0,
            "rfid_identifier": f"rfid-{name}",
            **extra,
        })
        assert response.status_code == 200, response.text
        return response.json()

    return _make_team


@pytest.fixture
def make_driver(competition_client):
    async def _make_driver(team_id, name="Driver", weight=70.0):
        response = await competition_client.post(
            "/drivers/", headers=ADMIN_HEADERS, json={"name": name, "team_id": team_id, "weight": weight}
        )
        assert response.status_code == 200, response.text
        return response.json()

    return _make_driver


@pytest.fixture
def make_challenge(db):
    async def _make_challenge(name="Skidpad", max_attempts=3):
        challenge = Challenge(name=name, max_attempts=max_attempts)
        db.add(challenge)
        await db.commit()
        return challenge.id

    return _make_challenge


@pytest.fixture
def make_penalty_type(db):
    async def _make_penalty_type(type="Strecke verlassen", amount=10):
        penalty_type = PenaltyType(type=type, amount=amount)
        db.add(penalty_type)
        await db.commit()
        return penalty_type.id

    return _make_penalty_type


@pytest.fixture
def attempt_body():
    def _attempt_body(team_id, driver_id, challenge_id, **extra):
        return {
            "team_id": team_id,
            "driver_id": driver_id,
            "challenge_id": challenge_id,
            "start_time": START,
            "end_time": END,
            "energy_used": 12.5,
            **extra,
        }

    return _attempt_body


@pytest.fixture
def make_attempt(competition_client, attempt_body):
    async def _make_attempt(team_id, driver_id, challenge_id, **extra):
        response = await competition_client.post(
            "/attempts/", headers=ADMIN_HEADERS, json=attempt_body(team_id, driver_id, challenge_id, **extra)
        )
        assert response.status_code == 200, response.text
        return response.json()

    return _make_attempt


@pytest_asyncio.fixture
async def setup(make_team, make_driver, make_challenge):
    team = await make_team()
    driver = await make_driver(team["id"])
    challenge_id = await make_challenge()
    return {"team": team["id"], "driver": driver["id"], "challenge": challenge_id}
