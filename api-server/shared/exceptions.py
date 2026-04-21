from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse


class ApiServerError(Exception):
    def __init__(self, message: str = "Server is unavailable", name: str = "Api-Server"):
        self.message = message
        self.name = name
        super().__init__(self.message, self.name)

class ServiceError(ApiServerError):
    pass

class EntityDoesNotExistError(ApiServerError):
    pass

class EntityAlreadyExistsError(ApiServerError):
    pass

class InvalidOperationError(ApiServerError):
    pass

class AuthenticationFailed(ApiServerError):
    pass

class InvalidTokenError(ApiServerError):
    pass

def register_exception_handlers(app: FastAPI):
    @app.exception_handler(NotFoundError)
    async def not_found_handler(request: Request, exc: NotFoundError):
        return JSONResponse(
            status_code=404,
            content={"detail": f"{exc.resource} with id {exc.id} not found"},
        )

    @app.exception_handler(ConflictError)
    async def conflict_handler(request: Request, exc: ConflictError):
        return JSONResponse(
            status_code=409,
            content={"detail": exc.message},
        )

    @app.exception_handler(ForbiddenError)
    async def forbidden_handler(request: Request, exc: ForbiddenError):
        return JSONResponse(
            status_code=403,
            content={"detail": "Forbidden"},
        )
