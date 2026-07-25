from core.celery_app import celery_app
from services.agent.graph import app as langgraph_app

@celery_app.task(bind=True)
def process_case_file_task(self, raw_text: str, case_metadata: dict = None):
    """
    Process a case file through the LangGraph AI extraction pipeline.
    """
    self.update_state(state='PROCESSING', meta={'status': 'Starting AI extraction...'})
    
    try:
        # Run LangGraph pipeline
        result = langgraph_app.invoke({"raw_text": raw_text})
        
        extracted_data = result.get("extracted_data")
        entities_count = 0
        
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
