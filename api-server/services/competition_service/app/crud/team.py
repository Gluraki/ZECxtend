from app.schemas.team import TeamCreate, TeamUpdate  # type: ignore
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from shared.crud_base import CRUDBase
from shared.models import Attempt, Team


class CRUDTeam(CRUDBase[Team, TeamCreate, TeamUpdate]):
    async def has_attempts(self, db: AsyncSession, id: int) -> bool:
        return await db.scalar(select(Attempt.id).where(Attempt.team_id == id).limit(1)) is not None

crud_team = CRUDTeam(Team)
