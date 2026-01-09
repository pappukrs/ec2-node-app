# API URL Configuration Guide

## ✅ Fixed Issue

All API calls now use the configured `NEXT_PUBLIC_API_BASE_URL` environment variable instead of relative paths.

## 🔧 How to Set API URL

### Option 1: Environment Variable (Recommended)

#### Development:
```bash
# In .env.local
NEXT_PUBLIC_API_BASE_URL=http://localhost:3001/api
```

#### Production:
```bash
# In .env.production.local
NEXT_PUBLIC_API_BASE_URL=https://api.yourdomain.com/api
```

### Option 2: Quick Script
```bash
# Set production API URL directly
npm run env:set-prod "https://api.yourdomain.com/api" "https://yourdomain.com"
```

### Option 3: Hardcode (Temporary - Not Recommended)
If you need to hardcode temporarily, edit `lib/config.ts`:
```typescript
const apiBaseUrl = 'http://13.233.116.167/api'; // Your API URL
```

## 📍 Where API URLs Are Used

All API calls now use `${config.api.baseUrl}` which reads from `NEXT_PUBLIC_API_BASE_URL`:

1. **Authentication APIs** (`lib/api/auth.ts`):
   - `/auth/login` → `${config.api.baseUrl}/auth/login`
   - `/auth/register` → `${config.api.baseUrl}/auth/register`
   - `/auth/logout` → `${config.api.baseUrl}/auth/logout`
   - `/auth/refresh` → `${config.api.baseUrl}/auth/refresh`
   - `/auth/me` → `${config.api.baseUrl}/auth/me`

2. **User APIs** (`lib/api/auth.ts`):
   - `/users/profile` → `${config.api.baseUrl}/users/profile`
   - `/users/password` → `${config.api.baseUrl}/users/password`
   - `/users/account` → `${config.api.baseUrl}/users/account`
   - `/users/:userId` → `${config.api.baseUrl}/users/:userId`
   - `/users/search` → `${config.api.baseUrl}/users/search`

3. **Auth Context** (`lib/auth/context.tsx`):
   - Uses `config.api.baseUrl` for all API calls

## 🔍 Verify Configuration

Check what API URL is being used:

1. **In Browser Console** (Development):
   ```javascript
   // Open browser console and check
   console.log('API Base URL:', process.env.NEXT_PUBLIC_API_BASE_URL);
   ```

2. **In Code**:
   ```typescript
   import { config } from '@/lib/config';
   console.log('Current API URL:', config.api.baseUrl);
   ```

3. **Network Tab**:
   - Open DevTools → Network tab
   - Make an API call (login/register)
   - Check the request URL - it should show your configured API URL

## ⚠️ Important Notes

1. **Environment Variable Format**:
   - Must start with `NEXT_PUBLIC_` to be available in the browser
   - Format: `NEXT_PUBLIC_API_BASE_URL=https://api.example.com/api`
   - Include `/api` at the end if your backend serves APIs under `/api`

2. **Restart Required**:
   - After changing `.env.local`, restart the dev server
   - After changing `.env.production.local`, rebuild the app

3. **CORS Configuration**:
   - Make sure your backend allows requests from your frontend domain
   - Backend should have CORS configured to accept requests from your frontend URL

## 🐛 Troubleshooting

### API calls still going to localhost:3000?
1. Check `.env.local` or `.env.production.local` exists
2. Verify `NEXT_PUBLIC_API_BASE_URL` is set correctly
3. Restart the dev server: `npm run dev`
4. Clear `.next` cache: `rm -rf .next && npm run build`

### API calls not working?
1. Check browser console for CORS errors
2. Verify the API URL is correct in Network tab
3. Ensure backend is running and accessible
4. Check if API URL includes `/api` suffix if needed

### Production build using wrong URL?
1. Ensure `.env.production.local` exists
2. Set `NODE_ENV=production` in the environment
3. Rebuild: `npm run build:prod`

## 📝 Example Configurations

### Development
```env
NODE_ENV=development
NEXT_PUBLIC_API_BASE_URL=http://localhost:3001/api
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Production (EC2)
```env
NODE_ENV=production
NEXT_PUBLIC_API_BASE_URL=http://13.233.116.167/api
NEXT_PUBLIC_APP_URL=http://13.233.116.167
```

### Production (With Domain)
```env
NODE_ENV=production
NEXT_PUBLIC_API_BASE_URL=https://api.yourdomain.com/api
NEXT_PUBLIC_APP_URL=https://yourdomain.com
```

