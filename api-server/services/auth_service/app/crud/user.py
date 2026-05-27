from app.crud.auth import get_password_hash, verify_password
from app.models.user import User
from app.schemas.user import UserCreate, UserUpdate
from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession

import shared.exceptions as exc
from shared.crud_base import CRUDBase


class CRUDUser(CRUDBase[User, UserCreate, UserUpdate]):
    async def create(self, db: AsyncSession, obj_in: UserCreate) -> User:
        try:
            db_user = User(
                username=obj_in.username,
                password_hash=get_password_hash(obj_in.password),
                team_id=obj_in.team_id,
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
            
    async def get_by_username(self, db: AsyncSession, username: str) -> User:
        result = await db.execute(select(User).where(User.username == username))
        db_user = result.scalar_one_or_none()
        if db_user is None:
            raise exc.EntityDoesNotExistError(f"User with username {username} does not exist")
        return db_user

    async def authenticate_user(self, db: AsyncSession, username: str, password: str) -> User:
        db_user = await self.get_by_username(db=db, username=username)
        if not verify_password(password, db_user.password_hash):
            raise exc.AuthenticationFailed("Incorrect username or password")
        return db_user

crud_user = CRUDUser(User)
