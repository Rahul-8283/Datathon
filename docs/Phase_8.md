# Phase 8: Machine Learning & Predictive Modeling

## Objective
Implement statistical and machine learning models to forecast future crime trends and detect anomalous cases.

## Key Tasks
1. **Time-Series Forecasting (Prophet):**
   - Create a Python service that aggregates historical case data by date and district from PostgreSQL.
   - Train a `Prophet` model on this aggregated data to project case volumes for the next 12 months.
   - Expose the forecast via a FastAPI endpoint (`/api/ml/forecast`).
2. **Anomaly Detection (scikit-learn):**
   - Implement an Isolation Forest or DBSCAN algorithm.
   - Feed it features (time of day, location coordinates, crime category).
   - Flag cases that score high as outliers (anomalies).
3. **Automation:**
   - Schedule a Celery Beat task to retrain/update these models nightly based on new cases uploaded that day.

## Deliverables
- Predictive analytics endpoints serving JSON data representing future trend lines and flagged anomaly incidents.
