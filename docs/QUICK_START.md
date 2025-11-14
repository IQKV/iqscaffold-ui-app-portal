# Authentication API Quick Start Guide

Quick reference for using the refactored authentication API in auth.gripday.com.

## Installation

No installation needed - the API is already integrated into the project.

## Basic Usage

### 1. User Registration

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

### 2. Email Verification

```typescript
// Verify email with token from email
await authApi.verifyEmail(token);

// Resend verification email
await authApi.resendVerification("john@example.com");

// Check verification status
const status = await authApi.getEmailStatus("john@example.com");
```

### 3. User Login

```typescript
import { useAuthStore } from "@/processes/auth";

const login = useAuthStore((state) => state.login);

await login({
  username: "johndoe",
  password: "SecurePass123!",
  rememberMe: true,
});
```

### 4. Password Reset

```typescript
// Request password reset
await authApi.forgotPassword("john@example.com");

// Reset password with token
await authApi.resetPassword(token, "NewSecurePass123!");

// Change password (authenticated)
await authApi.changePassword("OldPass123!", "NewPass123!");
```

### 5. Token Management

```typescript
// Validate token
const validation = await authApi.validateToken(token);
if (validation.active) {
  console.log("Token is valid", validation.user);
}

// Refresh token
const refreshed = await authApi.refresh({ refreshToken });

// Logout
await authApi.logout();

// Logout from all devices
await authApi.logoutAll();
```

## Using React Hooks

### Email Verification Hook

```typescript
import { useVerifyEmail } from '@/shared/lib/use-auth-api';

function VerifyEmailPage() {
  const verifyEmail = useVerifyEmail();

  useEffect(() => {
    if (token) {
      verifyEmail.mutate(token);
    }
  }, [token]);

  if (verifyEmail.isSuccess) {
    return <div>Email verified! ✓</div>;
  }

  return <div>Verifying...</div>;
}
```

### Change Password Hook

```typescript
import { useChangePassword } from '@/shared/lib/use-auth-api';

function ChangePasswordForm() {
  const changePassword = useChangePassword();

  const handleSubmit = (values) => {
    changePassword.mutate({
      currentPassword: values.current,
      newPassword: values.new
    });
  };

  return <form onSubmit={handleSubmit}>...</form>;
}
```

### Email Status Hook

```typescript
import { useEmailStatus } from '@/shared/lib/use-auth-api';

function EmailStatusBadge({ email }) {
  const { data, isLoading } = useEmailStatus(email);

  if (isLoading) return <span>Checking...</span>;

  return (
    <span>
      {data?.emailVerified ? '✓ Verified' : '✗ Not Verified'}
    </span>
  );
}
```

## API Endpoints Reference

| Method                         | Endpoint                         | Description               |
| ------------------------------ | -------------------------------- | ------------------------- |
| `authApi.signup()`             | `POST /api/v1/auth/signup`       | Register new user         |
| `authApi.login()`              | `POST /api/v1/auth/login`        | Login user                |
| `authApi.logout()`             | `POST /api/v1/auth/logout`       | Logout current session    |
| `authApi.logoutAll()`          | `POST /api/v1/auth/logout-all`   | Logout all sessions       |
| `authApi.refresh()`            | `POST /api/v1/auth/refresh`      | Refresh access token      |
| `authApi.validateToken()`      | `POST /api/v1/auth/validate`     | Validate JWT token        |
| `authApi.verifyEmail()`        | `GET /api/v1/auth/email/verify`  | Verify email address      |
| `authApi.resendVerification()` | `POST /api/v1/auth/email/resend` | Resend verification email |
| `authApi.getEmailStatus()`     | `GET /api/v1/auth/email/status`  | Check email status        |
| `authApi.forgotPassword()`     | `POST /api/v1/password/forgot`   | Request password reset    |
| `authApi.resetPassword()`      | `POST /api/v1/password/reset`    | Reset password            |
| `authApi.changePassword()`     | `POST /api/v1/password/change`   | Change password           |

## Available Hooks

| Hook                      | Purpose                         |
| ------------------------- | ------------------------------- |
| `useValidateToken()`      | Validate JWT tokens             |
| `useChangePassword()`     | Change user password            |
| `useLogoutAll()`          | Logout from all devices         |
| `useEmailStatus(email)`   | Query email verification status |
| `useResendVerification()` | Resend verification email       |
| `useVerifyEmail()`        | Verify email with token         |
| `useForgotPassword()`     | Request password reset          |
| `useResetPassword()`      | Reset password with token       |

## Common Patterns

### Protected Route

```typescript
import { useAuthStore } from '@/processes/auth';
import { Navigate } from '@tanstack/react-router';

function ProtectedRoute({ children }) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  return children;
}
```

### Auto Token Refresh

```typescript
import { useEffect } from "react";
import { useAuthStore } from "@/processes/auth";

function useAutoRefresh() {
  const refreshTokens = useAuthStore((state) => state.refreshTokens);

  useEffect(() => {
    // Refresh every 14 minutes (1 min before expiry)
    const interval = setInterval(refreshTokens, 14 * 60 * 1000);
    return () => clearInterval(interval);
  }, [refreshTokens]);
}
```

### Error Handling

```typescript
try {
  await authApi.login(credentials);
} catch (error) {
  if (error.status === 401) {
    console.error("Invalid credentials");
  } else if (error.status === 423) {
    console.error("Account locked");
  } else {
    console.error("Login failed");
  }
}
```

## Environment Configuration

Create `.env` file:

```env
VITE_API_URL_SERVER=http://localhost:8080
VITE_AUTH_DOMAIN_AUTH=https://auth.iqkv.com
VITE_AUTH_DOMAIN_APP=https://app.iqkv.com
```

## Security Best Practices

1. **Always use HTTPS in production**
2. **Store tokens securely** (consider httpOnly cookies)
3. **Implement token refresh** before expiry
4. **Handle 401 errors** by redirecting to login
5. **Clear tokens on logout**
6. **Validate tokens** on sensitive operations
7. **Use strong passwords** (enforced by backend)
8. **Enable email verification** (required by backend)

## Rate Limits

Be aware of rate limits:

- Login: 10 requests/minute
- Signup: 5 requests/minute
- Email resend: 3 requests/minute
- Password reset: 3 requests/minute

## Token Expiry

- **Access Token**: 15 minutes
- **Refresh Token**: 7 days (30 days with rememberMe)

## Next Steps

1. Read the [Complete API Documentation](./API.md)
2. Check [Usage Examples](./API_USAGE_EXAMPLES.md)
3. Review [Refactoring Summary](./REFACTORING_SUMMARY.md)
4. Explore [Backend Architecture](../../backend/AUTHENTICATION-ARCHITECTURE.md)

## Support

For issues or questions:

- Check the documentation
- Review the examples
- Consult the backend API docs
