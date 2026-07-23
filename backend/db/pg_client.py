"""Compatibility exports for the PostgreSQL connector.

Use :mod:`db.database` for new imports. This module preserves the original
project path while the Phase 1 guide's requested module name is adopted.
"""

from .database import Base, PostgreSQLDatabase

__all__ = ["Base", "PostgreSQLDatabase"]
