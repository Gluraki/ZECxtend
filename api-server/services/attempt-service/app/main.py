from app.routers.attempt import router as attempts_router
from app.routers.export import router as exports_router
from app.routers.leaderboard import router as leaderboard_router
from app.routers.penalty import router as penalty_router
from app.routers.score import router as score_router
from fastapi import FastAPI
from fastapi.routing import APIRoute

from shared.exceptions import register_exception_handlers


def cstm_generate_unique_id(route: APIRoute) -> str:
    if route.tags:
        return f"{route.tags[0]}-{route.name}"
    return f"untagged-{route.name}"

app = FastAPI(
    title="Attempt Service API",
    openapi_url="/openapi.json",
    generate_unique_id_function=cstm_generate_unique_id,
)
app.include_router(exports_router, prefix="/export", tags=["export"])
app.include_router(attempts_router, prefix="/attempts", tags=["attempts"])
app.include_router(leaderboard_router, prefix="/leaderboard", tags=["leaderboard"])
app.include_router(penalty_router, prefix="/penalties", tags=["penalties"])
app.include_router(score_router, prefix="/scores", tags=["scores"])

register_exception_handlers(app)