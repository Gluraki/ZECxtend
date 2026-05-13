from app.crud.score import crud_score as crud
from app.schemas.score import ScoreCreate, ScoreResponse, ScoreUpdate
from fastapi import APIRouter

from shared.database import SessionDep

router = APIRouter()

@router.post("/", response_model=ScoreResponse)
async def create_score(db: SessionDep, score: ScoreCreate):
    db_score = await crud.create(db=db, obj_in=score)
    return db_score

@router.put("/{score_id}", response_model=ScoreResponse)
async def update_score(db: SessionDep, score_id: int, score_update: ScoreUpdate):
    db_score = await crud.update(db=db, id=score_id, obj_in=score_update)
    return db_score

@router.delete("/{score_id}", response_model=ScoreResponse)
async def delete_score(db: SessionDep, score_id: int):
    db_score = await crud.delete(db=db, id=score_id)
    return db_score

@router.get("/{score_id}", response_model=ScoreResponse)
async def get_score(db: SessionDep, score_id: int):
    db_score = await crud.get(db=db, id=score_id)
    return db_score

@router.get("/", response_model=list[ScoreResponse])
async def get_all_scores(db: SessionDep):
    db_scores = await crud.get_multi(db=db)
    return db_scores
