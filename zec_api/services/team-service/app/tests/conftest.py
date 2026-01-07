import os
import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.main import app
from app.database.session import Base
from app.database.dependency import get_db
from app.models.driver import Driver
from app.models.team import Team

os.environ.setdefault("PROJECT_NAME", "test")
SQLALCHEMY_DATABASE_URL = "sqlite:///./test_team.db"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={"check_same_thread": False},
)

TestingSessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine,
)

@pytest.fixture(scope="function")
def db():
    Base.metadata.create_all(bind=engine)
    session = TestingSessionLocal()
    try:
        yield session
    finally:
        session.rollback()
        session.close()
        Base.metadata.drop_all(bind=engine)


@pytest.fixture(scope="function")
def seeded_data(db):
    teams = [
        Team(name="Team A", vehicle_weight=300, mean_power=80),
        Team(name="Team B", vehicle_weight=320, mean_power=75),
    ]
    db.add_all(teams)
    db.commit()

    drivers = [
        Driver(name="Driver 1", weight=70),
        Driver(name="Driver 2", weight=75),
    ]
    db.add_all(drivers)
    db.commit()

    return {
        "teams": teams,
        "drivers": drivers,
    }

@pytest.fixture(scope="function")
def client(db, seeded_data):
    def override_get_db():
        yield db

    app.dependency_overrides[get_db] = override_get_db

    with TestClient(app) as c:
        yield c

    app.dependency_overrides.clear()
