import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import os
from redis import Redis
from starlette.concurrency import run_in_threadpool

if __package__:
    from .core.config import Settings
    from .db.chromadb_client import ChromaDatabase
    from .db.database import PostgreSQLDatabase
    from .db.neo4j_client import Neo4jDatabase
else:
    from core.config import Settings
    from db.chromadb_client import ChromaDatabase
    from db.database import PostgreSQLDatabase
    from db.neo4j_client import Neo4jDatabase


logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Validate and connect every persistence layer before serving requests."""
    settings = Settings()
    postgres: PostgreSQLDatabase | None = None
    neo4j: Neo4jDatabase | None = None
    redis_client: Redis | None = None
    app.state.connections_ready = False
    try:
        postgres = PostgreSQLDatabase(settings.database_url)
        neo4j = Neo4jDatabase(
            settings.neo4j_uri,
            settings.neo4j_username,
            settings.neo4j_password,
            settings.neo4j_database,
        )
        redis_client = Redis.from_url(settings.redis_url)
        chroma = ChromaDatabase(settings.chroma_path, settings.chroma_collection_name)

        await run_in_threadpool(postgres.verify_connectivity)
        await run_in_threadpool(neo4j.verify_connectivity)
        await run_in_threadpool(redis_client.ping)
        await run_in_threadpool(chroma.verify_connectivity)

        app.state.settings = settings
        app.state.postgres = postgres
        app.state.neo4j = neo4j
        app.state.redis = redis_client
        app.state.chroma = chroma
        app.state.connections_ready = True
        logger.info("All 4 databases connected successfully.")
        yield
    finally:
        app.state.connections_ready = False
        if neo4j is not None:
            await run_in_threadpool(neo4j.close)
        if postgres is not None:
            await run_in_threadpool(postgres.close)
        if redis_client is not None:
            await run_in_threadpool(redis_client.close)
        logger.info("Database connections closed.")

app = FastAPI(
    title="KSP Crime Intelligence & Analytical Platform",
    description="AI-driven intelligence, investigation, and crime analytics platform.",
    version="1.0.0",
    lifespan=lifespan,
)

# CORS configuration to allow the API Gateway to talk to this service
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, restrict this to the API gateway URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

from typing import Any, Dict
from fastapi import Depends
if __package__:
    from .api.deps import get_current_user
else:
    from api.deps import get_current_user

@app.get("/health", tags=["Health"])
async def health_check():
    """Return the API and persistence readiness state."""
    return {
        "success": True,
        "service": "ksp-crime-intelligence-api",
        "status": "up" if getattr(app.state, "connections_ready", False) else "starting",
        "databases_ready": getattr(app.state, "connections_ready", False),
    }

@app.get("/api/v1/auth/me", tags=["Auth"])
async def get_my_user_profile(user: Dict[str, Any] = Depends(get_current_user)):
    """Return the authenticated user profile information decoded from Supabase JWT."""
    return {
        "success": True,
        "user": user,
    }

@app.get("/api/v1/secure-data", tags=["Auth"])
async def get_secure_data(user: Dict[str, Any] = Depends(get_current_user)):
    """Protected endpoint demonstrating Supabase JWT Bearer token authentication."""
    return {
        "success": True,
        "message": f"Welcome, authenticated officer {user.get('email', 'User')}!",
        "user_id": user.get("user_id"),
        "role": user.get("role"),
    }

if __name__ == "__main__":
    import uvicorn
    # When running directly, start the uvicorn server
    port = int(os.getenv("PORT", 8000))
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=True)
