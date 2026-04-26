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

class ForeignKeyViolationError(ApiServerError):
    pass

class NotEnoughPermissionsError(ApiServerError):
    pass

class DatabaseError(ApiServerError):
    pass

def register_exception_handlers(app: FastAPI):
    @app.exception_handler(InvalidOperationError)
    async def invalid_operation_handler(request: Request, exc: InvalidOperationError):
        return JSONResponse(
            status_code=400,
            content={"detail": f"{exc.message}-{exc.name}"},
        )
    
    @app.exception_handler(ForeignKeyViolationError)
    async def foreign_key_violation_handler(request: Request, exc: ForeignKeyViolationError):
        return JSONResponse(
            status_code=400,
            content={"detail": f"{exc.message}-{exc.name}"},
        )
    
    @app.exception_handler(AuthenticationFailed)
    async def authentication_failed_handler(request: Request, exc: AuthenticationFailed):
        return JSONResponse(
            status_code=401,
            content={"detail": f"{exc.message}-{exc.name}"},
        )

    @app.exception_handler(InvalidTokenError)
    async def invalid_token_handler(request: Request, exc: InvalidTokenError):
        return JSONResponse(
            status_code=401,
            content={"detail": f"{exc.message}-{exc.name}"},
        )
    
    @app.exception_handler(NotEnoughPermissionsError)
    async def not_enough_permissions_handler(request: Request, exc: NotEnoughPermissionsError):
        return JSONResponse(
            status_code=403,
            content={"detail": f"{exc.message}-{exc.name}"},
        )
    
    @app.exception_handler(EntityDoesNotExistError)
    async def not_found_handler(request: Request, exc: EntityDoesNotExistError):
        return JSONResponse(
            status_code=404,
            content={"detail": f"{exc.message}-{exc.name}"},
        )
    
    @app.exception_handler(EntityAlreadyExistsError)
    async def already_exists_handler(request: Request, exc: EntityAlreadyExistsError):
        return JSONResponse(
            status_code=409,
            content={"detail": f"{exc.message}-{exc.name}"},
        )

    @app.exception_handler(ServiceError)
    async def service_error_handler(request: Request, exc: ServiceError):
        return JSONResponse(
            status_code=500,
            content={"detail": f"{exc.message}-{exc.name}"},
        )
    @app.exception_handler(DatabaseError)
    async def database_error_handler(request: Request, exc: DatabaseError):
        return JSONResponse(
            status_code=500,
            content={"detail": f"{exc.message}-{exc.name}"},
        )
