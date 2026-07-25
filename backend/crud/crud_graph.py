"""CRUD operations for the Neo4j Graph Database."""

from typing import Dict, Any, List
from neo4j import Driver

def ingest_entities_and_relations(driver: Driver, extracted_data) -> None:
    """
    Ingests AI-extracted entities and relationships into Neo4j using idempotent MERGE statements.
    """
    if not extracted_data:
        return
        
    with driver.session() as session:
        # Ingest Entities
        if hasattr(extracted_data, "entities") and extracted_data.entities:
            for entity in extracted_data.entities:
                label = entity.entity_type
                # Neo4j labels cannot be parameterized directly in Cypher, so we format it in.
                # Since entity_type is strictly constrained by our Pydantic Enum, this is safe from injection.
                query = f"""
                MERGE (n:{label} {{id: $id}})
                SET n.name = $name_or_value,
                    n.role = $person_role
                """
                session.run(
                    query, 
                    id=entity.id, 
                    name_or_value=entity.name_or_value, 
                    person_role=getattr(entity, "person_role", None)
                )
                
        # Ingest Relationships
        if hasattr(extracted_data, "relationships") and extracted_data.relationships:
            for rel in extracted_data.relationships:
                rel_type = rel.relation_type
                # Relationship types also cannot be parameterized, but they are Enum constrained.
                query = f"""
                MATCH (a {{id: $source_id}})
                MATCH (b {{id: $target_id}})
                MERGE (a)-[r:{rel_type}]->(b)
                """
                session.run(
                    query,
                    source_id=rel.source_id,
                    target_id=rel.target_id
                )


def get_network_graph(driver: Driver, limit: int = 500) -> Dict[str, List[Dict[str, Any]]]:
    """
    Retrieves the graph topology formatted for React Force Graph 2D.
    Returns: { "nodes": [...], "links": [...] }
    """
    query = """
    MATCH (n)-[r]->(m)
    RETURN n, r, m
    LIMIT $limit
    """
    
    nodes_dict = {}
    links = []
    
    with driver.session() as session:
        result = session.run(query, limit=limit)
        for record in result:
            n = record["n"]
            m = record["m"]
            r = record["r"]
            
            if n["id"] not in nodes_dict:
                nodes_dict[n["id"]] = {
                    "id": n["id"],
                    "name": n.get("name"),
                    "label": list(n.labels)[0] if n.labels else "Unknown",
                    "role": n.get("role")
                }
                
            if m["id"] not in nodes_dict:
                nodes_dict[m["id"]] = {
                    "id": m["id"],
                    "name": m.get("name"),
                    "label": list(m.labels)[0] if m.labels else "Unknown",
                    "role": m.get("role")
                }
                
            links.append({
                "source": n["id"],
                "target": m["id"],
                "label": r.type
            })
            
    return {
        "nodes": list(nodes_dict.values()),
        "links": links
    }


def get_shortest_path(driver: Driver, start_id: str, end_id: str) -> Dict[str, Any]:
    """
    Calculates the shortest path between two nodes up to 5 degrees of separation.
    """
    query = """
    MATCH p=shortestPath((start {{id: $start_id}})-[*..5]-(end {{id: $end_id}}))
    RETURN nodes(p) AS path_nodes, relationships(p) AS path_rels
    """
    
    with driver.session() as session:
        result = session.run(query, start_id=start_id, end_id=end_id).single()
        
        if not result:
            return {"nodes": [], "links": []}
            
        nodes_dict = {}
        links = []
        
        for n in result["path_nodes"]:
             nodes_dict[n["id"]] = {
                "id": n["id"],
                "name": n.get("name"),
                "label": list(n.labels)[0] if n.labels else "Unknown",
                "role": n.get("role")
            }
            
        for r in result["path_rels"]:
            links.append({
                "source": r.nodes[0]["id"],
                "target": r.nodes[1]["id"],
                "label": r.type
            })
            
        return {
            "nodes": list(nodes_dict.values()),
            "links": links
        }
