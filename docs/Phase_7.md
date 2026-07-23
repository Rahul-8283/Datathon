# Phase 7: Vector Embeddings & Semantic Search (ChromaDB)

## Objective
Enable "Google-like" semantic search across unstructured Modus Operandi (MO) notes to identify similar past crimes.

## Key Tasks
1. **Embedding Generation:**
   - Setup a text embedding model (via OpenAI/OpenRouter embeddings or a local HuggingFace model).
   - Inside the Celery task, convert the extracted MO descriptions into numerical vector embeddings.
2. **ChromaDB Storage:**
   - Upsert the generated embeddings into the ChromaDB `mo_notes` collection alongside metadata (FIR number, district).
3. **Semantic Search API:**
   - Create a FastAPI endpoint (`/api/search/mo`) that accepts a search string (e.g., "Thief entered through the roof by cutting glass").
   - Convert the search string to a vector and query ChromaDB for the Top-K nearest neighbors.
   - Return the matched historical cases.

## Deliverables
- A fully functional vector search pipeline capable of clustering behaviorally similar crimes based purely on contextual meaning, not exact keyword matches.
