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
    "http://localhost:8080", # Docker Frontend
    "http://localhost:80",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

from fastapi.responses import RedirectResponse

@app.get("/", include_in_schema=False)
async def root():
    if os.path.exists("static/index.html"):
        return FileResponse("static/index.html")
    return RedirectResponse(url="/api/docs")

app.include_router(auth.router, prefix="/api/auth", tags=["Auth"])
app.include_router(leaderboard.router, prefix="/api/leaderboard", tags=["Leaderboard"])
app.include_router(spectate.router, prefix="/api/spectate", tags=["Spectate"])
app.include_router(game.router, prefix="/api/game", tags=["Game"])

@app.get("/health")
async def health_check():
    return {"status": "ok"}

# Serve Static Files (SPA)
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
import os

# Only mount if static directory exists (Production/Docker)
if os.path.exists("static"):
    app.mount("/assets", StaticFiles(directory="static/assets"), name="assets")
    
    @app.get("/{full_path:path}")
    async def serve_spa(full_path: str):
        # API routes are already handled above by specific routers
        # This catch-all serves index.html for client-side routing
        return FileResponse("static/index.html")
