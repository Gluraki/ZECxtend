from app.crud.leaderboard import get_leaderboard

def test_get_leaderboard(db, seeded_scores, mock_requests):
    mock_requests.get.side_effect = [
        type("Resp", (), {
            "status_code": 200,
            "json": lambda: [
                {"id": 1, "team_id": 10},
                {"id": 2, "team_id": 20},
            ],
        })(),
        type("Resp", (), {
            "status_code": 200,
            "json": lambda: [
                {"id": 10, "name": "Team A"},
                {"id": 20, "name": "Team B"},
            ],
        })(),
    ]

    leaderboard = get_leaderboard(db=db, challenge_id=1)

    assert len(leaderboard) == 2
    assert leaderboard[0].score.value >= leaderboard[1].score.value
