"""API endpoints for dashboard statistics."""
from typing import Dict, Any
from fastapi import APIRouter, Depends, Request
from sqlalchemy.orm import Session
from sqlalchemy import select, func
from neo4j import Driver

from api.deps import get_db, get_neo4j, get_current_user
from models.case import Case

router = APIRouter(prefix="/stats", tags=["stats"])

@router.get("/overview", response_model=Dict[str, Any])
def get_overview_stats(
    request: Request,
    db: Session = Depends(get_db),
    driver: Driver = Depends(get_neo4j),
    user: Dict[str, Any] = Depends(get_current_user)
):
    """
    Retrieve statistics for the Command Centre Overview Dashboard.
    """
    # 1. Total cases from PostgreSQL
    cases_logged = db.scalar(select(func.count()).select_from(Case)) or 0
    
    # 2. Total entities from Neo4j
    network_entities = 0
    neo4j_db_name = getattr(request.app.state.settings, "neo4j_database", "neo4j") if hasattr(request.app, "state") and hasattr(request.app.state, "settings") else "neo4j"
    
    try:
        with driver.session(database=neo4j_db_name) as session:
            result = session.run("MATCH (n) RETURN count(n) AS c")
            record = result.single()
            if record:
                network_entities = record["c"]
    except Exception as e:
        # If Neo4j isn't properly connected or queried, fail gracefully for stats
        pass
            
    return {
        "cases_logged": cases_logged,
        "network_entities": network_entities,
        "active_alerts": 8,  # Mock for predictive engine phase
        "high_risk_zones": 14, # Mock for geospatial engine phase
        "weekly_signal": [44, 52, 48, 61, 56, 72, 69, 82, 76, 91, 84, 96]
    }
