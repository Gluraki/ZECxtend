import os
import sys
from pathlib import Path

import pytest_asyncio
from httpx import ASGITransport, AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine

ROOT = Path(__file__).resolve().parents[1]
TEST_DATABASE_URL = "sqlite+aiosqlite:///./test.db"

if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))

os.environ.setdefault("DATABASE_URL", TEST_DATABASE_URL)

from services.attempt_service.app.models.attempt import Attempt  # noqa: E402, F401
from services.attempt_service.app.models.penalty import Penalty  # noqa: E402, F401
from services.attempt_service.app.models.penalty_type import PenaltyType  # noqa: E402, F401
from services.attempt_service.app.models.score import Score  # noqa: E402, F401
from services.auth_service.app.models.user import User  # noqa: E402, F401
from services.challenge_service.app.models.challenge import Challenge  # noqa: E402, F401
from services.roster_service.app.models.driver import Driver  # noqa: E402, F401
from services.roster_service.app.models.team import Team  # noqa: E402, F401
from shared.database import Base, get_db  # noqa: E402
from shared.user_role import UserRole  # noqa: E402, F401


@pytest_asyncio.fixture(scope="function")
async def db_engine():
    engine = create_async_engine(TEST_DATABASE_URL, connect_args={"check_same_thread": False})
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
async def attempt_client(db: AsyncSession):
    from services.attempt_service.app.main import app
    async def override_get_db():
        yield db
    app.dependency_overrides[get_db] = override_get_db
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        yield ac
    app.dependency_overrides.clear()


@pytest_asyncio.fixture(scope="function")
async def auth_client(db: AsyncSession):
    from services.auth_service.app.main import app
    async def override_get_db():
        yield db
    app.dependency_overrides[get_db] = override_get_db
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        yield ac
    app.dependency_overrides.clear()


@pytest_asyncio.fixture(scope="function")
async def challenge_client(db: AsyncSession):
    from services.challenge_service.app.main import app
    async def override_get_db():
        yield db
    app.dependency_overrides[get_db] = override_get_db
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        yield ac
    app.dependency_overrides.clear()


@pytest_asyncio.fixture(scope="function")
async def roster_client(db: AsyncSession):
    from services.roster_service.app.main import app
    async def override_get_db():
        yield db
    app.dependency_overrides[get_db] = override_get_db
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        yield ac
    app.dependency_overrides.clear()
