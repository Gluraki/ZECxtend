from app.crud.team import crud_team as crud
from app.schemas.team import TeamCreate, TeamResponse, TeamUpdate  # type: ignore
from fastapi import APIRouter

from shared.database import SessionDep

router = APIRouter()

@router.post("/", response_model=TeamResponse)
async def create_team(db: SessionDep, team: TeamCreate):
    team = await crud.create(db=db, obj_in=team)
    return team

@router.put("/{team_id}", response_model=TeamResponse)
async def update_team(db: SessionDep, team_id: int, team_update: TeamUpdate):
    team = await crud.update(db=db, id=team_id, obj_in=team_update)
    return team

@router.delete("/{team_id}", response_model=TeamResponse)
async def delete_team(db: SessionDep, team_id: int):
    team = await crud.delete(db=db, id=team_id)
    return team

@router.get("/{team_id}", response_model=TeamResponse)
async def get_team(db: SessionDep, team_id: int):
    team = await crud.get(db=db, id=team_id)
    return team

@router.get("/", response_model=list[TeamResponse])
async def get_all_teams(db: SessionDep):
    teams = await crud.get_multi(db=db)
    return teams
