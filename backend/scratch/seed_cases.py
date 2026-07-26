import os
import sys
import random
import uuid
from datetime import datetime, timedelta, timezone

# Add backend directory to Python path
backend_path = r"D:/Datathon/backend"
if backend_path not in sys.path:
    sys.path.append(backend_path)

from dotenv import load_dotenv
load_dotenv(os.path.join(backend_path, ".env"))

from sqlalchemy import create_engine, delete
from sqlalchemy.orm import sessionmaker
from models.case import Case

# Define districts and mock details
districts = ["Bengaluru Urban", "Mysuru", "Hubballi-Dharwad", "Mangaluru"]

descriptions = [
    "Residential burglary reported. Thieves broke open the backdoor lock and stole gold jewelry and cash.",
    "A black Bajaj Pulsar motorcycle was stolen from outside the Jayanagar shopping complex parking lot.",
    "Two unidentified men on a motorcycle snatched a gold chain from a woman walking in the park.",
    "Commercial break-in reported at a mobile electronics store. Multiple smartphones and tablets stolen.",
    "Altercation reported between two local merchant groups, resulting in minor injuries and property damage.",
    "Phishing fraud reported. Victim was tricked into sharing bank OTP, losing a sum of INR 50,000.",
    "Suspect detained for possession and peddling of illegal drugs near the educational institution campus.",
    "Aggravated assault reported at the main vegetable market following a dispute over a loading bay space.",
    "Vandalism reported. Group of youths spray-painted the public building walls and broke window panes.",
    "Pickpocketing incident reported at a crowded bus terminus. Wallet containing cash and IDs was stolen."
]

def seed_historical_cases():
    db_url = os.getenv("DATABASE_URL")
    if not db_url:
        print("DATABASE_URL not found in environment variables.")
        sys.exit(1)
        
    engine = create_engine(db_url)
    Session = sessionmaker(bind=engine)
    session = Session()
    
    print("Deleting existing cases in PostgreSQL...")
    session.execute(delete(Case))
    session.commit()
    
    print("Generating synthetic historical crime cases...")
    
    base_time = datetime.now(timezone.utc) - timedelta(days=180)
    case_objects = []
    
    # We will generate 30 cases per district (120 cases total)
    for district in districts:
        district_prefix = district[:3].upper().replace(" ", "")
        
        for idx in range(30):
            # Stagger the dates reported over the last 180 days
            day_offset = idx * 6 + random.randint(0, 5)
            hour_offset = random.randint(0, 23)
            minute_offset = random.randint(0, 59)
            
            date_reported = base_time + timedelta(days=day_offset, hours=hour_offset, minutes=minute_offset)
            
            # Stagger status
            status = "Open"
            if idx < 15:
                status = "Closed"
            elif idx < 20:
                status = "Cold"
                
            fir_number = f"KSP/{district_prefix}/2026/{idx+1:03d}"
            desc = random.choice(descriptions)
            
            db_case = Case(
                id=uuid.uuid4(),
                fir_number=fir_number,
                date_reported=date_reported,
                district=district,
                status=status,
                description=desc,
                is_anomaly=False, # to be populated by the anomaly model later
                created_at=date_reported,
                updated_at=date_reported
            )
            case_objects.append(db_case)
            
    print(f"Adding {len(case_objects)} cases to the database...")
    session.add_all(case_objects)
    session.commit()
    
    print("Database seeding complete!")
    session.close()
    engine.dispose()

if __name__ == "__main__":
    seed_historical_cases()
