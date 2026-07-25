from pydantic import BaseModel, Field
from typing import List, Literal, Optional


class ExtractedEntity(BaseModel):
    """Schema representing an extracted named entity from a case diary, FIR, or crime report —
    a person (suspect/victim/witness/complainant), place, vehicle, phone, weapon, organization,
    property item, or legal provision. Works across ANY IPC/special-act crime category, not a
    single offence type."""

    id: str = Field(
        description=(
            "Unique identifier: <ENTITY_TYPE>_<CleanName>, e.g. PERSON_JohnDoe, "
            "PHONE_9988776655, LOCATION_KRPuram, VEHICLE_KA05MX1234, "
            "WEAPON_CountryMadePistol, ORGANIZATION_RowdySheeterGang, ACT_SECTION_IPC_302"
        )
    )
    entity_type: Literal[
        "PERSON",
        "LOCATION",
        "VEHICLE",
        "PHONE",
        "WEAPON",
        "ORGANIZATION",
        "PROPERTY",
        "BANK_ACCOUNT",
        "ACT_SECTION",
        "IDENTIFIER",
    ] = Field(
        description=(
            "PERSON: any human — suspect, victim, witness, complainant, absconder, or officer. "
            "LOCATION: an address, landmark, or place tied to the incident, arrest, or hideout. "
            "VEHICLE: any vehicle, with registration number if available. "
            "PHONE: a phone number. "
            "WEAPON: a weapon or tool used in the offence (firearm, knife, acid, explosive). "
            "ORGANIZATION: a named gang, syndicate, company, or group. "
            "PROPERTY: stolen, damaged, or recovered goods, cash, jewellery, drugs, or documents. "
            "BANK_ACCOUNT: a bank account, UPI ID, or card number involved in a financial crime. "
            "ACT_SECTION: a specific law/section invoked, e.g. 'IPC 302', 'NDPS Act Section 8'. "
            "IDENTIFIER: any other unique code (IMEI, email ID, social media handle, chassis number) "
            "that doesn't fit the above."
        )
    )
    name_or_value: str = Field(
        description="The clean, resolved name or value of the entity, e.g. 'John Doe', '+91 99887 76655', 'KA05MX1234'."
    )
    person_role: Optional[
        Literal["SUSPECT", "VICTIM", "WITNESS", "COMPLAINANT", "POLICE_OFFICER", "UNKNOWN"]
    ] = Field(
        default=None,
        description=(
            "Only set for entity_type=PERSON: the person's role in this case, if stated or clearly "
            "implied by the text. Leave null for every non-PERSON entity."
        ),
    )


class ExtractedRelationship(BaseModel):
    """Schema representing a network linkage between two extracted entities. The label set is
    deliberately generic so it applies to violent crime, property crime, cybercrime, narcotics,
    or any other case category without redesign."""

    source_id: str = Field(description="ID of the source entity matching an ExtractedEntity.id")
    target_id: str = Field(description="ID of the target entity matching an ExtractedEntity.id")
    relation_type: str = Field(
        description=(
            "The type of link between the two entities. Reuse a standard label below rather than "
            "inventing a new one-off phrase per case:\n"
            "  CO_CONSPIRATOR_WITH — suspects collaborating on the crime\n"
            "  COMMUNICATED_WITH   — phone/person contacted another phone/person\n"
            "  OWNS                — a person owns a phone, vehicle, bank account, or weapon\n"
            "  USED                — a suspect used a vehicle, weapon, or tool to commit the offence\n"
            "  SEEN_AT             — a person or vehicle was seen/present at a location\n"
            "  COMMITTED_AT        — the offence occurred at a location\n"
            "  ARRESTED_AT         — a suspect was arrested or surrendered at a location\n"
            "  INVOLVED_IN         — an entity is linked to the case/incident generally\n"
            "  VICTIM_OF           — a person is the victim of the crime\n"
            "  WITNESSED           — a person witnessed the incident\n"
            "  MEMBER_OF           — a person belongs to a gang or organization\n"
            "  ASSOCIATE_OF        — a general known association between two people\n"
            "  RELATED_TO          — a family or personal relationship between two people\n"
            "  TRANSACTED_WITH     — money or goods moved between a person and a bank account/person\n"
            "  RECOVERED_FROM      — stolen property or a weapon was recovered from a person/location\n"
            "  CHARGED_UNDER       — an accused person is charged under a specific ACT_SECTION"
        )
    )


class DocumentExtraction(BaseModel):
    """Master schema for structured extraction from a case diary, FIR, or police reporting note —
    covers any crime category (crimes against body, property, cybercrime, narcotics, etc.), not a
    single hardcoded offence type."""

    case_category: Optional[str] = Field(
        default=None,
        description=(
            "The crime category/sub-head this record belongs to, in standard police terminology "
            "(e.g. 'Murder', 'Robbery', 'Chain Snatching', 'Vehicle Theft', 'Cyber Fraud', "
            "'NDPS - Drug Peddling', 'Kidnapping', 'POCSO'). Infer from context; omit if genuinely "
            "unclear rather than guessing — this is later matched against CrimeHead/CrimeSubHead."
        ),
    )
    incident_date: Optional[str] = Field(
        default=None,
        description="The specific date the incident occurred, preferably in YYYY-MM-DD format if possible to infer. Leave null if not stated."
    )
    incident_time: Optional[str] = Field(
        default=None,
        description="The time or time range of day the incident occurred (e.g. '14:30', 'Late night', 'Between 2 PM and 4 PM'). Leave null if not stated."
    )
    entities: List[ExtractedEntity] = Field(
        description="List of all unique entities detected in the text, of any entity_type."
    )
    relationships: List[ExtractedRelationship] = Field(
        description="List of all unique connections discovered between the extracted entities."
    )
    modus_operandi_summary: str = Field(
        description=(
            "A clear, concise summary of the crime execution pattern (Modus Operandi) — method, "
            "tools/weapons, timing, target selection, and escape — phrased generically enough to be "
            "compared against MO summaries from other crime categories for repeat-offender matching."
        )
    )
