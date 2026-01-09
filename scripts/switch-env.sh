#!/bin/bash

# Environment Switcher Script
# Usage: ./scripts/switch-env.sh [dev|prod]

set -e

ENV_MODE=${1:-dev}

if [ "$ENV_MODE" = "dev" ] || [ "$ENV_MODE" = "development" ]; then
    echo "🔄 Switching to DEVELOPMENT environment..."
    cp env.development .env.local
    echo "✅ Development environment configured!"
    echo "📝 Edit .env.local to customize settings"
    echo ""
    echo "Current API URL: http://localhost:3001/api"
elif [ "$ENV_MODE" = "prod" ] || [ "$ENV_MODE" = "production" ]; then
    echo "🔄 Switching to PRODUCTION environment..."
    
    if [ ! -f "env.production" ]; then
        echo "❌ env.production file not found!"
        exit 1
    fi
    
    cp env.production .env.production.local
    
    echo "✅ Production environment configured!"
    echo "⚠️  IMPORTANT: Edit .env.production.local and replace:"
    echo "   - YOUR_API_DOMAIN with your actual API domain"
    echo "   - YOUR_FRONTEND_DOMAIN with your actual frontend domain"
    echo ""
    echo "📝 File location: .env.production.local"
else
    echo "❌ Invalid environment mode: $ENV_MODE"
    echo "Usage: ./scripts/switch-env.sh [dev|prod]"
    exit 1
fi

