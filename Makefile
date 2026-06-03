# ── Buddy Studio — Developer Shortcuts ─────────────────────────────────────────
#
#  FIRST TIME SETUP (new machine / new developer):
#    make setup          ← copy .env file
#    make start          ← build & run everything
#
#  DAILY USE:
#    make start          ← start all services
#    make stop           ← stop all services
#    make logs           ← see all logs
#    make test           ← run all tests
#
#  INDIVIDUAL SERVICES:
#    make agent          ← only Python agent
#    make frontend       ← only React
#    make rails          ← only Rails
#
# ───────────────────────────────────────────────────────────────────────────────

.PHONY: help setup start stop restart build logs test clean agent frontend rails shell-agent shell-rails status

# Default: show help
help:
	@echo ""
	@echo "  ╔══════════════════════════════════════════════╗"
	@echo "  ║       Buddy Studio — Dev Commands            ║"
	@echo "  ╠══════════════════════════════════════════════╣"
	@echo "  ║  make setup      First time: copy .env file  ║"
	@echo "  ║  make start      Start all 3 services         ║"
	@echo "  ║  make stop       Stop all services            ║"
	@echo "  ║  make restart    Restart all services         ║"
	@echo "  ║  make build      Rebuild Docker images        ║"
	@echo "  ║  make logs       See all live logs            ║"
	@echo "  ║  make status     Check service health         ║"
	@echo "  ╠══════════════════════════════════════════════╣"
	@echo "  ║  make test       Run all tests                ║"
	@echo "  ║  make test-agent Python tests only            ║"
	@echo "  ║  make test-rails Rails tests only             ║"
	@echo "  ╠══════════════════════════════════════════════╣"
	@echo "  ║  make agent      Only Python agent            ║"
	@echo "  ║  make frontend   Only React frontend          ║"
	@echo "  ║  make rails      Only Rails backend           ║"
	@echo "  ╠══════════════════════════════════════════════╣"
	@echo "  ║  make shell-agent  Terminal inside agent      ║"
	@echo "  ║  make shell-rails  Terminal inside rails      ║"
	@echo "  ║  make clean      Remove containers + images   ║"
	@echo "  ╚══════════════════════════════════════════════╝"
	@echo ""

# ── First Time Setup ───────────────────────────────────────────────────────────

setup:
	@if [ ! -f .env.docker ]; then \
		cp .env.docker.example .env.docker; \
		echo ""; \
		echo "  ✅ .env.docker file created!"; \
		echo "  ⚠️  Now open .env.docker and fill in:"; \
		echo "     - GEMINI_API_KEY=your_key_here"; \
		echo "     - SUPPORT_PHONE=+91-XXXXXXXXXX"; \
		echo ""; \
		echo "  Then run: make start"; \
	else \
		echo "  ✅ .env.docker already exists. Run: make start"; \
	fi

# ── Start / Stop ───────────────────────────────────────────────────────────────

start:
	@echo "  🚀 Starting all services..."
	@docker-compose up --build -d
	@echo ""
	@echo "  ✅ All services started!"
	@echo "  🌐 React Frontend : http://localhost:3000"
	@echo "  🛤  Rails API      : http://localhost:3001"
	@echo "  🤖 Python Agent   : http://localhost:8000"
	@echo "  📖 Agent API Docs : http://localhost:8000/docs"
	@echo ""
	@echo "  Run 'make logs' to see live output"

stop:
	@echo "  🛑 Stopping all services..."
	@docker-compose down
	@echo "  ✅ All services stopped."

restart:
	@docker-compose down
	@docker-compose up --build -d
	@echo "  ✅ All services restarted."

build:
	@echo "  🔨 Rebuilding Docker images..."
	@docker-compose build --no-cache
	@echo "  ✅ Build complete. Run 'make start' to start."

# ── Logs ───────────────────────────────────────────────────────────────────────

logs:
	docker-compose logs -f

logs-agent:
	docker-compose logs -f buddy-agent

logs-frontend:
	docker-compose logs -f frontend

logs-rails:
	docker-compose logs -f backend

# ── Individual Services ────────────────────────────────────────────────────────

agent:
	@echo "  🤖 Starting Python Agent only..."
	@docker-compose up buddy-agent

frontend:
	@echo "  ⚛️  Starting React Frontend only..."
	@docker-compose up frontend

rails:
	@echo "  🛤  Starting Rails Backend only..."
	@docker-compose up backend

# ── Status ─────────────────────────────────────────────────────────────────────

status:
	@echo "  📊 Service Status:"
	@docker-compose ps
	@echo ""
	@echo "  🔍 Health checks:"
	@curl -s http://localhost:8000/health && echo " ← Agent OK" || echo "  ❌ Agent not running"
	@curl -s http://localhost:3001/health && echo " ← Rails OK" || echo "  ❌ Rails not running"

# ── Tests ──────────────────────────────────────────────────────────────────────

test: test-agent test-rails
	@echo "  ✅ All tests complete!"

test-agent:
	@echo "  🧪 Running Python Agent tests..."
	@docker-compose run --rm buddy-agent sh -c "LLM_PROVIDER=none pytest tests/ -v"

test-rails:
	@echo "  🧪 Running Rails tests..."
	@docker-compose run --rm backend bundle exec rspec

test-agent-local:
	@echo "  🧪 Running Python Agent tests locally (no Docker)..."
	@cd buddy-agent && source venv/bin/activate && LLM_PROVIDER=none pytest tests/ -v

# ── Shell / Debug ──────────────────────────────────────────────────────────────

shell-agent:
	@echo "  🐚 Opening shell inside Python Agent container..."
	@docker-compose exec buddy-agent sh

shell-rails:
	@echo "  🐚 Opening shell inside Rails container..."
	@docker-compose exec backend bash

shell-frontend:
	@echo "  🐚 Opening shell inside Frontend container..."
	@docker-compose exec frontend sh

rails-console:
	@echo "  🛤  Opening Rails console..."
	@docker-compose exec backend bundle exec rails console

rails-migrate:
	@echo "  🗃  Running Rails migrations..."
	@docker-compose exec backend bundle exec rails db:migrate

# ── Cleanup ────────────────────────────────────────────────────────────────────

clean:
	@echo "  🧹 Removing containers, networks, and images..."
	@docker-compose down --rmi all --volumes --remove-orphans
	@echo "  ✅ Cleanup done. Run 'make start' to start fresh."

clean-soft:
	@echo "  🧹 Removing containers only (keeping images for faster restart)..."
	@docker-compose down --remove-orphans
	@echo "  ✅ Done."
