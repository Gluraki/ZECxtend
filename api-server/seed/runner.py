import logging
import os
from pathlib import Path

import bcrypt
from pydantic import BaseModel, Field, TypeAdapter, ValidationError, field_validator
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from shared.database import AsyncSessionLocal
from shared.models import Challenge, PenaltyType, ScoringType, User
from shared.user_role import UserRole

DATA_DIR = Path(__file__).parent
log = logging.getLogger("seed")


class ChallengeSeed(BaseModel):
    name: str
    max_attempts: int | None = Field(None, ge=1)
    scoring_type: ScoringType


class PenaltyTypeSeed(BaseModel):
    type: str = Field(..., max_length=50)
    amount: int = Field(..., ge=0)


class AdminSeed(BaseModel):
    username: str = Field(..., min_length=3, max_length=64)
    password: str = Field(..., min_length=10)

    @field_validator("password")
    @classmethod
    def password_fits_bcrypt(cls, password: str) -> str:
        if len(password.encode("utf-8")) > 72:
            raise ValueError("password must be at most 72 bytes")
        return password


def load[T: BaseModel](filename: str, model: type[T]) -> list[T]:
    return TypeAdapter(list[model]).validate_json((DATA_DIR / filename).read_bytes())


async def seed_challenges(db: AsyncSession) -> int:
    added = 0
    for item in load("challenges.json", ChallengeSeed):
        if await db.scalar(select(Challenge.id).where(Challenge.name == item.name)) is None:
            db.add(Challenge(**item.model_dump()))
            added += 1
    return added


async def seed_penalty_types(db: AsyncSession) -> int:
    added = 0
    for item in load("penalty_types.json", PenaltyTypeSeed):
        if await db.scalar(select(PenaltyType.id).where(PenaltyType.type == item.type)) is None:
            db.add(PenaltyType(**item.model_dump()))
            added += 1
    return added


async def seed_admin(db: AsyncSession, username: str | None, password: str | None) -> bool:
    if await db.scalar(select(User.id).where(User.role == UserRole.ADMIN).limit(1)) is not None:
        return False
    if not username or not password:
        log.warning("No admin exists and ADMIN_USERNAME / ADMIN_PASSWORD are not set, no admin created")
        return False
    try:
        admin = AdminSeed(username=username, password=password)
    except ValidationError as e:
        log.warning("ADMIN_USERNAME / ADMIN_PASSWORD invalid, no admin created: %s", e.errors()[0]["msg"])
        return False
    if await db.scalar(select(User.id).where(User.username == admin.username)) is not None:
        log.warning("User %r exists but is not an admin, no admin created", admin.username)
        return False

    password_hash = bcrypt.hashpw(admin.password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")
    db.add(User(username=admin.username, password_hash=password_hash, role=UserRole.ADMIN, must_change_password=True))
    return True


async def seed_all(db: AsyncSession, admin_username: str | None, admin_password: str | None) -> None:
    challenges = await seed_challenges(db)
    penalty_types = await seed_penalty_types(db)
    admin = await seed_admin(db, admin_username, admin_password)
    await db.commit()
    log.info(
        "added %d challenges, %d penalty types, admin %s",
        challenges, penalty_types, "created" if admin else "not created",
    )


async def main() -> None:
    async with AsyncSessionLocal() as db:
        await seed_all(db, os.environ.get("ADMIN_USERNAME"), os.environ.get("ADMIN_PASSWORD"))
