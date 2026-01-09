# Frontend Integration Guide

Complete guide for integrating your frontend application with the FullStack Backend API.

## 📋 Table of Contents

- [Environment Setup](#environment-setup)
- [Authentication](#authentication)
- [User Management](#user-management)
- [API Endpoints Reference](#api-endpoints-reference)
- [Error Handling](#error-handling)
- [Code Examples](#code-examples)
- [Best Practices](#best-practices)
- [Testing](#testing)
- [Troubleshooting](#troubleshooting)

## 🔧 Environment Setup

### Base URLs

```javascript
// Development
const API_BASE_URL = 'http://localhost:3001/api';

// Production
const API_BASE_URL = 'https://your-api-domain.com/api';
```

### Environment Variables

```javascript
// .env.local or your environment config
VITE_API_BASE_URL=http://localhost:3001/api
VITE_APP_ENV=development
```

## 🔐 Authentication

### Overview

The API uses JWT (JSON Web Tokens) for authentication with the following flow:

1. **Register** or **Login** → Receive access token + httpOnly refresh cookie
2. **Include Bearer token** in Authorization header for protected requests
3. **Refresh token automatically** when access token expires
4. **Logout** to revoke refresh token

### JWT Token Storage

- **Access Token**: Store in memory or localStorage (short-lived: 15 minutes)
- **Refresh Token**: Handled automatically via httpOnly cookies (7 days)

### Register User

**Endpoint:** `POST /api/auth/register`

**Request:**
```javascript
const registerData = {
  email: "user@example.com",
  password: "securepassword123", // min 6 characters
  firstName: "John",
  lastName: "Doe"
};

const response = await fetch('/api/auth/register', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify(registerData)
});
```

**Success Response (201):**
```json
{
  "user": {
    "id": "uuid-string",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "createdAt": "2024-01-01T00:00:00.000Z"
  },
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Error Responses:**
```json
// 400 - Validation Error
{
  "error": "All fields are required"
}

// 409 - User Exists
{
  "error": "User already exists with this email"
}
```

### Login User

**Endpoint:** `POST /api/auth/login`

**Request:**
```javascript
const loginData = {
  email: "user@example.com",
  password: "securepassword123"
};

const response = await fetch('/api/auth/login', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify(loginData),
  credentials: 'include' // Important: Include cookies for refresh token
});
```

**Success Response (200):**
```json
{
  "user": {
    "id": "uuid-string",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "bio": null,
    "avatarUrl": null,
    "emailVerified": true
  },
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Error Response (401):**
```json
{
  "error": "Invalid credentials"
}
```

### Refresh Access Token

**Endpoint:** `POST /api/auth/refresh`

**Request:**
```javascript
const response = await fetch('/api/auth/refresh', {
  method: 'POST',
  credentials: 'include' // Send refresh cookie
});
```

**Success Response (200):**
```json
{
  "accessToken": "new-jwt-token-here"
}
```

### Logout User

**Endpoint:** `POST /api/auth/logout`

**Request:**
```javascript
const response = await fetch('/api/auth/logout', {
  method: 'POST',
  credentials: 'include' // Send refresh cookie to revoke
});
```

**Success Response (200):**
```json
{
  "message": "Logged out successfully"
}
```

### Get Current User

**Endpoint:** `GET /api/auth/me`

**Request:**
```javascript
const token = localStorage.getItem('accessToken');

const response = await fetch('/api/auth/me', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});
```

**Success Response (200):**
```json
{
  "id": "uuid-string",
  "email": "user@example.com",
  "firstName": "John",
  "lastName": "Doe",
  "bio": "Software developer",
  "avatarUrl": "https://example.com/avatar.jpg",
  "phone": "+1-555-0123",
  "dateOfBirth": "1990-01-01",
  "address": {
    "street": "123 Main St",
    "city": "Anytown",
    "state": "CA",
    "zipCode": "12345"
  },
  "preferences": {
    "theme": "dark",
    "notifications": true,
    "language": "en"
  },
  "emailVerified": true,
  "createdAt": "2024-01-01T00:00:00.000Z"
}
```

## 👤 User Management

### Update Profile

**Endpoint:** `PUT /api/users/profile`

**Request:**
```javascript
const token = localStorage.getItem('accessToken');
const profileData = {
  firstName: "John",
  lastName: "Smith",
  bio: "Updated bio",
  phone: "+1-555-0123",
  dateOfBirth: "1990-01-01",
  address: {
    street: "123 Main St",
    city: "Anytown",
    state: "CA",
    zipCode: "12345"
  },
  preferences: {
    theme: "dark",
    notifications: true
  }
};

const response = await fetch('/api/users/profile', {
  method: 'PUT',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify(profileData)
});
```

**Success Response (200):** Returns updated user object

### Change Password

**Endpoint:** `PUT /api/users/password`

**Request:**
```javascript
const passwordData = {
  currentPassword: "oldpassword123",
  newPassword: "newpassword456"
};

const response = await fetch('/api/users/password', {
  method: 'PUT',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify(passwordData)
});
```

**Success Response (200):**
```json
{
  "message": "Password changed successfully. Please login again."
}
```

### Delete Account

**Endpoint:** `DELETE /api/users/account`

**Request:**
```javascript
const deleteData = {
  password: "currentpassword123"
};

const response = await fetch('/api/users/account', {
  method: 'DELETE',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify(deleteData)
});
```

### Get User Profile

**Endpoint:** `GET /api/users/:userId`

**Request:**
```javascript
const response = await fetch(`/api/users/${userId}`, {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});
```

**Success Response (200):**
```json
{
  "id": "uuid-string",
  "email": "user@example.com",
  "firstName": "John",
  "lastName": "Doe",
  "bio": "User bio",
  "avatarUrl": "https://example.com/avatar.jpg",
  "phone": "+1-555-0123",
  "dateOfBirth": "1990-01-01",
  "address": {
    "street": "123 Main St",
    "city": "Anytown",
    "state": "CA",
    "zipCode": "12345"
  },
  "preferences": {
    "theme": "dark"
  },
  "createdAt": "2024-01-01T00:00:00.000Z",
  "isOwnProfile": false
}
```

### Search Users

**Endpoint:** `GET /api/users/search`

**Request:**
```javascript
const searchParams = new URLSearchParams({
  q: 'john',     // Search query (min 2 characters)
  limit: 10,     // Optional: results per page (max 50)
  offset: 0      // Optional: pagination offset
});

const response = await fetch(`/api/users/search?${searchParams}`, {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});
```

**Success Response (200):**
```json
{
  "users": [
    {
      "id": "uuid-string",
      "email": "john.doe@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "bio": "Software developer",
      "avatarUrl": null,
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  ],
  "limit": 10,
  "offset": 0
}
```

## 📋 API Endpoints Reference

### Authentication Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/auth/register` | Register new user | ❌ |
| POST | `/api/auth/login` | User login | ❌ |
| POST | `/api/auth/refresh` | Refresh access token | ❌ (uses cookie) |
| POST | `/api/auth/logout` | User logout | ❌ (uses cookie) |
| GET | `/api/auth/me` | Get current user | ✅ |

### User Management Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| PUT | `/api/users/profile` | Update user profile | ✅ |
| PUT | `/api/users/password` | Change password | ✅ |
| DELETE | `/api/users/account` | Delete account | ✅ |
| GET | `/api/users/:userId` | Get user profile | ✅ |
| GET | `/api/users/search` | Search users | ✅ |

### System Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/health` | Health check | ❌ |

## 🚨 Error Handling

### HTTP Status Codes

- **200**: Success
- **201**: Created (registration)
- **400**: Bad Request (validation errors)
- **401**: Unauthorized (invalid/missing token)
- **403**: Forbidden (insufficient permissions)
- **404**: Not Found
- **409**: Conflict (user already exists)
- **422**: Unprocessable Entity
- **429**: Too Many Requests (rate limited)
- **500**: Internal Server Error

### Error Response Format

```json
{
  "error": "Error message description"
}
```

### Common Error Scenarios

1. **Token Expired (401):**
   ```javascript
   if (response.status === 401) {
     // Try to refresh token, then retry request
     await refreshToken();
     // Retry the original request
   }
   ```

2. **Validation Errors (400):**
   ```javascript
   // Handle field-specific errors
   if (response.status === 400) {
     const error = await response.json();
     showValidationError(error.error);
   }
   ```

3. **Network Errors:**
   ```javascript
   try {
     const response = await fetch(url, options);
     return await response.json();
   } catch (error) {
     if (error.name === 'TypeError') {
       // Network error - server unreachable
       showNetworkError();
     }
   }
   ```

## 💻 Code Examples

### React Hook for Authentication

```javascript
// hooks/useAuth.js
import { useState, useEffect } from 'react';

export function useAuth() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(localStorage.getItem('accessToken'));

  const login = async (email, password) => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
        credentials: 'include'
      });

      if (!response.ok) throw new Error('Login failed');

      const data = await response.json();
      setToken(data.accessToken);
      setUser(data.user);
      localStorage.setItem('accessToken', data.accessToken);

      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const register = async (userData) => {
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData)
      });

      if (!response.ok) throw new Error('Registration failed');

      const data = await response.json();
      setToken(data.accessToken);
      setUser(data.user);
      localStorage.setItem('accessToken', data.accessToken);

      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const logout = async () => {
    try {
      await fetch('/api/auth/logout', { credentials: 'include' });
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setToken(null);
      setUser(null);
      localStorage.removeItem('accessToken');
    }
  };

  const refreshToken = async () => {
    try {
      const response = await fetch('/api/auth/refresh', {
        credentials: 'include'
      });

      if (response.ok) {
        const data = await response.json();
        setToken(data.accessToken);
        localStorage.setItem('accessToken', data.accessToken);
        return true;
      }
      return false;
    } catch (error) {
      return false;
    }
  };

  const fetchWithAuth = async (url, options = {}) => {
    let response = await fetch(url, {
      ...options,
      headers: {
        ...options.headers,
        ...(token && { Authorization: `Bearer ${token}` })
      }
    });

    if (response.status === 401) {
      // Try to refresh token
      const refreshed = await refreshToken();
      if (refreshed) {
        // Retry with new token
        response = await fetch(url, {
          ...options,
          headers: {
            ...options.headers,
            Authorization: `Bearer ${token}`
          }
        });
      }
    }

    return response;
  };

  useEffect(() => {
    const checkAuth = async () => {
      if (token) {
        try {
          const response = await fetch('/api/auth/me', {
            headers: { Authorization: `Bearer ${token}` }
          });

          if (response.ok) {
            const userData = await response.json();
            setUser(userData);
          } else if (response.status === 401) {
            // Try refresh, if fails, logout
            const refreshed = await refreshToken();
            if (!refreshed) {
              logout();
            }
          }
        } catch (error) {
          console.error('Auth check failed:', error);
        }
      }
      setLoading(false);
    };

    checkAuth();
  }, [token]);

  return {
    user,
    token,
    loading,
    login,
    register,
    logout,
    fetchWithAuth
  };
}
```

### API Service Class

```javascript
// services/api.js
class ApiService {
  constructor(baseURL = '/api') {
    this.baseURL = baseURL;
    this.token = localStorage.getItem('accessToken');
  }

  setToken(token) {
    this.token = token;
    if (token) {
      localStorage.setItem('accessToken', token);
    } else {
      localStorage.removeItem('accessToken');
    }
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      },
      ...options
    };

    if (this.token) {
      config.headers.Authorization = `Bearer ${this.token}`;
    }

    if (options.body && typeof options.body === 'object') {
      config.body = JSON.stringify(options.body);
    }

    let response = await fetch(url, config);

    // Handle token refresh
    if (response.status === 401 && this.token) {
      const refreshed = await this.refreshToken();
      if (refreshed) {
        // Retry with new token
        config.headers.Authorization = `Bearer ${this.token}`;
        response = await fetch(url, config);
      }
    }

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Network error' }));
      throw new Error(error.error || `HTTP ${response.status}`);
    }

    return response.json();
  }

  async refreshToken() {
    try {
      const response = await fetch(`${this.baseURL}/auth/refresh`, {
        credentials: 'include'
      });

      if (response.ok) {
        const data = await response.json();
        this.setToken(data.accessToken);
        return true;
      }
      return false;
    } catch (error) {
      return false;
    }
  }

  // Auth methods
  async login(credentials) {
    const response = await fetch(`${this.baseURL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials),
      credentials: 'include'
    });

    if (!response.ok) {
      throw new Error('Login failed');
    }

    const data = await response.json();
    this.setToken(data.accessToken);
    return data;
  }

  async register(userData) {
    const data = await this.request('/auth/register', {
      method: 'POST',
      body: userData
    });
    this.setToken(data.accessToken);
    return data;
  }

  async logout() {
    await fetch(`${this.baseURL}/auth/logout`, { credentials: 'include' });
    this.setToken(null);
  }

  async getCurrentUser() {
    return this.request('/auth/me');
  }

  // User methods
  async updateProfile(profileData) {
    return this.request('/users/profile', {
      method: 'PUT',
      body: profileData
    });
  }

  async changePassword(passwordData) {
    return this.request('/users/password', {
      method: 'PUT',
      body: passwordData
    });
  }

  async deleteAccount(password) {
    return this.request('/users/account', {
      method: 'DELETE',
      body: { password }
    });
  }

  async getUserProfile(userId) {
    return this.request(`/users/${userId}`);
  }

  async searchUsers(query, limit = 10, offset = 0) {
    const params = new URLSearchParams({ q: query, limit, offset });
    return this.request(`/users/search?${params}`);
  }
}

export default new ApiService();
```

## 📋 Best Practices

### Token Management

1. **Store tokens securely:**
   ```javascript
   // Access token in memory/localStorage
   // Refresh token handled by httpOnly cookies
   ```

2. **Automatic token refresh:**
   ```javascript
   // Implement in your API client
   if (response.status === 401) {
     await refreshToken();
     // Retry request
   }
   ```

3. **Token expiration handling:**
   ```javascript
   // Decode JWT to check expiration
   const decoded = JSON.parse(atob(token.split('.')[1]));
   const isExpired = decoded.exp * 1000 < Date.now();
   ```

### Error Handling

1. **Global error interceptor:**
   ```javascript
   // Add to your API client
   if (!response.ok) {
     const error = await response.json();
     throw new Error(error.error || 'API Error');
   }
   ```

2. **User-friendly error messages:**
   ```javascript
   try {
     await api.updateProfile(profileData);
   } catch (error) {
     if (error.message.includes('validation')) {
       showFieldErrors(error.details);
     } else {
       showGenericError(error.message);
     }
   }
   ```

### Loading States

1. **Request loading states:**
   ```javascript
   const [loading, setLoading] = useState(false);

   const handleSubmit = async () => {
     setLoading(true);
     try {
       await api.updateProfile(data);
       showSuccess('Profile updated!');
     } catch (error) {
       showError(error.message);
     } finally {
       setLoading(false);
     }
   };
   ```

### Form Validation

1. **Client-side validation:**
   ```javascript
   const validatePassword = (password) => {
     if (password.length < 6) {
       return 'Password must be at least 6 characters';
     }
     return null;
   };
   ```

2. **Server error handling:**
   ```javascript
   // Map API errors to form fields
   const handleApiErrors = (error) => {
     if (error.message.includes('email')) {
       setFieldError('email', error.message);
     }
   };
   ```

## 🧪 Testing

### Health Check

```bash
# Test API availability
curl http://localhost:3001/health
```

### Authentication Testing

```bash
# Register test user
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test123","firstName":"Test","lastName":"User"}'

# Login
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test123"}' \
  -c cookies.txt

# Get profile (replace TOKEN with actual token)
curl -H "Authorization: Bearer TOKEN" \
  http://localhost:3001/api/auth/me
```

### Demo Credentials

```javascript
// Pre-seeded test accounts
const demoUsers = [
  { email: 'demo@example.com', password: 'DemoPass123!' },
  { email: 'john.doe@example.com', password: 'TestPass123!' },
  { email: 'jane.smith@example.com', password: 'TestPass123!' },
  { email: 'admin@example.com', password: 'TestPass123!' }
];
```

## 🔧 Troubleshooting

### Common Issues

1. **CORS Errors:**
   - Ensure API calls include `credentials: 'include'` for cookies
   - Check if API base URL matches allowed origins

2. **401 Unauthorized:**
   - Check if token is valid and not expired
   - Ensure `Authorization: Bearer ${token}` header is set
   - Try refreshing token

3. **Network Errors:**
   - Verify API base URL is correct
   - Check if backend is running
   - Test with health endpoint

4. **Token Refresh Issues:**
   - Ensure refresh endpoint is called with `credentials: 'include'`
   - Check if refresh cookie exists

### Debug Tips

1. **Check token validity:**
   ```javascript
   // Decode JWT payload
   const payload = JSON.parse(atob(token.split('.')[1]));
   console.log('Token expires:', new Date(payload.exp * 1000));
   ```

2. **Monitor network requests:**
   ```javascript
   // Add logging to your API client
   console.log('Request:', url, options);
   console.log('Response:', response.status, await response.clone().json());
   ```

3. **Check browser cookies:**
   - Open DevTools → Application → Cookies
   - Look for `refreshToken` cookie

### Rate Limiting

- **Authentication endpoints:** 5 requests per 15 minutes
- **General API:** 100 requests per 15 minutes
- **Login endpoint:** 10 attempts per 15 minutes

Rate limit headers are included in responses:
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 99
X-RateLimit-Reset: 1640995200
```

## 📞 Support

### API Documentation

- **Swagger UI:** `http://localhost:3001/docs`
- **API Reference:** `API.md`
- **Health Check:** `http://localhost:3001/health`

### Data Types

```typescript
interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  bio?: string;
  avatarUrl?: string;
  phone?: string;
  dateOfBirth?: string;
  address?: Address;
  preferences?: Record<string, any>;
  emailVerified: boolean;
  createdAt: string;
}

interface Address {
  street?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  country?: string;
}

interface ApiError {
  error: string;
}

interface PaginatedResponse<T> {
  data: T[];
  limit: number;
  offset: number;
}
```

This guide provides everything needed to integrate your frontend with the backend API. Start with the authentication flow, then implement user management features. Use the code examples as a foundation and adapt them to your specific frontend framework. 🚀
