from datetime import datetime, timedelta, timezone

import jwt
import pytest

import shared.exceptions as exc
from shared.user_role import UserRole

MINUTES_15 = timedelta(minutes=15)


@pytest.fixture
def access_token(auth_crud):
    def _access_token(**overrides):
        kwargs = {"subject": "alice", "expires_delta": MINUTES_15, "role": UserRole.USER, "user_id": 1, **overrides}
        return auth_crud.create_access_token(**kwargs)

    return _access_token


@pytest.fixture
def refresh_token(auth_crud):
    def _refresh_token(**overrides):
        kwargs = {"subject": "alice", "user_id": 1, "token_version": 0, "expires_delta": MINUTES_15, **overrides}
        return auth_crud.create_refresh_token(**kwargs)

    return _refresh_token


def signed(auth_crud, payload: dict, key: str | None = None, algorithm: str | None = None) -> str:
    from app.config import settings

    return jwt.encode(payload, key or settings.SECRET_KEY, algorithm=algorithm or auth_crud.ALGORITHM)


def test_access_token_claims(access_token, claims):
    payload = claims(access_token(role=UserRole.TEAMLEAD, user_id=5, team_id=2))

    assert payload["typ"] == "access"
    assert payload["sub"] == "alice"
    assert payload["id"] == 5
    assert payload["role"] == "TEAMLEAD"
    assert payload["team_id"] == 2
    assert "pwd_change" not in payload


def test_access_token_omits_team_id_when_none(access_token, claims):
    assert "team_id" not in claims(access_token())


def test_access_token_pwd_change_only_when_set(access_token, claims):
    assert claims(access_token(must_change_password=True))["pwd_change"] is True
    assert "pwd_change" not in claims(access_token(must_change_password=False))


def test_access_token_expiry_matches_delta(access_token, claims):
    payload = claims(access_token())

    assert payload["exp"] - payload["iat"] == MINUTES_15.total_seconds()
    assert abs(payload["iat"] - datetime.now(timezone.utc).timestamp()) < 5


def test_refresh_token_claims(refresh_token, claims):
    payload = claims(refresh_token(user_id=5, token_version=3))

    assert payload["typ"] == "refresh"
    assert payload["sub"] == "alice"
    assert payload["id"] == 5
    assert payload["ver"] == 3
    assert "role" not in payload


def test_decode_valid_tokens(auth_crud, access_token, refresh_token):
    assert auth_crud.decode_token(access_token(), expected_type="access")["typ"] == "access"
    assert auth_crud.decode_token(refresh_token(), expected_type="refresh")["typ"] == "refresh"


def test_decode_rejects_wrong_type(auth_crud, access_token, refresh_token):
    with pytest.raises(exc.InvalidTokenError):
        auth_crud.decode_token(access_token(), expected_type="refresh")
    with pytest.raises(exc.InvalidTokenError):
        auth_crud.decode_token(refresh_token(), expected_type="access")


def test_decode_rejects_expired(auth_crud, refresh_token):
    with pytest.raises(exc.InvalidTokenError):
        auth_crud.decode_token(refresh_token(expires_delta=timedelta(seconds=-1)), expected_type="refresh")


def test_decode_rejects_wrong_signature(auth_crud, claims, refresh_token):
    forged = signed(auth_crud, claims(refresh_token()), key="some-other-secret-that-is-at-least-32-bytes")

    with pytest.raises(exc.InvalidTokenError):
        auth_crud.decode_token(forged, expected_type="refresh")


@pytest.mark.filterwarnings("ignore:The HMAC key is")
def test_decode_rejects_other_algorithm(auth_crud, claims, refresh_token):
    from app.config import settings

    other_alg = signed(auth_crud, claims(refresh_token()), key=settings.SECRET_KEY, algorithm="HS512")

    with pytest.raises(exc.InvalidTokenError):
        auth_crud.decode_token(other_alg, expected_type="refresh")


@pytest.mark.parametrize("missing", ["exp", "iat", "sub", "id", "typ"])
def test_decode_rejects_missing_required_claim(auth_crud, claims, refresh_token, missing):
    payload = claims(refresh_token())
    del payload[missing]

    with pytest.raises(exc.InvalidTokenError):
        auth_crud.decode_token(signed(auth_crud, payload), expected_type="refresh")


@pytest.mark.parametrize("garbage", ["", "not-a-jwt", "a.b.c"])
def test_decode_rejects_garbage(auth_crud, garbage):
    with pytest.raises(exc.InvalidTokenError):
        auth_crud.decode_token(garbage, expected_type="access")


def test_password_hash_is_salted_and_verifiable(auth_crud, password):
    first = auth_crud.get_password_hash(password)
    second = auth_crud.get_password_hash(password)

    assert first != second
    assert password not in first
    assert auth_crud.verify_password(password, first)
    assert auth_crud.verify_password(password, second)


def test_verify_password_wrong_password(auth_crud, password):
    assert auth_crud.verify_password("wrong-password", auth_crud.get_password_hash(password)) is False


def test_verify_password_malformed_hash_is_false(auth_crud, password):
    assert auth_crud.verify_password(password, "not-a-bcrypt-hash") is False


def test_burn_password_check_returns_nothing(auth_crud, password):
    assert auth_crud.burn_password_check(password) is None
