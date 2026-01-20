from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from ..deps import get_current_user, get_db
from ..schemas import LeaderboardEntry, ScoreSubmission, GameMode, User
from .. import crud
from datetime import date

router = APIRouter()

@router.get("/", response_model=List[LeaderboardEntry])
async def get_leaderboard(mode: Optional[GameMode] = None, db: AsyncSession = Depends(get_db)):
    # crud.get_leaderboard support mode filtering?
    # I only implemented `get_leaderboard` with limit, no mode filter in my `crud.py` snippet above?
    # Wait, I checked `crud.py` content. `get_leaderboard` only has `limit`.
    # I should update `crud.get_leaderboard` to support mode.
    
    # For now, I will modify the route to fetch all and filter in python (ineffficient) OR update crud.
    # Update crud is better.
    
    # I'll update crud first or just use a custom query here?
    # Better to keep logic in crud.
    # I'll call `crud.get_leaderboard(db, mode=mode)` and rely on update.
    return await crud.get_leaderboard(db, mode=mode)

@router.post("/", response_model=Optional[LeaderboardEntry])
async def submit_score(
    submission: ScoreSubmission, 
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    entry = LeaderboardEntry(
        id="", # DB generates ID? No, model says default UUID.
        rank=0, 
        username=current_user.username,
        score=submission.score,
        mode=submission.mode,
        date=date.today()
    )
    # add_leaderboard_entry expects schema?
    # My crud accepts `schemas.LeaderboardEntry`. Pydantic model.
    # I'm constructing a Pydantic model here.
    # `id` is required in schema `LeaderboardEntry` (Pydantic). SQL model generates it.
    # I should probably make `id` optional in `LeaderboardEntry` schema or create `LeaderboardEntryCreate`.
    # But `schemas.py` `LeaderboardEntry` has `id: str`.
    # I'll pass a dummy ID or uuid.
    import uuid
    entry.id = str(uuid.uuid4())
    
    return await crud.add_leaderboard_entry(db, entry)
