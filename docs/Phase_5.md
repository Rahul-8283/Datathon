# Phase 5: Asynchronous Job Queues (Celery + Redis)

## Objective
Offload long-running AI extraction and database ingestion tasks to a background worker to keep the FastAPI dashboard responsive.

## Key Tasks
1. **Celery Configuration:**
   - Initialize Celery in the backend (`core/celery_app.py`).
   - Set the broker and result backend to the Upstash `REDIS_URL`.
2. **Task Definition:**
   - Create a Celery task (e.g., `@celery.task def process_crime_document(text)`).
   - Wrap the LangGraph pipeline (from Phase 4) inside this Celery task.
3. **API Trigger Endpoint:**
   - Build a FastAPI endpoint (`/api/ingest/upload`) that accepts a document/CSV.
   - Configure the endpoint to dispatch the Celery task and immediately return a `task_id` to the client.
4. **Task Status Tracking:**
   - Create an endpoint (`/api/ingest/status/{task_id}`) for the frontend to poll and check if the AI processing is complete.

## Deliverables
- Background processing capabilities. The frontend can upload a heavy file without freezing the UI, while Celery processes the data asynchronously.
