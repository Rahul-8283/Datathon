from pydantic import BaseModel, Field
from typing import List, Literal

class ExtractedEntity(BaseModel):
    """Schema representing an extracted named entity (suspect, vehicle, address, phone number)."""
    id: str = Field(
        description="Unique identifier, e.g., Suspect_JohnDoe, Phone_9988776655, Location_KR_Puram"
    )
    entity_type: Literal["PERSON", "LOCATION", "VEHICLE", "PHONE"] = Field(
        description="Type of entity: MUST be PERSON, LOCATION, VEHICLE, or PHONE"
    )
    name_or_value: str = Field(
        description="The clean, resolved name or value of the entity (e.g. 'John Doe', '+91 99887 76655')"
    )

class ExtractedRelationship(BaseModel):
    """Schema representing a network linkage between two extracted entities."""
    source_id: str = Field(
        description="ID of the source entity matching the ExtractedEntity.id"
    )
    target_id: str = Field(
        description="ID of the target entity matching the ExtractedEntity.id"
    )
    relation_type: str = Field(
        description="The type of link, e.g., COMMUNICATED_WITH, SEEN_AT, CO_CONSPIRATOR_WITH, ASSOCIATE_OF"
    )

class DocumentExtraction(BaseModel):
    """Master schema for structured case log information extraction."""
    entities: List[ExtractedEntity] = Field(
        description="List of all unique entities detected in the text"
    )
    relationships: List[ExtractedRelationship] = Field(
        description="List of all unique connections discovered between the extracted entities"
    )
    modus_operandi_summary: str = Field(
        description="A clear, concise summary of the crime execution pattern (Modus Operandi)"
    )
