# Phase 6: Asynchronous Ingestion Pipeline (Detailed Implementation Guide)

## 1. Overview and Core Objectives
We now have a powerful LangGraph AI pipeline capable of processing text. However, LLM calls are notoriously slow. If a user uploads a batch of 50 case files and we process them synchronously in FastAPI, the HTTP request will time out, and the React dashboard will freeze.

The solution is an **Asynchronous Job Queue**. We will use **Celery** as the task worker and **Upstash Redis** as the message broker.

The goals are:
1. Configure Celery in the FastAPI backend.
2. Wrap the LangGraph execution in a background task.
3. Build endpoints for the frontend to submit files and poll for progress.

---

## 2. Directory Structure & File Architecture

```text
Datathon/
└── backend/
    ├── core/
    │   └── celery_app.py    # Celery instance configuration
    ├── worker/
    │   └── tasks.py         # Celery task definitions
    └── api/
        └── v1/
            └── ingest.py    # Upload and Status APIs
```

---

## 3. Implementation Steps

### 3.1 Celery Configuration (`core/celery_app.py`)
- Import `Celery`.
- Instantiate the app: `celery_app = Celery("datathon_worker", broker=settings.REDIS_URL, backend=settings.REDIS_URL)`.
- Configure Celery settings (e.g., `task_serializer='json'`, `result_expires=3600`).
- Ensure Celery autodiscovers tasks in the `worker.tasks` module.

### 3.2 Defining the Background Task (`worker/tasks.py`)
- Import your compiled LangGraph `app` from Phase 5.
- Create a function decorated with `@celery_app.task(bind=True)`.
  ```python
  @celery_app.task(bind=True)
  def process_case_file_task(self, raw_text: str, case_metadata: dict):
      # 1. Update state: self.update_state(state='PROCESSING')
      # 2. Run LangGraph: result = app.invoke({"raw_text": raw_text})
      # 3. (In Phase 7, we will insert `result` into Neo4j/Postgres here)
      # 4. Return success status
      return {"status": "success", "entities_extracted": len(result["extracted_data"].entities)}
  ```

### 3.3 Building the Ingestion APIs (`api/v1/ingest.py`)
- **Upload Endpoint (`POST /api/v1/ingest/upload`):**
  - Accept a `UploadFile` (e.g., a `.txt` or `.csv` file).
  - Read the file contents into a string.
  - Dispatch the task: `task = process_case_file_task.delay(raw_text, metadata)`.
  - Immediately return an HTTP 202 Accepted response with the `task.id`.
- **Status Endpoint (`GET /api/v1/ingest/status/{task_id}`):**
  - Use `AsyncResult(task_id, app=celery_app)`.
  - Return the `task.state` (PENDING, PROCESSING, SUCCESS, FAILURE) and any `task.info` (progress updates).

### 3.4 Frontend Integration (React Upload Portal)
- On the React dashboard, build a Drag-and-Drop file uploader.
- When the user submits, make a POST request to `/upload`.
- Capture the returned `task_id`.
- Start a `setInterval` polling the `/status/{task_id}` endpoint every 2 seconds.
- Display a progress bar or spinner based on the state. When the state hits `SUCCESS`, trigger a toast notification and refresh the Cases Ledger table (from Phase 3).

---

## 4. Key Considerations
- **Running the Worker:** To actually process tasks locally, you must run the Celery worker in a separate terminal window: 
  `celery -A core.celery_app worker --loglevel=info`
- **Error Handling:** If the LLM fails completely, ensure the Celery task catches the exception and updates its state to `FAILURE` with a reason, so the frontend can display a red error toast rather than spinning infinitely.

---

## 5. Definition of Done & Verification Strategy
You know Phase 6 is complete when:
1. You can start the FastAPI server in one terminal and the Celery worker in another.
2. Uploading a file via the React dashboard instantly returns control to the user (no freezing).
3. The Celery terminal logs show the task being received, the LLM running, and the task completing.
4. The React dashboard successfully polls the status endpoint and updates the UI from "Processing" to "Complete" when Celery finishes.
