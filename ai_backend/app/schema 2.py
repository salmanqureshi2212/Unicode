from pydantic import BaseModel, Field
from typing import Optional

class AIResponse(BaseModel):
    damage_class: str = Field(...)
    severity: str = Field(...)
    severity_score: float = Field(..., ge=0, le=1)
    health_score: int = Field(..., ge=0, le=100)
    risk_level: str = Field(...)
    ai_suggestion: str = Field(...)
    inferred_infra_type: Optional[str]
    infra_type_mismatch: bool
