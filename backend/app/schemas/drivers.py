from typing import List, Optional

from pydantic import BaseModel

class Driver(BaseModel):
    driver_name: List[str]