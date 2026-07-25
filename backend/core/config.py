"""Validated application configuration loaded from ``backend/.env``."""

from pathlib import Path

from pydantic import AliasChoices, Field, field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


ENV_FILE = Path(__file__).resolve().parents[1] / ".env"
DEFAULT_CHROMA_PATH = Path(__file__).resolve().parents[1] / "chroma_data"


class Settings(BaseSettings):
    """Connection settings required before the API can accept traffic.

    Required settings deliberately have no defaults. Pydantic therefore raises a
    clear validation error at startup if an environment has not been configured.
    """

    database_url: str = Field(validation_alias=AliasChoices("DATABASE_URL"))
    neo4j_uri: str = Field(validation_alias=AliasChoices("NEO4J_URI"))
    neo4j_username: str = Field(validation_alias=AliasChoices("NEO4J_USERNAME"))
    neo4j_password: str = Field(validation_alias=AliasChoices("NEO4J_PASSWORD"))
    neo4j_database: str = Field(
        default="neo4j", validation_alias=AliasChoices("NEO4J_DATABASE")
    )
    redis_url: str = Field(validation_alias=AliasChoices("REDIS_URL"))
    chroma_path: Path = Field(
        default=DEFAULT_CHROMA_PATH, validation_alias=AliasChoices("CHROMA_PATH")
    )
    chroma_collection_name: str = Field(
        default="modus_operandi", validation_alias=AliasChoices("CHROMA_COLLECTION_NAME")
    )
    supabase_url: str = Field(
        default="https://wyknzfjynbahuhgvehkb.supabase.co",
        validation_alias=AliasChoices("SUPABASE_URL"),
    )
    supabase_jwt_secret: str = Field(
        default="DATATHON",
        validation_alias=AliasChoices("SUPABASE_JWT_SECRET"),
    )
    openrouter_api_key: str = Field(validation_alias=AliasChoices("OPENROUTER_API_KEY"))
    gemini_api_key: str = Field(validation_alias=AliasChoices("GEMINI_API_KEY"))
    huggingface_api_key: str = Field(validation_alias=AliasChoices("HUGGINGFACE_API_KEY"))

    model_config = SettingsConfigDict(
        env_file=ENV_FILE,
        env_file_encoding="utf-8",
        extra="ignore",
    )

    @field_validator("chroma_path")
    @classmethod
    def resolve_chroma_path(cls, value: Path) -> Path:
        """Keep relative Chroma paths rooted in ``backend`` in every launch mode."""
        return value if value.is_absolute() else ENV_FILE.parent / value
