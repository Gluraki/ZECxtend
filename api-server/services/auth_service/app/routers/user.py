from app.crud.user import crud_user as crud
from app.schemas.user import UserCreate, UserResponse, UserUpdate
from fastapi import APIRouter

from shared.database import SessionDep

router = APIRouter()

@router.post("/", response_model=UserResponse)
async def create_user(db: SessionDep, user: UserCreate):
    db_user = await crud.create(db=db, obj_in=user)
    return db_user

@router.put("/{user_id}", response_model=UserResponse)
async def update_user(db: SessionDep, user_id: int, user_update: UserUpdate):
    db_user = await crud.update(db=db, id=user_id, obj_in=user_update)
    return db_user

@router.delete("/{user_id}", response_model=UserResponse)
async def delete_user(db: SessionDep, user_id: int):
    db_user = await crud.delete(db=db, id=user_id)
    return db_user

@router.get("/{user_id}", response_model=UserResponse)
async def get_user_by_id(db: SessionDep, user_id: int):
    db_user = await crud.get(db=db, id=user_id)
    return db_user

@router.get("/", response_model=list[UserResponse])
async def get_all_users(db: SessionDep):
    db_users = await crud.get_multi(db=db)
    return db_users

@router.post("/{user_id}/roles")
async def assign_client_roles_to_user():
    pass

@router.delete("/{user_id}/roles")
async def remove_roles_from_user():
    pass
