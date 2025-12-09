from fastapi import APIRouter
from app.schemas.user import CreateUserKC
from app.crud import user as crud

router = APIRouter()

@router.post("/")
def create_user(request: CreateUserKC):
    response = crud.create_user(request=request)
    return response