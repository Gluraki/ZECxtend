from fastapi import APIRouter
from app.api.routes import login, user, protected

api_router = APIRouter()

api_router.include_router(login.router, prefix="/login", tags=["login"])
api_router.include_router(user.router, prefix="/user", tags=["user"])
api_router.include_router(protected.router, prefix="/protected", tags=["protected"])
