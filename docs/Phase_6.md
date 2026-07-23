# Phase 6: Graph Database Ingestion (Neo4j Linkages)

## Objective
Translate the structured data extracted by the AI agents into a complex web of nodes and relationships inside Neo4j.

## Key Tasks
1. **Graph Queries (Cypher):**
   - Write parameterized Cypher queries to `MERGE` (create or update) nodes: `Person`, `Location`, `Vehicle`, `Phone`.
   - Write Cypher queries to `MERGE` relationships: `COMMUNICATED_WITH`, `INVOLVED_IN_CASE`, `OWNED_VEHICLE`.
2. **Pipeline Integration:**
   - Update the Celery worker task to push the extracted entities into Neo4j using the defined Cypher queries.
3. **Graph Retrieval APIs:**
   - Build a FastAPI endpoint (`/api/graph/network`) that queries Neo4j and returns a JSON structure formatted specifically for frontend visualization (nodes array, links array).
   - Implement the "Shortest Path" Cypher query endpoint to find links between two specific suspects.

## Deliverables
- A populated Neo4j database reflecting the intricate criminal networks derived from uploaded documents.
- API endpoints capable of serving graph data to the frontend.
