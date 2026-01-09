#!/bin/bash

# Deployment script for Full Stack Backend API
# Usage: ./deploy.sh [environment] [action]
# Environments: dev, prod (default: dev)
# Actions: up, down, restart, logs, clean (default: up)

set -e

ENVIRONMENT=${1:-dev}
ACTION=${2:-up}
PROJECT_NAME="fullstack-backend"
DOCKER_USERNAME=${DOCKER_USERNAME:-pappukrs}

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_status "🚀 Starting $ACTION for $ENVIRONMENT environment"

# Validate environment
if [[ "$ENVIRONMENT" != "dev" && "$ENVIRONMENT" != "prod" ]]; then
    print_error "Invalid environment: $ENVIRONMENT. Use 'dev' or 'prod'"
    exit 1
fi

# Set compose file based on environment
COMPOSE_FILE="docker-compose.${ENVIRONMENT}.yml"

# Check if compose file exists
if [ ! -f "$COMPOSE_FILE" ]; then
    print_error "Compose file $COMPOSE_FILE not found"
    exit 1
fi

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    print_error "Docker is not installed. Please install Docker first."
    exit 1
fi

# Check if Docker Compose is installed (v1 or v2)
if ! command -v docker &> /dev/null; then
    print_error "Docker is not installed. Please install Docker first."
    exit 1
fi

# Check for docker compose (v2) or docker-compose (v1)
if docker compose version &> /dev/null; then
    DOCKER_COMPOSE_CMD="docker compose"
elif command -v docker-compose &> /dev/null; then
    DOCKER_COMPOSE_CMD="docker-compose"
else
    print_error "Docker Compose is not installed. Please install Docker Compose first."
    exit 1
fi

# Function to validate environment variables
validate_env() {
    local env_file=".env"
    if [ "$ENVIRONMENT" = "prod" ]; then
        env_file=".env.prod"
        if [ ! -f "$env_file" ]; then
            print_warning "Production env file .env.prod not found, using .env"
            env_file=".env"
        fi
    fi

    if [ ! -f "$env_file" ]; then
        print_error "$env_file file not found. Please create it from .env.example"
        exit 1
    fi

    print_status "Validating environment configuration ($env_file)..."

    # Required environment variables
    local required_vars=("DB_PASS")
    if [ "$ENVIRONMENT" = "prod" ]; then
        required_vars=("DB_PASS" "JWT_ACCESS_SECRET" "JWT_REFRESH_SECRET")
    fi

    for var in "${required_vars[@]}"; do
        if ! grep -q "^${var}=" "$env_file"; then
            print_error "Required environment variable ${var} not found in $env_file"
            exit 1
        fi
    done

    print_status "Environment validation passed"
}

# Function to handle different actions
handle_action() {
    case $ACTION in
        up)
            deploy_services
            ;;
        down)
            print_status "Stopping services..."
            $DOCKER_COMPOSE_CMD -f "$COMPOSE_FILE" down
            print_status "✅ Services stopped successfully"
            ;;
        restart)
            print_status "Restarting services..."
            $DOCKER_COMPOSE_CMD -f "$COMPOSE_FILE" restart
            print_status "✅ Services restarted successfully"
            ;;
        logs)
            print_info "Showing logs for $ENVIRONMENT environment..."
            $DOCKER_COMPOSE_CMD -f "$COMPOSE_FILE" logs -f
            ;;
        clean)
            print_warning "This will remove all containers, volumes, and images!"
            read -p "Are you sure? (y/N): " -n 1 -r
            echo
            if [[ $REPLY =~ ^[Yy]$ ]]; then
                print_status "Cleaning up..."
                $DOCKER_COMPOSE_CMD -f "$COMPOSE_FILE" down -v --rmi all
                print_status "✅ Cleanup completed"
            fi
            ;;
        *)
            print_error "Unknown action: $ACTION"
            print_info "Available actions: up, down, restart, logs, clean"
            exit 1
            ;;
    esac
}

# Function to deploy services
deploy_services() {
    validate_env

    # Create logs directory if it doesn't exist
    mkdir -p logs

    # Build and deploy
    print_status "Building Docker images..."
    $DOCKER_COMPOSE_CMD -f "$COMPOSE_FILE" build --no-cache

    print_status "Starting services..."
    $DOCKER_COMPOSE_CMD -f "$COMPOSE_FILE" up -d

    # Wait for services to be ready
    print_status "Waiting for services to be ready..."
    sleep 15

    # Database initialization (only for fresh deployments)
    if [ "$ENVIRONMENT" = "dev" ] || [ ! -f ".db_initialized" ]; then
        initialize_database
        touch .db_initialized
    else
        print_info "Database already initialized, skipping..."
    fi

    # Run health check
    run_health_check
}

# Function to initialize database
initialize_database() {
    print_status "Initializing database..."

    # Wait for database to be ready
    local max_attempts=30
    local attempt=1

    while [ $attempt -le $max_attempts ]; do
        if $DOCKER_COMPOSE_CMD -f "$COMPOSE_FILE" exec -T postgres pg_isready -U postgres >/dev/null 2>&1; then
            print_status "Database is ready"
            break
        fi
        print_info "Waiting for database... (attempt $attempt/$max_attempts)"
        sleep 5
        ((attempt++))
    done

    if [ $attempt -gt $max_attempts ]; then
        print_error "Database failed to start"
        exit 1
    fi

    # Initialize database schema
    print_status "Running database initialization..."
    $DOCKER_COMPOSE_CMD -f "$COMPOSE_FILE" exec backend npm run db:init

    # Seed database (only in development)
    if [ "$ENVIRONMENT" = "dev" ]; then
        print_status "Seeding database with demo data..."
        $DOCKER_COMPOSE_CMD -f "$COMPOSE_FILE" exec backend npm run db:seed
    fi
}

# Function to run health check
run_health_check() {
    print_status "Running health check..."

    local max_attempts=10
    local attempt=1
    local health_url="http://localhost:3001/health"

    if [ "$ENVIRONMENT" = "prod" ]; then
        health_url="http://localhost/health"  # Through nginx
    fi

    while [ $attempt -le $max_attempts ]; do
        if curl -f -s "$health_url" > /dev/null; then
            print_status "✅ Deployment successful!"

            # Show access information
            if [ "$ENVIRONMENT" = "dev" ]; then
                print_info "🌐 API available at: http://localhost:3001"
                print_info "📚 API Docs (Swagger): http://localhost:3001/docs"
                print_info "🔍 Health check: http://localhost:3001/health"
                print_info "🗄️ PgAdmin: http://localhost:5050 (admin@dev.local / admin123)"
                echo ""
                print_info "Demo credentials:"
                print_info "Email: demo@example.com"
                print_info "Password: DemoPass123!"
            else
                print_info "🌐 API available through Nginx on port 80"
                print_info "🔍 Health check: http://localhost/health"
            fi

            return 0
        fi

        print_info "Health check failed, retrying... (attempt $attempt/$max_attempts)"
        sleep 5
        ((attempt++))
    done

    print_error "❌ Health check failed after $max_attempts attempts"
    print_info "Check logs with: ./deploy.sh $ENVIRONMENT logs"
    exit 1
}

# Main execution
handle_action

print_status "✅ Operation completed successfully!"
