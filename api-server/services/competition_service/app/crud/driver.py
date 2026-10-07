from app.schemas.driver import DriverCreate, DriverUpdate
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from shared.crud_base import CRUDBase
from shared.models import Attempt, Driver


class CRUDDriver(CRUDBase[Driver, DriverCreate, DriverUpdate]):
    async def has_attempts(self, db: AsyncSession, id: int) -> bool:
        return await db.scalar(select(Attempt.id).where(Attempt.driver_id == id).limit(1)) is not None

crud_driver = CRUDDriver(Driver)
