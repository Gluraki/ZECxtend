import pytest
from app.crud.team import (
    get_team,
    get_teams,
    get_teams_by_ids,
    delete_team,
)
from app.exceptions.exceptions import EntityDoesNotExistError

def test_get_team(db, seeded_data):
    team = seeded_data["teams"][0]
    fetched = get_team(db=db, team_id=team.id)
    assert fetched.name == team.name

def test_list_teams(db, seeded_data):
    teams = get_teams(db=db)
    assert len(teams) == 2

def test_get_teams_by_ids(db, seeded_data):
    ids = {t.id for t in seeded_data["teams"]}
    teams = get_teams_by_ids(db=db, team_ids=ids)
    assert len(teams) == 2

def test_delete_team(db, seeded_data):
    team = seeded_data["teams"][0]
    deleted = delete_team(db=db, team_id=team.id)
    assert deleted.id == team.id

def test_get_team_not_found(db):
    with pytest.raises(EntityDoesNotExistError):
        get_team(db=db, team_id=999)
