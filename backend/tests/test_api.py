import pytest
from app.schemas import GameMode

# All tests in this file are async
pytestmark = pytest.mark.asyncio

async def test_health(client):
    response = await client.get("/health")
    assert response.status_code == 200
    assert response.json() == {"status": "ok"}

async def test_auth_flow(client):
    # Signup
    signup_payload = {"username": "NewUser", "email": "new@test.com", "password": "securepassword"}
    response = await client.post("/api/auth/signup", json=signup_payload)
    assert response.status_code == 201
    data = response.json()
    assert "token" in data
    assert data["user"]["username"] == "NewUser"
    token = data["token"]
    
    # Login
    login_payload = {"email": "new@test.com", "password": "securepassword"}
    response = await client.post("/api/auth/login", json=login_payload)
    assert response.status_code == 200
    assert "token" in response.json()
    
    # Me
    response = await client.get("/api/auth/me", headers={"Authorization": f"Bearer {token}"})
    assert response.status_code == 200
    assert response.json()["email"] == "new@test.com"

async def test_leaderboard(client):
    # Setup user
    signup_payload = {"username": "Leader", "email": "leader@test.com", "password": "password"}
    login_res = await client.post("/api/auth/signup", json=signup_payload)
    token = login_res.json()["token"]
    
    score_payload = {"score": 500, "mode": "walls"}
    response = await client.post("/api/leaderboard/", json=score_payload, headers={"Authorization": f"Bearer {token}"})
    assert response.status_code == 200
    assert response.json()["score"] == 500
    
    # Get leaderboard
    response = await client.get("/api/leaderboard/")
    assert response.status_code == 200
    entries = response.json()
    assert len(entries) > 0
    assert entries[0]["score"] == 500

async def test_game_highscore(client):
    signup_payload = {"username": "Gamer", "email": "gamer@test.com", "password": "password"}
    login_res = await client.post("/api/auth/signup", json=signup_payload)
    token = login_res.json()["token"]
    
    # Save high score
    await client.post("/api/game/highscore", json={"score": 100, "mode": "walls"}, headers={"Authorization": f"Bearer {token}"})
    
    # Get high score
    response = await client.get("/api/game/highscore?mode=walls", headers={"Authorization": f"Bearer {token}"})
    assert response.status_code == 200
    assert response.json()["score"] == 100
    
    # Update higher
    await client.post("/api/game/highscore", json={"score": 200, "mode": "walls"}, headers={"Authorization": f"Bearer {token}"})
    response = await client.get("/api/game/highscore?mode=walls", headers={"Authorization": f"Bearer {token}"})
    assert response.json()["score"] == 200
    
    # Don't update lower
    await client.post("/api/game/highscore", json={"score": 50, "mode": "walls"}, headers={"Authorization": f"Bearer {token}"})
    response = await client.get("/api/game/highscore?mode=walls", headers={"Authorization": f"Bearer {token}"})
    assert response.json()["score"] == 200

async def test_spectate(client):
    # Active players are currently mocked in CRUD and not persisted, testing the endpoint return
    response = await client.get("/api/spectate/active")
    assert response.status_code == 200
    assert isinstance(response.json(), list)
