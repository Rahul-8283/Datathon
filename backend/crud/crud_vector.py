import uuid
from typing import List, Dict, Any

from langchain_huggingface import HuggingFaceEndpointEmbeddings
from core.config import Settings
from db.chromadb_client import ChromaDatabase

# Initialize the embedding model once
settings = Settings()
hf_embeddings = HuggingFaceEndpointEmbeddings(
    model="sentence-transformers/all-MiniLM-L6-v2",
    task="feature-extraction",
    huggingfacehub_api_token=settings.huggingface_api_key,
)

def add_case_to_vector_store(
    chroma_db: ChromaDatabase, 
    raw_text: str, 
    metadata: Dict[str, Any] = None
) -> str:
    """
    Generate vector embeddings for a case's raw text using Hugging Face 
    and store it in ChromaDB with a unique UUID.
    """
    if metadata is None:
        metadata = {}

    collection = chroma_db.get_or_create_mo_collection()
    
    # Generate the embedding
    embedding = hf_embeddings.embed_query(raw_text)
    
    # Generate a unique mathematical ID
    doc_id = str(uuid.uuid4())
    
    # Add to ChromaDB
    collection.add(
        documents=[raw_text],
        embeddings=[embedding],
        metadatas=[metadata],
        ids=[doc_id]
    )
    
    return doc_id

def search_similar_mo(
    chroma_db: ChromaDatabase, 
    query: str, 
    limit: int = 5
) -> List[Dict[str, Any]]:
    """
    Search ChromaDB for the most similar past cases based on natural language query.
    """
    collection = chroma_db.get_or_create_mo_collection()
    
    # Generate embedding for the search query
    query_embedding = hf_embeddings.embed_query(query)
    
    # Query ChromaDB
    results = collection.query(
        query_embeddings=[query_embedding],
        n_results=limit
    )
    
    formatted_results = []
    
    # Results is a dictionary with lists of lists (because we can pass multiple queries).
    # Since we only passed 1 query, we take the 0th index of everything.
    if results and results.get("documents") and len(results["documents"]) > 0:
        docs = results["documents"][0]
        metadatas = results["metadatas"][0]
        distances = results["distances"][0]
        ids = results["ids"][0]
        
        for i in range(len(docs)):
            formatted_results.append({
                "id": ids[i],
                "document": docs[i],
                "metadata": metadatas[i],
                "distance": distances[i]  # Lower distance means higher similarity
            })
            
    return formatted_results
