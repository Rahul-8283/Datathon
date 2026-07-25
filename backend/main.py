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
        redis_url_for_client = settings.redis_url.replace("ssl_cert_reqs=CERT_NONE", "ssl_cert_reqs=none")
        redis_client = Redis.from_url(redis_url_for_client)
        chroma = ChromaDatabase(settings.chroma_path, settings.chroma_collection_name)

        db_statuses = {}

        try:
            await run_in_threadpool(postgres.verify_connectivity)
            db_statuses["postgres"] = "connected"
            logger.info("PostgreSQL connected successfully.")
        except Exception as e:
            db_statuses["postgres"] = f"error: {e}"
            logger.warning(f"PostgreSQL connection warning: {e}")

        try:
            await run_in_threadpool(neo4j.verify_connectivity)
            db_statuses["neo4j"] = "connected"
            logger.info("Neo4j connected successfully.")
        except Exception as e:
            db_statuses["neo4j"] = f"error: {e}"
            logger.warning(f"Neo4j connection warning: {e}")

        try:
            await run_in_threadpool(redis_client.ping)
            db_statuses["redis"] = "connected"
            logger.info("Redis connected successfully.")
        except Exception as e:
            db_statuses["redis"] = f"error: {e}"
            logger.warning(f"Redis connection warning: {e}")

        try:
            await run_in_threadpool(chroma.verify_connectivity)
            db_statuses["chroma"] = "connected"
            logger.info("ChromaDB connected successfully.")
        except Exception as e:
            db_statuses["chroma"] = f"error: {e}"
            logger.warning(f"ChromaDB connection warning: {e}")

        app.state.settings = settings
        app.state.postgres = postgres
        app.state.neo4j = neo4j
        app.state.redis = redis_client
        app.state.chroma = chroma
        app.state.db_statuses = db_statuses
        app.state.connections_ready = True
        logger.info("Server startup completed. DB statuses: %s", db_statuses)
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
    from .api.v1.cases import router as cases_router
    from .api.v1.ingest import router as ingest_router
    from .api.v1.graph import router as graph_router
    from .api.v1.search import router as search_router
    from .api.v1.stats import router as stats_router
else:
    from api.deps import get_current_user
    from api.v1.cases import router as cases_router
    from api.v1.ingest import router as ingest_router
    from api.v1.graph import router as graph_router
    from api.v1.search import router as search_router
    from api.v1.stats import router as stats_router

app.include_router(cases_router, prefix="/api/v1")
app.include_router(ingest_router, prefix="/api/v1")
app.include_router(graph_router, prefix="/api/v1")
app.include_router(search_router, prefix="/api/v1")
app.include_router(stats_router, prefix="/api/v1")

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
