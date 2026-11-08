"""Application settings, loaded from environment variables."""

from functools import lru_cache

from pydantic import Field, field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(extra="ignore")

    admin_username: str = Field(default="admin", min_length=3, max_length=64)
    admin_password: str = Field(min_length=12)
    jwt_secret: str = Field(min_length=32)
    jwt_expire_minutes: int = Field(default=480, ge=5, le=10080)
    database_url: str = "sqlite:////data/urls.db"
    log_level: str = "INFO"

    @field_validator("admin_password")
    @classmethod
    def password_fits_bcrypt(cls, value: str) -> str:
        if len(value.encode("utf-8")) > 72:
            raise ValueError("must be at most 72 bytes long (bcrypt limit)")
        return value


@lru_cache
def get_settings() -> Settings:
    return Settings()  # type: ignore[call-arg]
