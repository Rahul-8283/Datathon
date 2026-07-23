# Phase 2: Database & Infrastructure Provisioning

## Objective
Provision and establish connections to the four primary infrastructure components: PostgreSQL, Neo4j, ChromaDB, and Redis.

## Key Tasks
1. **Supabase (PostgreSQL):**
   - Create the Supabase project.
   - Extract the `DATABASE_URL` and `SUPABASE_URL`.
   - Setup SQLAlchemy in the backend to connect to the Postgres instance.
2. **Neo4j Aura (Graph Database):**
   - Provision a free Neo4j Aura instance.
   - Configure the Python Neo4j driver in the backend (`db/neo4j_client.py`).
   - Test basic connection ping.
3. **ChromaDB (Vector Database):**
   - Initialize a local persistent ChromaDB client in the backend.
   - Create the initial `mo_notes` collection.
4. **Upstash Redis (Message Broker):**
   - Provision an Upstash Redis database.
   - Extract the `REDIS_URL` (TCP connection string) for future Celery integration.

## Deliverables
- Verified, active connections to all four databases from the FastAPI backend.
- Database client wrapper classes built in the `backend/db/` directory.
