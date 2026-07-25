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
    Case Report - 2023-04-15
    Incident: Vehicle Theft & Assault
    Location: 123 Main St, K.R. Puram, Bangalore
    
    On Tuesday evening, suspect J. Doe (Phone: 9988776655) was spotted near the crime scene. 
    Witnesses reported seeing John Doe fleeing the scene in a stolen red Honda Civic (KA-01-AB-1234).
    The victim, Ramesh Kumar, was assaulted and his vehicle was taken. 
    Later, we found that Ramesh's phone was also stolen. J. Doe was seen communicating with an associate 
    using the number 9988776655.
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
            print("\nExtracted Entities:")
            for entity in extracted.entities:
                print(f" - [{entity.entity_type}] {entity.name_or_value} (ID: {entity.id})")
                
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
