import sys
from pathlib import Path

# Add backend directory to sys.path to enable imports
backend_path = Path(__file__).resolve().parents[1]
sys.path.append(str(backend_path))

from core.config import Settings
from core.llm_client import get_extraction_chain
from llm.prompts import EXTRACTOR_SYSTEM_PROMPT
from langchain_core.prompts import ChatPromptTemplate

test_text = """
On Friday night, suspect John Doe, driving a black Jeep with registration plate KA-03-MM-5678, 
was seen at the robbery location KR Puram by victim Alice Smith. John Doe called co-conspirator Bob Jones 
using the phone number +91 9900887766 to coordinate their escape.
"""

def test_extraction():
    print("Initializing settings...")
    settings = Settings()
    
    print("Building extraction chain...")
    chain = get_extraction_chain(settings)
    
    prompt = ChatPromptTemplate.from_messages([
        ("system", EXTRACTOR_SYSTEM_PROMPT),
        ("user", "Extract data from: {text}")
    ])
    
    full_chain = prompt | chain
    
    print("\n--- Invoking Extraction Chain (Success Path - OpenRouter) ---")
    try:
        result = full_chain.invoke({"text": test_text})
        print("\nExtracted Entities:")
        for e in result.entities:
            print(f" - ID: {e.id} | Type: {e.entity_type} | Value: {e.name_or_value}")
        print("\nExtracted Relationships:")
        for r in result.relationships:
            print(f" - {r.source_id} --({r.relation_type})--> {r.target_id}")
        print(f"\nModus Operandi Summary:\n{result.modus_operandi_summary}")
    except Exception as e:
        print("Extraction failed on OpenRouter path:", e)

    print("\n--- Testing Fallback Path (Invalid OpenRouter Key -> Gemini Failover) ---")
    # Clone settings and force invalid OpenRouter key to trigger fallback
    settings_fallback = Settings()
    settings_fallback.openrouter_api_key = "sk-or-v1-invalid-key-to-trigger-fallback-execution-test"
    
    fallback_chain = get_extraction_chain(settings_fallback)
    full_fallback_chain = prompt | fallback_chain
    
    try:
        fallback_result = full_fallback_chain.invoke({"text": test_text})
        print("\nFallback Extracted Entities (Gemini):")
        for e in fallback_result.entities:
            print(f" - ID: {e.id} | Type: {e.entity_type} | Value: {e.name_or_value}")
        print("\nFallback Extracted Relationships (Gemini):")
        for r in fallback_result.relationships:
            print(f" - {r.source_id} --({r.relation_type})--> {r.target_id}")
        print(f"\nFallback Modus Operandi Summary (Gemini):\n{fallback_result.modus_operandi_summary}")
    except Exception as e:
        print("Failover test failed:", e)

if __name__ == "__main__":
    test_extraction()
