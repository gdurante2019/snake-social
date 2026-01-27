from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    DATABASE_URL: str = "sqlite+aiosqlite:///./snake.db"

    model_config = SettingsConfigDict(env_file=".env")

    @property
    def ASYNC_DATABASE_URL(self) -> str:
        """
        Render provides DATABASE_URL starting with postgres:// but SQLAlchemy async
        needs postgresql+asyncpg://
        """
        url = self.DATABASE_URL
        if url.startswith("postgres://"):
            url = url.replace("postgres://", "postgresql+asyncpg://", 1)
        elif url.startswith("postgresql://") and "+asyncpg" not in url:
             url = url.replace("postgresql://", "postgresql+asyncpg://", 1)
        return url

settings = Settings()
