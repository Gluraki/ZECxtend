from app.crud.team import crud_team as crud
from app.schemas.team import TeamCreate, TeamResponse, TeamUpdate  # type: ignore
from fastapi import APIRouter

import shared.exceptions as exc
from shared.database import SessionDep
from shared.identity import CurrentUserDep, require_roles
from shared.pagination import PaginationDep
from shared.user_role import UserRole

TEAMLEAD_EDITABLE_FIELDS = {"name", "vehicle_weight", "mean_power", "rfid_identifier"}
SCORING_FIELDS = {"vehicle_weight", "mean_power"}

router = APIRouter()

@router.post("/", response_model=TeamResponse, dependencies=[require_roles(UserRole.ADMIN)])
async def create_team(db: SessionDep, team: TeamCreate):
    team = await crud.create(db=db, obj_in=team)
    return team

@router.put("/{team_id}", response_model=TeamResponse)
async def update_team(db: SessionDep, user: CurrentUserDep, team_id: int, team_update: TeamUpdate):
    if not user.is_admin:
        if not user.can_manage_team(team_id):
            raise exc.NotEnoughPermissionsError("Not allowed to edit this team")
        forbidden = team_update.model_fields_set - TEAMLEAD_EDITABLE_FIELDS
        if forbidden:
            raise exc.NotEnoughPermissionsError(f"Only an admin can change: {', '.join(sorted(forbidden))}")
        locked = team_update.model_fields_set & SCORING_FIELDS
        if locked and await crud.has_attempts(db=db, id=team_id):
            raise exc.NotEnoughPermissionsError(
                f"Only an admin can change {', '.join(sorted(locked))} once the team has attempts"
            )
    team = await crud.update(db=db, id=team_id, obj_in=team_update)
    return team

@router.delete("/{team_id}", response_model=TeamResponse, dependencies=[require_roles(UserRole.ADMIN)])
async def delete_team(db: SessionDep, team_id: int):
    team = await crud.delete(db=db, id=team_id)
    return team

@router.get("/{team_id}", response_model=TeamResponse)
async def get_team_by_id(db: SessionDep, team_id: int):
    team = await crud.get(db=db, id=team_id)
    return team

@router.get("/", response_model=list[TeamResponse])
async def get_all_teams(db: SessionDep, page: PaginationDep):
    teams = await crud.get_multi(db=db, skip=page.skip, limit=page.limit)
    return teams
