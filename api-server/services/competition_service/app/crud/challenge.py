from app.schemas.challenge import ChallengeCreate, ChallengeUpdate

from shared.crud_base import CRUDBase
from shared.models import Challenge


class CRUDChallenge(CRUDBase[Challenge, ChallengeCreate, ChallengeUpdate]):
    pass

crud_challenge = CRUDChallenge(Challenge)
