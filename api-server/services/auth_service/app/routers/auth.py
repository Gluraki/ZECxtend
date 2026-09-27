from datetime import timedelta
from typing import Annotated

import app.crud.auth as auth_crud
from app.config import REFRESH_COOKIE_NAME, REFRESH_COOKIE_OPTIONS, settings
from app.crud.user import crud_user
from app.models.user import User
from app.schemas import token as schemas
from fastapi import APIRouter, Cookie, Depends, Response, status
from fastapi.security import OAuth2PasswordRequestForm

import shared.exceptions as exc
from shared.database import SessionDep

router = APIRouter()


def _issue_access_token(user: User) -> schemas.Token:
    expires_delta = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    return schemas.Token(
        access_token=auth_crud.create_access_token(
            subject=user.username,
            expires_delta=expires_delta,
            role=user.role,
            user_id=user.id,
            team_id=user.team_id,
            must_change_password=user.must_change_password,
        ),
        token_type="bearer",
        expires_in=int(expires_delta.total_seconds()),
    )


def _set_refresh_cookie(response: Response, user: User) -> None:
    expires_delta = timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS)
    response.set_cookie(
        key=REFRESH_COOKIE_NAME,
        value=auth_crud.create_refresh_token(
            subject=user.username,
            user_id=user.id,
            token_version=user.token_version,
            expires_delta=expires_delta,
        ),
        max_age=int(expires_delta.total_seconds()),
        **REFRESH_COOKIE_OPTIONS,
    )


@router.post("/login", response_model=schemas.Token)
async def login(db: SessionDep, response: Response, form_data: Annotated[OAuth2PasswordRequestForm, Depends()]):
    user = await crud_user.authenticate_user(db=db, username=form_data.username, password=form_data.password)
    _set_refresh_cookie(response, user)
    return _issue_access_token(user)


@router.post("/refresh", response_model=schemas.Token)
async def refresh(
    db: SessionDep,
    refresh_token: Annotated[str | None, Cookie(alias=REFRESH_COOKIE_NAME)] = None,
):
    if refresh_token is None:
        raise exc.InvalidTokenError("Missing refresh token")
    claims = auth_crud.decode_token(refresh_token, expected_type="refresh")

    user = await crud_user.get_or_none(db=db, id=claims["id"])
    if user is None or claims.get("ver") != user.token_version:
        raise exc.InvalidTokenError("Invalid or expired token")
    return _issue_access_token(user)


@router.post("/logout", status_code=status.HTTP_204_NO_CONTENT)
async def logout(response: Response):
    response.delete_cookie(key=REFRESH_COOKIE_NAME, **REFRESH_COOKIE_OPTIONS)
