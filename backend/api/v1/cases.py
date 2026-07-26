from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List, Dict, Any
import uuid

from api.deps import get_db, get_current_user
from schemas.case import CaseCreate, CaseResponse
from crud import crud_case
from crud.crud_case import FIRConflictError

router = APIRouter(prefix="/cases", tags=["Cases"])

@router.get("/", response_model=List[CaseResponse])
def read_cases(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=500),
    db: Session = Depends(get_db),
    current_user: Dict[str, Any] = Depends(get_current_user),
):
    """Retrieve all case records with pagination. Requires token authentication."""
    return crud_case.get_cases(db, skip=skip, limit=limit)

@router.post("/", response_model=CaseResponse, status_code=status.HTTP_201_CREATED)
def create_new_case(
    case_in: CaseCreate,
    db: Session = Depends(get_db),
    current_user: Dict[str, Any] = Depends(get_current_user),
):
    """Create a new case record. Ensures FIR number is unique. Requires token authentication."""
    existing_case = crud_case.get_case_by_fir(db, fir_number=case_in.fir_number)
    if existing_case:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"A case with FIR number {case_in.fir_number} already exists.",
        )
    try:
        return crud_case.create_case(db, case_in=case_in)
    except FIRConflictError as e:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=str(e),
        )

@router.get("/{case_id}", response_model=CaseResponse)
def read_case(
    case_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: Dict[str, Any] = Depends(get_current_user),
):
    """Retrieve a specific case record by UUID. Requires token authentication."""
    db_case = crud_case.get_case(db, case_id=case_id)
    if db_case is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Case record not found.",
        )
    return db_case

@router.delete("/{case_id}", response_model=CaseResponse)
def delete_case_record(
    case_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: Dict[str, Any] = Depends(get_current_user),
):
    """Delete a specific case record. Requires token authentication."""
    db_case = crud_case.delete_case(db, case_id=case_id)
    if db_case is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Case record not found.",
        )
    return db_case
