from typing import List, Optional

from pydantic import BaseModel

class Team(BaseModel):
    teams: Optional[List[str]] = None