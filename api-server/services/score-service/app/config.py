from shared.config import BaseAppSettings


class Settings(BaseAppSettings):
    PROJECT_NAME: str = "score-service"
    SCORE_SERVICE_URL: str
    TEAM_SERVICE_URL: str
    CHALLENGE_SERVICE_URL: str

settings = Settings()