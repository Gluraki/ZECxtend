from sqlalchemy.orm import Session

from app.models.teams import Team as model_team
from app.schemas.teams import Team as schema_team

def get_drivers(db: Session) -> schema_driv:
    teams = db.query(model_team).all()

    team_names = []

    for team in teams:
        team_names.append(team.name)

    return schema_team(name=team_names)
