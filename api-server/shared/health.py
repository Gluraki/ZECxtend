from fastapi import FastAPI


def register_health_endpoint(app: FastAPI) -> None:
    @app.get("/health", tags=["health"])
    async def health() -> dict[str, str]:
        return {"status": "ok"}
