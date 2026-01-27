import pytest
from httpx import AsyncClient

@pytest.mark.asyncio
async def test_user_flow_integration(client: AsyncClient):
    # 1. Register a new user
    user_data = {
        "email": "integration@example.com",
        "username": "integration_user",
        "password": "strongpassword123"
    }
    response = await client.post("/api/auth/signup", json=user_data)
    assert response.status_code == 201
    data = response.json()
    assert data["user"]["email"] == user_data["email"]
    assert "token" in data

    # 2. Login
    login_data = {
        "email": "integration@example.com",
        "password": "strongpassword123"
    }
    response = await client.post("/api/auth/login", json=login_data)
    assert response.status_code == 200
    token_data = response.json()
    assert "token" in token_data
    access_token = token_data["token"]

    # 3. Access protected route (Get Current User via /me)
    headers = {"Authorization": f"Bearer {access_token}"}
    response = await client.get("/api/auth/me", headers=headers)
    assert response.status_code == 200
    me_data = response.json()
    assert me_data["email"] == user_data["email"]

    # 4. Check Leaderboard (Game endpoints might be mocked or minimal)
    # Just checking if we can access it
    response = await client.get("/api/leaderboard/")
    assert response.status_code == 200
    leaderboard = response.json()
    assert isinstance(leaderboard, list)

