# Phase 9: AI Forecasting & Anomaly Detection (Detailed Implementation Guide)

## 1. Overview and Core Objectives
To transition policing from reactive to proactive, the platform must anticipate where crime will happen next. We achieve this using statistical Machine Learning models.

1. **Forecasting (Prophet):** Predict the future volume of specific crime categories in specific districts based on seasonality and historical trends.
2. **Anomaly Detection (scikit-learn):** Flag individual crimes that are statistically highly unusual (e.g., wrong time, wrong place, highly unusual MO) which often indicates serial or organized behavior.

The goal is to run these models in the background, update them periodically, and serve the results to the dashboard via FastAPI.

---

## 2. Directory Structure & File Architecture

```text
Datathon/
└── backend/
    ├── services/
    │   └── ml/
    │       ├── forecaster.py  # Prophet training and inference logic
    │       └── anomaly.py     # Isolation Forest training and scoring
    └── api/
        └── v1/
            └── ml.py          # Endpoints serving the ML results
```

---

## 3. Implementation Steps

### 3.1 Time-Series Forecasting (`services/ml/forecaster.py`)
- Pull historical case data from PostgreSQL via SQLAlchemy (e.g., group by `date` and `district`, count cases).
- Format the data into a Pandas DataFrame with two columns: `ds` (date) and `y` (count), as required by Facebook/Prophet.
- Instantiate and fit the model: `m = Prophet(); m.fit(df)`.
- Create a future dataframe for 365 days: `future = m.make_future_dataframe(periods=365)`.
- Generate the forecast: `forecast = m.predict(future)`.
- Extract the `ds`, `yhat` (predicted value), `yhat_lower`, and `yhat_upper` columns. Serialize this into JSON.

### 3.2 Anomaly Detection (`services/ml/anomaly.py`)
- We use an Unsupervised Learning model because we don't have labeled "anomaly" data.
- Fetch recent cases from Postgres.
- Convert features into a numerical matrix. For example: Convert `time_of_day` to an integer (0-23), encode `district` categorically, and use coordinate latitudes/longitudes.
- Instantiate `IsolationForest` from `sklearn.ensemble`.
- `fit_predict(matrix)`. The model returns `-1` for anomalies and `1` for normal cases.
- Update the `Case` record in Postgres, setting a boolean flag `is_anomaly = True` for the outliers.

### 3.3 Serving the Data (`api/v1/ml.py`)
- **GET `/api/v1/ml/forecast?district={district}`**: Returns the Prophet forecast JSON array.
- **GET `/api/v1/ml/anomalies`**: Queries Postgres for all cases where `is_anomaly == True` and returns them in a list for the frontend ticker feed.

### 3.4 Automated Retraining (Celery Beat)
- Crime trends shift daily. A model trained a month ago is stale.
- Use `celery-beat` (a scheduler for Celery) to trigger a retrain task every night at 3:00 AM.
- The task should pull the latest DB rows, run the `Prophet.fit()` and `IsolationForest.fit()` pipelines, and cache the new forecast results in Upstash Redis so the API can serve them instantly the next day.

---

## 4. Key Considerations
- **Dependencies:** `Prophet` and `scikit-learn` are heavy libraries. Ensure they are installed correctly in your backend environment (they were added in the previous requirements update).
- **Cold Start:** If the database has fewer than ~30 days of case data, Prophet will struggle to find seasonal trends. You may need to write a script to insert synthetic historical data for testing purposes.

---

## 5. Definition of Done & Verification Strategy
You know Phase 9 is complete when:
1. You can hit the `/forecast` endpoint and receive a JSON array projecting crime numbers into the future.
2. The Celery Beat scheduler successfully triggers the retraining job automatically.
3. Cases that have extreme or weird data points are successfully flagged as anomalies in the database and appear on the anomaly API feed.
