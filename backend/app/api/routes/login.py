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
def login(
    username: str = Form(...),
    password: str = Form(...),
    db: Session = Depends(get_db),
):
    try:
        token_data = keycloak_login(username, password)
        access_token = token_data["access_token"] 
        
        payload = jwt.get_unverified_claims(access_token)
        user_id = payload.get("sub")
        username = payload.get("preferred_username")
        email = payload.get("email")

        if not user_id:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token: missing user ID"
            )

        try:
            user = db.query(User).filter(User.id == user_id).first()
            if not user:
                user = User(id=user_id, username=username, email=email)
                db.add(user)
            else:
                user.username = username
                user.email = email
                user.updated_at = datetime.utcnow()

            db.commit()
            db.refresh(user)
            
        except IntegrityError:
            db.rollback()
            user = db.query(User).filter(User.id == user_id).first()

        """
        return {
            "user": {"id": user.id, "username": user.username, "email": user.email},
            "access_token": access_token,  # This is the string token
            "refresh_token": token_data.get("refresh_token"),
            "token_type": token_data.get("token_type", "Bearer"),
            "expires_in": token_data.get("expires_in"),
        }
        """
        return token_data
        
    except HTTPException as e:
        raise e
    except Exception as e:
        print(f"Unexpected login error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal server error during login"
        )

@router.post("/refresh")
def refresh(refresh_token: str = Form(...)):
    try:
        token_data = keycloak_refresh(refresh_token)
        return token_data
    except HTTPException as e:
        raise e