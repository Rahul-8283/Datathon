import requests
import jwt
from datetime import datetime, timezone, timedelta

def test_endpoints():
    # 1. Generate a mock token for development mode signature bypass
    payload = {
        "sub": "d8239260-7f2c-4625-8f97-99938c654570",
        "email": "analyst@ksp.gov.in",
        "role": "authenticated",
        "exp": int((datetime.now(timezone.utc) + timedelta(days=1)).timestamp())
    }
    mock_token = jwt.encode(payload, "dummy_secret", algorithm="HS256")
    
    headers = {
        "Authorization": f"Bearer {mock_token}"
    }
    
    base_url = "http://127.0.0.1:8000/api/v1"
    
    print("Testing manual anomaly detection trigger (POST /ml/anomalies)...")
    res = requests.post(f"{base_url}/ml/anomalies", headers=headers)
    print("Status:", res.status_code)
    if res.status_code == 200:
        anomalies = res.json()
        print(f"Success! Flagged {len(anomalies)} cases as anomalies.")
        if len(anomalies) > 0:
            print("First anomaly case example:")
            print("  FIR Number:", anomalies[0].get("fir_number"))
            print("  District:", anomalies[0].get("district"))
            print("  Description:", anomalies[0].get("description"))
    else:
        print("Error:", res.text)
        
    print("\nTesting anomaly retrieval (GET /ml/anomalies)...")
    res = requests.get(f"{base_url}/ml/anomalies", headers=headers)
    print("Status:", res.status_code)
    if res.status_code == 200:
        anomalies = res.json()
        print(f"Success! Retrieved {len(anomalies)} anomalies from Postgres.")
    else:
        print("Error:", res.text)

    print("\nTesting forecasting retrieval (GET /ml/forecast)...")
    res = requests.get(f"{base_url}/ml/forecast?district=Bengaluru Urban", headers=headers)
    print("Status:", res.status_code)
    if res.status_code == 200:
        forecast = res.json()
        print(f"Success! Retrieved {len(forecast)} forecast records.")
        print("First forecast record example:")
        print("  Date (ds):", forecast[0].get("ds"))
        print("  Predicted Volume (yhat):", forecast[0].get("yhat"))
        print("  yhat_lower:", forecast[0].get("yhat_lower"))
        print("  yhat_upper:", forecast[0].get("yhat_upper"))
    else:
        print("Error:", res.text)

if __name__ == "__main__":
    test_endpoints()
