from typing import List

from app.crud.attempt import crud_attempt as crud
from app.schemas.attempt import AttemptCreate, AttemptResponse, AttemptUpdate
from fastapi import APIRouter

from shared.database import SessionDep

router = APIRouter()

@router.post("/", response_model=AttemptResponse)
async def create_attempt(db: SessionDep, attempt: AttemptCreate):
    attempt = await crud.create(db=db, obj_in=attempt)
    return attempt

@router.put("/{attempt_id}", response_model=AttemptResponse)
async def update_attempt(db: SessionDep, attempt_id: int, attempt_update: AttemptUpdate):
    attempt = await crud.update(db=db, id=attempt_id, obj_in=attempt_update)
    return attempt

@router.delete("/{attempt_id}", response_model=AttemptResponse)
async def delete_attempt(db: SessionDep, attempt_id: int):
    attempt = await crud.delete(db=db, id=attempt_id)
    return attempt

@router.get("/{attempt_id}", response_model=AttemptResponse)
async def get_attempt(db: SessionDep, attempt_id: int):
    attempt = await crud.get(db=db, id=attempt_id)
    return attempt

@router.get("/", response_model=List[AttemptResponse])
async def get_all_attempts(db: SessionDep):
    attempts = await crud.get_multi(db=db)
    return attempts
