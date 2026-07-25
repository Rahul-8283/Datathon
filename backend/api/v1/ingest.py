from fastapi import APIRouter, UploadFile, File, HTTPException, status
from pydantic import BaseModel
from typing import Dict, Any, Optional
from worker.tasks import process_case_file_task
from celery.result import AsyncResult
from core.celery_app import celery_app

router = APIRouter(prefix="/ingest", tags=["Ingestion"])

class TaskStatusResponse(BaseModel):
    task_id: str
    status: str
    result: Optional[Dict[str, Any]] = None
    info: Optional[Dict[str, Any]] = None

@router.post("/upload", status_code=status.HTTP_202_ACCEPTED)
async def upload_case_file(file: UploadFile = File(...)):
    """
    Upload a case file for asynchronous AI extraction.
    """
    if not file.filename.endswith(('.txt', '.csv', '.md')):
        raise HTTPException(status_code=400, detail="Only .txt, .csv, or .md files are supported for now.")
    
    try:
        content = await file.read()
        raw_text = content.decode("utf-8")
    except Exception:
        raise HTTPException(status_code=400, detail="File could not be read. Ensure it is a valid text file.")
    
    metadata = {"filename": file.filename, "content_type": file.content_type}
    
    # Dispatch to Celery
    task = process_case_file_task.delay(raw_text, metadata)
    
    return {"message": "File uploaded and processing started.", "task_id": task.id}

@router.get("/status/{task_id}", response_model=TaskStatusResponse)
async def get_task_status(task_id: str):
    """
    Check the status of a Celery background task.
    """
    task_result = AsyncResult(task_id, app=celery_app)
    
    response = {
        "task_id": task_id,
        "status": task_result.state,
    }
    
    if task_result.state == "SUCCESS":
        response["result"] = task_result.result
    elif task_result.state == "FAILURE":
        response["info"] = {"error": str(task_result.info)}
    elif task_result.state == "PROCESSING":
        response["info"] = task_result.info if isinstance(task_result.info, dict) else {"details": str(task_result.info)}
        
    return response
