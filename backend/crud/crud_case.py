import uuid
from typing import List, Optional
from sqlalchemy.orm import Session
from sqlalchemy import select

from models.case import Case
from schemas.case import CaseCreate

def get_case(db: Session, case_id: uuid.UUID) -> Optional[Case]:
    """Retrieve a single case by its UUID primary key."""
    return db.scalar(select(Case).where(Case.id == case_id))

def get_case_by_fir(db: Session, fir_number: str) -> Optional[Case]:
    """Retrieve a case by its unique KSP FIR registration number."""
    return db.scalar(select(Case).where(Case.fir_number == fir_number))

def get_cases(db: Session, skip: int = 0, limit: int = 100) -> List[Case]:
    """Retrieve a list of cases with pagination."""
    return list(db.scalars(select(Case).offset(skip).limit(limit).order_by(Case.created_at.desc())).all())

def create_case(db: Session, case_in: CaseCreate) -> Case:
    """Create a new case in the database."""
    db_obj = Case(
        fir_number=case_in.fir_number,
        date_reported=case_in.date_reported,
        district=case_in.district,
        status=case_in.status,
        description=case_in.description,
    )
    db.add(db_obj)
    db.commit()
    db.refresh(db_obj)
    return db_obj

def delete_case(db: Session, case_id: uuid.UUID) -> Optional[Case]:
    """Delete a case by its UUID primary key."""
    db_obj = get_case(db, case_id)
    if db_obj:
        db.delete(db_obj)
        db.commit()
    return db_obj
