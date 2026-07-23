# KSP Crime Intelligence & Analytical Platform
### AI-Driven Crime Analytics & Visualization Platform for the Karnataka State Police (SCRB)

This platform transforms static, siloed Excel sheets and manual records into a state-of-the-art, proactive Strategic Intelligence Hub. It leverages multi-agent graph database ingestion, geospatial spatiotemporal clustering, sociological correlation, and advanced criminal network link analysis.

<div align="center">

[![React](https://img.shields.io/badge/react-%2320232a.svg?style=for-the-badge&logo=react&logoColor=%2361DAFB)](https://react.dev/) [![TypeScript](https://img.shields.io/badge/typescript-%23007acc.svg?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/) [![TailwindCSS](https://img.shields.io/badge/tailwindcss-%2338B2AC.svg?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/) [![Leaflet](https://img.shields.io/badge/Leaflet-%23199900.svg?style=for-the-badge&logo=leaflet&logoColor=white)](https://leafletjs.com/) [![D3.js](https://img.shields.io/badge/d3.js-%23F9A03F.svg?style=for-the-badge&logo=d3.js&logoColor=white)](https://d3js.org/) [![FastAPI](https://img.shields.io/badge/FastAPI-%23005571.svg?style=for-the-badge&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/) [![LangGraph](https://img.shields.io/badge/LangGraph-%23121011.svg?style=for-the-badge&logo=chainlink&logoColor=white)](https://github.com/langchain-ai/langgraph) [![Celery](https://img.shields.io/badge/Celery-%2337814A.svg?style=for-the-badge&logo=celery&logoColor=white)](https://docs.celeryq.dev/) [![Redis](https://img.shields.io/badge/redis-%23DD0031.svg?style=for-the-badge&logo=redis&logoColor=white)](https://redis.io/) [![Upstash](https://img.shields.io/badge/Upstash-00E9A3?style=for-the-badge&logo=upstash&logoColor=white)](https://upstash.com/) [![PostgreSQL](https://img.shields.io/badge/postgres-%23316194.svg?style=for-the-badge&logo=postgresql&logoColor=white)](https://www.postgresql.org/) [![Neo4j](https://img.shields.io/badge/Neo4j-%23008CC1.svg?style=for-the-badge&logo=neo4j&logoColor=white)](https://neo4j.com/) [![Supabase](https://img.shields.io/badge/Supabase-%233ECF8E.svg?style=for-the-badge&logo=supabase&logoColor=white)](https://supabase.com/) [![ChromaDB](https://img.shields.io/badge/ChromaDB-%23FC8019.svg?style=for-the-badge)](https://www.trychroma.com/) [![PyTorch](https://img.shields.io/badge/PyTorch-%23EE4C2C.svg?style=for-the-badge&logo=pytorch&logoColor=white)](https://pytorch.org/) [![scikit-learn](https://img.shields.io/badge/scikit--learn-%23F7931E.svg?style=for-the-badge&logo=scikit-learn&logoColor=white)](https://scikit-learn.org/) [![Pandas](https://img.shields.io/badge/pandas-%23150458.svg?style=for-the-badge&logo=pandas&logoColor=white)](https://pandas.pydata.org/) [![NumPy](https://img.shields.io/badge/numpy-%23013243.svg?style=for-the-badge&logo=numpy&logoColor=white)](https://numpy.org/)

</div>

---

## 🏛️ Architecture Overview & How We Solve It

The solution breaks down the traditional "independent silos" of police data through a 4-tiered architecture:

```mermaid
graph TD
    %% Ingestion Layer
    A[Excel/CSV/Police Diaries] -->|Uploaded to FastAPI| B[Multi-Agent ETL Pipeline: LangGraph]
    B -->|Agent 1: Entity & MO Extractor| C[Structured CSV Data]
    B -->|Agent 2: Network Resolver| D[Entity Connections Graph]
    B -->|Agent 3: Embeddings Generator| E[Semantic Search Vectorizer]

    %% Data Sync Layer
    C -->|Store Relational Data| F[(Supabase PostgreSQL)]
    D -->|Store Graph Network| G[(Neo4j Aura)]
    E -->|Store Text Embeddings| H[(Pinecone Local / VectorDB)]

    %% Analytics & ML Layer
    F & G & H -->|Scheduled Ingestion / Queue| I[Celery Async Tasks]
    I -->|Time-Series Forecasting| J[Prophet Model]
    I -->|Anomaly Outlier Detection| K[PyTorch / scikit-learn]
    I -->|MO Behavioral Clustering| L[K-Means / DBSCAN]

    %% API Gateway & Auth
    F & G & H & J & K & L -->|API endpoints| M[FastAPI Gateway]
    N[Supabase Auth / Google OAuth] -->|Access Security| M

    %% Frontend Visualization
    M -->|JSON APIs / WebSockets| O[React + TS Client]
    O -->|Interactive Choropleth & Heatmap| P[Leaflet / Mapbox]
    O -->|Suspect Relationship Graph| Q[React Force Graph 2D]
    O -->|AI Predictions & Correlations| R[Recharts / D3.js]
```

### 1. Ingestion Layer: Multi-Agent ETL Pipeline (LangGraph & FastAPI)
- **The Process:** Police diaries, case files, and Excel records are uploaded to the platform. 
- **The AI Resolver:** A LangGraph multi-agent system runs sequentially:
  - **Extractor Agent:** Parses unstructured texts to extract entities: suspects, victims, phone numbers, vehicles, addresses, date/time, and Modus Operandi (MO).
  - **Linker Agent:** Resolves entity duplicates and connects records (e.g., matching a phone number found in one file to a suspect mentioned in another).
  - **Geocoding Agent:** Translates location notes into coordinates for mapping.
- **LLM Strategy:** The system utilizes **OpenRouter** as the primary API gateway for LLM operations. In case of network latency, rate limit errors, or API outages, the system automatically triggers a fallback to the **Gemini API** to maintain uninterrupted processing.
- **Async Execution:** Heavy extraction tasks are offloaded to **Celery** via Redis queues to keep the FastAPI dashboard highly responsive.

### 2. Relational & Network Link Analysis Database Hub (Supabase PostgreSQL & Neo4j Aura)
- **Supabase PostgreSQL:** Stores the primary relational schema (Case details, District demographics, User audits, and logs).
- **Neo4j Aura:** Maps relationships as nodes and edges.
  - Nodes: `Suspect`, `Victim`, `Location`, `Vehicle`, `Phone`, `Case`.
  - Edges: `CO_CONSPIRATOR_WITH`, `COMMUNICATED_WITH`, `SEEN_AT`, `VICTIM_OF`, `INVOLVED_IN`.
  - **Network Calculations:** We run PageRank and Centrality algorithms to isolate ring-leaders, and Shortest-Path algorithms to display the exact linkage path between any two suspects in seconds.
- **Pinecone Local:** Modus Operandi descriptions are vectorized (via OpenRouter/Gemini Embeddings) and stored in Pinecone to query similar cases semantically.

### 3. Geospatial & Spatiotemporal Visualization (React, Tailwind CSS & Leaflet)
- **District-Level Drill-down:** A custom interactive choropleth map styled with Tailwind CSS overlays Karnataka's districts. Clicking on a district drills down into sub-stations and local case lists.
- **Spatiotemporal Hotspots:** Users adjust a time-slider (hour of day/day of week) to dynamically filter Leaflet heatmaps. This reveals shifting patterns (e.g., commercial thefts peaking between 1:00 AM – 4:00 AM in specific markets).
- **Emerging Spikes:** A statistical pipeline compares weekly crime rates against a 3-year moving historical average. If a category spikes, it triggers a red-pulsing warning on the map for that district.

### 4. Sociological & AI-Driven Predictive Analytics (PyTorch, Prophet, scikit-learn)
- **Future Crime Forecasting:** Uses **Prophet** to train on historical crime logs and project case volumes per district and category 12 months into the future.
- **Socioeconomic Correlations:** Overlays crime maps with local socio-economic indicators (urbanization %, literacy rate, poverty index). The system computes Pearson correlations and draws scatterplots showing the "why" behind the "where".
- **Anomaly Detection:** An outlier model (via Isolation Forests) flags cases that break patterns (e.g., a crime committed with an unusual tool or at a highly anomalous location/time), signaling potential serial offenses.

---

## 🛠 Complete Tech Stack

| Component | Technology | Description |
| :--- | :--- | :--- |
| **Frontend** | **React (v19) + TypeScript** | Client-side reactive application shell. |
| | **Tailwind CSS** | Premium dark-themed HUD console, glassmorphism, responsive components. |
| | **Leaflet / Mapbox** | Dynamic geospatial mapping, heatmaps, and coordinate plotting. |
| | **React Force Graph 2D (D3)** | Physics-directed network visualization of criminal nodes. |
| | **Recharts** | Interactive statistics, forecasts, and correlation charts. |
| | **Zustand** | Light, efficient global state management. |
| **Backend** | **FastAPI (Python)** | High-performance asynchronous API gateway. |
| | **LangGraph** | Orchestrates the multi-agent ETL pipeline for case data. |
| | **Celery + Redis** | Asynchronous background processing for ETL and ML tasks. |
| | **OpenRouter / Gemini (Fallback)** | Primary/secondary LLM integration powering text reasoning & parsing agent pipelines. |
| **Database** | **PostgreSQL (Supabase)** | Core system logs, user schemas, and tabular crime files. |
| | **Neo4j Aura** | Graph database for suspect networks and link analysis. |
| | **Pinecone (Local)** | Semantic search vector database for MO notes. |
| **Auth** | **Supabase Auth / Google OAuth** | Secure role-based dashboard access control. |
| **AI/ML** | **Prophet** | Time-series forecasting for predicting crime trends. |
| | **scikit-learn / PyTorch** | Anomaly detection and behavioral clustering. |
| | **Pandas / NumPy** | Statistical operations, cleaning, and matrix manipulations. |

---

## 📂 Project Structure

```
Datathon/
├── backend/
│   ├── api/             # API Router endpoints (auth, crimes, graph, prediction)
│   ├── core/            # System config, security, environment configurations
│   ├── db/              # Postgres (SQLAlchemy), Neo4j drivers, Pinecone connections
│   ├── llm/             # LangGraph definitions, agent prompts, and models
│   ├── models/          # Pydantic schemas & SQLAlchemy models
│   ├── services/        # ML Forecasting, Anomaly calculations, and ETL processing
│   ├── main.py          # FastAPI application entry point
│   ├── Dockerfile       # Container setup for production FastAPI
│   └── requirements.txt # Python package dependencies
│
├── frontend/
│   ├── public/          # Static assets and maps
│   ├── src/
│   │   ├── components/  # Layouts (Sidebar, Header) and Visual cards
│   │   ├── pages/       # Dashboard screens (Overview, Geo, Network, Predictions)
│   │   ├── services/    # API, Neo4j, and Supabase client connectors
│   │   ├── store/       # Zustand state management
│   │   ├── index.css    # Global CSS definitions & Tailwind imports
│   │   ├── App.tsx      # Core SPA layout
│   │   └── main.tsx     # React rendering target
│   ├── package.json     # Node script definitions & dependencies
│   ├── vite.config.ts   # Build tool configurations
│   └── Dockerfile       # Nginx production deployment setup
│
└── README.md            # Project main documentation (This file)
```

---

## ⚡ Getting Started

### ⚙️ Environment Configurations

Create a `.env` file in both the `backend/` and `frontend/` directories matching these templates:

#### Backend (`backend/.env.example`)
```env
PORT=8000

SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-never-share
DATABASE_URL=postgresql://postgres:[YOUR-PASSWORD]@db.your-project-id.supabase.co:5432/postgres

NEO4J_URI=bolt://localhost:7687
NEO4J_USERNAME=neo4j
NEO4J_PASSWORD=your_neo4j_password
NEO4J_DATABASE=neo4j

CHROMA_DATABASE=Datathon

REDIS_URL=rediss://default:your_password@your-upstash-endpoint:6379

OPENROUTER_API_KEY=sk-or-v1-...
GEMINI_API_KEY=your_gemini_api_key
```

#### Frontend (`frontend/.env.example`)
```env
# --- Frontend Environment Variables ---

# API Gateway URLs
VITE_API_DEV_URL=http://127.0.0.1:8000
VITE_API_PRO_URL=https://project_name.onrender.com

# Execution Mode (development | production)
VITE_MODE=development

# WebSocket URL for real-time updates
VITE_WS_URL=ws://localhost:4000

# Supabase Auth & Database (Public Keys)
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-public-anon-key
```

### Prerequisites
- Python 3.10+
- Node.js 18+
- Redis (for Celery)

### 1. Setting up the Backend
1. Navigate to the backend folder:
   ```bash
   cd backend
   ```
2. Create and activate a virtual environment:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```
3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Copy the environment template and fill in keys (Supabase, Neo4j Aura, OpenRouter/Gemini):
   ```bash
   cp .env.example .env
   ```
5. Start the FastAPI development server:
   ```bash
   uvicorn main.py --reload
   ```

### 2. Setting up the Frontend
1. Navigate to the frontend folder:
   ```bash
   cd ../frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Copy environment template:
   ```bash
   cp .env.example .env
   ```
4. Start the Vite React development server:
   ```bash
   npm run dev
   ```

---

## 📡 Key Intelligence Dashboard Tabs
1. **Command Center:** Real-time summary metrics, alert ticker feeds, and pulsing district risk indicators.
2. **Geospatial Analytics:** Dynamic Map plotting hotspots based on active filters, time slider, and socio-demographic overlays.
3. **Criminological Link Analysis:** Dynamic draggable network graph showcasing offender associations. Clicking on nodes opens profiles with their Modus Operandi timeline. Includes the "Shortest Path" relationship finder.
4. **AI Predictive Forecasting:** Interactive forecast curves for future crimes alongside NLP-grouped MO clusters and anomaly outlier flags.
5. **Cases Ledger:** Table of all logged cases with multi-column filtering and an input portal to report new incidents, dynamically triggering network mapping and forecasting updates.
