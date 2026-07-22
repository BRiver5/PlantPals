"""Application configuration loaded from environment variables."""
from __future__ import annotations

from pathlib import Path

from pydantic_settings import BaseSettings, SettingsConfigDict

BASE_DIR = Path(__file__).resolve().parent.parent


class Settings(BaseSettings):
    """Runtime settings. Override any field via an environment variable."""

    model_config = SettingsConfigDict(env_prefix="PLANTPALS_", env_file=".env", extra="ignore")

    # Database
    database_url: str = f"sqlite:///{BASE_DIR / 'plantpals.db'}"

    # Uploaded photo storage
    upload_dir: Path = BASE_DIR / "uploads"
    max_upload_bytes: int = 8 * 1024 * 1024  # 8 MB
    allowed_image_types: tuple[str, ...] = ("image/jpeg", "image/png", "image/webp")

    # Public base URL used when building absolute photo URLs.
    # In production set PLANTPALS_PUBLIC_BASE_URL to the deployed host.
    public_base_url: str = ""

    # CORS
    cors_origins: tuple[str, ...] = ("*",)


settings = Settings()
settings.upload_dir.mkdir(parents=True, exist_ok=True)
