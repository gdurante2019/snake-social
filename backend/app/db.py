import json
import os
from typing import List, Optional, Dict
from datetime import datetime, timezone, date
from .models import User, LeaderboardEntry, ActivePlayer, GameMode, Direction, Position

DATA_FILE = "data.json"

# Helper to serialize datetime/date
class DateTimeEncoder(json.JSONEncoder):
    def default(self, o):
        if isinstance(o, (datetime, date)):
            return o.isoformat()
        if isinstance(o, (GameMode, Direction)):
            return o.value
        return super().default(o)

# Simulated database with JSON persistence
class MockDB:
    def __init__(self):
        self.users: List[User] = []
        self.user_creds: Dict[str, str] = {} # email -> password
        self.sessions: Dict[str, str] = {} # token -> user_id
        self.leaderboard: List[LeaderboardEntry] = []
        self.active_players: List[ActivePlayer] = []
        self.high_scores: Dict[str, Dict[str, int]] = {} # user_id -> {mode -> score}
        
        self.load_data()

    def save_data(self):
        data = {
            "users": [u.dict() for u in self.users],
            "user_creds": self.user_creds,
            # Skip sessions/active_players for persistence as they are ephemeral
            "leaderboard": [e.dict() for e in self.leaderboard],
            "high_scores": self.high_scores
        }
        with open(DATA_FILE, "w") as f:
            json.dump(data, f, cls=DateTimeEncoder, indent=2)

    def load_data(self):
        if not os.path.exists(DATA_FILE):
            self.seed_data()
            return
            
        try:
            with open(DATA_FILE, "r") as f:
                data = json.load(f)
                
            self.users = [User(**u) for u in data.get("users", [])]
            self.user_creds = data.get("user_creds", {})
            self.leaderboard = [LeaderboardEntry(**e) for e in data.get("leaderboard", [])]
            self.high_scores = data.get("high_scores", {})
        except Exception as e:
            print(f"Failed to load data: {e}")
            self.seed_data()

    def seed_data(self):
        # Seed data
        self.create_user("SnakeMaster", "master@snake.io", "password", save=False)
        self.create_user("PixelViper", "viper@snake.io", "password", save=False)
        self.create_user("NeonSlither", "neon@snake.io", "password", save=False)

        # Seed Leaderboard
        self.add_leaderboard_entry(LeaderboardEntry(id="1", rank=0, username="SnakeMaster", score=2450, mode=GameMode.WALLS, date=date(2024, 12, 28)), save=False)
        self.add_leaderboard_entry(LeaderboardEntry(id="2", rank=0, username="PixelViper", score=2100, mode=GameMode.PASS_THROUGH, date=date(2024, 12, 29)), save=False)
        self.add_leaderboard_entry(LeaderboardEntry(id="3", rank=0, username="NeonSlither", score=1850, mode=GameMode.WALLS, date=date(2024, 12, 30)), save=False)
        self.add_leaderboard_entry(LeaderboardEntry(id="4", rank=0, username="ByteCrawler", score=1720, mode=GameMode.PASS_THROUGH, date=date(2024, 12, 27)), save=False)
        
        self.save_data()

    def create_user(self, username: str, email: str, password: str, save=True) -> User:
        user = User(
            id=str(len(self.users) + 1),
            username=username,
            email=email,
            createdAt=datetime.now(timezone.utc)
        )
        self.users.append(user)
        self.user_creds[email] = password
        self.high_scores[user.id] = {}
        if save: self.save_data()
        return user

    def get_user_by_email(self, email: str) -> Optional[User]:
        return next((u for u in self.users if u.email == email), None)

    def get_user_by_id(self, user_id: str) -> Optional[User]:
        return next((u for u in self.users if u.id == user_id), None)
        
    def get_user_by_username(self, username: str) -> Optional[User]:
        return next((u for u in self.users if u.username == username), None)

    def verify_password(self, email: str, password: str) -> bool:
        return self.user_creds.get(email) == password

    def update_password(self, email: str, new_password: str) -> bool:
        if email in self.user_creds:
            self.user_creds[email] = new_password
            self.save_data()
            return True
        return False

    def delete_user(self, user_id: str) -> bool:
        user = self.get_user_by_id(user_id)
        if not user:
            return False
            
        # Remove from users list
        self.users = [u for u in self.users if u.id != user_id]
        
        # Remove credentials
        if user.email in self.user_creds:
            del self.user_creds[user.email]
            
        # Remove sessions
        tokens_to_remove = [t for t, uid in self.sessions.items() if uid == user_id]
        for t in tokens_to_remove:
            del self.sessions[t]
            
        # Remove high scores
        if user.id in self.high_scores:
            del self.high_scores[user.id]
            
        self.save_data()
        return True

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

    def add_leaderboard_entry(self, entry: LeaderboardEntry, save=True):
        self.leaderboard.append(entry)
        self.leaderboard.sort(key=lambda x: x.score, reverse=True)
        # Re-rank
        for i, e in enumerate(self.leaderboard):
            e.rank = i + 1
        # Keep top 100
        if len(self.leaderboard) > 100:
            self.leaderboard = self.leaderboard[:100]
        if save: self.save_data()

    def get_leaderboard(self, mode: Optional[GameMode] = None) -> List[LeaderboardEntry]:
        if mode:
            return [e for e in self.leaderboard if e.mode == mode]
        return self.leaderboard

    def get_active_players(self) -> List[ActivePlayer]:
        # Generate dummy active players if empty for demo
        if not self.active_players:
            self.active_players = [
                ActivePlayer(
                    id="p1", 
                    username="LivePlayer1", 
                    score=120, 
                    mode=GameMode.WALLS, 
                    snake=[Position(x=10, y=10), Position(x=9, y=10), Position(x=8, y=10)], 
                    food=Position(x=15, y=15), 
                    direction=Direction.RIGHT, 
                    startedAt=datetime.now(timezone.utc)
                ),
                ActivePlayer(
                    id="p2", 
                    username="GamerX99", 
                    score=85, 
                    mode=GameMode.PASS_THROUGH, 
                    snake=[Position(x=5, y=5), Position(x=5, y=6), Position(x=5, y=7)], 
                    food=Position(x=2, y=2), 
                    direction=Direction.UP, 
                    startedAt=datetime.now(timezone.utc)
                )
            ]
        return self.active_players

    def get_active_player(self, player_id: str) -> Optional[ActivePlayer]:
        return next((p for p in self.active_players if p.id == player_id), None)
        
    def save_high_score(self, user_id: str, mode: GameMode, score: int):
        if user_id not in self.high_scores:
            self.high_scores[user_id] = {}
        
        current = self.high_scores[user_id].get(mode.value, 0)
        if score > current:
            self.high_scores[user_id][mode.value] = score
            self.save_data()
            
    def get_high_score(self, user_id: str, mode: GameMode) -> int:
        return self.high_scores.get(user_id, {}).get(mode.value, 0)

# Singleton instance
db = MockDB()

