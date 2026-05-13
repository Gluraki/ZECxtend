from app.crud.attempt import crud_attempt as crud
from app.schemas.attempt import AttemptCreate, AttemptResponse, AttemptUpdate
from fastapi import APIRouter

from shared.database import SessionDep

router = APIRouter()

@router.post("/", response_model=AttemptResponse)
async def create_attempt(db: SessionDep, attempt: AttemptCreate):
    db_attempt = await crud.create(db=db, obj_in=attempt)
    return db_attempt

@router.put("/{attempt_id}", response_model=AttemptResponse)
async def update_attempt(db: SessionDep, attempt_id: int, attempt_update: AttemptUpdate):
    db_attempt = await crud.update(db=db, id=attempt_id, obj_in=attempt_update)
    return db_attempt

@router.delete("/{attempt_id}", response_model=AttemptResponse)
async def delete_attempt(db: SessionDep, attempt_id: int):
    db_attempt = await crud.delete(db=db, id=attempt_id)
    return db_attempt

@router.get("/{attempt_id}", response_model=AttemptResponse)
async def get_attempt(db: SessionDep, attempt_id: int):
    db_attempt = await crud.get(db=db, id=attempt_id)
    return db_attempt

@router.get("/", response_model=list[AttemptResponse])
async def get_all_attempts(db: SessionDep):
    db_attempts = await crud.get_multi(db=db)
    return db_attempts
