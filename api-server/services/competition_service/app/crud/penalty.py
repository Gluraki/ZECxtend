from app.schemas.penalty import PenaltyCreate, PenaltyUpdate

from shared.crud_base import CRUDBase
from shared.models import Penalty


class CRUDPenalty(CRUDBase[Penalty, PenaltyCreate, PenaltyUpdate]):
    pass

crud_penalty = CRUDPenalty(Penalty)
