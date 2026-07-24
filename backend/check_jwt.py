import jwt

token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind5a256Zmp5bmJhaHVoZ3ZlaHViIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NDc3OTEyNCwiZXhwIjoyMTAwMzU1MTI0fQ.HH_HwPKOZbHvBqbIV4J9ibVxYPUm4LJ321gvyiiAxBg"

try:
    decoded = jwt.decode(token, "DATATHON", algorithms=["HS256"])
    print("MATCH: Signed with DATATHON")
    
    # Generate anon key
    payload = {
        "iss": "supabase",
        "ref": "wyknzfjynbahuhgvehkb",
        "role": "anon",
        "iat": 1784779124,
        "exp": 2100355124
    }
    anon_key = jwt.encode(payload, "DATATHON", algorithm="HS256")
    print(f"ANON_KEY: {anon_key}")
except Exception as e:
    print("NO MATCH:", e)
