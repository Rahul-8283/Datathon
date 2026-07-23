# Phase 4: AI Agent Architecture (LangGraph Setup)

## Objective
Initialize the LLM connections and define the LangGraph multi-agent pipeline responsible for unstructured data extraction.

## Key Tasks
1. **LLM Provider Setup:**
   - Configure `langchain-openai` to use the OpenRouter API key.
   - Configure `langchain-google-genai` as a fallback mechanism for the Gemini API.
2. **Agent Prompts & Schemas:**
   - Define strict Pydantic schemas for the expected output (e.g., `ExtractedEntities`, `CrimeRelationships`).
   - Write highly specific system prompts for the "Extractor" and "Linker" agents.
3. **LangGraph State & Nodes:**
   - Define the `State` dictionary for the graph (holding raw text, extracted entities, and metadata).
   - Create the individual graph nodes:
     - `extract_node`: Reads text and outputs JSON entities.
     - `resolve_node`: Deduplicates names/entities.
   - Compile the LangGraph workflow.

## Deliverables
- A functioning LangGraph pipeline that can take a raw paragraph of text (e.g., a Police Diary) and accurately return structured JSON entities.
