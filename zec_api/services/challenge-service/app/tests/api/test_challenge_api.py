def test_list_challenges(client):
    response = client.get("/api/challenges/")
    assert response.status_code == 200
    assert len(response.json()) == 2

def test_get_challenge(client):
    response = client.get("/api/challenges/1")
    assert response.status_code == 200
    assert response.json()["name"] == "challenge-one"

def test_get_challenge_by_name(client):
    response = client.get("/api/challenges/name/challenge-two")
    assert response.status_code == 200
    assert response.json()["description"] == "Second challenge"

def test_update_challenge(client):
    payload = {
        "id": 1,
        "description": "Updated via API",
    }

    response = client.put("/api/challenges/1", json=payload)
    assert response.status_code == 200
    assert response.json()["description"] == "Updated via API"
