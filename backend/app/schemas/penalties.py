from typing import List, Optional

from pydantic import BaseModel

class Penalty(BaseModel):
    category: str
    value: float