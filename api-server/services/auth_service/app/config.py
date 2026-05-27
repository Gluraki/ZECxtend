import secrets

from shared.config import Settings as BaseAppSettings


class Settings(BaseAppSettings):
    PROJECT_NAME: str = "auth-service"
    SCORE_SERVICE_URL: str = ""
    TEAM_SERVICE_URL: str = ""
    CHALLENGE_SERVICE_URL: str = ""
    SECRET_KEY: str = secrets.token_urlsafe(32)
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7

settings = Settings()