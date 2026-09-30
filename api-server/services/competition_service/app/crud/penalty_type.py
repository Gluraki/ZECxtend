from app.models.penalty_type import PenaltyType
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession


async def get_penalty_types(db: AsyncSession) -> list[PenaltyType]:
    result = await db.execute(select(PenaltyType).order_by(PenaltyType.id))
    return list(result.scalars().all())
