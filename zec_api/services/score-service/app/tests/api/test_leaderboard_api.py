def test_leaderboard_endpoint(client, mock_requests):
    mock_requests.get.side_effect = [
        type("Resp", (), {
            "status_code": 200,
            "json": lambda: [
                {"id": 1, "team_id": 10},
                {"id": 2, "team_id": 20},
            ],
        })(),
        # teams
        type("Resp", (), {
            "status_code": 200,
            "json": lambda: [
                {"id": 10, "name": "Team A"},
                {"id": 20, "name": "Team B"},
            ],
        })(),
    ]

    resp = client.get("/api/leaderboard/1")
    assert resp.status_code == 200
    assert len(resp.json()) == 2
