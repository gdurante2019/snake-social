# Stage 1: Build Frontend
FROM node:18-alpine AS frontend-builder
WORKDIR /app/frontend

COPY frontend/package.json frontend/package-lock.json ./
RUN npm ci

COPY frontend/ .
RUN npm run build

# Stage 2: Build Backend and Serve
FROM python:3.12-slim

# Install uv
COPY --from=ghcr.io/astral-sh/uv:latest /uv /bin/uv

WORKDIR /app

# Copy backend dependencies
COPY backend/pyproject.toml backend/uv.lock backend/README.md ./
COPY backend/.python-version ./

# Install dependencies
RUN uv sync --frozen --no-install-project --no-dev

# Copy backend code
COPY backend/app ./app
COPY backend/alembic.ini ./
COPY backend/migrations ./migrations

# Copy compiled frontend assets from Stage 1
COPY --from=frontend-builder /app/frontend/dist ./static

# Expose port (FastAPI default)
EXPOSE 8000

# Run command
CMD ["/bin/sh", "-c", "uv run alembic upgrade head && uv run uvicorn app.main:app --host 0.0.0.0 --port 8000"]
