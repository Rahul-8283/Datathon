"""FastAPI Dependency Injection utilities for authentication and database sessions."""

from typing import Any, Dict
from fastapi import Depends, HTTPException, Request, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

try:
    from core.config import Settings
    from core.security import decode_supabase_token
except ImportError:
    from ..core.config import Settings
    from ..core.security import decode_supabase_token

security = HTTPBearer(auto_error=True)

def get_settings(request: Request) -> Settings:
    """Retrieve application settings from FastAPI app state or instantiate anew."""
    return getattr(request.app.state, "settings", None) or Settings()

async def get_current_user(
    request: Request,
    credentials: HTTPAuthorizationCredentials = Depends(security),
) -> Dict[str, Any]:
    """Dependency to validate the Bearer token and inject authenticated user metadata.

    Args:
        request: FastAPI request object.
        credentials: Bearer token authorization header credentials.

    Returns:
        Dict[str, Any]: Dictionary containing authenticated user information:
            - user_id (str)
            - email (str)
            - role (str)
            - metadata (dict)
    """
    token = credentials.credentials
    if not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing Authorization Bearer header",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    settings = get_settings(request)
    payload = decode_supabase_token(token, settings.supabase_jwt_secret)
    
    user_id = payload.get("sub")
    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token payload: missing user ID (sub)",
            headers={"WWW-Authenticate": "Bearer"},
        )
        
    return {
        "user_id": user_id,
        "email": payload.get("email", ""),
        "role": payload.get("role", "authenticated"),
        "app_metadata": payload.get("app_metadata", {}),
        "user_metadata": payload.get("user_metadata", {}),
    }

from collections.abc import Generator
from sqlalchemy.orm import Session

def get_db(request: Request) -> Generator[Session, None, None]:
    """Dependency to retrieve a database session for a single request, then close it."""
    postgres = getattr(request.app.state, "postgres", None)
    if postgres is None:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Database connection is not initialized",
        )
    db = postgres.SessionLocal()
    try:
        yield db
    finally:
        db.close()

from neo4j import Driver
def get_neo4j(request: Request) -> Driver:
    """Dependency to retrieve the Neo4j Driver."""
    neo4j_db = getattr(request.app.state, "neo4j", None)
    if neo4j_db is None or neo4j_db._driver is None:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Neo4j connection is not initialized",
        )
    return neo4j_db._driver

from db.chromadb_client import ChromaDatabase
def get_chroma(request: Request) -> ChromaDatabase:
    """Dependency to retrieve the ChromaDB client."""
    chroma_db = getattr(request.app.state, "chroma", None)
    if chroma_db is None:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="ChromaDB connection is not initialized",
        )
    return chroma_db
