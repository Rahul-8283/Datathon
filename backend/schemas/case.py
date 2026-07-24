from datetime import datetime
from typing import Optional
from uuid import UUID
from pydantic import BaseModel, ConfigDict, Field

class CaseBase(BaseModel):
    fir_number: str = Field(..., description="Unique KSP FIR registration number", min_length=1)
    date_reported: datetime = Field(..., description="Timestamp of when the incident was reported")
    district: str = Field(..., description="District jurisdiction name", min_length=1)
    status: str = Field("Open", description="Incident status: Open, Closed, or Cold")
    description: Optional[str] = Field(None, description="Detailed case notes or narrative")

class CaseCreate(CaseBase):
    pass

class CaseResponse(CaseBase):
    id: UUID
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)
