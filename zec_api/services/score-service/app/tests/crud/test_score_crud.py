import pytest
from app.crud.score import (
    get_score,
    get_scores,
    delete_score,
)
from app.exceptions.exceptions import EntityDoesNotExistError

def test_get_score(db, seeded_scores):
    score = get_score(db=db, score_id=seeded_scores[0].id)
    assert score.value == 95.0

def test_get_scores(db, seeded_scores):
    scores = get_scores(db=db)
    assert len(scores) == 2

def test_delete_score(db, seeded_scores):
    deleted = delete_score(db=db, score_id=seeded_scores[0].id)
    assert deleted.id == seeded_scores[0].id

def test_get_score_not_found(db):
    with pytest.raises(EntityDoesNotExistError):
        get_score(db=db, score_id=999)
