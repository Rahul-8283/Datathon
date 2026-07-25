import sys
import os
import json
from dotenv import load_dotenv

# Ensure the backend directory is in the python path
sys.path.append(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))

# Load environment variables
load_dotenv(os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))), '.env'))

from services.agent.graph import app
from services.agent.state import AgentState

def test_pipeline():
    sample_text = """
    FIR No: 104/2023
    Police Station: Indiranagar PS
    
    On 2023-11-05 at approximately 23:30 hours, a raid was conducted at an abandoned warehouse 
    near 100ft Road, Indiranagar. The raid targeted the notorious 'D-Company' syndicate.
    Officers apprehended the main suspect, Vikram alias 'Vicky' (Phone: 9876543210), who was found 
    in possession of 2 kilograms of cocaine and a country-made pistol. 
    During interrogation, Vicky confessed to transferring drug money to a bank account (HDFC Acc: 0123456789) 
    belonging to his associate, Ravi Kumar. 
    A black Mahindra Scorpio (KA-03-XY-9999) was seized from the location. 
    The suspects were booked under NDPS Act Section 8 and IPC 307.
    """
    
    print("--- Starting LangGraph Pipeline Test ---")
    initial_state = AgentState(
        raw_text=sample_text,
        extracted_data=None,
        errors=[],
        is_completed=False
    )
    
    try:
        final_state = app.invoke(initial_state)
        
        print("\n=== FINAL STATE ===")
        if final_state.get("errors"):
            print("Errors encountered:")
            for e in final_state["errors"]:
                print(f" - {e}")
                
        extracted = final_state.get("extracted_data")
        if extracted:
            print(f"\nCase Category: {getattr(extracted, 'case_category', 'N/A')}")
            print(f"Incident Date: {getattr(extracted, 'incident_date', 'N/A')}")
            print(f"Incident Time: {getattr(extracted, 'incident_time', 'N/A')}")
            print("\nExtracted Entities:")
            for entity in extracted.entities:
                role_str = f" (Role: {entity.person_role})" if getattr(entity, 'person_role', None) else ""
                print(f" - [{entity.entity_type}] {entity.name_or_value} (ID: {entity.id}){role_str}")
                
            print("\nExtracted Relationships:")
            for rel in extracted.relationships:
                print(f" - {rel.source_id} --[{rel.relation_type}]--> {rel.target_id}")
                
            print(f"\nModus Operandi Summary:\n {extracted.modus_operandi_summary}")
        else:
            print("No data extracted.")
            
    except Exception as e:
        print(f"Test failed with exception: {str(e)}")

if __name__ == "__main__":
    test_pipeline()
