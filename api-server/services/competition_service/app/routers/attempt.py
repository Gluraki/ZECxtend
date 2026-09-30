from app.crud.attempt import crud_attempt as crud
from app.schemas.attempt import AttemptCreate, AttemptResponse, AttemptUpdate, AttemptValidityUpdate
from fastapi import APIRouter

from shared.database import SessionDep
from shared.identity import require_roles
from shared.pagination import PaginationDep
from shared.user_role import UserRole

router = APIRouter()


@router.post("/", response_model=AttemptResponse, dependencies=[require_roles(UserRole.ADMIN)])
async def create_attempt(db: SessionDep, attempt: AttemptCreate):
    db_attempt = await crud.create(db=db, obj_in=attempt)
    return db_attempt


@router.put("/{attempt_id}", response_model=AttemptResponse, dependencies=[require_roles(UserRole.ADMIN)])
async def update_attempt(db: SessionDep, attempt_id: int, attempt_update: AttemptUpdate):
    db_attempt = await crud.update(db=db, id=attempt_id, obj_in=attempt_update)
    return db_attempt


@router.patch("/{attempt_id}/validity", response_model=AttemptResponse, dependencies=[require_roles(UserRole.ADMIN)])
async def set_attempt_validity(db: SessionDep, attempt_id: int, validity: AttemptValidityUpdate):
    db_attempt = await crud.set_validity(db=db, id=attempt_id, is_valid=validity.is_valid)
    return db_attempt


@router.delete("/{attempt_id}", response_model=AttemptResponse, dependencies=[require_roles(UserRole.ADMIN)])
async def delete_attempt(db: SessionDep, attempt_id: int):
    db_attempt = await crud.delete(db=db, id=attempt_id)
    return db_attempt


@router.get("/{attempt_id}", response_model=AttemptResponse)
async def get_attempt(db: SessionDep, attempt_id: int):
    db_attempt = await crud.get(db=db, id=attempt_id)
    return db_attempt


@router.get("/", response_model=list[AttemptResponse])
async def get_all_attempts(
    db: SessionDep,
    page: PaginationDep,
    challenge_id: int | None = None,
    team_id: int | None = None,
    driver_id: int | None = None,
):
    db_attempts = await crud.get_multi(
        db=db, skip=page.skip, limit=page.limit, challenge_id=challenge_id, team_id=team_id, driver_id=driver_id
    )
    return db_attempts
