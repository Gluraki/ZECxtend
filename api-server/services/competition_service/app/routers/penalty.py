from app.crud.penalty import crud_penalty as crud
from app.crud.penalty_type import get_penalty_types
from app.schemas.penalty import PenaltyCreate, PenaltyResponse, PenaltyTypeResponse, PenaltyUpdate
from fastapi import APIRouter

from shared.database import SessionDep
from shared.identity import require_roles
from shared.pagination import PaginationDep
from shared.user_role import UserRole

router = APIRouter()


@router.get("/types/", response_model=list[PenaltyTypeResponse])
async def get_all_penalty_types(db: SessionDep):
    penalty_types = await get_penalty_types(db=db)
    return penalty_types


@router.post("/", response_model=PenaltyResponse, dependencies=[require_roles(UserRole.ADMIN)])
async def create_penalty(db: SessionDep, penalty: PenaltyCreate):
    db_penalty = await crud.create(db=db, obj_in=penalty)
    return db_penalty


@router.put("/{penalty_id}", response_model=PenaltyResponse, dependencies=[require_roles(UserRole.ADMIN)])
async def update_penalty(db: SessionDep, penalty_id: int, penalty_update: PenaltyUpdate):
    db_penalty = await crud.update(db=db, id=penalty_id, obj_in=penalty_update)
    return db_penalty


@router.delete("/{penalty_id}", response_model=PenaltyResponse, dependencies=[require_roles(UserRole.ADMIN)])
async def delete_penalty(db: SessionDep, penalty_id: int):
    db_penalty = await crud.delete(db=db, id=penalty_id)
    return db_penalty


@router.get("/{penalty_id}", response_model=PenaltyResponse)
async def get_penalty(db: SessionDep, penalty_id: int):
    db_penalty = await crud.get(db=db, id=penalty_id)
    return db_penalty


@router.get("/", response_model=list[PenaltyResponse])
async def get_all_penalties(db: SessionDep, page: PaginationDep, attempt_id: int | None = None):
    db_penalties = await crud.get_multi(db=db, skip=page.skip, limit=page.limit, attempt_id=attempt_id)
    return db_penalties
