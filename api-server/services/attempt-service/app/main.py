from app.config import settings
from app.routers.attempt import router as attempts_router
from app.routers.export import router as exports_router
from fastapi import FastAPI
from fastapi.routing import APIRoute

from shared.exceptions import register_exception_handlers


def cstm_generate_unique_id(route: APIRoute) -> str:
    if route.tags:
        return f"{route.tags[0]}-{route.name}"
    return f"untagged-{route.name}"

app = FastAPI(
    title="Attempt Service API",
    openapi_url=f"{settings.API_STR}/openapi.json",
    generate_unique_id_function=cstm_generate_unique_id,
)
app.include_router(exports_router, prefix=settings.API_STR)
app.include_router(attempts_router, prefix=settings.API_STR)

register_exception_handlers(app)