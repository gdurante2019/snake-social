from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .routes import auth, leaderboard, spectate, game

app = FastAPI(
    title="Snake Social API",
    description="Backend API for Snake Social application",
    version="1.0.0",
    docs_url="/api/docs",
    openapi_url="/api/openapi.json"
)

# CORS config
origins = [
    "http://localhost:5173", # Vite default
    "http://127.0.0.1:5173",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/api/auth", tags=["Auth"])
app.include_router(leaderboard.router, prefix="/api/leaderboard", tags=["Leaderboard"])
app.include_router(spectate.router, prefix="/api/spectate", tags=["Spectate"])
app.include_router(game.router, prefix="/api/game", tags=["Game"])

@app.get("/health")
async def health_check():
    return {"status": "ok"}
