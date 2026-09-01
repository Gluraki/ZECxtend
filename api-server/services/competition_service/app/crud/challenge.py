from app.models.challenge import Challenge
from app.schemas.challenge import ChallengeCreate, ChallengeUpdate

from shared.crud_base import CRUDBase


class CRUDChallenge(CRUDBase[Challenge, ChallengeCreate, ChallengeUpdate]):
    pass

crud_challenge = CRUDChallenge(Challenge)
