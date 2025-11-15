from typing import List, Optional

from pydantic import BaseModel

class Challenge(BaseModel):
    name: List[str]