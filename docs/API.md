# Authentication API Documentation

This document describes the authentication API endpoints available in the auth.gripday.com frontend application and how they map to the backend services.

## Architecture Overview

The authentication system follows a microservices architecture with:

- **User Service**: Handles authentication, user management, and JWT token generation
- **Gateway Service**: Routes requests and validates JWT tokens
- **Frontend (auth.gripday.com)**: Provides authentication UI and API client

## API Endpoints

### Authentication Endpoints

#### 1. User Registration (Signup)

**Endpoint**: `POST /api/v1/auth/signup`

**Description**: Register a new user account with email verification.

**Request Body**:

```typescript
{
  username: string;      // 3-50 characters, alphanumeric + underscore
  email: string;         // Valid email format
  password: string;      // Min 8 chars, uppercase, lowercase, number, special char
  firstName: string;     // User's first name
  lastName: string;      // User's last name
  tenantId?: string;     // Optional tenant ID (defaults to "default")
}
```

**Response** (201 Created):

```typescript
{
  userId: number;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  emailVerified: boolean;
  createdAt: string;
  message: string;
}
```

**Features**:

- Username and email uniqueness validation
- Strong password requirements
- Email verification required before login
- Multi-tenant support
- Rate limiting protection

**Frontend Usage**:

```typescript
import { authApi } from "@/shared/api";

const response = await authApi.signup({
  username: "johndoe",
  email: "john@example.com",
  password: "SecurePass123!",
  firstName: "John",
  lastName: "Doe",
});
```

---

#### 2. User Login

**Endpoint**: `POST /api/v1/auth/login`

**Description**: Authenticate user and receive JWT tokens.

**Request Body**:

```typescript
{
  username: string; // Username or email
  password: string; // User password
  rememberMe: boolean; // Extend refresh token expiry
}
```

**Response** (200 OK):

```typescript
{
  accessToken: string;   // JWT access token (15 min expiry)
  refreshToken: string;  // JWT refresh token (7 days or 30 days with rememberMe)
  tokenType: string;     // "Bearer"
  expiresIn: number;     // Access token expiry in seconds
  user: {
    userId: number;
    username: string;
    email: string;
    firstName: string;
    lastName: string;
    roles: string[];
    permissions: string[];
    tenantId: string;
    emailVerified: boolean;
    customClaims: Record<string, unknown>;
  }
}
```

**Security Features**:

- Account lockout after 5 failed attempts (15-minute lockout)
- Rate limiting (5 attempts per minute per IP)
- Audit logging
- Email verification required

**Frontend Usage**:

```typescript
import { useAuthStore } from "@/processes/auth";

const login = useAuthStore((state) => state.login);

await login({
  username: "johndoe",
  password: "SecurePass123!",
  rememberMe: true,
});
```

---

#### 3. Token Refresh

**Endpoint**: `POST /api/v1/auth/refresh`

**Description**: Refresh access token using a valid refresh token.

**Request Body**:

```typescript
{
  refreshToken: string; // Valid refresh token
}
```

**Response** (200 OK):

```typescript
{
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  expiresIn: number;
  user: AuthUser;
}
```

**Features**:

- Automatic token rotation
- Old refresh token is invalidated
- Maintains user session

**Frontend Usage**:

```typescript
import { authApi } from "@/shared/api";

const response = await authApi.refresh({
  refreshToken: "current-refresh-token",
});
```

---

#### 4. User Logout

**Endpoint**: `POST /api/v1/auth/logout`

**Description**: Logout user and invalidate current tokens.

**Headers**:

```
Authorization: Bearer <access-token>
```

**Response** (204 No Content)

**Features**:

- Invalidates current access and refresh tokens
- Adds tokens to blacklist
- Audit logging

**Frontend Usage**:

```typescript
import { useAuthStore } from "@/processes/auth";

const logout = useAuthStore((state) => state.logout);
await logout();
```

---

#### 5. Logout from All Devices

**Endpoint**: `POST /api/v1/auth/logout-all`

**Description**: Invalidate all refresh tokens and sessions for the user.

**Headers**:

```
Authorization: Bearer <access-token>
```

**Response** (204 No Content)

**Frontend Usage**:

```typescript
import { authApi } from "@/shared/api";

await authApi.logoutAll();
```

---

#### 6. Validate Token

**Endpoint**: `POST /api/v1/auth/validate`

**Description**: Validate a JWT token and return its status and user context.

**Request Body**:

```typescript
{
  token: string; // JWT token to validate
}
```

**Response** (200 OK):

```typescript
{
  active: boolean;
  tokenId: string | null;
  tokenType: string | null;
  issuedAt: string | null;
  expiresAt: string | null;
  user: AuthUser | null;
}
```

**Frontend Usage**:

```typescript
import { authApi } from "@/shared/api";

const validation = await authApi.validateToken("jwt-token");
if (validation.active) {
  console.log("Token is valid", validation.user);
}
```

---

### Email Verification Endpoints

#### 7. Verify Email

**Endpoint**: `GET /api/v1/auth/email/verify?token=<token>`

**Description**: Verify user email address using verification token.

**Query Parameters**:

- `token` (required): Email verification token from email

**Response** (200 OK):

```typescript
{
  success: boolean;
  message: string;
  username: string;
  verifiedAt: string;
}
```

**Features**:

- Single-use tokens
- 24-hour token expiry
- Account activation

**Frontend Usage**:

```typescript
import { authApi } from "@/shared/api";

await authApi.verifyEmail("verification-token");
```

---

#### 8. Resend Verification Email

**Endpoint**: `POST /api/v1/auth/email/resend`

**Description**: Resend email verification link.

**Request Body**:

```typescript
{
  email: string; // Email address to resend verification to
}
```

**Response** (200 OK):

```typescript
{
  success: boolean;
  message: string;
  username: string;
  verifiedAt: null;
}
```

**Rate Limiting**: Maximum 3 emails per hour per user

**Frontend Usage**:

```typescript
import { authApi } from "@/shared/api";

await authApi.resendVerification("john@example.com");
```

---

#### 9. Get Email Verification Status

**Endpoint**: `GET /api/v1/auth/email/status?email=<email>`

**Description**: Check email verification status for an email address.

**Query Parameters**:

- `email` (required): Email address to check

**Response** (200 OK):

```typescript
{
  email: string;
  emailVerified: boolean;
  registrationDate: string;
  message: string;
}
```

**Frontend Usage**:

```typescript
import { authApi } from "@/shared/api";

const status = await authApi.getEmailStatus("john@example.com");
console.log("Email verified:", status.emailVerified);
```

---

### Password Management Endpoints

#### 10. Forgot Password

**Endpoint**: `POST /api/v1/password/forgot`

**Description**: Initiate password reset flow by sending reset email.

**Request Body**:

```typescript
{
  email: string; // Email address for password reset
}
```

**Response** (202 Accepted)

**Security Features**:

- Always returns 202 (prevents user enumeration)
- Reset tokens expire in 1 hour
- Rate limiting per IP address
- Audit logging

**Frontend Usage**:

```typescript
import { authApi } from "@/shared/api";

await authApi.forgotPassword("john@example.com");
```

---

#### 11. Reset Password

**Endpoint**: `POST /api/v1/password/reset`

**Description**: Reset password using reset token from email.

**Request Body**:

```typescript
{
  token: string; // Password reset token
  newPassword: string; // New password
}
```

**Response** (204 No Content)

**Password Requirements**:

- Minimum 8 characters
- Uppercase letter
- Lowercase letter
- Number
- Special character

**Security Features**:

- Single-use tokens
- 1-hour token expiry
- All existing sessions invalidated
- Confirmation email sent

**Frontend Usage**:

```typescript
import { authApi } from "@/shared/api";

await authApi.resetPassword("reset-token", "NewSecurePass123!");
```

---

#### 12. Change Password

**Endpoint**: `POST /api/v1/password/change`

**Description**: Change password for authenticated user.

**Headers**:

```
Authorization: Bearer <access-token>
```

**Request Body**:

```typescript
{
  currentPassword: string; // Current password for verification
  newPassword: string; // New password
}
```

**Response** (204 No Content)

**Features**:

- Requires current password verification
- Cannot be same as current password
- Confirmation email sent
- Session preserved

**Frontend Usage**:

```typescript
import { authApi } from "@/shared/api";

await authApi.changePassword("CurrentPass123!", "NewSecurePass123!");
```

---

## JWT Token Structure

### Access Token (15 minutes expiry)

```json
{
  "iss": "gripday-user-service",
  "sub": "1",
  "iat": 1642248000,
  "exp": 1642248900,
  "jti": "unique-token-id",
  "type": "access",
  "userId": 1,
  "username": "johndoe",
  "email": "john@example.com",
  "roles": ["USER", "ADMIN"],
  "permissions": ["read:profile", "update:profile"],
  "firstName": "John",
  "lastName": "Doe",
  "tenantId": "default",
  "department": "Engineering",
  "organizationId": "org-123"
}
```

### Refresh Token (7 days expiry, 30 days with rememberMe)

Similar structure with `type: "refresh"` and longer expiry.

---

## Error Handling

All API errors follow RFC 7807 Problem Details format:

```typescript
{
  type: string;           // Error type URI
  title: string;          // Human-readable title
  status: number;         // HTTP status code
  detail: string;         // Detailed error message
  instance: string;       // Request path
  code: string;           // Application error code
  path: string;           // Request path
  method: string;         // HTTP method
  correlationId: string;  // Request correlation ID
  requestId: string;      // Request ID
  fields?: Array<{        // Validation errors
    field: string;
    message: string;
  }>;
}
```

### Common Error Codes

- `400 Bad Request`: Invalid input data
- `401 Unauthorized`: Invalid credentials or expired token
- `403 Forbidden`: Insufficient permissions
- `404 Not Found`: Resource not found
- `409 Conflict`: Username or email already exists
- `423 Locked`: Account locked due to failed login attempts
- `429 Too Many Requests`: Rate limit exceeded

---

## Rate Limiting

### Endpoint Rate Limits

| Endpoint                    | Requests/Minute | Burst Capacity |
| --------------------------- | --------------- | -------------- |
| `/api/v1/auth/login`        | 10              | 20             |
| `/api/v1/auth/signup`       | 5               | 10             |
| `/api/v1/auth/email/resend` | 3               | 5              |
| `/api/v1/auth/email/verify` | 10              | 15             |
| `/api/v1/password/forgot`   | 3               | 5              |
| `/api/v1/password/reset`    | 5               | 10             |
| `/api/v1/password/change`   | 10              | 15             |

---

## Security Features

### Account Protection

- Account lockout after 5 failed login attempts
- 15-minute lockout duration
- Email verification required before login
- Strong password requirements

### Token Security

- RSA256 asymmetric encryption
- Short-lived access tokens (15 minutes)
- Long-lived refresh tokens (7 days)
- Token blacklisting on logout
- Automatic token rotation

### Audit Logging

- All authentication events logged
- Failed login attempts tracked
- Password changes recorded
- Token operations monitored

---

## Configuration

### Environment Variables

```env
# API Base URL
VITE_API_URL_SERVER=http://localhost:8080

# Auth Domain Configuration
VITE_AUTH_DOMAIN_AUTH=https://auth.iqkv.com
VITE_AUTH_DOMAIN_APP=https://app.iqkv.com

# Redirect URLs
VITE_AUTH_REDIRECT_AFTER_LOGIN=https://app.iqkv.com
VITE_AUTH_REDIRECT_AFTER_LOGOUT=https://auth.iqkv.com
VITE_AUTH_REDIRECT_AFTER_SIGNUP=https://auth.iqkv.com
```

### Token Storage

Tokens are stored in:

- **Access Token**: `localStorage` with key `accessToken`
- **Refresh Token**: `localStorage` with key `refreshToken`

For production, consider using `httpOnly` cookies for enhanced security.

---

## Testing

### Example Test Flow

```typescript
// 1. Register user
const signupResponse = await authApi.signup({
  username: "testuser",
  email: "test@example.com",
  password: "TestPass123!",
  firstName: "Test",
  lastName: "User",
});

// 2. Verify email (get token from email)
await authApi.verifyEmail("verification-token");

// 3. Login
const loginResponse = await authApi.login({
  username: "testuser",
  password: "TestPass123!",
  rememberMe: false,
});

// 4. Access protected resources
// (Access token is automatically included in requests)

// 5. Refresh token when needed
const refreshResponse = await authApi.refresh({
  refreshToken: loginResponse.refreshToken,
});

// 6. Logout
await authApi.logout();
```

---

## Related Documentation

- [Backend Authentication Architecture](../../backend/AUTHENTICATION-ARCHITECTURE.md)
- [User Service API](../../backend/gripday-user-service/docs/api/authentication.md)
- [Gateway Service Configuration](../../backend/gripday-gateway-service/README.md)
