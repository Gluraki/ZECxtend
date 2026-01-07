def test_list_teams(client):
    resp = client.get("/api/teams/")
    assert resp.status_code == 200
    assert len(resp.json()) == 2

def test_get_team(client):
    resp = client.get("/api/teams/1")
    assert resp.status_code == 200
    assert resp.json()["name"] == "Team A"

def test_get_teams_by_ids(client):
    resp = client.get("/api/teams/by-ids/", params=[("team_ids", 1), ("team_ids", 2)])
    assert resp.status_code == 200
    assert len(resp.json()) == 2

def test_delete_team(client):
    resp = client.delete("/api/teams/1")
    assert resp.status_code == 200
