# Environment Configuration Guide

This guide explains how to easily switch between development and production environments.

## 📋 Quick Start

### Option 1: Use Environment Scripts (Recommended)

#### Switch to Development:
```bash
npm run env:dev
# or
./scripts/switch-env.sh dev
```

#### Switch to Production:
```bash
npm run env:prod
# or
./scripts/switch-env.sh prod
```

#### Set Production URLs Directly:
```bash
npm run env:set-prod "https://api.yourdomain.com/api" "https://yourdomain.com"
# or
./scripts/set-prod-url.sh "https://api.yourdomain.com/api" "https://yourdomain.com"
```

### Option 2: Manual Configuration

#### For Development:
1. Copy `env.development` to `.env.local`:
   ```bash
   cp env.development .env.local
   ```

2. Edit `.env.local` if needed:
   ```env
   NEXT_PUBLIC_API_BASE_URL=http://localhost:3001/api
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   ```

#### For Production:
1. Copy `env.production` to `.env.production.local`:
   ```bash
   cp env.production .env.production.local
   ```

2. Edit `.env.production.local` and replace placeholders:
   ```env
   NEXT_PUBLIC_API_BASE_URL=https://api.yourdomain.com/api
   NEXT_PUBLIC_APP_URL=https://yourdomain.com
   ```

## 🔧 Environment Variables

### Required Variables

| Variable | Description | Development | Production |
|----------|-------------|-------------|------------|
| `NODE_ENV` | Environment mode | `development` | `production` |
| `NEXT_PUBLIC_API_BASE_URL` | Backend API URL | `http://localhost:3001/api` | `https://api.yourdomain.com/api` |
| `NEXT_PUBLIC_APP_URL` | Frontend URL | `http://localhost:3000` | `https://yourdomain.com` |

### Optional Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `NEXT_PUBLIC_API_TIMEOUT` | API request timeout (ms) | `10000` |
| `NEXT_PUBLIC_APP_NAME` | Application name | `FullStack App` |
| `NEXT_PUBLIC_TOKEN_REFRESH_THRESHOLD` | Token refresh threshold (ms) | `300000` |
| `NEXT_PUBLIC_MAX_RETRY_ATTEMPTS` | Max API retry attempts | `3` |

## 🚀 Usage Examples

### Development Mode
```bash
# Set development environment
npm run env:dev

# Start development server
npm run dev
```

### Production Mode
```bash
# Set production URLs
npm run env:set-prod "https://api.example.com/api" "https://example.com"

# Build for production
npm run build:prod

# Start production server
npm run start:prod
```

### Docker Deployment
```bash
# Set production URLs
npm run env:set-prod "https://api.example.com/api" "https://example.com"

# Build Docker image
docker build -t pappukrs/fullstack-frontend .

# Run with Docker Compose
docker compose up --build
```

## 📝 Environment Files

### File Priority (Next.js)
1. `.env.production.local` - Production overrides (gitignored)
2. `.env.local` - Local overrides (gitignored)
3. `.env.production` - Production defaults
4. `.env` - Default values

### Template Files
- `env.example` - Complete example with all variables
- `env.development` - Development template
- `env.production` - Production template

## 🔍 Verify Configuration

Check your current environment configuration:
```bash
# View current API URL
echo $NEXT_PUBLIC_API_BASE_URL

# Or check in the app
# The config is available at: lib/config.ts
```

## ⚠️ Important Notes

1. **Never commit `.env.local` or `.env.production.local`** - These files are gitignored
2. **Always use `NEXT_PUBLIC_` prefix** for client-side variables
3. **Restart the dev server** after changing environment variables
4. **Rebuild the app** when switching to production mode

## 🐛 Troubleshooting

### Environment variables not updating?
- Restart the Next.js dev server
- Clear `.next` cache: `rm -rf .next`
- Rebuild: `npm run build`

### Production build using wrong URLs?
- Check `.env.production.local` exists
- Verify `NODE_ENV=production` is set
- Ensure variables have `NEXT_PUBLIC_` prefix

### Docker not picking up environment?
- Pass environment variables in `docker-compose.yml`
- Or use `.env.production.local` file
- Rebuild Docker image after changes

## 📚 Additional Resources

- [Next.js Environment Variables](https://nextjs.org/docs/basic-features/environment-variables)
- [Docker Environment Variables](https://docs.docker.com/compose/environment-variables/)

