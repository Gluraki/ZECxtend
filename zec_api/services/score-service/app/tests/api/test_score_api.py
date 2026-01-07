def test_list_scores(client):
    resp = client.get("/api/scores/")
    assert resp.status_code == 200
    assert len(resp.json()) == 2

def test_get_score(client):
    resp = client.get("/api/scores/1")
    assert resp.status_code == 200
    assert resp.json()["value"] == 95.0

def test_delete_score(client):
    resp = client.delete("/api/scores/1")
    assert resp.status_code == 200
