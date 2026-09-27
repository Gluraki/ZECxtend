from app.crud.auth import burn_password_check, get_password_hash, verify_password
from app.models.user import User
from app.schemas.user import UserCreate, UserUpdate
from sqlalchemy import func, select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession

import shared.exceptions as exc
from shared.crud_base import CRUDBase
from shared.user_role import UserRole

TOKEN_RELEVANT_FIELDS = {"password", "role", "team_id"}
NON_NULLABLE_FIELDS = {"username", "password", "role"}


def _check_teamlead_has_team(role: UserRole, team_id: int | None) -> None:
    if role == UserRole.TEAMLEAD and team_id is None:
        raise exc.InvalidOperationError("A TEAMLEAD must be assigned to a team")


class CRUDUser(CRUDBase[User, UserCreate, UserUpdate]):
    async def create(self, db: AsyncSession, obj_in: UserCreate) -> User:
        _check_teamlead_has_team(obj_in.role, obj_in.team_id)
        try:
            db_user = User(
                username=obj_in.username,
                password_hash=get_password_hash(obj_in.password),
                team_id=obj_in.team_id,
                role=obj_in.role,
                must_change_password=obj_in.must_change_password,
            )
            db.add(db_user)
            await db.commit()
            await db.refresh(db_user)
            return db_user
        except IntegrityError as e:
            await db.rollback()
            if "unique" in str(e.orig).lower():
                raise exc.EntityAlreadyExistsError("User with this username already exists")
            if "foreign" in str(e.orig).lower():
                raise exc.ForeignKeyViolationError("Team with the specified id does not exist")
            else:
                raise exc.DatabaseError("Database error occurred while creating User")

    async def update(self, db: AsyncSession, id: int, obj_in: UserUpdate) -> User:
        db_user = await self.get(db, id)
        data = obj_in.model_dump(exclude_unset=True)

        for field in NON_NULLABLE_FIELDS:
            if field in data and data[field] is None:
                raise exc.InvalidOperationError(f"{field} cannot be null")

        _check_teamlead_has_team(data.get("role", db_user.role), data.get("team_id", db_user.team_id))

        if db_user.role == UserRole.ADMIN and data.get("role", UserRole.ADMIN) != UserRole.ADMIN:
            await self._ensure_not_last_admin(db)

        if TOKEN_RELEVANT_FIELDS & data.keys():
            db_user.token_version += 1

        if "password" in data:
            db_user.password_hash = get_password_hash(data.pop("password"))
            db_user.must_change_password = False
        for field, value in data.items():
            setattr(db_user, field, value)

        try:
            await db.commit()
            await db.refresh(db_user)
        except IntegrityError as e:
            await db.rollback()
            if "unique" in str(e.orig).lower():
                raise exc.EntityAlreadyExistsError("User with this username already exists")
            raise exc.DatabaseError("Database error occurred while updating User")
        return db_user

    async def delete(self, db: AsyncSession, id: int) -> User:
        db_user = await self.get(db, id)
        if db_user.role == UserRole.ADMIN:
            await self._ensure_not_last_admin(db)
        return await super().delete(db=db, id=id)

    async def _ensure_not_last_admin(self, db: AsyncSession) -> None:
        admin_count = await db.scalar(select(func.count()).select_from(User).where(User.role == UserRole.ADMIN))
        if (admin_count or 0) <= 1:
            raise exc.InvalidOperationError("Cannot remove the last admin")

    async def authenticate_user(self, db: AsyncSession, username: str, password: str) -> User:
        result = await db.execute(select(User).where(User.username == username))
        db_user = result.scalar_one_or_none()
        if db_user is None:
            burn_password_check(password)
            raise exc.AuthenticationFailed("Incorrect username or password")
        if not verify_password(password, db_user.password_hash):
            raise exc.AuthenticationFailed("Incorrect username or password")
        return db_user

crud_user = CRUDUser(User)
