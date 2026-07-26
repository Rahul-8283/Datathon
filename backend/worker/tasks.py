from core.celery_app import celery_app
from services.agent.graph import app as langgraph_app
from core.config import Settings
from db.neo4j_client import Neo4jDatabase
from crud.crud_graph import ingest_entities_and_relations
from crud.crud_vector import add_case_to_vector_store
from db.database import PostgreSQLDatabase

settings = Settings()
neo4j_db = Neo4jDatabase(
    settings.neo4j_uri,
    settings.neo4j_username,
    settings.neo4j_password,
    settings.neo4j_database,
)
postgres_db = PostgreSQLDatabase(settings.database_url)

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
            
            self.update_state(state='PROCESSING', meta={'status': 'Generating Semantic Embeddings for pgvector...'})
            with postgres_db.session() as db:
                doc_id = add_case_to_vector_store(db, raw_text, metadata=case_metadata)
        
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


from services.ml.forecaster import generate_prophet_forecast
from services.ml.anomaly import run_anomaly_detection
from redis import Redis
from sqlalchemy import select, distinct
from models.case import Case
import json

from celery.utils.log import get_task_logger

logger = get_task_logger(__name__)

@celery_app.task(bind=True)
def retrain_ml_models_task(self):
    """
    Background worker task to retrain the forecasting and anomaly detection models.
    Updates cache in Redis and scores database cases for anomalies.
    """
    logger.info("Starting background ML models retraining task...")
    
    postgres_db = PostgreSQLDatabase(settings.database_url)
    
    # 1. Retrain Anomaly Detection
    logger.info("Running Isolation Forest anomaly detection pipeline...")
    with postgres_db.session() as db:
        try:
            run_anomaly_detection(db)
            logger.info("Anomaly detection completed successfully.")
        except Exception as e:
            logger.error(f"Failed to run anomaly detection: {e}", exc_info=True)
            
    # 2. Retrain Forecasting per District
    logger.info("Generating forecasts for all unique districts...")
    # Clean Redis client url
    redis_url_for_client = settings.redis_url.replace("ssl_cert_reqs=CERT_NONE", "ssl_cert_reqs=none")
    redis_client = Redis.from_url(redis_url_for_client)
    
    with postgres_db.session() as db:
        try:
            # Query all unique districts
            stmt = select(distinct(Case.district))
            districts = db.scalars(stmt).all()
            
            for district in districts:
                logger.info(f"Retraining Prophet model for district: {district}")
                # Generate new forecast
                forecast_data = generate_prophet_forecast(db, district)
                # Store in Redis
                cache_key = f"forecast:{district}"
                redis_client.setex(cache_key, 86400, json.dumps(forecast_data))
                
            logger.info(f"Successfully generated forecasts for {len(districts)} districts.")
        except Exception as e:
            logger.error(f"Failed to run forecasting models: {e}", exc_info=True)
        finally:
            redis_client.close()
            
    postgres_db.close()
    return {"status": "success"}
