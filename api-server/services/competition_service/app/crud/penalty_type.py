from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from shared.models import PenaltyType


async def get_penalty_types(db: AsyncSession) -> list[PenaltyType]:
    result = await db.execute(select(PenaltyType).order_by(PenaltyType.id))
    return list(result.scalars().all())
