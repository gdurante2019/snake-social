from typing import List, Optional, Dict
from datetime import datetime, timezone
from .models import User, LeaderboardEntry, ActivePlayer, GameMode, Direction, Position

# Simulated in-memory database
class MockDB:
    def __init__(self):
        self.users: List[User] = []
        # Store passwords separately/insecurely for mock
        self.user_creds: Dict[str, str] = {} # email -> password
        self.sessions: Dict[str, str] = {} # token -> user_id
        self.leaderboard: List[LeaderboardEntry] = []
        self.active_players: List[ActivePlayer] = []
        self.high_scores: Dict[str, Dict[str, int]] = {} # user_id -> {mode -> score}

    def create_user(self, username: str, email: str, password: str) -> User:
        user = User(
            id=str(len(self.users) + 1),
            username=username,
            email=email,
            createdAt=datetime.now(timezone.utc)
        )
        self.users.append(user)
        self.user_creds[email] = password
        self.high_scores[user.id] = {}
        return user

    def get_user_by_email(self, email: str) -> Optional[User]:
        return next((u for u in self.users if u.email == email), None)

    def get_user_by_id(self, user_id: str) -> Optional[User]:
        return next((u for u in self.users if u.id == user_id), None)
        
    def get_user_by_username(self, username: str) -> Optional[User]:
        return next((u for u in self.users if u.username == username), None)

    def verify_password(self, email: str, password: str) -> bool:
        return self.user_creds.get(email) == password

    def create_session(self, user_id: str) -> str:
        token = f"mock-token-{user_id}-{int(datetime.now(timezone.utc).timestamp())}"
        self.sessions[token] = user_id
        return token

    def get_user_from_token(self, token: str) -> Optional[User]:
        user_id = self.sessions.get(token)
        if user_id:
            return self.get_user_by_id(user_id)
        return None
        
    def delete_session(self, token: str):
        if token in self.sessions:
            del self.sessions[token]

    def add_leaderboard_entry(self, entry: LeaderboardEntry):
        self.leaderboard.append(entry)
        self.leaderboard.sort(key=lambda x: x.score, reverse=True)
        # Re-rank
        for i, e in enumerate(self.leaderboard):
            e.rank = i + 1
        # Keep top 100
        if len(self.leaderboard) > 100:
            self.leaderboard = self.leaderboard[:100]

    def get_leaderboard(self, mode: Optional[GameMode] = None) -> List[LeaderboardEntry]:
        if mode:
            return [e for e in self.leaderboard if e.mode == mode]
        return self.leaderboard

    def get_active_players(self) -> List[ActivePlayer]:
        return self.active_players

    def get_active_player(self, player_id: str) -> Optional[ActivePlayer]:
        return next((p for p in self.active_players if p.id == player_id), None)
        
    def save_high_score(self, user_id: str, mode: GameMode, score: int):
        if user_id not in self.high_scores:
            self.high_scores[user_id] = {}
        
        current = self.high_scores[user_id].get(mode.value, 0)
        print(f"Saving high score: user={user_id}, mode={mode}, score={score}, current={current}")
        if score > current:
            self.high_scores[user_id][mode.value] = score
            
    def get_high_score(self, user_id: str, mode: GameMode) -> int:
        return self.high_scores.get(user_id, {}).get(mode.value, 0)

# Singleton instance
db = MockDB()

# Seed data
db.create_user("SnakeMaster", "master@snake.io", "password")
db.create_user("PixelViper", "viper@snake.io", "password")
db.create_user("NeonSlither", "neon@snake.io", "password")

# Seed Leaderboard
from datetime import date
db.add_leaderboard_entry(LeaderboardEntry(id="1", rank=0, username="SnakeMaster", score=2450, mode=GameMode.WALLS, date=date(2024, 12, 28)))
db.add_leaderboard_entry(LeaderboardEntry(id="2", rank=0, username="PixelViper", score=2100, mode=GameMode.PASS_THROUGH, date=date(2024, 12, 29)))
db.add_leaderboard_entry(LeaderboardEntry(id="3", rank=0, username="NeonSlither", score=1850, mode=GameMode.WALLS, date=date(2024, 12, 30)))
db.add_leaderboard_entry(LeaderboardEntry(id="4", rank=0, username="ByteCrawler", score=1720, mode=GameMode.PASS_THROUGH, date=date(2024, 12, 27)))

# Seed Active Players
db.active_players.append(ActivePlayer(
    id="p1", 
    username="LivePlayer1", 
    score=120, 
    mode=GameMode.WALLS, 
    snake=[Position(x=10, y=10), Position(x=9, y=10), Position(x=8, y=10)], 
    food=Position(x=15, y=15), 
    direction=Direction.RIGHT, 
    startedAt=datetime.now(timezone.utc)
))
db.active_players.append(ActivePlayer(
    id="p2", 
    username="GamerX99", 
    score=85, 
    mode=GameMode.PASS_THROUGH, 
    snake=[Position(x=5, y=5), Position(x=5, y=6), Position(x=5, y=7)], 
    food=Position(x=2, y=2), 
    direction=Direction.UP, 
    startedAt=datetime.now(timezone.utc)
))

