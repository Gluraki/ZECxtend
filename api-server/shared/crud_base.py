from typing import Generic, Type, TypeVar

from pydantic import BaseModel
from sqlalchemy import Column, Integer, select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession

from shared import exceptions as exc
from shared.database import Base


class SQLModel(Base):
    __abstract__ = True
    id = Column(Integer, autoincrement=True, primary_key=True, index=True)

ModelType = TypeVar("ModelType", bound=SQLModel)
CreateSchemaType = TypeVar("CreateSchemaType", bound=BaseModel)
UpdateSchemaType = TypeVar("UpdateSchemaType", bound=BaseModel)

def _handle_integrity_error(e: IntegrityError, model_name: str, operation: str):
    if "unique" in str(e.orig).lower():
        raise exc.EntityAlreadyExistsError(f"{model_name} with the same unique field already exists")
    if "foreign" in str(e.orig).lower():
        raise exc.ForeignKeyViolationError(f"Foreign key error violated while {operation} {model_name}")
    raise exc.DatabaseError(f"Database error occurred while {operation} {model_name}")

class CRUDBase(Generic[ModelType, CreateSchemaType, UpdateSchemaType]):
    def __init__(self, model: Type[ModelType]):
        self.model = model

    async def get(self, db: AsyncSession, id: int) -> ModelType:
        result = await db.execute(select(self.model).where(self.model.id == id))
        obj = result.scalar_one_or_none()
        if obj is None:
            raise exc.EntityDoesNotExistError(f"{self.model.__name__} with id {id} does not exist")
        return obj
    
    async def get_or_none(self, db: AsyncSession, id: int) -> ModelType | None:
        result = await db.execute(select(self.model).where(self.model.id == id))
        obj = result.scalar_one_or_none()
        return obj

    async def get_multi(self, db: AsyncSession, skip: int = 0, limit: int = 100) -> list[ModelType]:
        result = await db.execute(select(self.model).offset(skip).limit(limit).order_by(self.model.id))
        return list(result.scalars().all())

    async def create(self, db: AsyncSession, obj_in: CreateSchemaType) -> ModelType:
        db_obj = self.model(**obj_in.model_dump())
        try:
            db.add(db_obj)
            await db.commit()
            await db.refresh(db_obj)
        except IntegrityError as e:
            await db.rollback()
            _handle_integrity_error(e, self.model.__name__, "creating")
        return db_obj

    async def update(self, db: AsyncSession, id: int, obj_in: UpdateSchemaType) -> ModelType:
        db_obj = await self.get(db, id)
        for field, value in obj_in.model_dump(exclude_unset=True).items():
            setattr(db_obj, field, value)
        try:
            await db.commit()
            await db.refresh(db_obj)
        except IntegrityError as e:
            await db.rollback()
            _handle_integrity_error(e, self.model.__name__, "updating")
        return db_obj

    async def delete(self, db: AsyncSession, id: int) -> ModelType:
        obj = await self.get(db, id)
        try:
            await db.delete(obj)
            await db.commit()
        except IntegrityError as e:
            await db.rollback()
            _handle_integrity_error(e, self.model.__name__, "deleting")
        return obj
