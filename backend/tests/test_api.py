import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.db import db
from app.models import GameMode

client = TestClient(app)

@pytest.fixture(autouse=True)
def reset_db():
    # Clear vital parts of DB or reset to known state
    db.users = []
    db.user_creds = {}
    db.sessions = {}
    db.leaderboard = []
    # Re-seed basic
    db.create_user("SnakeMaster", "master@snake.io", "password")

def test_health():
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json() == {"status": "ok"}

def test_auth_flow():
    # Signup
    signup_payload = {"username": "NewUser", "email": "new@test.com", "password": "securepassword"}
    response = client.post("/api/auth/signup", json=signup_payload)
    assert response.status_code == 201
    data = response.json()
    assert "token" in data
    assert data["user"]["username"] == "NewUser"
    token = data["token"]
    
    # Login
    login_payload = {"email": "new@test.com", "password": "securepassword"}
    response = client.post("/api/auth/login", json=login_payload)
    assert response.status_code == 200
    assert "token" in response.json()
    
    # Me
    response = client.get("/api/auth/me", headers={"Authorization": f"Bearer {token}"})
    assert response.status_code == 200
    assert response.json()["email"] == "new@test.com"

def test_leaderboard():
    # Submit score requires login
    login_res = client.post("/api/auth/login", json={"email": "master@snake.io", "password": "password"})
    token = login_res.json()["token"]
    
    score_payload = {"score": 500, "mode": "walls"}
    response = client.post("/api/leaderboard/", json=score_payload, headers={"Authorization": f"Bearer {token}"})
    assert response.status_code == 200
    assert response.json()["score"] == 500
    
    # Get leaderboard
    response = client.get("/api/leaderboard/")
    assert response.status_code == 200
    entries = response.json()
    assert len(entries) > 0
    assert entries[0]["score"] == 500

def test_game_highscore():
    login_res = client.post("/api/auth/login", json={"email": "master@snake.io", "password": "password"})
    token = login_res.json()["token"]
    
    # Save high score
    client.post("/api/game/highscore", json={"score": 100, "mode": "walls"}, headers={"Authorization": f"Bearer {token}"})
    
    # Get high score
    response = client.get("/api/game/highscore?mode=walls", headers={"Authorization": f"Bearer {token}"})
    assert response.status_code == 200
    assert response.json()["score"] == 100
    
    # Update higher
    client.post("/api/game/highscore", json={"score": 200, "mode": "walls"}, headers={"Authorization": f"Bearer {token}"})
    response = client.get("/api/game/highscore?mode=walls", headers={"Authorization": f"Bearer {token}"})
    assert response.json()["score"] == 200
    
    # Don't update lower
    client.post("/api/game/highscore", json={"score": 50, "mode": "walls"}, headers={"Authorization": f"Bearer {token}"})
    response = client.get("/api/game/highscore?mode=walls", headers={"Authorization": f"Bearer {token}"})
    assert response.json()["score"] == 200

def test_spectate():
    response = client.get("/api/spectate/active")
    assert response.status_code == 200
    assert isinstance(response.json(), list)
