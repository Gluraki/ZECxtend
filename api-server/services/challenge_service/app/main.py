from app.routers.challenge import router as challenges_router
from fastapi import FastAPI
from fastapi.routing import APIRoute

from shared.exceptions import register_exception_handlers
from shared.health import register_health_endpoint


def cstm_generate_unique_id(route: APIRoute) -> str:
    if route.tags:
        return f"{route.tags[0]}-{route.name}"
    return f"untagged-{route.name}"

app = FastAPI(
    title="Challenge Service API",
    openapi_url="/openapi.json",
    generate_unique_id_function=cstm_generate_unique_id,
)
register_health_endpoint(app)
app.include_router(challenges_router, prefix="/challenges", tags=["challenges"])

register_exception_handlers(app)