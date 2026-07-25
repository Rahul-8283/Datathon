import os
from celery import Celery

try:
    from core.config import Settings
except ImportError:
    from .config import Settings

settings = Settings()

redis_url = settings.redis_url
if redis_url and redis_url.startswith("rediss://") and "ssl_cert_reqs" not in redis_url:
    redis_url += "?ssl_cert_reqs=CERT_NONE" if "?" not in redis_url else "&ssl_cert_reqs=CERT_NONE"

# Create Celery instance
celery_app = Celery(
    "datathon_worker",
    broker=redis_url,
    backend=redis_url,
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
