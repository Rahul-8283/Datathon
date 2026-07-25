import os
import sys

# Ensure the backend directory is in the Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from core.config import Settings
from db.neo4j_client import Neo4jDatabase
from db.chromadb_client import ChromaDatabase
import chromadb.errors

def nuke_all_data():
    settings = Settings()
    
    print("Connecting to Neo4j...")
    neo4j_db = Neo4jDatabase(
        uri=settings.neo4j_uri,
        username=settings.neo4j_username,
        password=settings.neo4j_password,
        database=settings.neo4j_database
    )
    
    print("Deleting all nodes and relationships in Neo4j...")
    with neo4j_db._driver.session(database=neo4j_db._database) as session:
        session.run("MATCH (n) DETACH DELETE n")
    print("✅ Neo4j Knowledge Graph has been completely wiped.")
    
    print("\nConnecting to ChromaDB...")
    chroma_db = ChromaDatabase(
        path=settings.chroma_path,
        collection_name=settings.chroma_collection_name
    )
    
    print(f"Deleting ChromaDB collection: {settings.chroma_collection_name}...")
    try:
        chroma_db._client.delete_collection(settings.chroma_collection_name)
        print("✅ ChromaDB Vectors have been completely wiped.")
    except Exception as e:
        if "does not exist" in str(e).lower() or "not found" in str(e).lower():
            print("✅ ChromaDB Vectors were already empty (collection does not exist).")
        else:
            print(f"⚠️ Could not delete ChromaDB collection: {e}")

if __name__ == "__main__":
    nuke_all_data()
