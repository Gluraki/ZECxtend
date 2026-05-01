from app.crud.challenge import crud_challenge as crud
from app.schemas.challenge import ChallengeResponse, ChallengeUpdate
from fastapi import APIRouter

from shared.database import SessionDep

router = APIRouter()

@router.put("/{challenge_id}", response_model=ChallengeResponse)
async def update_challenge(db: SessionDep, challenge_id: int, challenge_update: ChallengeUpdate):
    challenge = await crud.update(db=db, id=challenge_id, obj_in=challenge_update)
    return challenge

@router.get("/{challenge_id}", response_model=ChallengeResponse)
async def get_challenge(db: SessionDep, challenge_id: int):
    challenge = await crud.get(db=db, id=challenge_id)
    return challenge

@router.get("/", response_model=list[ChallengeResponse])
async def get_all_challenges(db: SessionDep):
    challenges = await crud.get_multi(db=db)
    return challenges