# Phase 1: Database Connections & ORM Setup (Detailed Implementation Guide)

## 1. Overview and Core Objectives
Phase 1 marks the true beginning of the backend implementation for the KSP Crime Intelligence & Analytical Platform. While the environment is set up and dependencies are installed, a robust application requires rock-solid connections to its data layers before any business logic can be written. 

Our architecture leverages a **polyglot persistence strategy**, meaning we use different types of databases tailored for specific tasks:
1. **Supabase (PostgreSQL):** For relational, structured, and tabular data (e.g., standard Case FIR records, User authentication logs).
2. **Neo4j Aura:** For property graph data (e.g., modeling the complex web of relationships between suspects, phones, and locations).
3. **ChromaDB:** For vector embeddings (e.g., storing the semantic meaning of Modus Operandi descriptions for similarity searches).
4. **Upstash Redis:** As an in-memory data structure store, used primarily here as the message broker for our asynchronous Celery workers.

The goal of this phase is to write the connector classes/modules for each of these four systems, verify their health on application startup, and ensure they close connections cleanly on shutdown.

---

## 2. Directory Structure & File Architecture
You will be working primarily within the `backend/` directory. Specifically, we need to create a dedicated `db/` module to encapsulate all database logic.

```text
Datathon/
└── backend/
    ├── core/
    │   └── config.py        # Centralized Pydantic BaseSettings for Env Vars
    ├── db/
    │   ├── __init__.py
    │   ├── database.py      # SQLAlchemy setup for PostgreSQL (Supabase)
    │   ├── neo4j_client.py  # Neo4j Graph database driver wrapper
    │   └── chroma_client.py # Local persistent ChromaDB setup
    └── main.py              # FastAPI entry point with Lifespan events
```

---

## 3. Implementation Steps

### 3.1 Centralized Configuration (`core/config.py`)
Before connecting, we must securely load environment variables. 
- Use `pydantic-settings` to create a `Settings` class.
- This class will automatically read from `backend/.env` and validate that `DATABASE_URL`, `NEO4J_URI`, `NEO4J_USERNAME`, `NEO4J_PASSWORD`, and `REDIS_URL` are present.
- If a key is missing, the application should crash immediately on startup with a descriptive error, preventing silent failures later.

### 3.2 Relational Setup: PostgreSQL & SQLAlchemy (`db/database.py`)
Supabase provides a standard PostgreSQL connection string. We will use SQLAlchemy 2.0.
- **Engine Creation:** Create an async (or sync depending on preference, though async is recommended for FastAPI) SQLAlchemy `create_engine` using the `DATABASE_URL`.
- **Session Local:** Create a `sessionmaker` factory. This will be used as a FastAPI dependency (`Yield Session`) in future phases to ensure every API request gets its own database transaction that is cleanly committed or rolled back.
- **Declarative Base:** Define the `Base = declarative_base()` which our future Models (Cases, Users) will inherit from.

### 3.3 Graph Setup: Neo4j Aura (`db/neo4j_client.py`)
Neo4j requires the official `neo4j` Python driver.
- Create a `Neo4jDatabase` class.
- Implement an `__init__` method that establishes a connection using `GraphDatabase.driver(URI, auth=(USER, PASS))`.
- **Connection Verification:** Implement a `verify_connectivity()` method that runs a simple Cypher query (e.g., `RETURN 1`) to ensure the cloud Aura instance is reachable.
- **Cleanup:** Implement a `close()` method to gracefully shut down the driver to prevent socket leaks.

### 3.4 Vector Setup: ChromaDB (`db/chroma_client.py`)
Since we are using local persistent ChromaDB (no cloud API keys needed), setup is straightforward but critical for AI features.
- Import `chromadb`.
- Initialize `chromadb.PersistentClient(path="./chroma_data")`. This will create a local folder in the backend to store the vector SQLite files.
- Implement a method `get_or_create_mo_collection()` that returns the specific collection where we will eventually store Modus Operandi embeddings.

### 3.5 Broker Setup: Upstash Redis Check
While Celery will handle most Redis interactions internally, we need to ensure the connection works.
- In `main.py` (or a dedicated `core/celery_app.py`), you can instantiate a simple `redis.Redis.from_url(REDIS_URL)` to ping the Upstash server.
- This confirms that our TCP connection isn't blocked by a firewall and the password is correct before we introduce the complexity of Celery workers.

---

## 4. FastAPI Lifespan Integration (`main.py`)
FastAPI provides a `@asynccontextmanager` called `lifespan` that runs code before the server starts accepting requests, and after it shuts down.

**Startup Logic:**
1. Initialize the `Settings` class (validates `.env`).
2. Instantiate the `Neo4jDatabase` class and call `verify_connectivity()`.
3. Ping the PostgreSQL database via SQLAlchemy.
4. Ping Upstash Redis.
5. Initialize the ChromaDB client.
6. Log a success message to the console: `"All 4 Databases Connected Successfully!"`

**Shutdown Logic:**
1. Call `close()` on the Neo4j driver.
2. Dispose of the SQLAlchemy engine (`engine.dispose()`).
3. Ensure no dangling connections remain.

---

## 5. Definition of Done & Verification Strategy
You know Phase 1 is complete when you can run:
```bash
cd backend
uvicorn main.py --reload
```
And the terminal outputs a clear, error-free boot sequence indicating that all databases have responded to a ping. If you change a password in the `.env` file to something incorrect, the application should accurately catch the specific authentication error and halt. 

Once this phase is verified, the system's "memory" is fully online and ready to accept data structures in Phase 2 and 3.
