import pytest
from app.crud import attempt as crud
from app.schemas.attempt import AttemptCreate, AttemptUpdate
from app.exceptions.exceptions import EntityDoesNotExistError

def test_get_attempt(db, seeded_attempts):
    attempt = crud.get_attempt(db=db, attempt_id=seeded_attempts[0].id)
    assert attempt.team_id == 1

def test_get_attempts(db, seeded_attempts):
    attempts = crud.get_attempts(db=db)
    assert len(attempts) == 3

def test_get_attempts_for_challenge(db, seeded_attempts):
    attempts = crud.get_attempts_for_challenge(db=db, challenge_id=1)
    assert len(attempts) == 3

def test_fastest_attempt(db, seeded_attempts):
    attempt = crud.get_fastest_attempt(db=db, challenge_id=1)
    assert attempt.end_time - attempt.start_time == min(
        a.end_time - a.start_time for a in seeded_attempts
    )

def test_fastest_attempt_for_team(db, seeded_attempts):
    attempt = crud.get_fastest_attempt_for_team(db=db, team_id=1, challenge_id=1)
    assert attempt.team_id == 1

def test_least_energy_attempt(db, seeded_attempts):
    attempt = crud.get_least_energy_attempt(db=db, challenge_id=1)
    assert attempt.energy_used == 30

def test_delete_attempt(db, seeded_attempts):
    deleted = crud.delete_attempt(db=db, attempt_id=seeded_attempts[0].id)
    assert deleted.id == seeded_attempts[0].id
    with pytest.raises(EntityDoesNotExistError):
        crud.get_attempt(db=db, attempt_id=deleted.id)
