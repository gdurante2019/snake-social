from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from ..deps import get_current_user, get_db
from ..schemas import HighScoreSave, GameMode, User
from .. import crud

router = APIRouter()

@router.get("/highscore")
async def get_highscore(mode: GameMode, current_user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    score = await crud.get_high_score(db, current_user.id, mode)
    return {"score": score}

@router.post("/highscore")
async def save_highscore(data: HighScoreSave, current_user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    await crud.save_high_score(db, current_user.id, data.mode, data.score)
    return {"message": "Score saved"}
