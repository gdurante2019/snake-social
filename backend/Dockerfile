FROM python:3.12-slim

WORKDIR /app

# Install uv
COPY --from=ghcr.io/astral-sh/uv:latest /uv /bin/uv

# Copy project files
COPY pyproject.toml uv.lock ./
COPY README.md ./

# Install dependencies
RUN uv sync --frozen --no-cache

# Copy app code
COPY app ./app
COPY alembic.ini ./
COPY migrations ./migrations

# Copy entrypoint
COPY entrypoint.sh ./
RUN chmod +x entrypoint.sh

# Environment variables
ENV PATH="/app/.venv/bin:$PATH"
ENV PYTHONPATH=/app

ENTRYPOINT ["./entrypoint.sh"]
