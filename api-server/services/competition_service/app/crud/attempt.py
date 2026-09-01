from app.crud.penalty import crud_penalty
from app.models.attempt import Attempt
from app.schemas.attempt import AttemptCreate, AttemptUpdate
from app.schemas.penalty import PenaltyCreate
from sqlalchemy.ext.asyncio import AsyncSession

from shared.crud_base import CRUDBase


class CRUDAttempt(CRUDBase[Attempt, AttemptCreate, AttemptUpdate]):
    async def create(self, db: AsyncSession, obj_in: AttemptCreate) -> Attempt:
        attempt_data = obj_in.model_dump(exclude={"penalty_count", "penalty_type"})
        db_attempt = await self._create_from_data(db, attempt_data)

        if obj_in.penalty_type is not None:
            await crud_penalty.create(
                db,
                PenaltyCreate(
                    attempt_id=db_attempt.id,
                    penalty_type_id=obj_in.penalty_type,
                    count=obj_in.penalty_count or 0,
                ),
            )

        return db_attempt

crud_attempt = CRUDAttempt(Attempt)
