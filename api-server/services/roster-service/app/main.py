from app.config import settings
from app.routers.user import router as users_router
from fastapi import FastAPI
from fastapi.routing import APIRoute

from shared.exceptions import register_exception_handlers


def cstm_generate_unique_id(route: APIRoute) -> str:
    if route.tags:
        return f"{route.tags[0]}-{route.name}"
    return f"untagged-{route.name}"

app = FastAPI(
    title="User Service API",
    openapi_url=f"{settings.API_STR}/openapi.json",
    generate_unique_id_function=cstm_generate_unique_id,
)

app.include_router(users_router, prefix=settings.API_STR)

register_exception_handlers(app)