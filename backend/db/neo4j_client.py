"""Neo4j Aura driver wrapper with explicit lifecycle management."""

import logging
from neo4j import Driver, GraphDatabase
from neo4j.exceptions import BoltSecurityError, ServiceUnavailable

logger = logging.getLogger(__name__)


class Neo4jDatabase:
    """A small owner wrapper around Neo4j's thread-safe driver."""

    def __init__(self, uri: str, username: str, password: str, database: str) -> None:
        self._database = database
        self._uri = uri
        self._username = username
        self._password = password
        self._driver: Driver = self._create_driver(uri)

    def _create_driver(self, uri: str) -> Driver:
        return GraphDatabase.driver(uri, auth=(self._username, self._password))

    def verify_connectivity(self) -> None:
        """Confirm the driver can authenticate and execute a Cypher query."""
        try:
            self._driver.verify_connectivity()
        except (BoltSecurityError, ServiceUnavailable, Exception) as err:
            if "neo4j+s://" in self._uri:
                logger.warning(
                    "Strict SSL verification failed for Neo4j (%s). Retrying with self-signed certificate fallback (neo4j+ssc://)...",
                    err,
                )
                fallback_uri = self._uri.replace("neo4j+s://", "neo4j+ssc://")
                try:
                    self._driver.close()
                except Exception:
                    pass
                self._driver = self._create_driver(fallback_uri)
                self._driver.verify_connectivity()
            else:
                raise err

        with self._driver.session(database=self._database) as session:
            result = session.run("RETURN 1 AS connection_check").single()
            if result is None or result["connection_check"] != 1:
                raise RuntimeError("Neo4j connectivity check returned an unexpected result")

    def close(self) -> None:
        """Close network connections held by the Neo4j driver."""
        if hasattr(self, "_driver") and self._driver is not None:
            try:
                self._driver.close()
            except Exception:
                pass
