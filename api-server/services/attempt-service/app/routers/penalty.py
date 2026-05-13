from app.crud.penalty import crud_penalty as crud
from app.schemas.penalty import PenaltyCreate, PenaltyResponse, PenaltyUpdate
from fastapi import APIRouter

from shared.database import SessionDep

router = APIRouter()

@router.post("/", response_model=PenaltyResponse)
async def create_penalty(db: SessionDep, penalty: PenaltyCreate):
    db_penalty = await crud.create(db=db, obj_in=penalty)
    return db_penalty

@router.put("/{penalty_id}", response_model=PenaltyResponse)
async def update_penalty(db: SessionDep, penalty_id: int, penalty_update: PenaltyUpdate):
    db_penalty = await crud.update(db=db, id=penalty_id, obj_in=penalty_update)
    return db_penalty

@router.delete("/{penalty_id}", response_model=PenaltyResponse)
async def delete_penalty(db: SessionDep, penalty_id: int):
    db_penalty = await crud.delete(db=db, id=penalty_id)
    return db_penalty

@router.get("/{penalty_id}", response_model=PenaltyResponse)
async def get_penalty(db: SessionDep, penalty_id: int):
    db_penalty = await crud.get(db=db, id=penalty_id)
    return db_penalty

@router.get("/", response_model=list[PenaltyResponse])
async def get_all_penalties(db: SessionDep):
    db_penalties = await crud.get_multi(db=db)
    return db_penalties
