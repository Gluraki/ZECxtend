from datetime import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict, Field

from shared.models import ScoringType


class ChallengeBase(BaseModel):
    name: str
    max_attempts: Optional[int] = Field(None, ge=1)
    scoring_type: Optional[ScoringType] = None
    esp_mac_start1: Optional[str] = None
    esp_mac_start2: Optional[str] = None
    esp_mac_finish1: Optional[str] = None
    esp_mac_finish2: Optional[str] = None

class ChallengeCreate(ChallengeBase):
    pass

class ChallengeUpdate(BaseModel):
    name: Optional[str] = None
    max_attempts: Optional[int] = Field(None, ge=1)
    scoring_type: Optional[ScoringType] = None
    esp_mac_start1: Optional[str] = None
    esp_mac_start2: Optional[str] = None
    esp_mac_finish1: Optional[str] = None
    esp_mac_finish2: Optional[str] = None

class ChallengeResponse(ChallengeBase):
    id: int
    created_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)
