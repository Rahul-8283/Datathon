from typing import TypedDict, List, Optional
try:
    from llm.schemas import DocumentExtraction
except ImportError:
    import sys
    import os
    sys.path.append(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))
    from llm.schemas import DocumentExtraction

class AgentState(TypedDict):
    """
    Represents the state of our LangGraph workflow as it processes a case file.
    """
    raw_text: str
    extracted_data: Optional[DocumentExtraction]
    errors: List[str]
    is_completed: bool
