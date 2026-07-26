import logging
from typing import List
from sqlalchemy.orm import Session
from sqlalchemy import select

try:
    import pandas as pd
    from sklearn.ensemble import IsolationForest
except Exception:
    pd = None
    IsolationForest = None

from models.case import Case

logger = logging.getLogger(__name__)

def run_anomaly_detection(db: Session) -> List[Case]:
    """
    Run the Isolation Forest anomaly detection algorithm on all logged cases.
    Identifies the top ~10% anomalous cases and updates their is_anomaly flag in the DB.
    Returns the list of cases flagged as anomalies.
    """
    # 1. Fetch all cases
    stmt = select(Case)
    cases = list(db.scalars(stmt).all())
    
    if len(cases) < 5:
        logger.info(f"Insufficient cases in database ({len(cases)} cases) to perform anomaly detection. Min 5 required.")
        return []

    # 2. Extract features
    data = []
    for case in cases:
        # Convert date to features
        hour = case.date_reported.hour
        day_of_week = case.date_reported.weekday()
        desc_len = len(case.description) if case.description else 0
        
        data.append({
            "id": case.id,
            "hour": hour,
            "day_of_week": day_of_week,
            "district": case.district,
            "desc_len": desc_len
        })
        
    df = pd.DataFrame(data)
    
    # 3. Categorical encoding for district jurisdiction name
    df["district_cat"] = df["district"].astype("category").cat.codes
    
    # 4. Define features matrix
    X = df[["hour", "day_of_week", "district_cat", "desc_len"]]
    
    try:
        # 5. Fit Isolation Forest model
        # contamination=0.1 means we target ~10% outliers
        clf = IsolationForest(contamination=0.1, random_state=42)
        df["anomaly_score"] = clf.fit_predict(X)
        
        # IsolationForest output: -1 for anomalies, 1 for normal
        anomalies_count = 0
        for _, row in df.iterrows():
            case_id = row["id"]
            is_anomaly = bool(row["anomaly_score"] == -1)
            
            # Find and update the SQLAlchemy case object
            db_case = db.get(Case, case_id)
            if db_case:
                db_case.is_anomaly = is_anomaly
                if is_anomaly:
                    anomalies_count += 1
                    
        db.commit()
        logger.info(f"Anomaly detection complete. Flagged {anomalies_count} cases out of {len(cases)} total cases.")
        
    except Exception as e:
        logger.error(f"Error executing anomaly detection algorithm: {e}", exc_info=True)
        db.rollback()
        
    # 6. Retrieve and return all cases currently marked as anomalies
    anomaly_stmt = select(Case).where(Case.is_anomaly == True).order_by(Case.date_reported.desc())
    return list(db.scalars(anomaly_stmt).all())
