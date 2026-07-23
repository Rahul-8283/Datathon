# Technical Requirements Document (TRD)
## AI-Driven Crime Analytics & Visualization Platform

### 1. System Architecture Overview
The platform uses a decoupled, 4-tier architecture designed for high scalability, asynchronous processing, and real-time visualization.

1.  **Ingestion & ETL Tier:** FastAPI gateway routing uploads to a LangGraph multi-agent pipeline, orchestrated asynchronously by Celery and Upstash Redis.
2.  **Data Storage Tier:** Polyglot persistence strategy using PostgreSQL (relational), Neo4j (graph), and ChromaDB (vector).
3.  **Analytics & ML Tier:** Python-based forecasting and clustering jobs running via background Celery tasks.
4.  **Client Tier:** React 19 Single Page Application (SPA) providing an interactive, data-dense HUD.

### 2. Technology Stack
*   **Frontend:** React (v19) with TypeScript, Vite, Tailwind CSS (v4), Zustand (state management), Leaflet (geospatial), React Force Graph 2D (network mapping), Recharts.
*   **Backend Framework:** FastAPI, Uvicorn, Pydantic, Python 3.10+.
*   **Task Queue:** Celery with Upstash Redis (Broker & Backend).
*   **Databases:**
    *   **Supabase PostgreSQL:** Stores primary tabular records (cases, user profiles, system audits).
    *   **Neo4j Aura (Cloud):** Stores property graphs for entity link analysis (suspects, victims, phones).
    *   **ChromaDB (Local Persistent):** Stores vector embeddings of Modus Operandi (MO) for semantic search.
*   **AI & ML Models:**
    *   **Agent Pipeline:** LangGraph orchestrating `langchain-openai` (OpenRouter API) with a fallback to `langchain-google-genai` (Gemini API).
    *   **Forecasting:** Prophet (Time-series prediction).
    *   **Clustering / Anomalies:** scikit-learn (Isolation Forests, K-Means), PyTorch (advanced neural net operations if required), Pandas/NumPy.

### 3. Database Strategy & Schema

#### 3.1 Relational Schema (PostgreSQL)
*   **Tables:** `Users` (Auth), `Cases` (FIR No, Date, District, Status), `Audit_Logs`.
*   **Interface:** Accessed via SQLAlchemy ORM (async preferred) or direct `psycopg2`.

#### 3.2 Graph Schema (Neo4j)
*   **Nodes:** `Person` (Suspect/Victim), `Location`, `Vehicle`, `Phone`, `Case`.
*   **Edges:** `INVOLVED_IN`, `COMMUNICATED_WITH`, `SEEN_AT`, `CO_CONSPIRATOR`.
*   **Algorithms:** PageRank (identifying key influencers), Shortest Path (linking two suspects).

#### 3.3 Vector Schema (ChromaDB)
*   **Collections:** `mo_notes` (Embeddings of case descriptions, tags, and Modus Operandi).
*   **Usage:** Nearest-neighbor searches to cluster similar unsolved cases to known offender profiles.

### 4. API & Integration Strategy
*   **LLM Gateway:** OpenRouter serves as the primary endpoint due to model flexibility (e.g., Llama 3, Claude 3.5). The system is configured to auto-retry via Gemini API if rate limits or latency thresholds are breached.
*   **Authentication:** Managed via Supabase Auth (JWT based), supporting standard Email/Password and Google OAuth. The FastAPI backend verifies the JWT on protected endpoints.
*   **Endpoints (RESTful):**
    *   `/api/v1/auth/` - Token validation.
    *   `/api/v1/cases/` - CRUD for cases.
    *   `/api/v1/graph/` - Network traversal queries.
    *   `/api/v1/ml/` - Forecasts and anomaly triggers.
    *   `/api/v1/ingest/` - Triggers the Celery ETL task.

### 5. Asynchronous Pipeline (Celery + Upstash Redis)
*   **Flow:** 
    1.  User uploads a bulk case file via frontend.
    2.  FastAPI accepts the file, saves it to a temp buffer, and pushes an `extract_entities` task to Upstash Redis.
    3.  Celery worker picks up the task, invokes LangGraph agents (Extractor -> Linker -> Embedder), and pushes data to Postgres, Neo4j, and ChromaDB sequentially.
    4.  FastAPI polls or uses WebSockets to notify the frontend upon task completion.

### 6. Security Requirements
*   **Environment Variables:** All secrets (Supabase Keys, Neo4j Passwords, Upstash URLs, LLM Keys) strictly managed via `.env` files and `pydantic-settings`. Never committed to version control.
*   **Data Masking:** PII (Personally Identifiable Information) must be masked based on the user's role (e.g., Analysts see aggregated data; only specific Investigating Officers see plain-text names).
*   **CORS:** Strictly limited to the frontend's deployed origins.
