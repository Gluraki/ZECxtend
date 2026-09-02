from collections.abc import AsyncIterator
from contextlib import asynccontextmanager

from app import models  # noqa: F401
from app.routers.auth import router as auth_router
from app.routers.user import router as user_router
from fastapi import FastAPI
from fastapi.routing import APIRoute

from shared.database import create_tables
from shared.docs_auth import register_docs_auth
from shared.exceptions import register_exception_handlers
from shared.health import register_health_endpoint


def cstm_generate_unique_id(route: APIRoute) -> str:
    if route.tags:
        return f"{route.tags[0]}-{route.name}"
    return f"untagged-{route.name}"


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncIterator[None]:
    await create_tables()
    yield


app = FastAPI(
    title="Auth Service API",
    docs_url=None,
    redoc_url=None,
    openapi_url=None,
    generate_unique_id_function=cstm_generate_unique_id,
    lifespan=lifespan,
)
register_docs_auth(app)
register_health_endpoint(app)
app.include_router(auth_router, tags=["auth"])
app.include_router(user_router, prefix="/users", tags=["users"])

register_exception_handlers(app)
