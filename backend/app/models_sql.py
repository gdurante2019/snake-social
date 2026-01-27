from datetime import datetime, date, timezone
import uuid
from sqlalchemy import String, Integer, DateTime, Date, Enum as SQLEnum
from sqlalchemy.orm import Mapped, mapped_column
from app.db.base import Base
from app.schemas import GameMode

class User(Base):
    __tablename__ = "users"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    username: Mapped[str] = mapped_column(String, unique=True, index=True)
    email: Mapped[str] = mapped_column(String, unique=True, index=True)
    hashed_password: Mapped[str] = mapped_column(String)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

class LeaderboardEntry(Base):
    __tablename__ = "leaderboard"


    id: Mapped[str] = mapped_column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    username: Mapped[str] = mapped_column(String, index=True)
    rank: Mapped[int] = mapped_column(Integer, default=0)
    score: Mapped[int] = mapped_column(Integer)

    mode: Mapped[GameMode] = mapped_column(SQLEnum(GameMode))
    date: Mapped[date] = mapped_column(Date, default=date.today)

class Session(Base):
    __tablename__ = "sessions"

    token: Mapped[str] = mapped_column(String, primary_key=True)
    user_id: Mapped[str] = mapped_column(String, index=True)

