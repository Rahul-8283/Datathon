"""API endpoints for the Neo4j Graph Database."""

from typing import Dict, Any, List
from fastapi import APIRouter, Depends, Query
from neo4j import Driver

from api.deps import get_neo4j, get_current_user
from crud.crud_graph import get_network_graph, get_shortest_path

router = APIRouter(prefix="/graph", tags=["graph"])

@router.get("/network", response_model=Dict[str, List[Dict[str, Any]]])
def read_network_graph(
    limit: int = Query(500, description="Maximum number of relationships to return"),
    driver: Driver = Depends(get_neo4j),
    user: Dict[str, Any] = Depends(get_current_user)
):
    """
    Retrieve the full network graph topology (limited for performance).
    Returns a dictionary with 'nodes' and 'links' formatted for the React Force Graph 2D.
    """
    return get_network_graph(driver=driver, limit=limit)


@router.get("/shortest-path", response_model=Dict[str, List[Dict[str, Any]]])
def read_shortest_path(
    start: str = Query(..., description="ID of the starting node"),
    end: str = Query(..., description="ID of the ending node"),
    driver: Driver = Depends(get_neo4j),
    user: Dict[str, Any] = Depends(get_current_user)
):
    """
    Calculate the shortest relationship path between two entity nodes up to 5 degrees of separation.
    Returns the path as a sub-graph dictionary with 'nodes' and 'links'.
    """
    return get_shortest_path(driver=driver, start_id=start, end_id=end)
