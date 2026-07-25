from typing import Dict, Any
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.messages import SystemMessage, HumanMessage
import json

try:
    from core.llm_client import get_extraction_chain, get_primary_llm
    from llm.prompts import EXTRACTOR_SYSTEM_PROMPT, LINKER_SYSTEM_PROMPT
    from llm.schemas import DocumentExtraction
    from services.agent.state import AgentState
except ImportError:
    import sys
    import os
    sys.path.append(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))
    from core.llm_client import get_extraction_chain, get_primary_llm
    from llm.prompts import EXTRACTOR_SYSTEM_PROMPT, LINKER_SYSTEM_PROMPT
    from llm.schemas import DocumentExtraction
    from services.agent.state import AgentState

def extraction_node(state: AgentState) -> Dict[str, Any]:
    """
    Extracts entities and relationships from the raw text.
    """
    raw_text = state.get("raw_text", "")
    if not raw_text:
        return {"errors": ["No raw_text provided to extraction_node."]}
        
    llm_chain = get_extraction_chain()
    
    try:
        # Construct messages to send to the extraction chain
        messages = [
            SystemMessage(content=EXTRACTOR_SYSTEM_PROMPT),
            HumanMessage(content=f"Please extract information from this case file:\n\n{raw_text}")
        ]
        
        response = llm_chain.invoke(messages)
        return {"extracted_data": response, "errors": state.get("errors", [])}
    except Exception as e:
        errors = state.get("errors", [])
        errors.append(f"Extraction failed: {str(e)}")
        return {"errors": errors}

def resolution_node(state: AgentState) -> Dict[str, Any]:
    """
    Identifies and resolves duplicate entities.
    """
    extracted_data = state.get("extracted_data")
    if not extracted_data:
        return {"errors": state.get("errors", []) + ["No extracted_data available for resolution."]}
        
    llm = get_primary_llm(None) # Passing None will use default Settings inside if configured properly or we can handle it
    
    # We will pass the extracted JSON string to the LLM to resolve duplicates
    # and expect it to output a resolved DocumentExtraction.
    # To enforce the schema, we use with_structured_output again.
    resolver_chain = llm.with_structured_output(DocumentExtraction)
    
    try:
        json_data = extracted_data.model_dump_json(indent=2)
        messages = [
            SystemMessage(content=LINKER_SYSTEM_PROMPT),
            HumanMessage(content=f"Please resolve duplicate entities in this extracted data and return the cleaned graph:\n\n{json_data}")
        ]
        
        resolved_data = resolver_chain.invoke(messages)
        return {"extracted_data": resolved_data, "errors": state.get("errors", [])}
    except Exception as e:
        errors = state.get("errors", [])
        errors.append(f"Resolution failed: {str(e)}")
        # Proceed with unresolved data instead of completely failing
        return {"errors": errors, "extracted_data": extracted_data}

def mo_summary_node(state: AgentState) -> Dict[str, Any]:
    """
    Ensures that the Modus Operandi summary is present and concise.
    """
    extracted_data = state.get("extracted_data")
    if not extracted_data:
        return {"errors": state.get("errors", []) + ["No extracted_data available for MO summarization."]}
        
    # Since the structured output already extracts mo_summary in the extraction node,
    # we can validate it or do a dedicated summarization if needed.
    # We'll just verify it is present and mark the task as completed.
    if not extracted_data.modus_operandi_summary or extracted_data.modus_operandi_summary.strip() == "":
        extracted_data.modus_operandi_summary = "No specific Modus Operandi identified."
        
    return {"extracted_data": extracted_data, "is_completed": True, "errors": state.get("errors", [])}
