import os
from celery import Celery

try:
    from core.config import Settings
except ImportError:
    from .config import Settings

settings = Settings()

# Create Celery instance
celery_app = Celery(
    "datathon_worker",
    broker=settings.redis_url,
    backend=settings.redis_url,
    include=["worker.tasks"]
)

# Configure Celery
celery_app.conf.update(
    task_serializer="json",
    accept_content=["json"],
    result_serializer="json",
    timezone="UTC",
    enable_utc=True,
    result_expires=3600,
)
