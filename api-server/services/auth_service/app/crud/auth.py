from datetime import datetime, timedelta, timezone
from typing import Any

import bcrypt
import jwt
from app.config import settings

from shared.user_role import UserRole

ALGORITHM = "HS256"

def create_access_token(subject: str | Any, expires_delta: timedelta, role: UserRole, user_id: int) -> str:
    expire = datetime.now(timezone.utc) + expires_delta
    to_encode = {"exp": expire, "sub": str(subject), "role": role.value, "id": user_id}
    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=ALGORITHM) # pyright: ignore[reportAttributeAccessIssue]
    return encoded_jwt

def verify_password(plain_password: str, hashed_password: str) -> bool:
    try:
        return bcrypt.checkpw(plain_password.encode("utf-8"), hashed_password.encode("utf-8"))
    except ValueError:
        return False

def get_password_hash(password: str) -> str:
    salt = bcrypt.gensalt()
    return bcrypt.hashpw(password.encode("utf-8"), salt).decode("utf-8")