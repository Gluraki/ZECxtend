from datetime import timedelta
from typing import Annotated, cast

import app.crud.auth as auth_crud
from app.config import settings
from app.crud.user import crud_user
from app.schemas import token as schemas
from fastapi import APIRouter, Depends, Form
from fastapi.security import OAuth2PasswordRequestForm

from shared.database import SessionDep
from shared.user_role import UserRole

router = APIRouter()

@router.post("/login", response_model=schemas.Token)
async def login(db: SessionDep, form_data: Annotated[OAuth2PasswordRequestForm, Depends()]):
    user = await crud_user.authenticate_user(db=db, username=form_data.username, password=form_data.password)
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES) # pyright: ignore[reportAttributeAccessIssue]
    token = schemas.Token(
        access_token=auth_crud.create_access_token(
            subject=user.username,
            expires_delta=access_token_expires,
            role=cast(UserRole, user.role),
            user_id=cast(int, user.id),
        ),
        token_type="bearer",)
    return token

@router.post("/refresh")
def refresh(refresh_token: str = Form(...)):
    pass
