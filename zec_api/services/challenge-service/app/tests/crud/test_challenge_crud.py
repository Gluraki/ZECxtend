import pytest
from app.crud import challenge as crud
from app.schemas.challenge import ChallengeUpdate
from app.exceptions.exceptions import EntityDoesNotExistError

def test_get_challenge(db, seeded_challenges):
    challenge = crud.get_challenge(db=db, challenge_id=seeded_challenges[0].id)
    assert challenge.name == "challenge-one"

def test_get_challenge_by_name(db, seeded_challenges):
    challenge = crud.get_challenge_by_name(
        db=db,
        challenge_name="challenge-two",
    )
    assert challenge.description == "Second challenge"

def test_get_challenges(db, seeded_challenges):
    challenges = crud.get_challenges(db=db)
    assert len(challenges) == 2

def test_update_challenge(db, seeded_challenges):
    update = ChallengeUpdate(
        id=seeded_challenges[0].id,
        description="Updated description",
    )

    updated = crud.update_challenge(db=db, challenge_update=update)

    assert updated.description == "Updated description"

def test_get_challenge_not_found(db):
    with pytest.raises(EntityDoesNotExistError):
        crud.get_challenge(db=db, challenge_id=999)
