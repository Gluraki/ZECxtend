from fastapi import APIRouter, Form, Depends, HTTPException, status
from jose import jwt
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from datetime import datetime
from app.database.session import get_db
from app.models.user import User
from app.services.keycloak import keycloak_login, keycloak_refresh

router = APIRouter()

@router.post("/login")
def login(username: str = Form(...),password: str = Form(...), db: Session = Depends(get_db)):
    token_data = keycloak_login(username, password)
    return token_data

@router.post("/refresh")
def refresh(refresh_token: str = Form(...)):
    token_data = keycloak_refresh(refresh_token)
    return token_data