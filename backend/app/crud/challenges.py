from sqlalchemy.orm import Session

from app.models.challenges import Challenge as model_chal
from app.schemas.challenges import Challenge as schema_chal

def get_challenges(db: Session) -> schema_chal:
    challenges = db.query(model_chal).all()

    challenge_names = []

    for challenge in challenges:
        challenge_names.append(challenge.name)

    return schema_chal(name=challenge_names)
