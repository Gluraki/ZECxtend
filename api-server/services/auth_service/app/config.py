from pydantic import field_validator

from shared.config import Settings as BaseAppSettings

MIN_SECRET_KEY_BYTES = 32

REFRESH_COOKIE_NAME = "refresh_token"
REFRESH_COOKIE_OPTIONS = {
    "path": "/refresh",
    "secure": True,
    "httponly": True,
    "samesite": "strict",
}


class Settings(BaseAppSettings):
    PROJECT_NAME: str = "auth-service"
    SECRET_KEY: str
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 15
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7

    @field_validator("SECRET_KEY")
    @classmethod
    def secret_key_long_enough(cls, value: str) -> str:
        if len(value.encode("utf-8")) < MIN_SECRET_KEY_BYTES:
            raise ValueError(f"SECRET_KEY must be at least {MIN_SECRET_KEY_BYTES} bytes")
        return value


settings = Settings()  # type: ignore[call-arg]
