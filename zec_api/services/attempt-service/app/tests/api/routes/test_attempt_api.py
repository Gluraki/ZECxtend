def test_list_attempts(client):
    response = client.get("/api/attempts/")
    assert response.status_code == 200
    assert len(response.json()) == 3

def test_get_attempt(client):
    response = client.get("/api/attempts/1")
    assert response.status_code == 200
    assert response.json()["team_id"] == 1

def test_get_attempts_per_challenge(client):
    response = client.get("/api/attempts/challenges/1")
    assert response.status_code == 200
    assert len(response.json()) == 3

def test_fastest_attempt(client):
    response = client.get("/api/attempts/fast/", params={"challenge_id": 1})
    assert response.status_code == 200
    assert "id" in response.json()

def test_fastest_attempt_per_team(client):
    response = client.get(
        "/api/attempts/fast/per-team/",
        params={"challenge_id": 1, "team_id": 1},
    )
    assert response.status_code == 200
    assert response.json()["team_id"] == 1
