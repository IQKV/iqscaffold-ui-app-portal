# API Endpoints Reference

## Authentication Endpoints

### POST /api/auth/login

Authenticate user with email and password.

**Request:**

```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**

```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "123",
    "email": "user@example.com",
    "name": "John Doe",
    "role": "user"
  }
}
```

### POST /api/auth/logout

Logout current user and invalidate token.

**Headers:**

```
Authorization: Bearer <token>
```

**Response:**

```json
{
  "message": "Logged out successfully"
}
```

### GET /api/users/me

Get current authenticated user information.

**Headers:**

```
Authorization: Bearer <token>
```

**Response:**

```json
{
  "id": "123",
  "email": "user@example.com",
  "name": "John Doe",
  "role": "user",
  "createdAt": "2024-01-01T00:00:00Z"
}
```

## User Management Endpoints

### GET /api/users

Get list of users with pagination and filtering.

**Query Parameters:**

- `page` (number): Page number (default: 1)
- `limit` (number): Items per page (default: 10)
- `search` (string): Search term for name/email
- `role` (string): Filter by user role

**Response:**

```json
{
  "users": [
    {
      "id": "123",
      "name": "John Doe",
      "email": "john@example.com",
      "role": "user",
      "createdAt": "2024-01-01T00:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 100,
    "pages": 10
  }
}
```

### GET /api/users/:id

Get specific user by ID.

**Response:**

```json
{
  "id": "123",
  "name": "John Doe",
  "email": "john@example.com",
  "role": "user",
  "createdAt": "2024-01-01T00:00:00Z",
  "updatedAt": "2024-01-01T00:00:00Z"
}
```

### POST /api/users

Create new user.

**Request:**

```json
{
  "name": "Jane Doe",
  "email": "jane@example.com",
  "password": "password123",
  "role": "user"
}
```

**Response:**

```json
{
  "id": "124",
  "name": "Jane Doe",
  "email": "jane@example.com",
  "role": "user",
  "createdAt": "2024-01-01T00:00:00Z"
}
```

### PUT /api/users/:id

Update existing user.

**Request:**

```json
{
  "name": "Jane Smith",
  "email": "jane.smith@example.com"
}
```

**Response:**

```json
{
  "id": "124",
  "name": "Jane Smith",
  "email": "jane.smith@example.com",
  "role": "user",
  "updatedAt": "2024-01-01T00:00:00Z"
}
```

### DELETE /api/users/:id

Delete user by ID.

**Response:**

```json
{
  "message": "User deleted successfully"
}
```

## Error Responses

All endpoints may return the following error responses:

### 400 Bad Request

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input data",
    "details": [
      {
        "field": "email",
        "message": "Invalid email format"
      }
    ]
  }
}
```

### 401 Unauthorized

```json
{
  "error": {
    "code": "UNAUTHORIZED",
    "message": "Authentication required"
  }
}
```

### 403 Forbidden

```json
{
  "error": {
    "code": "FORBIDDEN",
    "message": "Insufficient permissions"
  }
}
```

### 404 Not Found

```json
{
  "error": {
    "code": "NOT_FOUND",
    "message": "Resource not found"
  }
}
```

### 429 Too Many Requests

```json
{
  "error": {
    "code": "RATE_LIMIT",
    "message": "Too many requests, please try again later"
  }
}
```

### 500 Internal Server Error

```json
{
  "error": {
    "code": "SERVER_ERROR",
    "message": "Internal server error"
  }
}
```
