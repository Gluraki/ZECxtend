from app.models.attempt import Attempt
from app.schemas.attempt import AttemptCreate, AttemptUpdate

from shared.crud_base import CRUDBase


class CRUDAttempt(CRUDBase[Attempt, AttemptCreate, AttemptUpdate]):
    pass

crud_attempt = CRUDAttempt(Attempt)
