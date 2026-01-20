from pydantic import BaseModel, EmailStr, Field, ConfigDict
import enum
from datetime import datetime, date
from typing import List, Optional




class Direction(str, enum.Enum):
    UP = 'UP'
    DOWN = 'DOWN'
    LEFT = 'LEFT'
    RIGHT = 'RIGHT'

class GameMode(str, enum.Enum):
    WALLS = 'walls'
    PASS_THROUGH = 'pass-through'

class Position(BaseModel):
    x: int
    y: int

class User(BaseModel):
    id: str
    username: str
    email: EmailStr
    created_at: datetime = Field(serialization_alias="createdAt")
    
    model_config = ConfigDict(from_attributes=True)

class AuthResponse(BaseModel):
    user: User
    token: str

class LeaderboardEntry(BaseModel):
    id: str
    rank: int
    username: str
    score: int
    mode: GameMode
    date: date
    
    model_config = ConfigDict(from_attributes=True)


class ActivePlayer(BaseModel):
    id: str
    username: str
    score: int
    mode: GameMode
    snake: List[Position]
    food: Position
    direction: Direction
    startedAt: datetime

# Request Models
class LoginRequest(BaseModel):
    email: EmailStr
    password: str

class SignupRequest(BaseModel):
    username: str
    email: EmailStr
    password: str

class ScoreSubmission(BaseModel):
    score: int
    mode: GameMode

class HighScoreSave(BaseModel):
    score: int
    mode: GameMode

class ResetPasswordRequest(BaseModel):
    email: EmailStr
    new_password: str
