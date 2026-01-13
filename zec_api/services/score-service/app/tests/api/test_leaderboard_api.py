def test_leaderboard_category_endpoint(client, mock_requests):
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
                {"id": 10, "name": "Team A", "category": "close_to_series"},
                {"id": 20, "name": "Team B", "category": "advanced_class"},
            ],
        })(),
    ]
    resp = client.get("/api/leaderboard/1/category/close_to_series")
    assert resp.status_code == 200
    data = resp.json()
    assert len(data) == 1
    assert data[0]["team"]["id"] == 10
