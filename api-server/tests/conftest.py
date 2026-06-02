import importlib
import os
import sys
from pathlib import Path

import pytest
import pytest_asyncio
from fastapi import FastAPI
from httpx import ASGITransport, AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine

ROOT = Path(__file__).resolve().parents[1]
TEST_DATABASE_URL = "sqlite+aiosqlite:///./test.db"
_SERVICE_APPS: dict[str, FastAPI] = {}

if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))

os.environ.setdefault("DATABASE_URL", TEST_DATABASE_URL)


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
    _load_service_app("attempt_service")
    _load_service_app("auth_service")
    _load_service_app("roster_service")


@pytest_asyncio.fixture(scope="function")
async def db_engine(import_all_models):
    from shared.database import Base

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
    app = _load_service_app("attempt_service")
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


@pytest_asyncio.fixture(scope="function")
async def roster_client(db: AsyncSession):
    app = _load_service_app("roster_service")
    from shared.database import get_db

    async def override_get_db():
        yield db

    app.dependency_overrides[get_db] = override_get_db
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        yield ac
    app.dependency_overrides.clear()
