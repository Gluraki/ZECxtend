from app.schemas.team import TeamCreate, TeamUpdate  # type: ignore

from shared.crud_base import CRUDBase
from shared.models import Team


class CRUDTeam(CRUDBase[Team, TeamCreate, TeamUpdate]):
    pass

crud_team = CRUDTeam(Team)
