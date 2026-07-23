"""Synchronous SQLAlchemy setup for the Supabase PostgreSQL database."""

from collections.abc import Generator
from contextlib import contextmanager

from sqlalchemy import Engine, create_engine, text
from sqlalchemy.orm import DeclarativeBase, Session, sessionmaker


class Base(DeclarativeBase):
    """Base class for relational models introduced in later phases."""


class PostgreSQLDatabase:
    """Owns the SQLAlchemy engine and request-scoped session factory."""

    def __init__(self, database_url: str) -> None:
        self.engine: Engine = create_engine(database_url, pool_pre_ping=True)
        self.SessionLocal = sessionmaker(
            bind=self.engine,
            autocommit=False,
            autoflush=False,
            expire_on_commit=False,
        )

    def verify_connectivity(self) -> None:
        """Raise when PostgreSQL cannot execute a minimal query."""
        with self.engine.connect() as connection:
            connection.execute(text("SELECT 1"))

    @contextmanager
    def session(self) -> Generator[Session, None, None]:
        """Provide a transaction-safe session for non-request callers."""
        db_session = self.SessionLocal()
        try:
            yield db_session
            db_session.commit()
        except Exception:
            db_session.rollback()
            raise
        finally:
            db_session.close()

    def close(self) -> None:
        """Release all pooled PostgreSQL connections."""
        self.engine.dispose()
