# Backend Migration Walkthrough

The backend has been successfully migrated from a JSON-based MockDB to a robust SQLAlchemy implementation supporting PostgreSQL and SQLite.

## Changes Created

### Database Layer
- **New `app/db` package**: Contains database session management (`session.py`) and declarative base (`base.py`).
- **New `app/models_sql.py`**: SQLAlchemy ORM models for `User`, `LeaderboardEntry`, and `Session`.
- **Refactored `app/schemas.py`**: Pydantic models (formerly `models.py`) updated for Pydantic V2 and compatibility.
- **New `app/crud.py`**: Async CRUD operations replacing direct MockDB calls.
- **Migrations**: Alembic setup in `migrations/` directory to manage schema changes.

### Routes
- Refactored `auth.py`, `leaderboard.py`, `game.py`, and `spectate.py` to use `AsyncSession` dependency and CRUD operations.

### Configuration
- **`app/core/config.py`**: Settings management using Pydantic Settings. Default Database URL is `sqlite+aiosqlite:///./snake.db`.

## Verification Results

### Automated Tests
- Updated `tests/conftest.py` to use an in-memory SQLite database for async tests.
- Refactored `tests/test_api.py` to use `httpx.AsyncClient`.
- **Result**: All 5 tests passed successfully.

## How to Run

### 1. Install Dependencies
```bash
cd backend
uv sync
```

### 2. Run Migrations
Initialize the database schema:
```bash
uv run alembic upgrade head
```

### 3. Run Application (Frontend + Backend)
```bash
npm run dev
```

Alternatively, run separately:
- Backend: `cd backend && uv run uvicorn app.main:app --reload`
- Frontend: `cd frontend && npm run dev`

### 4. Run Tests

To run all tests (Frontend + Backend):
```bash
npm run test
```

Or run separately:
- Backend: `npm run test:backend` (or `cd backend && uv run pytest`)
- Frontend: `npm run test:frontend` (or `cd frontend && npm run test`)



## Docker Support

To run the entire application stack (Frontend, Backend, and PostgreSQL) using Docker:

```bash
docker compose up --build
```

This will expose:
- **Frontend**: http://localhost:8080
- **Backend**: http://localhost:8000
- **Database**: Port 5432

## Troubleshooting

- **Authorization Errors in Docker**: Because Docker runs a fresh PostgreSQL database, your local user accounts do not exist there. You must create a new account when first running in Docker.
- **Database Schema Errors**: If you modify `models_sql.py` or migrations, you may need to reset the Docker database volume:
  ```bash
  docker compose down -v
  docker compose up --build
  ```
- **"API request failed"**: Check the browser console (F12) for the specific error message.

## Notes
- The default database is a local SQLite file `snake.db`. To use PostgreSQL, set `DATABASE_URL` environment variable.
- The `rank` field in `LeaderboardEntry` is currently initialized to 0. Real-time ranking logic can be enhanced in future iterations.
