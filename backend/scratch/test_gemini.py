import sys
from pathlib import Path

backend_path = Path(__file__).resolve().parents[1]
sys.path.append(str(backend_path))

from core.config import Settings
from core.llm_client import get_fallback_llm
from llm.schemas import DocumentExtraction
from langchain_core.prompts import ChatPromptTemplate
from llm.prompts import EXTRACTOR_SYSTEM_PROMPT

test_text = "On Friday night, suspect John Doe, driving a black Jeep, was seen at KR Puram."

def test_gemini():
    print("Initializing settings...")
    settings = Settings()
    
    print("Gemini Key:", settings.gemini_api_key)
    
    print("Building fallback structured LLM...")
    llm = get_fallback_llm(settings).with_structured_output(DocumentExtraction)
    
    prompt = ChatPromptTemplate.from_messages([
        ("system", EXTRACTOR_SYSTEM_PROMPT),
        ("user", "Extract data from: {text}")
    ])
    
    chain = prompt | llm
    
    print("Invoking Gemini...")
    try:
        res = chain.invoke({"text": test_text})
        print("Success:", res)
    except Exception as e:
        print("Gemini failed:", type(e), str(e))

if __name__ == "__main__":
    test_gemini()
