from fastapi import APIRouter, Depends, Query, HTTPException, status
from sqlalchemy.orm import Session
from redis import Redis
from typing import List, Dict, Any

from api.deps import get_db, get_redis, get_current_user
from services.ml.forecaster import get_forecast
from services.ml.anomaly import run_anomaly_detection
from schemas.case import CaseResponse
from sqlalchemy import select
from models.case import Case

router = APIRouter(prefix="/ml", tags=["Machine Learning Predictions"])

@router.get("/forecast", response_model=List[Dict[str, Any]])
def get_district_volume_forecast(
    district: str = Query(..., description="The name of the district for the forecasting model."),
    db: Session = Depends(get_db),
    redis_client: Redis = Depends(get_redis),
    current_user: Dict[str, Any] = Depends(get_current_user)
) -> List[Dict[str, Any]]:
    """
    Retrieve 30-day time-series case volume forecast for a specific district.
    Utilizes Prophet for projection and caches results in Redis.
    """
    try:
        forecast_data = get_forecast(db=db, redis_client=redis_client, district=district)
        return forecast_data
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Forecasting model execution failed: {str(e)}"
        )

@router.get("/anomalies", response_model=List[CaseResponse])
def get_flagged_anomalies(
    db: Session = Depends(get_db),
    current_user: Dict[str, Any] = Depends(get_current_user)
) -> List[Case]:
    """
    Query PostgreSQL to retrieve all historical cases that have been flagged as statistically anomalous.
    """
    try:
        stmt = select(Case).where(Case.is_anomaly == True).order_by(Case.date_reported.desc())
        anomalies = list(db.scalars(stmt).all())
        return anomalies
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to query database for anomalies: {str(e)}"
        )

@router.post("/anomalies", response_model=List[CaseResponse])
def run_anomaly_analysis(
    db: Session = Depends(get_db),
    current_user: Dict[str, Any] = Depends(get_current_user)
) -> List[Case]:
    """
    Manually trigger the Isolation Forest anomaly detection training and scoring pipeline.
    Re-evaluates all cases in the database and updates their `is_anomaly` flags in Postgres.
    """
    try:
        anomalies = run_anomaly_detection(db=db)
        return anomalies
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Anomaly detection pipeline execution failed: {str(e)}"
        )
