from fastapi import APIRouter, Depends
from ..deps import get_current_user
from ..models import HighScoreSave, GameMode, User
from ..db import db

router = APIRouter()

@router.get("/highscore")
async def get_highscore(mode: GameMode, current_user: User = Depends(get_current_user)):
    score = db.get_high_score(current_user.id, mode)
    return {"score": score}

@router.post("/highscore")
async def save_highscore(data: HighScoreSave, current_user: User = Depends(get_current_user)):
    db.save_high_score(current_user.id, data.mode, data.score)
    return {"message": "Score saved"}
