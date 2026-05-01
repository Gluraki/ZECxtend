from collections.abc import AsyncGenerator
from typing import Annotated

from fastapi import Depends
from sqlalchemy import Column, Integer
from sqlalchemy.ext.asyncio import (
    AsyncSession,
    async_sessionmaker,
    create_async_engine,
)
from sqlalchemy.orm import DeclarativeBase

from shared.config import settings

engine = create_async_engine(
    settings.SQLALCHEMY_DATABASE_URI,
    pool_pre_ping=True,
    pool_size=10,
    max_overflow=20,
    pool_timeout=30,
    pool_recycle=1800,
    echo=False,
)

AsyncSessionLocal = async_sessionmaker(
    bind=engine,
    expire_on_commit=False,
    autoflush=False,
)

class Base(DeclarativeBase):
    __abstract__ = True
    id = Column(Integer, autoincrement=True, primary_key=True, index=True)

async def get_db() -> AsyncGenerator[AsyncSession, None]:
    async with AsyncSessionLocal() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise

SessionDep = Annotated[AsyncSession, Depends(get_db)]

""""
def get_current_user(payload: dict = Depends(decode_keycloak_token)):
    roles = extract_roles_from_payload(payload)
    if not roles:
        raise exception.InsufficientPermissions()
    return {
        "sub": payload.get("sub"),
        "email": payload.get("email"),
        "username": payload.get("preferred_username"),
        "roles": roles,
        "token_payload": payload
    }
ROLE_HIERARCHY = {
    UserRole.VIEWER: {
        UserRole.VIEWER,
        UserRole.TEAM_LEAD,
        UserRole.ADMIN,
    },
    UserRole.TEAM_LEAD: {
        UserRole.TEAM_LEAD,
        UserRole.ADMIN,
    },
    UserRole.ADMIN: {
        UserRole.ADMIN,
    },
}

def require_role(required_role: UserRole):
    def role_checker(user: CurrentUser):
        user_roles = {UserRole(role) for role in user["roles"]}
        allowed_roles = ROLE_HIERARCHY[required_role]
        if user_roles.isdisjoint(allowed_roles):
            raise exception.InsufficientPermissions
        return user
    return role_checker

AdminUser = Annotated[dict, Depends(require_role(UserRole.ADMIN))]
TeamLeadUser = Annotated[dict, Depends(require_role(UserRole.TEAM_LEAD))]
ViewerUser = Annotated[dict, Depends(require_role(UserRole.VIEWER))]
"""