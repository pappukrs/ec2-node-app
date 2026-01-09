# API Reference

Complete API documentation for the Full Stack Backend.

## Base URL

```
http://localhost:3001/api
```

## Authentication

All protected endpoints require a Bearer token in the Authorization header:

```
Authorization: Bearer <access_token>
```

## Response Format

All responses follow this format:

```json
{
  "data": { ... },
  "message": "Optional message",
  "error": "Error message (only on error)"
}
```

Error responses include appropriate HTTP status codes.

---

## Authentication Endpoints

### POST /auth/register

Register a new user account.

**Request Body:**
```json
{
  "email": "string (required)",
  "password": "string (required, min 6 chars)",
  "firstName": "string (required)",
  "lastName": "string (required)"
}
```

**Response (201):**
```json
{
  "user": {
    "id": "uuid",
    "email": "string",
    "firstName": "string",
    "lastName": "string",
    "createdAt": "timestamp"
  },
  "accessToken": "string"
}
```

**Error Responses:**
- `400` - Invalid input data
- `409` - User already exists

### POST /auth/login

Authenticate user and return tokens.

**Request Body:**
```json
{
  "email": "string (required)",
  "password": "string (required)"
}
```

**Response (200):**
```json
{
  "user": {
    "id": "uuid",
    "email": "string",
    "firstName": "string",
    "lastName": "string",
    "bio": "string|null",
    "avatarUrl": "string|null",
    "emailVerified": "boolean"
  },
  "accessToken": "string"
}
```

**Error Responses:**
- `400` - Invalid credentials
- `401` - Account deactivated

### POST /auth/refresh

Refresh access token using refresh token cookie.

**Cookies:**
- `refreshToken`: JWT refresh token

**Response (200):**
```json
{
  "accessToken": "string"
}
```

**Error Responses:**
- `401` - Invalid or expired refresh token

### POST /auth/logout

Logout user by revoking refresh token.

**Cookies:**
- `refreshToken`: JWT refresh token

**Response (200):**
```json
{
  "message": "Logged out successfully"
}
```

### GET /auth/me

Get current authenticated user information.

**Headers:**
- `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "id": "uuid",
  "email": "string",
  "firstName": "string",
  "lastName": "string",
  "bio": "string|null",
  "avatarUrl": "string|null",
  "phone": "string|null",
  "dateOfBirth": "date|null",
  "address": "object|null",
  "preferences": "object",
  "emailVerified": "boolean",
  "createdAt": "timestamp"
}
```

---

## User Management Endpoints

### PUT /users/profile

Update user profile information.

**Headers:**
- `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "firstName": "string (optional)",
  "lastName": "string (optional)",
  "bio": "string (optional)",
  "phone": "string (optional)",
  "dateOfBirth": "date (optional)",
  "address": "object (optional)",
  "preferences": "object (optional)"
}
```

**Response (200):** Same as GET /auth/me

### PUT /users/password

Change user password.

**Headers:**
- `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "currentPassword": "string (required)",
  "newPassword": "string (required, min 6 chars)"
}
```

**Response (200):**
```json
{
  "message": "Password changed successfully. Please login again."
}
```

**Error Responses:**
- `400` - Incorrect current password or invalid new password

### DELETE /users/account

Delete user account permanently.

**Headers:**
- `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "password": "string (required)"
}
```

**Response (200):**
```json
{
  "message": "Account deleted successfully"
}
```

**Error Responses:**
- `400` - Incorrect password

### GET /users/:userId

Get public user profile information.

**Headers:**
- `Authorization: Bearer <token>`

**Parameters:**
- `userId`: UUID of the user

**Response (200):**
```json
{
  "id": "uuid",
  "email": "string",
  "firstName": "string",
  "lastName": "string",
  "bio": "string|null",
  "avatarUrl": "string|null",
  "phone": "string|null",
  "dateOfBirth": "date|null",
  "address": "object|null (only for own profile)",
  "preferences": "object (only for own profile)",
  "createdAt": "timestamp",
  "isOwnProfile": "boolean"
}
```

**Error Responses:**
- `404` - User not found

### GET /users/search

Search for users by name or email.

**Headers:**
- `Authorization: Bearer <token>`

**Query Parameters:**
- `q`: Search query (min 2 characters)
- `limit`: Number of results (default: 10, max: 50)
- `offset`: Pagination offset (default: 0)

**Response (200):**
```json
{
  "users": [
    {
      "id": "uuid",
      "email": "string",
      "firstName": "string",
      "lastName": "string",
      "bio": "string|null",
      "avatarUrl": "string|null",
      "createdAt": "timestamp"
    }
  ],
  "limit": 10,
  "offset": 0
}
```

---

## Health Check

### GET /health

Check API health status.

**Response (200):**
```json
{
  "status": "OK",
  "timestamp": "timestamp",
  "environment": "string",
  "version": "string"
}
```

---

## Error Codes

### Common HTTP Status Codes

- `200` - Success
- `201` - Created
- `400` - Bad Request (validation error)
- `401` - Unauthorized (invalid/missing token)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `409` - Conflict (resource already exists)
- `422` - Unprocessable Entity
- `429` - Too Many Requests (rate limited)
- `500` - Internal Server Error

### Error Response Format

```json
{
  "error": "Error message description"
}
```

---

## Rate Limiting

API endpoints are protected by rate limiting:

- **General API**: 100 requests per 15 minutes per IP
- **Auth endpoints**: 5 requests per 15 minutes per IP
- **Login endpoint**: 10 attempts per 15 minutes per IP

Rate limit headers are included in responses:
- `X-RateLimit-Limit`
- `X-RateLimit-Remaining`
- `X-RateLimit-Reset`

---

## Data Types

### User Object
```typescript
interface User {
  id: string; // UUID
  email: string;
  firstName: string;
  lastName: string;
  bio?: string;
  avatarUrl?: string;
  phone?: string;
  dateOfBirth?: string; // ISO date
  address?: Address;
  preferences?: object;
  emailVerified: boolean;
  createdAt: string; // ISO timestamp
}
```

### Address Object
```typescript
interface Address {
  street?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  country?: string;
}
```

---

## SDK Examples

### JavaScript (Fetch API)

```javascript
// Login
const login = async (email, password) => {
  const response = await fetch('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
    credentials: 'include' // Include cookies
  });

  if (response.ok) {
    const data = await response.json();
    localStorage.setItem('accessToken', data.accessToken);
    return data;
  } else {
    throw new Error('Login failed');
  }
};

// Authenticated request
const getUserProfile = async () => {
  const token = localStorage.getItem('accessToken');
  const response = await fetch('/api/auth/me', {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });

  if (response.status === 401) {
    // Token expired, try refresh
    await refreshToken();
    return getUserProfile();
  }

  return response.json();
};

// Refresh token
const refreshToken = async () => {
  const response = await fetch('/api/auth/refresh', {
    method: 'POST',
    credentials: 'include'
  });

  if (response.ok) {
    const data = await response.json();
    localStorage.setItem('accessToken', data.accessToken);
    return data;
  } else {
    // Redirect to login
    window.location.href = '/login';
  }
};
```

### cURL Examples

```bash
# Register
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "password123",
    "firstName": "John",
    "lastName": "Doe"
  }'

# Login
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "password123"
  }' \
  -c cookies.txt

# Get profile (using token)
curl -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  http://localhost:3001/api/auth/me

# Refresh token
curl -X POST http://localhost:3001/api/auth/refresh \
  -b cookies.txt

# Update profile
curl -X PUT http://localhost:3001/api/users/profile \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "bio": "Software developer",
    "phone": "+1-555-0123"
  }'
```
