from app.models.team import TeamCategory
from sqlalchemy.ext.asyncio import AsyncSession


async def get_leaderboard(db: AsyncSession, challenge_id: int, category: TeamCategory) -> list:
    return []
