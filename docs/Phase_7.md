# Phase 7: Neo4j Graph Population & APIs (Detailed Implementation Guide)

## 1. Overview and Core Objectives
With the AI extracting entities asynchronously, we must now permanently store this relational data. **Neo4j** is purpose-built for this. By storing suspects, phones, and vehicles as **Nodes**, and their interactions as **Edges**, we can instantly traverse massive webs of criminality that would take thousands of complex SQL JOINs to achieve.

The goals are:
1. Update the Celery worker to push AI-extracted JSON into Neo4j using Cypher queries.
2. Build FastAPI endpoints that query Neo4j and return graph topologies.
3. Implement advanced graph algorithms like "Shortest Path".

---

## 2. Directory Structure & File Architecture

```text
Datathon/
└── backend/
    ├── crud/
    │   └── crud_graph.py    # Logic to execute Neo4j Cypher queries
    └── api/
        └── v1/
            └── graph.py     # FastAPI endpoints for the React Force Graph
```

---

## 3. Implementation Steps

### 3.1 Writing Ingestion Cypher Queries (`crud/crud_graph.py`)
Neo4j uses the Cypher query language. We use `MERGE` instead of `CREATE` to ensure we don't create duplicate nodes if a suspect already exists in the database.
- Create a function `ingest_entities_and_relations(driver, extracted_data)`.
- Open a Neo4j session: `with driver.session() as session:`
- Loop through the extracted entities:
  - `session.run("MERGE (n:Person {id: $id, name: $name})", id=entity.id, name=entity.name)`
  - Handle locations, vehicles, and phones similarly.
- Loop through relationships:
  - ```cypher
    MATCH (a {id: $source_id}), (b {id: $target_id})
    MERGE (a)-[r:RELATION_TYPE]->(b)
    ```
- **Integration:** Call this `ingest` function inside your `tasks.py` Celery worker right after LangGraph completes successfully.

### 3.2 Building the Network Retrieval API (`api/v1/graph.py`)
The React frontend (using Force Graph 2D) expects a very specific JSON format: `{ "nodes": [...], "links": [...] }`.
- Create `GET /api/v1/graph/network`.
- Execute a query to pull the graph (limit to recent or related cases to prevent overloading the browser):
  `MATCH (n)-[r]->(m) RETURN n, r, m LIMIT 500`
- Iterate through the Neo4j driver response and format it into the exact `nodes` and `links` arrays required by the frontend.
  - Link format: `{"source": "node_id_1", "target": "node_id_2", "label": "COMMUNICATED"}`

### 3.3 The Shortest Path Algorithm
One of the most powerful features for police is finding how Suspect A is connected to Suspect B.
- Create `GET /api/v1/graph/shortest-path?start={id1}&end={id2}`.
- Execute Neo4j's built-in shortest path function:
  `MATCH p=shortestPath((start {id: $id1})-[*..5]-(end {id: $id2})) RETURN p`
- Return the path sequence to the frontend to highlight the specific chain of connections on the map.

---

## 4. Key Considerations
- **Indexing:** To make `MERGE` operations fast, you must create indexes in Neo4j on your primary IDs. 
  Run this once in the Neo4j Aura console: `CREATE INDEX FOR (n:Person) ON (n.id);`
- **Data Pruning:** Ensure your retrieval API doesn't attempt to return 100,000 nodes at once. Always use `LIMIT` or filter by a specific `case_id` or `district`.

---

## 5. Definition of Done & Verification Strategy
You know Phase 7 is complete when:
1. You upload a test case file via the Celery pipeline.
2. You open the Neo4j Aura web console, run `MATCH (n) RETURN n`, and visually see the newly created suspects, phones, and their connected arrows.
3. Making a GET request to `/api/v1/graph/network` returns a properly formatted JSON dictionary with `nodes` and `links` arrays.
4. The shortest-path endpoint successfully finds indirect links (e.g., A knows B, B knows C -> Returns A-B-C).
