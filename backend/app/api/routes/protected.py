from fastapi import APIRouter, Depends
from app.services.keycloak import decode_keycloak_token

router = APIRouter()

@router.get("/protected")
async def protected_route(user_data = Depends(decode_keycloak_token)):
    return {"message": "This is a protected route", "user": user_data}