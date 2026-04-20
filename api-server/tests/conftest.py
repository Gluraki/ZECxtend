# ---------------------------------------------------------------------------
# 0. Environment – set ALL env-vars before any app-module is imported
# ---------------------------------------------------------------------------
import os

# Shared
os.environ.setdefault("ENVIRONMENT", "testing")
os.environ.setdefault("PROJECT_NAME", "test")
os.environ.setdefault("POSTGRES_SERVER", "localhost")
os.environ.setdefault("POSTGRES_USER", "test")
os.environ.setdefault("POSTGRES_PASSWORD", "test")
os.environ.setdefault("POSTGRES_DB", "test")

# Inter-service URLs
os.environ.setdefault("TEAM_SERVICE_URL", "http://team-service")
os.environ.setdefault("CHALLENGE_SERVICE_URL", "http://challenge-service")
os.environ.setdefault("SCORE_SERVICE_URL", "http://score-service")
os.environ.setdefault("ATTEMPT_SERVICE_URL", "http://attempt-service")
os.environ.setdefault("AUTH_SERVICE_URL", "http://auth")

# Keycloak (auth-service + user-service)
os.environ.setdefault("KEYCLOAK_URL", "http://keycloak")
os.environ.setdefault("KEYCLOAK_TOKEN_URL", "http://keycloak/token")
os.environ.setdefault("KEYCLOAK_JWKS_URL", "http://keycloak/jwks")
os.environ.setdefault("KEYCLOAK_CLIENT_ID", "admin-client")
os.environ.setdefault("KEYCLOAK_CLIENT_SECRET", "secret")
os.environ.setdefault("KEYCLOAK_ADMIN_CLIENT_ID", "admin-client")
os.environ.setdefault("KEYCLOAK_ADMIN_CLIENT_SECRET", "admin-secret")
os.environ.setdefault("KEYCLOAK_USER_URL", "http://keycloak/users")
os.environ.setdefault("KC_CLIENTS_URL", "http://keycloak/clients")
os.environ.setdefault("KC_ADMIN_CLIENT_ID", "admin-cli")

# ---------------------------------------------------------------------------
# 1. Stdlib / third-party imports
# ---------------------------------------------------------------------------
from datetime import datetime, timedelta, timezone
from unittest import mock as _mock
from unittest.mock import MagicMock, Mock, patch

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

# ---------------------------------------------------------------------------
# 2. Helpers
# ---------------------------------------------------------------------------

def _make_engine(db_filename: str):
    """Return a SQLite engine + session factory for the given filename."""
    url = f"sqlite:///./{db_filename}"
    engine = create_engine(url, connect_args={"check_same_thread": False})
    Session = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    return engine, Session


def _db_fixture(engine, Session, Base):
    """
    Generic per-function DB fixture factory.
    Creates all tables before the test and drops them after.
    """
    Base.metadata.create_all(bind=engine)
    session = Session()
    try:
        yield session
    finally:
        session.rollback()
        session.close()
        Base.metadata.drop_all(bind=engine)


# ===========================================================================
# ── ATTEMPT SERVICE ─────────────────────────────────────────────────────────
# ===========================================================================

@pytest.fixture(scope="function")
def attempt_db():
    from app.database.session import Base as AttemptBase
    engine, Session = _make_engine("test_attempt.db")
    yield from _db_fixture(engine, Session, AttemptBase)


@pytest.fixture(scope="function")
def seeded_attempts(attempt_db):
    from app.models.attempt import Attempt

    base = datetime.now(timezone.utc)
    attempts = [
        Attempt(
            team_id=1,
            driver_id=1,
            challenge_id=1,
            start_time=base,
            end_time=base + timedelta(seconds=10),
            energy_used=50,
            is_valid=True,
        ),
        Attempt(
            team_id=1,
            driver_id=2,
            challenge_id=1,
            start_time=base + timedelta(seconds=1),
            end_time=base + timedelta(seconds=10),
            energy_used=40,
            is_valid=True,
        ),
    ]
    attempt_db.add_all(attempts)
    attempt_db.commit()
    return attempts


@pytest.fixture(autouse=True)
def mock_attempt_requests():
    """
    Auto-used mock for the attempt-service's outgoing HTTP calls.
    Patches both app.crud.attempt.requests and app.crud.export.requests.
    """
    with patch("app.crud.attempt.requests") as mock_att, \
         patch("app.crud.export.requests") as mock_exp:

        def _get(url, *args, **kwargs):
            resp = Mock()
            resp.status_code = 200
            if "/api/challenges/" in url:
                resp.json.return_value = {"id": 1, "max_attempts": 3, "name": "Speed Run"}
            elif "/api/teams/by-ids/" in url:
                resp.json.return_value = [{"id": 1, "name": "Team Alpha", "category": "A"}]
            elif "/api/teams/" in url:
                resp.json.return_value = {"id": 1}
            elif "/api/drivers/by-ids/" in url:
                resp.json.return_value = [
                    {"id": 1, "name": "Alice", "weight": 60},
                    {"id": 2, "name": "Bob", "weight": 75},
                ]
            elif "/api/drivers/" in url:
                resp.json.return_value = {"id": 1}
            else:
                resp.json.return_value = {}
            return resp

        def _ok(*args, **kwargs):
            resp = Mock()
            resp.status_code = 200
            return resp

        for m in (mock_att, mock_exp):
            m.get.side_effect = _get
            m.post.side_effect = _ok
            m.delete.side_effect = _ok

        yield mock_att, mock_exp


@pytest.fixture(scope="function")
def attempt_client(attempt_db, seeded_attempts, mock_attempt_requests):
    from app.database.dependency import get_db
    from app.main import app as attempt_app

    def _override():
        yield attempt_db

    attempt_app.dependency_overrides[get_db] = _override
    with TestClient(attempt_app) as c:
        yield c
    attempt_app.dependency_overrides.clear()


# ===========================================================================
# ── AUTH SERVICE ─────────────────────────────────────────────────────────────
# ===========================================================================

@pytest.fixture(scope="function")
def auth_client():
    from app.main import app as auth_app

    with TestClient(auth_app) as c:
        yield c


@pytest.fixture
def mocker(monkeypatch):
    """Lightweight mocker compatible with pytest-mock's API surface."""

    class _Mocker:
        Mock = _mock.Mock

        def __init__(self):
            self._patchers = []

        def patch(self, target, **kwargs):
            patcher = _mock.patch(target, **kwargs)
            started = patcher.start()
            self._patchers.append(patcher)
            return started

        def stopall(self):
            for p in self._patchers:
                p.stop()
            self._patchers.clear()

    m = _Mocker()
    yield m
    m.stopall()


@pytest.fixture
def mock_jwks(mocker):
    jwks = {
        "keys": [
            {"kty": "RSA", "kid": "test-kid", "use": "sig", "n": "abc", "e": "AQAB"}
        ]
    }
    mocker.patch("app.crud.auth.get_cached_jwks", return_value=jwks)
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
            "resource_access": {"admin-client": {"roles": ["admin"]}},
        },
    )


def _auth_override(user_dict):
    """Return a FastAPI dependency override that injects *user_dict*."""
    from app.crud.auth import get_current_user  # noqa: PLC0415

    def _dep():
        return user_dict

    return get_current_user, _dep


@pytest.fixture
def override_admin():
    from app.main import app as auth_app

    dep, impl = _auth_override(
        {"sub": "1", "email": "admin@test.com", "username": "admin", "roles": ["ADMIN"]}
    )
    auth_app.dependency_overrides[dep] = impl
    yield
    auth_app.dependency_overrides.clear()


@pytest.fixture
def override_teamlead():
    from app.main import app as auth_app

    dep, impl = _auth_override(
        {"sub": "2", "email": "teamlead@test.com", "username": "teamlead", "roles": ["TEAM_LEAD"]}
    )
    auth_app.dependency_overrides[dep] = impl
    yield
    auth_app.dependency_overrides.clear()


@pytest.fixture
def override_viewer():
    from app.main import app as auth_app

    dep, impl = _auth_override(
        {"sub": "3", "email": "viewer@test.com", "username": "viewer", "roles": ["VIEWER"]}
    )
    auth_app.dependency_overrides[dep] = impl
    yield
    auth_app.dependency_overrides.clear()


# ===========================================================================
# ── CHALLENGE SERVICE ────────────────────────────────────────────────────────
# ===========================================================================

@pytest.fixture(scope="function")
def challenge_db():
    from app.database.session import Base as ChallengeBase
    engine, Session = _make_engine("test_challenge.db")
    yield from _db_fixture(engine, Session, ChallengeBase)


@pytest.fixture(scope="function")
def seeded_challenges(challenge_db):
    from app.models.challenge import Challenge

    challenges = [
        Challenge(name="challenge-one", max_attempts=3),
        Challenge(name="challenge-two", max_attempts=5),
    ]
    challenge_db.add_all(challenges)
    challenge_db.commit()
    return challenges


@pytest.fixture(scope="function")
def challenge_client(challenge_db, seeded_challenges):
    from app.database.dependency import get_db
    from app.main import app as challenge_app

    def _override():
        yield challenge_db

    challenge_app.dependency_overrides[get_db] = _override
    with TestClient(challenge_app) as c:
        yield c
    challenge_app.dependency_overrides.clear()


# ===========================================================================
# ── SCORE SERVICE ────────────────────────────────────────────────────────────
# ===========================================================================

@pytest.fixture(scope="function")
def score_db():
    from app.database.session import Base as ScoreBase
    engine, Session = _make_engine("test_score.db")
    yield from _db_fixture(engine, Session, ScoreBase)


@pytest.fixture(scope="function")
def score_override_get_db(score_db):
    def _override():
        yield score_db

    return _override


@pytest.fixture(scope="function")
def seeded_penalty_types(score_db):
    from app.models.penalty_type import PenaltyType

    items = [
        PenaltyType(id=1, type="Cone Hit", amount=2),
        PenaltyType(id=2, type="Off Course", amount=5),
        PenaltyType(id=3, type="Wrong Gate", amount=3),
        PenaltyType(id=4, type="DNF", amount=999),
    ]
    score_db.add_all(items)
    score_db.commit()
    return items


@pytest.fixture(scope="function")
def seeded_penalties(score_db, seeded_penalty_types):
    from app.models.penalty import Penalty

    items = [
        Penalty(id=1, attempt_id=1, penalty_type_id=1, count=2),
        Penalty(id=2, attempt_id=1, penalty_type_id=2, count=1),
        Penalty(id=3, attempt_id=2, penalty_type_id=1, count=1),
        Penalty(id=4, attempt_id=3, penalty_type_id=3, count=1),
    ]
    score_db.add_all(items)
    score_db.commit()
    return items


@pytest.fixture(scope="function")
def seeded_scores(score_db):
    from app.models.score import Score

    base = datetime.now(timezone.utc)
    items = [
        Score(id=1, attempt_id=1, challenge_id=1, value=95.5, created_at=base),
        Score(id=2, attempt_id=2, challenge_id=1, value=88.3, created_at=base),
        Score(id=3, attempt_id=3, challenge_id=1, value=92.1, created_at=base),
        Score(id=4, attempt_id=4, challenge_id=1, value=85.7, created_at=base),
        Score(id=5, attempt_id=5, challenge_id=1, value=78.9, created_at=base),
        Score(id=6, attempt_id=6, challenge_id=2, value=82.3, created_at=base),
    ]
    score_db.add_all(items)
    score_db.commit()
    return items


@pytest.fixture(autouse=True)
def mock_penalty_requests_autouse():
    """Auto-used: keeps penalty CRUD from making real HTTP calls."""
    with patch("app.crud.penalty.requests.get") as mock_get:
        resp = MagicMock()
        resp.status_code = 200
        mock_get.return_value = resp
        yield mock_get


@pytest.fixture(scope="function")
def mock_score_requests():
    with patch("app.crud.score.requests") as m:
        yield m


@pytest.fixture(scope="function")
def mock_leaderboard_requests():
    with patch("app.crud.leaderboard.requests") as m:
        yield m


@pytest.fixture(scope="function")
def mock_penalty_requests():
    with patch("app.crud.penalty.requests") as m:
        yield m


@pytest.fixture(scope="function")
def score_client(
    score_db,
    score_override_get_db,
    seeded_penalty_types,
    seeded_penalties,
    seeded_scores,
    mock_score_requests,
):
    from app.database.dependency import get_db
    from app.main import app as score_app

    score_app.dependency_overrides[get_db] = score_override_get_db
    with TestClient(score_app) as c:
        yield c
    score_app.dependency_overrides.clear()


@pytest.fixture(scope="function")
def score_minimal_client(score_db, score_override_get_db, mock_score_requests):
    from app.database.dependency import get_db
    from app.main import app as score_app

    score_app.dependency_overrides[get_db] = score_override_get_db
    with TestClient(score_app) as c:
        yield c
    score_app.dependency_overrides.clear()


# ===========================================================================
# ── TEAM SERVICE ─────────────────────────────────────────────────────────────
# ===========================================================================

@pytest.fixture(scope="function")
def team_db():
    from app.database.session import Base as TeamBase
    engine, Session = _make_engine("test_team.db")
    yield from _db_fixture(engine, Session, TeamBase)


@pytest.fixture(scope="function")
def seeded_team_data(team_db):
    from app.models.team import Team, team_category
    from app.models.driver import Driver

    teams = [
        Team(
            category=team_category.close_to_series,
            name="Team A",
            vehicle_weight=300,
            mean_power=80,
            rfid_identifier="RFID_A",
        ),
        Team(
            category=team_category.advanced_class,
            name="Team B",
            vehicle_weight=320,
            mean_power=75,
            rfid_identifier="RFID_B",
        ),
    ]
    team_db.add_all(teams)
    team_db.commit()

    drivers = [
        Driver(name="Driver 1", weight=70, team_id=teams[0].id),
        Driver(name="Driver 2", weight=75, team_id=teams[1].id),
    ]
    team_db.add_all(drivers)
    team_db.commit()

    return {"teams": teams, "drivers": drivers}


@pytest.fixture(scope="function")
def team_client(team_db, seeded_team_data):
    from app.database.dependency import get_db
    from app.main import app as team_app

    def _override():
        yield team_db

    team_app.dependency_overrides[get_db] = _override
    with TestClient(team_app) as c:
        yield c
    team_app.dependency_overrides.clear()


@pytest.fixture
def mock_attempt_service_no_attempts():
    """Attempt service returns an empty list (no attempts recorded)."""
    with patch("requests.get") as mock_get:
        resp = MagicMock()
        resp.json.return_value = []
        mock_get.return_value = resp
        yield mock_get


@pytest.fixture
def mock_attempt_service_with_attempts():
    """Attempt service returns one sample attempt."""
    with patch("requests.get") as mock_get:
        resp = MagicMock()
        resp.json.return_value = [
            {
                "id": 1,
                "team_id": 1,
                "driver_id": 1,
                "challenge_id": 1,
                "is_valid": True,
                "start_time": "2024-01-01T10:00:00.000000",
                "end_time": "2024-01-01T10:05:00.000000",
                "energy_used": 50.5,
                "created_at": "2024-01-01T10:00:00.000000",
            }
        ]
        mock_get.return_value = resp
        yield mock_get


@pytest.fixture
def mock_attempt_service_custom(request):
    """Parametrize via @pytest.mark.parametrize or request.param."""
    with patch("requests.get") as mock_get:
        resp = MagicMock()
        resp.json.return_value = getattr(request, "param", [])
        mock_get.return_value = resp
        yield mock_get


@pytest.fixture
def mock_request():
    req = MagicMock()
    req.headers.get.return_value = None
    return req


# ===========================================================================
# ── USER SERVICE ─────────────────────────────────────────────────────────────
# ===========================================================================

@pytest.fixture(scope="function")
def user_db():
    from app.database.session import Base as UserBase
    engine, Session = _make_engine("test_user.db")
    yield from _db_fixture(engine, Session, UserBase)


@pytest.fixture(scope="function")
def seeded_user(user_db):
    from app.models.user import User

    user = User(username="testuser", kc_id="kc-123")
    user_db.add(user)
    user_db.commit()
    user_db.refresh(user)
    return user


@pytest.fixture(autouse=True)
def mock_admin_token():
    with patch("app.crud.user.get_admin_token", return_value="admin-token"):
        yield


@pytest.fixture(autouse=True)
def mock_user_requests():
    """Auto-used: mocks all outgoing HTTP calls made by user CRUD."""
    with patch("app.crud.user.requests") as mock_req:

        def _get(url, *args, **kwargs):
            if "/users/" in url and "username=" not in url:
                uid = url.rsplit("/", 1)[-1]
                uname = (
                    "testuser" if uid == "kc-123"
                    else ("admin" if uid == "kc-admin" else uid)
                )
                return MagicMock(status_code=200, json=lambda: {"id": uid, "username": uname})
            if "username=admin" in url:
                return MagicMock(
                    status_code=200,
                    json=lambda: [{"id": "kc-admin", "username": "admin"}],
                )
            if "username=newuser" in url or "username=apiuser" in url:
                extracted = url.split("username=")[-1]
                return MagicMock(
                    status_code=200,
                    json=lambda: [{"id": "kc-12345", "username": extracted}],
                )
            if "username=testuser" in url:
                return MagicMock(
                    status_code=200,
                    json=lambda: [{"id": "kc-123", "username": "testuser"}],
                )
            if "clients?clientId" in url:
                return MagicMock(status_code=200, json=lambda: [{"id": "client-uuid"}])
            if "/clients/" in url and "/roles/" in url:
                role = url.rsplit("/", 1)[-1]
                return MagicMock(
                    status_code=200,
                    json=lambda: {"id": f"role-{role}", "name": role},
                )
            return MagicMock(status_code=200, json=lambda: [])

        def _post(url, *args, **kwargs):
            rv = getattr(mock_req.post, "return_value", None)
            if rv is not None and getattr(rv, "status_code", None) in (401, 409, 500):
                return rv
            if "/role-mappings/clients/" in url:
                return MagicMock(status_code=204)
            return MagicMock(status_code=201)

        mock_req.get.side_effect = _get
        mock_req.post.side_effect = _post
        mock_req.put.return_value = MagicMock(status_code=204)
        mock_req.delete.return_value = MagicMock(status_code=204)
        yield mock_req


@pytest.fixture(scope="function")
def user_client(user_db, seeded_user):
    from app.database.dependency import get_db
    from app.main import app as user_app

    def _override():
        yield user_db

    user_app.dependency_overrides[get_db] = _override
    with TestClient(user_app) as c:
        yield c
    user_app.dependency_overrides.clear()
