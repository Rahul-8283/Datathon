"""Persistent local ChromaDB storage for semantic MO matching."""

from pathlib import Path

import chromadb
from chromadb.api import ClientAPI
from chromadb.api.models.Collection import Collection


class ChromaDatabase:
    """Owns the local persistent Chroma client and MO collection access."""

    def __init__(self, path: Path | str, collection_name: str = "modus_operandi") -> None:
        self._path = Path(path)
        self._collection_name = collection_name
        self._client: ClientAPI = chromadb.PersistentClient(path=str(self._path))

    def verify_connectivity(self) -> None:
        """Verify that the local vector store is responsive."""
        self._client.heartbeat()

    def get_or_create_mo_collection(self) -> Collection:
        """Return the collection used to store Modus Operandi embeddings."""
        return self._client.get_or_create_collection(
            name=self._collection_name,
            metadata={"description": "Modus Operandi semantic embeddings"},
        )
