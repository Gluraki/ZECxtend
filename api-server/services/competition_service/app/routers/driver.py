from app.crud.driver import crud_driver as crud
from app.schemas.driver import DriverCreate, DriverResponse, DriverUpdate
from fastapi import APIRouter

import shared.exceptions as exc
from shared.database import SessionDep
from shared.identity import CurrentUser, CurrentUserDep
from shared.pagination import PaginationDep

router = APIRouter()


def _ensure_can_manage(user: CurrentUser, team_id: int | None) -> None:
    if not user.can_manage_team(team_id):
        raise exc.NotEnoughPermissionsError("Not allowed to manage drivers of this team")

@router.post("/", response_model=DriverResponse)
async def create_driver(db: SessionDep, user: CurrentUserDep, driver: DriverCreate):
    _ensure_can_manage(user, driver.team_id)
    db_driver = await crud.create(db=db, obj_in=driver)
    return db_driver

@router.put("/{driver_id}", response_model=DriverResponse)
async def update_driver(db: SessionDep, user: CurrentUserDep, driver_id: int, driver_update: DriverUpdate):
    db_driver = await crud.get(db=db, id=driver_id)
    _ensure_can_manage(user, db_driver.team_id)
    if "team_id" in driver_update.model_fields_set:
        _ensure_can_manage(user, driver_update.team_id)
    db_driver = await crud.update(db=db, id=driver_id, obj_in=driver_update)
    return db_driver

@router.delete("/{driver_id}", response_model=DriverResponse)
async def delete_driver(db: SessionDep, user: CurrentUserDep, driver_id: int):
    db_driver = await crud.get(db=db, id=driver_id)
    _ensure_can_manage(user, db_driver.team_id)
    db_driver = await crud.delete(db=db, id=driver_id)
    return db_driver

@router.get("/{driver_id}", response_model=DriverResponse)
async def get_driver_by_id(db: SessionDep, driver_id: int):
    db_driver = await crud.get(db=db, id=driver_id)
    return db_driver

@router.get("/", response_model=list[DriverResponse])
async def get_all_drivers(db: SessionDep, page: PaginationDep, team_id: int | None = None):
    db_drivers = await crud.get_multi(db=db, skip=page.skip, limit=page.limit, team_id=team_id)
    return db_drivers
