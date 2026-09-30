from sqlalchemy.ext.asyncio import AsyncSession

from shared.models import TeamCategory


async def get_leaderboard(db: AsyncSession, challenge_id: int, category: TeamCategory) -> list:
    return []
