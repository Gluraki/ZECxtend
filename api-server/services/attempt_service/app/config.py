from shared.config import Settings as BaseAppSettings


class Settings(BaseAppSettings):
    PROJECT_NAME: str = "attempt-service"
    SCORE_SERVICE_URL: str = ""
    TEAM_SERVICE_URL: str = ""
    CHALLENGE_SERVICE_URL: str = ""

settings = Settings()