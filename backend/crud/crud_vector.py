import uuid
from typing import List, Dict, Any

from langchain_huggingface import HuggingFaceEndpointEmbeddings
from sqlalchemy.orm import Session
from sqlalchemy import select

from core.config import Settings
from models.document import DocumentEmbedding

# Initialize the embedding model once
settings = Settings()
hf_embeddings = HuggingFaceEndpointEmbeddings(
    model="sentence-transformers/all-MiniLM-L6-v2",
    task="feature-extraction",
    huggingfacehub_api_token=settings.huggingface_api_key,
)

def add_case_to_vector_store(
    db: Session,
    raw_text: str, 
    metadata: Dict[str, Any] = None
) -> str:
    """
    Generate vector embeddings for a case's raw text using Hugging Face 
    and store it in PostgreSQL via pgvector, replacing ChromaDB.
    """
    if metadata is None:
        metadata = {}

    # Generate the embedding
    embedding = hf_embeddings.embed_query(raw_text)
    
    # Generate a unique mathematical ID
    doc_id = uuid.uuid4()
    
    # Save to Postgres
    new_doc = DocumentEmbedding(
        id=doc_id,
        content=raw_text,
        meta_data=metadata,
        embedding=embedding
    )
    db.add(new_doc)
    db.commit()
    
    return str(doc_id)

def search_similar_mo(
    db: Session,
    query: str, 
    limit: int = 5
) -> List[Dict[str, Any]]:
    """
    Search PostgreSQL for the most similar past cases using pgvector cosine distance.
    """
    # Generate embedding for the search query
    query_embedding = hf_embeddings.embed_query(query)
    
    # Query Postgres using pgvector cosine_distance (<=> operator)
    distance_expr = DocumentEmbedding.embedding.cosine_distance(query_embedding)
    
    rows = db.execute(
        select(DocumentEmbedding, distance_expr.label('distance'))
        .order_by(distance_expr)
        .limit(limit)
    ).all()
    
    formatted_results = []
    
    for row in rows:
        doc_obj = row.DocumentEmbedding
        distance = row.distance
        
        formatted_results.append({
            "id": str(doc_obj.id),
            "document": doc_obj.content,
            "metadata": doc_obj.meta_data or {},
            "distance": distance
        })
            
    return formatted_results
