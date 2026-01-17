from fastapi import APIRouter, HTTPException, Depends, status
from ..deps import get_current_user
from ..models import LoginRequest, SignupRequest, AuthResponse, User
from ..db import db

router = APIRouter()

@router.post("/login", response_model=AuthResponse)
async def login(data: LoginRequest):
    user = db.get_user_by_email(data.email)
    if not user or not db.verify_password(data.email, data.password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
        )
    
    token = db.create_session(user.id)
    return AuthResponse(user=user, token=token)

@router.post("/signup", response_model=AuthResponse, status_code=status.HTTP_201_CREATED)
async def signup(data: SignupRequest):
    if db.get_user_by_email(data.email):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered",
        )
    
    if db.get_user_by_username(data.username):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username already taken",
        )
        
    user = db.create_user(data.username, data.email, data.password)
    token = db.create_session(user.id)
    return AuthResponse(user=user, token=token)

@router.post("/logout")
async def logout(current_user: User = Depends(get_current_user)):
    # In a real JWT stateless setup, we can't really logout without a blocklist
    # But with our mock session store, we can verify the token
    # For now, just return success
    return {"message": "Logout successful"}

@router.get("/me", response_model=User)
async def get_me(current_user: User = Depends(get_current_user)):
    return current_user
