"""Neo4j Aura driver wrapper with explicit lifecycle management."""

from neo4j import Driver, GraphDatabase


class Neo4jDatabase:
    """A small owner wrapper around Neo4j's thread-safe driver."""

    def __init__(self, uri: str, username: str, password: str, database: str) -> None:
        self._database = database
        self._driver: Driver = GraphDatabase.driver(uri, auth=(username, password))

    def verify_connectivity(self) -> None:
        """Confirm the driver can authenticate and execute a Cypher query."""
        self._driver.verify_connectivity()
        with self._driver.session(database=self._database) as session:
            result = session.run("RETURN 1 AS connection_check").single()
            if result is None or result["connection_check"] != 1:
                raise RuntimeError("Neo4j connectivity check returned an unexpected result")

    def close(self) -> None:
        """Close network connections held by the Neo4j driver."""
        self._driver.close()
