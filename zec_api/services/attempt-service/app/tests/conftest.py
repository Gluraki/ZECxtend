import os
import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from datetime import datetime, timedelta

from app.main import app
from app.database.session import Base, get_db
from app.models.attempt import Attempt

# -------------------------------------------------------------------
# DATABASE
# -------------------------------------------------------------------

SQLALCHEMY_DATABASE_URL = "sqlite:///./test.db"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={"check_same_thread": False},
)

TestingSessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine,
)

# -------------------------------------------------------------------
# DB SESSION FIXTURE
# -------------------------------------------------------------------

@pytest.fixture(scope="function")
def db():
    # Drop all tables first to ensure clean state
    Base.metadata.drop_all(bind=engine)
    # Create all tables
    Base.metadata.create_all(bind=engine)
    
    session = TestingSessionLocal()

    try:
        yield session
    finally:
        session.rollback()
        session.close()
        # Optional: clean up after test
        Base.metadata.drop_all(bind=engine)

# -------------------------------------------------------------------
# DATA SEEDING (ONCE PER TEST)
# -------------------------------------------------------------------

@pytest.fixture(scope="function")
def seeded_data(db):
    now = datetime.utcnow()

    attempts = [
        Attempt(
            team_id=1,
            driver_id=1,
            challenge_id=1,
            start_time=now,
            end_time=now + timedelta(seconds=10),
            energy_used=50,
        ),
        Attempt(
            team_id=1,
            driver_id=2,
            challenge_id=1,
            start_time=now,
            end_time=now + timedelta(seconds=8),
            energy_used=40,
        ),
    ]

    db.add_all(attempts)
    db.commit()

    return {
        "attempts": attempts,
    }

# -------------------------------------------------------------------
# FASTAPI CLIENT
# -------------------------------------------------------------------

@pytest.fixture(scope="function")
def client(db, seeded_data):
    def override_get_db():
        try:
            yield db
        finally:
            pass

    app.dependency_overrides[get_db] = override_get_db

    with TestClient(app) as c:
        yield c

    app.dependency_overrides.clear()

# -------------------------------------------------------------------
# OPTIONAL: Add cleanup for test database file
# -------------------------------------------------------------------

@pytest.fixture(scope="session", autouse=True)
def cleanup_test_db():
    """Clean up test database file after all tests run"""
    yield
    # Clean up test.db file after tests
    if os.path.exists("test.db"):
        os.remove("test.db")