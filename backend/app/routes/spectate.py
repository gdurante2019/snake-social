from typing import List
from fastapi import APIRouter, HTTPException
from ..models import ActivePlayer
from ..db import db

router = APIRouter()

@router.get("/active", response_model=List[ActivePlayer])
async def get_active_players():
    return db.get_active_players()

@router.get("/player/{player_id}", response_model=ActivePlayer)
async def get_player(player_id: str):
    player = db.get_active_player(player_id)
    if not player:
        raise HTTPException(status_code=404, detail="Player not found")
    return player
