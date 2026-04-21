from app.config import settings
from app.routers.driver import router as drivers_router
from app.routers.team import router as teams_router
from fastapi import FastAPI
from fastapi.routing import APIRoute

from shared.exceptions import register_exception_handlers


def cstm_generate_unique_id(route: APIRoute) -> str:
    if route.tags:
        return f"{route.tags[0]}-{route.name}"
    return f"untagged-{route.name}"

app = FastAPI(
    title="Team Service API",
    openapi_url=f"{settings.API_STR}/openapi.json",
    generate_unique_id_function=cstm_generate_unique_id,
)

app.include_router(teams_router, prefix=settings.API_STR)
app.include_router(drivers_router, prefix=settings.API_STR)

register_exception_handlers(app)