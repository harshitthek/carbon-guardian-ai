"""config.py module."""
from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    """
    Centralized configuration mapping environment variables to python attributes.
    Pydantic strictly validates these at startup, ensuring the app fails fast
    if required variables (like JWT_SECRET_KEY) are missing.
    """
    JWT_SECRET_KEY: str
    SEED_ADMIN_PASSWORD: str
    DATABASE_URL: str = "sqlite:///./carbon_guardian.db"

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

# Instantiate settings singleton to be imported by other modules
settings = Settings()
