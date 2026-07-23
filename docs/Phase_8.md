# Phase 8: ChromaDB Semantic Search & MO Clustering (Detailed Implementation Guide)

## 1. Overview and Core Objectives
Traditional databases require exact keyword matches (e.g., searching for "crowbar"). But criminals often use different tools or the police diary uses different phrasing (e.g., "pried open with a metal bar"). 

We solve this using **Vector Embeddings**. By converting the Modus Operandi (MO) textual descriptions into numerical vectors (arrays of floats), we can use **ChromaDB** to perform mathematical nearest-neighbor searches. This allows the system to find behaviorally similar cases based on *semantic meaning*.

The goals are:
1. Generate embeddings for the MO summaries during the Celery pipeline.
2. Store these embeddings in local ChromaDB.
3. Create an API that takes a user's natural language search and returns similar historical cases.

---

## 2. Directory Structure & File Architecture

```text
Datathon/
└── backend/
    ├── crud/
    │   └── crud_vector.py   # Logic to upsert and query ChromaDB
    └── api/
        └── v1/
            └── search.py    # Semantic search FastAPI endpoints
```

---

## 3. Implementation Steps

### 3.1 Generating Embeddings
- You need an embedding model. If using OpenAI via OpenRouter is not feasible for embeddings, use `langchain-google-genai` (Google's embedding models) or a local sentence-transformer model (e.g., `all-MiniLM-L6-v2` via HuggingFace).
- In your Celery task (`tasks.py`), after LangGraph generates the `modus_operandi_summary`, pass that string to the embedding model to get a vector (e.g., a 384-dimensional list of floats).

### 3.2 Upserting into ChromaDB (`crud/crud_vector.py`)
- Import the ChromaDB client initialized in Phase 1.
- Access the `mo_notes` collection.
- Use the `collection.upsert()` method:
  - `ids`: The `case_id`.
  - `embeddings`: The vector array you just generated.
  - `documents`: The original raw MO text.
  - `metadatas`: A dictionary containing `{ "district": "Bangalore", "date": "2023-10-01" }`.

### 3.3 Building the Semantic Search API (`api/v1/search.py`)
- Create `GET /api/v1/search/mo`.
- Accept a query parameter `q` (e.g., `?q=thief disabled the cctv and entered through roof`).
- Pass the query `q` through the *exact same* embedding model used in step 3.1 to convert the search text into a vector.
- Call `collection.query()` on ChromaDB, passing the query vector and `n_results=5`.
- Return the list of matched `case_ids` and their distances (similarity scores) to the frontend.

### 3.4 Frontend Integration
- Build a "Semantic MO Search" bar component on the React dashboard.
- When the user searches, hit the `/api/v1/search/mo` endpoint.
- Display the top 5 most similar historical cases as interactive cards. This allows detectives to instantly see if a new crime matches the signature of past unsolved crimes.

---

## 4. Key Considerations
- **Persistent Storage:** Ensure ChromaDB is configured to save to a local directory (e.g., `./chroma_data`) in your FastAPI root. If you use the in-memory client, all your vectors will be deleted every time the FastAPI server restarts.
- **Embedding Model Consistency:** You **must** use the same model to generate the database embeddings as you use to generate the search query embeddings. Mixing models will result in completely random search results.

---

## 5. Definition of Done & Verification Strategy
You know Phase 8 is complete when:
1. Processing a case via Celery successfully writes a new vector into the local ChromaDB `mo_notes` collection without crashing.
2. You can send a natural language query to the search endpoint.
3. The endpoint returns historically relevant cases that do *not* necessarily share exact keywords with the search query, proving that semantic vector distance is working.
