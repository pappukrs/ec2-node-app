# Debugging "Failed to fetch" Errors

## 🔍 What "Failed to fetch" Means

This error typically indicates one of these issues:

1. **CORS Error** - Backend not allowing requests from frontend origin
2. **Backend Not Running** - API server is down or unreachable
3. **Wrong API URL** - Incorrect API endpoint configured
4. **Network Issue** - Firewall or connectivity problem

## ✅ Enhanced Error Handling Added

All API calls now have:
- ✅ Better error messages
- ✅ URL logging for debugging
- ✅ CORS detection
- ✅ Network error detection

## 🔧 How to Debug

### Step 1: Check Browser Console

Open DevTools (F12) → Console tab. You should see:
```
🌐 Client-side API Configuration:
   API Base URL: http://13.233.116.167/api
   Environment: development
```

### Step 2: Check Network Tab

1. Open DevTools → Network tab
2. Try to login or load profile
3. Look for the failed request
4. Check:
   - **Request URL** - Should be your API URL (e.g., `http://13.233.116.167/api/auth/me`)
   - **Status** - Will show CORS error or network error
   - **Headers** - Check if `Authorization` header is present

### Step 3: Verify API URL

In browser console, run:
```javascript
// Check current API configuration
console.log('API Base URL:', process.env.NEXT_PUBLIC_API_BASE_URL);
```

Or check the config:
```javascript
import { config } from '@/lib/config';
console.log('Current API URL:', config.api.baseUrl);
```

### Step 4: Test API Directly

Test if your backend is accessible:
```bash
# Test if backend is reachable
curl http://13.233.116.167/api/auth/me \
  -H "Authorization: Bearer YOUR_TOKEN"

# Or test health endpoint
curl http://13.233.116.167/health
```

## 🐛 Common Issues & Solutions

### Issue 1: CORS Error

**Symptoms:**
- Console shows: "CORS Error: The backend at ... is not allowing requests"
- Network tab shows CORS error (red)

**Solution:**
Backend needs to allow your frontend origin. Add to backend CORS config:
```javascript
// Backend CORS configuration
origin: ['http://localhost:3000', 'http://13.233.116.167', 'https://yourdomain.com']
credentials: true
```

### Issue 2: Backend Not Running

**Symptoms:**
- Network tab shows "Failed to fetch" or "ERR_CONNECTION_REFUSED"
- curl command fails

**Solution:**
1. Check if backend is running
2. Verify backend port (should be 3001 or your configured port)
3. Check firewall rules

### Issue 3: Wrong API URL

**Symptoms:**
- Console shows different URL than expected
- Network tab shows request to wrong domain

**Solution:**
1. Check `.env.local` or `.env.production.local`
2. Verify `NEXT_PUBLIC_API_BASE_URL` is set correctly
3. Restart dev server after changing env vars

### Issue 4: Missing Credentials

**Symptoms:**
- Refresh token not working
- Cookies not being sent

**Solution:**
All API calls now have `credentials: 'include'` ✅

## 📋 Quick Checklist

- [ ] Backend server is running
- [ ] API URL is correct in environment variables
- [ ] CORS is configured on backend
- [ ] Network tab shows correct request URL
- [ ] `credentials: 'include'` is present (✅ Already fixed)
- [ ] Backend allows requests from frontend origin

## 🔍 Enhanced Error Messages

Now when errors occur, you'll see:
- Exact API URL being called
- Type of error (CORS, Network, etc.)
- Helpful suggestions for fixing

Check the browser console for detailed error information!

