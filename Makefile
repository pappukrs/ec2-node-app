# Full Stack Backend - Makefile

.PHONY: help dev prod up down restart logs clean docs install test

# Default target
help:
	@echo "Available commands:"
	@echo "  make dev         - Start development environment"
	@echo "  make prod        - Start production environment"
	@echo "  make up          - Start services (detects environment)"
	@echo "  make down        - Stop all services"
	@echo "  make restart     - Restart all services"
	@echo "  make logs        - Show service logs"
	@echo "  make clean       - Remove containers and volumes"
	@echo "  make docs        - Generate API documentation"
	@echo "  make install     - Install dependencies"
	@echo "  make test        - Run tests"

# Docker Compose command (compatible with v1 and v2)
DOCKER_COMPOSE := docker compose

# Environment detection
ENV_FILE := .env
ifeq ($(shell test -f .env.prod && echo exists),exists)
  COMPOSE_FILE := docker-compose.prod.yml
  ENV := prod
else
  COMPOSE_FILE := docker-compose.dev.yml
  ENV := dev
endif

# Development commands
dev:
	@echo "Starting development environment..."
	@$(DOCKER_COMPOSE) -f docker-compose.dev.yml up -d 2>/dev/null || $(DOCKER_COMPOSE) -f docker-compose.dev.yml up -d
	@echo "Waiting for services to be ready..."
	@sleep 10
	@echo "Initializing database..."
	@$(DOCKER_COMPOSE) -f docker-compose.dev.yml exec -T backend npm run db:init 2>/dev/null || echo "Database init may have failed - check logs"
	@echo "Seeding database..."
	@$(DOCKER_COMPOSE) -f docker-compose.dev.yml exec -T backend npm run db:seed 2>/dev/null || echo "Database seeding may have failed - check logs"
	@echo "✅ Development environment started!"
	@echo "🌐 API: http://localhost:3001"
	@echo "📚 Swagger Docs: http://localhost:3001/docs"
	@echo "🗄️ PgAdmin: http://localhost:5050"
	@echo "🔍 Health: http://localhost:3001/health"
	@echo ""
	@echo "Note: Check 'make logs' if services don't start properly"

prod:
	@echo "Starting production environment..."
	@$(DOCKER_COMPOSE) -f docker-compose.prod.yml up -d 2>/dev/null || $(DOCKER_COMPOSE) -f docker-compose.prod.yml up -d
	@echo "Waiting for services to be ready..."
	@sleep 15
	@echo "Initializing database..."
	@$(DOCKER_COMPOSE) -f docker-compose.prod.yml exec -T backend npm run db:init 2>/dev/null || echo "Database init may have failed - check logs"
	@echo "✅ Production environment started!"
	@echo "🌐 API: http://localhost"
	@echo "🔍 Health: http://localhost/health"

# Generic commands (use detected environment)
up:
	@echo "Starting $(ENV) environment..."
	@$(DOCKER_COMPOSE) -f $(COMPOSE_FILE) up -d 2>/dev/null || $(DOCKER_COMPOSE) -f $(COMPOSE_FILE) up -d
	@echo "Waiting for services to be ready..."
	@sleep 10
	@echo "Initializing database..."
	@$(DOCKER_COMPOSE) -f $(COMPOSE_FILE) exec -T backend npm run db:init 2>/dev/null || echo "Database init may have failed - check logs"
	@if [ "$(ENV)" = "dev" ]; then \
		echo "Seeding database..."; \
		$(DOCKER_COMPOSE) -f $(COMPOSE_FILE) exec -T backend npm run db:seed 2>/dev/null || echo "Database seeding may have failed - check logs"; \
	fi
	@echo "✅ $(ENV) environment started!"

down:
	@echo "Stopping $(ENV) environment..."
	@$(DOCKER_COMPOSE) -f $(COMPOSE_FILE) down

restart:
	@echo "Restarting $(ENV) environment..."
	@$(DOCKER_COMPOSE) -f $(COMPOSE_FILE) restart

logs:
	@echo "Showing $(ENV) environment logs..."
	@$(DOCKER_COMPOSE) -f $(COMPOSE_FILE) logs -f

clean:
	@echo "Cleaning $(ENV) environment..."
	@$(DOCKER_COMPOSE) -f $(COMPOSE_FILE) down -v --rmi all

# Documentation
docs:
	@echo "Generating API documentation..."
	@npm run docs:generate

# Dependencies
install:
	@echo "Installing dependencies..."
	@npm install

# Testing
test:
	@echo "Running tests..."
	@npm test
