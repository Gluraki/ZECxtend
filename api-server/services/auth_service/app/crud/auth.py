from datetime import timedelta
from typing import Any, Literal

import bcrypt
import jwt
from app.config import settings

import shared.exceptions as exc
from shared.database import utcnow
from shared.user_role import UserRole

ALGORITHM = "HS256"
BCRYPT_MAX_PASSWORD_BYTES = 72

TokenType = Literal["access", "refresh"]

_DUMMY_PASSWORD_HASH = bcrypt.hashpw(b"dummy-password", bcrypt.gensalt()).decode("utf-8")


def _encode(claims: dict[str, Any], token_type: TokenType, expires_delta: timedelta) -> str:
    now = utcnow()
    to_encode = {**claims, "typ": token_type, "iat": now, "exp": now + expires_delta}
    return jwt.encode(to_encode, settings.SECRET_KEY, algorithm=ALGORITHM)


def create_access_token(
    subject: str | Any,
    expires_delta: timedelta,
    role: UserRole,
    user_id: int,
    team_id: int | None = None,
    must_change_password: bool = False,
) -> str:
    to_encode: dict[str, Any] = {"sub": str(subject), "role": role.value, "id": user_id}

    if team_id is not None:
        to_encode["team_id"] = team_id
    if must_change_password:
        to_encode["pwd_change"] = True

    return _encode(to_encode, "access", expires_delta)


def create_refresh_token(subject: str | Any, user_id: int, token_version: int, expires_delta: timedelta) -> str:
    return _encode({"sub": str(subject), "id": user_id, "ver": token_version}, "refresh", expires_delta)


def decode_token(token: str, expected_type: TokenType) -> dict[str, Any]:
    try:
        payload = jwt.decode(
            token,
            settings.SECRET_KEY,
            algorithms=[ALGORITHM],
            options={"require": ["exp", "iat", "sub", "id", "typ"]},
        )
    except jwt.PyJWTError:
        raise exc.InvalidTokenError("Invalid or expired token")
    if payload["typ"] != expected_type:
        raise exc.InvalidTokenError("Invalid or expired token")
    return payload


def verify_password(plain_password: str, hashed_password: str) -> bool:
    try:
        return bcrypt.checkpw(plain_password.encode("utf-8"), hashed_password.encode("utf-8"))
    except ValueError:
        return False


def burn_password_check(plain_password: str) -> None:
    verify_password(plain_password, _DUMMY_PASSWORD_HASH)


def get_password_hash(password: str) -> str:
    salt = bcrypt.gensalt()
    return bcrypt.hashpw(password.encode("utf-8"), salt).decode("utf-8")
