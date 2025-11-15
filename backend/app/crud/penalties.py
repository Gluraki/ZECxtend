from sqlalchemy.orm import Session

from app.models.penalties import Penalty as model_penal
from app.schemas.penalties import Penalty as schema_penal

def get_penalties(db: Session) -> list[schema_penal]:
    penalties = db.query(model_penal).all()

    penalties_lst = []

    for penalty in penalties:
        penalties_lst.append(schema_penal(
            category = penalties.category,
            value = penalties.value,

        ))

    return penalties_lst
