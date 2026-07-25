from core.celery_app import celery_app
from services.agent.graph import app as langgraph_app
from core.config import Settings
from db.neo4j_client import Neo4jDatabase
from crud.crud_graph import ingest_entities_and_relations
from db.chromadb_client import ChromaDatabase
from crud.crud_vector import add_case_to_vector_store

settings = Settings()
neo4j_db = Neo4jDatabase(
    settings.neo4j_uri,
    settings.neo4j_username,
    settings.neo4j_password,
    settings.neo4j_database,
)
chroma_db = ChromaDatabase(settings.chroma_path, settings.chroma_collection_name)

@celery_app.task(bind=True)
def process_case_file_task(self, raw_text: str, case_metadata: dict = None):
    """
    Process a case file through the LangGraph AI extraction pipeline and ingest into Neo4j.
    """
    self.update_state(state='PROCESSING', meta={'status': 'Starting AI extraction...'})
    
    try:
        # Run LangGraph pipeline
        result = langgraph_app.invoke({"raw_text": raw_text})
        
        extracted_data = result.get("extracted_data")
        entities_count = 0
        
        if extracted_data:
            self.update_state(state='PROCESSING', meta={'status': 'Ingesting Graph Data into Neo4j...'})
            ingest_entities_and_relations(neo4j_db._driver, extracted_data)
            
            self.update_state(state='PROCESSING', meta={'status': 'Generating Semantic Embeddings for ChromaDB...'})
            doc_id = add_case_to_vector_store(chroma_db, raw_text, metadata=case_metadata)
        
        if extracted_data and hasattr(extracted_data, "entities"):
            entities_count = len(extracted_data.entities)
        elif extracted_data and isinstance(extracted_data, dict) and "entities" in extracted_data:
            entities_count = len(extracted_data["entities"])
        
        return {
            "status": "success", 
            "entities_extracted": entities_count,
            "case_metadata": case_metadata or {}
        }
    except Exception as e:
        self.update_state(state='FAILURE', meta={'exc_type': type(e).__name__, 'exc_message': str(e)})
        raise e
