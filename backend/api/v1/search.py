from fastapi import APIRouter, Depends, Query, HTTPException, status
from typing import List, Dict, Any
from api.deps import get_current_user, get_db
from sqlalchemy.orm import Session
from crud.crud_vector import search_similar_mo

router = APIRouter(prefix="/search", tags=["Search & Discovery"])

@router.get("/mo")
def search_modus_operandi(
    query: str = Query(..., min_length=3, description="Natural language search query for MO."),
    limit: int = Query(5, ge=1, le=20, description="Number of similar cases to return."),
    db: Session = Depends(get_db),
    current_user: Dict[str, Any] = Depends(get_current_user)
) -> List[Dict[str, Any]]:
    """
    Perform a semantic similarity search across historical Modus Operandi (MO) and case diaries.
    Returns cases conceptually similar to the search query, even if keywords don't match.
    """
    try:
        results = search_similar_mo(db=db, query=query, limit=limit)
        return results
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Semantic search failed: {str(e)}"
        )
