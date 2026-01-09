# 🚀 Quick Start - Environment Setup

## Switch to Development
```bash
npm run env:dev
npm run dev
```

## Switch to Production
```bash
# Option 1: Use the quick script (paste your URLs)
npm run env:set-prod "https://api.yourdomain.com/api" "https://yourdomain.com"

# Option 2: Use the template
npm run env:prod
# Then edit .env.production.local and replace YOUR_API_DOMAIN and YOUR_FRONTEND_DOMAIN

# Build and run
npm run build:prod
npm run start:prod
```

## Manual Setup

### Development (.env.local)
```env
NODE_ENV=development
NEXT_PUBLIC_API_BASE_URL=http://localhost:3001/api
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Production (.env.production.local)
```env
NODE_ENV=production
NEXT_PUBLIC_API_BASE_URL=https://api.yourdomain.com/api
NEXT_PUBLIC_APP_URL=https://yourdomain.com
```

## Docker Deployment
```bash
# Set production URLs
npm run env:set-prod "https://api.yourdomain.com/api" "https://yourdomain.com"

# Build and deploy
docker compose up --build
```

For more details, see [ENV_SETUP.md](./ENV_SETUP.md)
