.PHONY: install run-backend test test-integration docker-up docker-down clean lint

# dependency management
install:
	cd backend && uv sync

# local development
run-backend:
	cd backend && uv run uvicorn app.main:app --reload

# testing
test:
	cd backend && uv run pytest tests

test-integration:
	cd backend && uv run pytest tests_integration

test-all: test test-integration

# docker
docker-up:
	docker compose up -d --build

docker-down:
	docker compose down

docker-logs:
	docker compose logs -f

# maintenance
clean:
	find . -type d -name "__pycache__" -exec rm -rf {} +
	find . -type d -name ".pytest_cache" -exec rm -rf {} +

lint:
	cd backend && uv run ruff check .
