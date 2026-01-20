from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc, delete
from app import models_sql, schemas
import uuid
from datetime import datetime

async def get_user_by_email(db: AsyncSession, email: str):
    result = await db.execute(select(models_sql.User).filter(models_sql.User.email == email))
    return result.scalars().first()

async def get_user_by_username(db: AsyncSession, username: str):
    result = await db.execute(select(models_sql.User).filter(models_sql.User.username == username))
    return result.scalars().first()

async def create_user(db: AsyncSession, user: schemas.SignupRequest):
    # In a real app, hash the password here
    db_user = models_sql.User(
        username=user.username,
        email=user.email,
        hashed_password=user.password 
    )
    db.add(db_user)
    await db.commit()
    await db.refresh(db_user)
    return db_user

async def get_user(db: AsyncSession, user_id: str):
    result = await db.execute(select(models_sql.User).filter(models_sql.User.id == user_id))
    return result.scalars().first()

async def get_leaderboard(db: AsyncSession, limit: int = 100, mode: schemas.GameMode = None):
    query = select(models_sql.LeaderboardEntry).order_by(desc(models_sql.LeaderboardEntry.score))
    
    if mode:
        query = query.filter(models_sql.LeaderboardEntry.mode == mode)
        
    result = await db.execute(query.limit(limit))
    return result.scalars().all()


async def add_leaderboard_entry(db: AsyncSession, entry: schemas.LeaderboardEntry):
    db_entry = models_sql.LeaderboardEntry(
        username=entry.username,
        score=entry.score,
        mode=entry.mode,
        date=entry.date,
        rank=0
    )
    db.add(db_entry)
    await db.commit()
    await db.refresh(db_entry)
    return db_entry


async def create_session(db: AsyncSession, user_id: str) -> str:
    token = f"token-{uuid.uuid4()}" 
    db_session = models_sql.Session(token=token, user_id=user_id)
    db.add(db_session)
    await db.commit()
    return token

async def get_session(db: AsyncSession, token: str):
    result = await db.execute(select(models_sql.Session).filter(models_sql.Session.token == token))
    return result.scalars().first()

async def delete_session(db: AsyncSession, token: str):
    await db.execute(delete(models_sql.Session).filter(models_sql.Session.token == token))
    await db.commit()

async def update_password(db: AsyncSession, email: str, new_password: str):
    result = await db.execute(select(models_sql.User).filter(models_sql.User.email == email))
    user = result.scalars().first()
    if user:
        user.hashed_password = new_password
        await db.commit()

async def delete_user(db: AsyncSession, user_id: str):
    # Depending on cascade rules, manually delete related items if needed
    # Sessions
    await db.execute(delete(models_sql.Session).filter(models_sql.Session.user_id == user_id))
    # Leaderboard? Usually keep scores but maybe anonymize? Old code deleted them.
    await db.execute(delete(models_sql.LeaderboardEntry).filter(models_sql.LeaderboardEntry.username == select(models_sql.User.username).filter(models_sql.User.id == user_id).scalar_subquery())) 
    # That subquery delete might be complex for ORM.
    # Simpler: Get user, then delete.
    
    # Let's just delete the user and rely on cascades or simple delete. 
    # But wait, `delete_user` in db.py deleted everything.
    
    # Delete User
    await db.execute(delete(models_sql.User).filter(models_sql.User.id == user_id))
    await db.commit()


async def get_high_score(db: AsyncSession, user_id: str, mode: schemas.GameMode) -> int:
    # Logic: Get max score from leaderboard for this user and mode?
    # Or do we need a separate HighScores table?
    # db.py had `high_scores` dict AND `leaderboard` list.
    # Leaderboard was derived/updated.
    # Let's query LeaderboardEntry for max score for user+mode.
    
    result = await db.execute(
        select(models_sql.LeaderboardEntry.score)
        .filter(models_sql.LeaderboardEntry.username == select(models_sql.User.username).filter(models_sql.User.id == user_id).scalar_subquery())
        .filter(models_sql.LeaderboardEntry.mode == mode)
        .order_by(desc(models_sql.LeaderboardEntry.score))
        .limit(1)
    )
    score = result.scalars().first()
    return score if score else 0

async def save_high_score(db: AsyncSession, user_id: str, mode: schemas.GameMode, score: int):
    # Check current high score
    current_high = await get_high_score(db, user_id, mode)
    if score > current_high:
        # Get username
        user = await get_user(db, user_id)
        if not user:
            return
            
        # Update or Insert LeaderboardEntry
        # We can just insert a new entry for history, or update "best"?
        # db.py updated existing if it existed for that user+mode?
        # db.py: "Check if entry exists... if existing: existing.score = score... else append"
        
        result = await db.execute(
            select(models_sql.LeaderboardEntry)
            .filter(models_sql.LeaderboardEntry.username == user.username)
            .filter(models_sql.LeaderboardEntry.mode == mode)
        )
        existing = result.scalars().first()
        
        if existing:
            existing.score = score
            existing.date = datetime.now().date()
        else:
            new_entry = models_sql.LeaderboardEntry(
                username=user.username,
                score=score,
                mode=mode,
                date=datetime.now().date()
            )
            db.add(new_entry)
        
        await db.commit()

async def get_active_players():
    # Helper to generate dummy players as per original db.py
    # Since we aren't persisting active players yet.
    from datetime import timezone
    return [
        schemas.ActivePlayer(
            id="p1", 
            username="LivePlayer1", 
            score=120, 
            mode=schemas.GameMode.WALLS, 
            snake=[schemas.Position(x=10, y=10), schemas.Position(x=9, y=10), schemas.Position(x=8, y=10)], 
            food=schemas.Position(x=15, y=15), 
            direction=schemas.Direction.RIGHT, 
            startedAt=datetime.now(timezone.utc)
        ),
        schemas.ActivePlayer(
            id="p2", 
            username="GamerX99", 
            score=85, 
            mode=schemas.GameMode.PASS_THROUGH, 
            snake=[schemas.Position(x=5, y=5), schemas.Position(x=5, y=6), schemas.Position(x=5, y=7)], 
            food=schemas.Position(x=2, y=2), 
            direction=schemas.Direction.UP, 
            startedAt=datetime.now(timezone.utc)
        )
    ]

async def get_active_player(player_id: str):
    players = await get_active_players()
    return next((p for p in players if p.id == player_id), None)

