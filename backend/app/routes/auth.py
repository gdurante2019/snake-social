from fastapi import APIRouter, HTTPException, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession
from ..deps import get_current_user, get_db, oauth2_scheme
from ..schemas import LoginRequest, SignupRequest, AuthResponse, User, ResetPasswordRequest
from .. import crud

router = APIRouter()

@router.post("/login", response_model=AuthResponse)
async def login(data: LoginRequest, db: AsyncSession = Depends(get_db)):
    user = await crud.get_user_by_email(db, data.email)
    # Simple password check (plaintext as per migration plan/legacy)
    if not user or user.hashed_password != data.password:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
        )
    
    token = await crud.create_session(db, user.id)
    return AuthResponse(user=user, token=token)

@router.post("/signup", response_model=AuthResponse, status_code=status.HTTP_201_CREATED)
async def signup(data: SignupRequest, db: AsyncSession = Depends(get_db)):
    if await crud.get_user_by_email(db, data.email):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered",
        )
    
    if await crud.get_user_by_username(db, data.username):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username already taken",
        )
        
    user = await crud.create_user(db, data)
    token = await crud.create_session(db, user.id)
    return AuthResponse(user=user, token=token)

@router.post("/logout")
async def logout(
    current_user: User = Depends(get_current_user),
    token: str = Depends(oauth2_scheme),
    db: AsyncSession = Depends(get_db)
):
    await crud.delete_session(db, token)
    return {"message": "Logout successful"}

@router.post("/reset-password", status_code=status.HTTP_200_OK)
async def reset_password(data: ResetPasswordRequest, db: AsyncSession = Depends(get_db)):
    if not await crud.get_user_by_email(db, data.email):
        # For debugging purposes, exposing that user doesn't exist
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Email not found",
        )
        
    await crud.update_password(db, data.email, data.new_password)
    return {"message": "Password updated successfully"}

@router.delete("/delete", status_code=status.HTTP_200_OK)
async def delete_account(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    await crud.delete_user(db, current_user.id)
    return {"message": "Account deleted successfully"}

@router.get("/me", response_model=User)
async def get_me(current_user: User = Depends(get_current_user)):
    return current_user
