from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException
from ..deps import get_current_user
from ..models import LeaderboardEntry, ScoreSubmission, GameMode, User
from ..db import db
from datetime import date

router = APIRouter()

@router.get("/", response_model=List[LeaderboardEntry])
async def get_leaderboard(mode: Optional[GameMode] = None):
    return db.get_leaderboard(mode)

@router.post("/", response_model=Optional[LeaderboardEntry])
async def submit_score(submission: ScoreSubmission, current_user: User = Depends(get_current_user)):
    entry = LeaderboardEntry(
        id=str(len(db.leaderboard) + 1), # Simple ID generation
        rank=0, # Will be calculated
        username=current_user.username,
        score=submission.score,
        mode=submission.mode,
        date=date.today()
    )
    db.add_leaderboard_entry(entry)
    # Check if entry made it to top 100/is in list
    if entry in db.leaderboard:
        return entry
    return None
