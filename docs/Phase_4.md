# Phase 4: LLM Architecture Setup (Detailed Implementation Guide)

## 1. Overview and Core Objectives
Phase 4 lays the groundwork for the AI brain of the platform. We need to parse messy, unstructured police diaries and FIRs into clean, relational data. To do this, we rely on Large Language Models (LLMs).

Our strategy uses **OpenRouter** as the primary gateway, giving us access to powerful models (like Llama 3 or Claude 3.5) while using the OpenAI-compatible API. We also establish a **Gemini API** fallback mechanism. 

The goals of this phase are:
1. Initialize the LLM clients.
2. Define the strict Pydantic models that force the LLM to output valid JSON.
3. Craft the highly specific System Prompts required to teach the LLM how to think like a criminal intelligence analyst.

---

## 2. Directory Structure & File Architecture
We will create a dedicated `llm/` directory in the backend to manage all prompts, schemas, and API clients.

```text
Datathon/
└── backend/
    ├── core/
    │   └── llm_client.py    # Client initialization (OpenRouter & Gemini)
    └── llm/
        ├── schemas.py       # Pydantic validation models for AI output
        └── prompts.py       # System prompt strings for the agents
```

---

## 3. Implementation Steps

### 3.1 The LLM Client Wrapper (`core/llm_client.py`)
- Import `ChatOpenAI` from `langchain_openai`.
- Create a function `get_primary_llm()` that instantiates `ChatOpenAI` using `base_url="https://openrouter.ai/api/v1"` and your `OPENROUTER_API_KEY`. Set `model="meta-llama/llama-3-70b-instruct"` (or preferred model) and `temperature=0` (we want facts, not creativity).
- Import `ChatGoogleGenerativeAI` from `langchain_google_genai`.
- Create a function `get_fallback_llm()` using your `GEMINI_API_KEY`.
- Implement a `with_fallbacks` chain logic so if OpenRouter returns a 500 error or rate limit, LangChain automatically routes the request to Gemini.

### 3.2 Defining AI Output Schemas (`llm/schemas.py`)
LLMs are prone to hallucinations and malformed JSON. We must force them to adhere to a strict schema using LangChain's `with_structured_output`.
- **Entity Schema:**
  ```python
  class ExtractedEntity(BaseModel):
      id: str = Field(description="Unique identifier, e.g., Suspect_JohnDoe")
      entity_type: str = Field(description="Must be PERSON, LOCATION, VEHICLE, or PHONE")
      name_or_value: str = Field(description="The actual name or number")
  ```
- **Relationship Schema:**
  ```python
  class ExtractedRelationship(BaseModel):
      source_id: str = Field(description="ID of the source entity")
      target_id: str = Field(description="ID of the target entity")
      relation_type: str = Field(description="e.g., COMMUNICATED_WITH, SEEN_AT, CO_CONSPIRATOR")
  ```
- **Master Schema:** Create a `DocumentExtraction(BaseModel)` that holds a `List[ExtractedEntity]` and `List[ExtractedRelationship]`, plus a string for `modus_operandi_summary`.

### 3.3 Crafting the Prompts (`llm/prompts.py`)
- Write the `EXTRACTOR_SYSTEM_PROMPT`. 
  - *Example:* "You are an expert criminal intelligence analyst. Read the following police diary. Extract all suspects, victims, phones, and vehicles. You must output valid JSON matching the schema provided. Do not guess information. If a suspect has an alias, combine them."
- Write the `LINKER_SYSTEM_PROMPT`.
  - *Example:* "Review the extracted entities. Identify relationships. If Phone A was found on Suspect B, create a relationship 'OWNS_PHONE'. If Suspect A and Suspect B committed the crime together, create 'CO_CONSPIRATOR'."

### 3.4 Testing the LLM Chain
- Create a temporary script or route to pass a fake paragraph: "On Tuesday, John Doe (Ph: 555-1234) was seen fleeing 123 Main St in a red Honda Civic."
- Pass this to `get_primary_llm().with_structured_output(DocumentExtraction).invoke(...)`.
- Print the result to the console and ensure it perfectly maps to the Pydantic classes without crashing.

---

## 4. Key Considerations
- **Token Limits:** Large case files might exceed the context window. Consider implementing a chunking strategy (using LangChain's `RecursiveCharacterTextSplitter`) if you expect massive PDF uploads in the future.
- **Cost Management:** OpenRouter charges per token. Ensure your prompts are concise and you are using an appropriately sized/priced model for the task.

---

## 5. Definition of Done & Verification Strategy
You know Phase 4 is complete when:
1. You can successfully trigger an API call to OpenRouter from your backend.
2. The LLM accurately extracts entities and relationships from a test string.
3. The response is automatically parsed into Python Pydantic objects, guaranteeing the keys (like `entity_type`) are exactly what our future Neo4j ingestion script expects.
4. If you artificially break the OpenRouter key (e.g., set it to "invalid"), the Langchain fallback mechanism successfully routes the request to Gemini and succeeds.
