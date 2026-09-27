from shared.config import Settings as BaseAppSettings


class Settings(BaseAppSettings):
    PROJECT_NAME: str = "competition-service"

settings = Settings()