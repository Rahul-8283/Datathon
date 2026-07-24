from langchain_openai import ChatOpenAI
from langchain_google_genai import ChatGoogleGenerativeAI
try:
    from core.config import Settings
    from llm.schemas import DocumentExtraction
except ImportError:
    from .config import Settings
    from ..llm.schemas import DocumentExtraction

def get_primary_llm(settings: Settings) -> ChatOpenAI:
    """Initialize primary ChatOpenAI client pointing to OpenRouter Llama 3.3."""
    return ChatOpenAI(
        api_key=settings.openrouter_api_key.get_secret_value() if hasattr(settings.openrouter_api_key, 'get_secret_value') else settings.openrouter_api_key,
        base_url="https://openrouter.ai/api/v1",
        model="meta-llama/llama-3.3-70b-instruct",
        temperature=0.0,
    )

def get_fallback_llm(settings: Settings) -> ChatGoogleGenerativeAI:
    """Initialize fallback ChatGoogleGenerativeAI client pointing to Gemini 1.5 Flash."""
    return ChatGoogleGenerativeAI(
        google_api_key=settings.gemini_api_key.get_secret_value() if hasattr(settings.gemini_api_key, 'get_secret_value') else settings.gemini_api_key,
        model="gemini-1.5-flash",
        temperature=0.0,
    )

def get_extraction_chain(settings: Settings = None):
    """Return extraction chain with structured output and automatic fallback failover."""
    if settings is None:
        settings = Settings()
    
    primary_structured = get_primary_llm(settings).with_structured_output(DocumentExtraction)
    fallback_structured = get_fallback_llm(settings).with_structured_output(DocumentExtraction)
    
    # Enable fallback handling for all standard Exceptions (including auth / endpoint errors)
    return primary_structured.with_fallbacks(
        [fallback_structured], 
        exceptions_to_handle=(Exception,)
    )
