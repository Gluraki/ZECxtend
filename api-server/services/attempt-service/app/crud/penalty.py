from app.models.penalty import Penalty
from app.schemas.penalty import PenaltyCreate, PenaltyUpdate

from shared.crud_base import CRUDBase


class CRUDPenalty(CRUDBase[Penalty, PenaltyCreate, PenaltyUpdate]):
    pass

crud_penalty = CRUDPenalty(Penalty)
