# Authentication API Usage Examples

This document provides practical examples of using the authentication API in the auth.gripday.com frontend application.

## Table of Contents

1. [Basic Authentication Flow](#basic-authentication-flow)
2. [User Registration](#user-registration)
3. [Email Verification](#email-verification)
4. [Password Management](#password-management)
5. [Token Management](#token-management)
6. [Advanced Use Cases](#advanced-use-cases)

---

## Basic Authentication Flow

### Complete Registration and Login Flow

```typescript
import { authApi } from "@/shared/api";
import { useAuthStore } from "@/processes/auth";

// 1. Register a new user
async function registerUser() {
  try {
    const response = await authApi.signup({
      username: "johndoe",
      email: "john@example.com",
      password: "SecurePass123!",
      firstName: "John",
      lastName: "Doe",
    });

    console.log("User registered:", response);
    // Response includes: userId, username, email, emailVerified: false

    // User will receive verification email
    return response;
  } catch (error) {
    console.error("Registration failed:", error);
    throw error;
  }
}

// 2. Verify email (user clicks link in email)
async function verifyUserEmail(token: string) {
  try {
    await authApi.verifyEmail(token);
    console.log("Email verified successfully");
  } catch (error) {
    console.error("Email verification failed:", error);
    throw error;
  }
}

// 3. Login after email verification
async function loginUser() {
  const login = useAuthStore.getState().login;

  try {
    await login({
      username: "johndoe",
      password: "SecurePass123!",
      rememberMe: true,
    });

    // User is now authenticated
    const user = useAuthStore.getState().user;
    console.log("Logged in user:", user);
  } catch (error) {
    console.error("Login failed:", error);
    throw error;
  }
}
```

---

## User Registration

### Using React Component with Form

```typescript
import { useMutation } from '@tanstack/react-query';
import { authApi } from '@/shared/api';
import { useNavigate } from '@tanstack/react-router';

function SignupForm() {
  const navigate = useNavigate();

  const signupMutation = useMutation({
    mutationFn: authApi.signup,
    onSuccess: (data) => {
      console.log('Registration successful:', data);
      // Redirect to email verification page
      navigate({
        to: '/verify-email',
        search: { email: data.email }
      });
    },
    onError: (error: any) => {
      console.error('Registration failed:', error);
    }
  });

  const handleSubmit = (values: any) => {
    signupMutation.mutate({
      username: values.username,
      email: values.email,
      password: values.password,
      firstName: values.firstName,
      lastName: values.lastName
    });
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* Form fields */}
      <button type="submit" disabled={signupMutation.isPending}>
        {signupMutation.isPending ? 'Creating account...' : 'Sign Up'}
      </button>
    </form>
  );
}
```

### Handling Registration Errors

```typescript
import { authApi } from "@/shared/api";

async function registerWithErrorHandling(userData: any) {
  try {
    const response = await authApi.signup(userData);
    return { success: true, data: response };
  } catch (error: any) {
    // Handle specific error cases
    if (error.status === 409) {
      return {
        success: false,
        error: "Username or email already exists",
      };
    } else if (error.status === 400) {
      return {
        success: false,
        error: "Invalid input data",
        fields: error.fields, // Validation errors
      };
    } else if (error.status === 429) {
      return {
        success: false,
        error: "Too many registration attempts. Please try again later.",
      };
    }

    return {
      success: false,
      error: "Registration failed. Please try again.",
    };
  }
}
```

---

## Email Verification

### Auto-Verify on Page Load

```typescript
import { useEffect } from 'react';
import { useSearchParams } from '@tanstack/react-router';
import { useVerifyEmail } from '@/shared/lib/use-auth-api';

function EmailVerificationPage() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const verifyEmail = useVerifyEmail();

  useEffect(() => {
    if (token && !verifyEmail.isSuccess && !verifyEmail.isError) {
      verifyEmail.mutate(token);
    }
  }, [token]);

  if (verifyEmail.isPending) {
    return <div>Verifying your email...</div>;
  }

  if (verifyEmail.isSuccess) {
    return (
      <div>
        <h2>Email Verified!</h2>
        <p>Your email has been successfully verified.</p>
        <button onClick={() => navigate('/login')}>
          Continue to Login
        </button>
      </div>
    );
  }

  if (verifyEmail.isError) {
    return (
      <div>
        <h2>Verification Failed</h2>
        <p>The verification link is invalid or has expired.</p>
        <button onClick={() => navigate('/verify-email')}>
          Resend Verification Email
        </button>
      </div>
    );
  }

  return null;
}
```

### Resend Verification Email

```typescript
import { useResendVerification } from '@/shared/lib/use-auth-api';

function ResendVerificationForm() {
  const resendVerification = useResendVerification();
  const [email, setEmail] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    resendVerification.mutate(email);
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Enter your email"
        required
      />
      <button type="submit" disabled={resendVerification.isPending}>
        {resendVerification.isPending ? 'Sending...' : 'Resend Email'}
      </button>

      {resendVerification.isSuccess && (
        <p>Verification email sent! Please check your inbox.</p>
      )}
    </form>
  );
}
```

### Check Email Verification Status

```typescript
import { useEmailStatus } from '@/shared/lib/use-auth-api';

function EmailStatusChecker({ email }: { email: string }) {
  const { data, isLoading, error } = useEmailStatus(email);

  if (isLoading) return <div>Checking status...</div>;
  if (error) return <div>Failed to check status</div>;

  return (
    <div>
      <p>Email: {data?.email}</p>
      <p>Status: {data?.emailVerified ? 'Verified ✓' : 'Not Verified'}</p>
      <p>Registered: {new Date(data?.registrationDate).toLocaleDateString()}</p>
      <p>{data?.message}</p>
    </div>
  );
}
```

---

## Password Management

### Forgot Password Flow

```typescript
import { useForgotPassword } from '@/shared/lib/use-auth-api';

function ForgotPasswordForm() {
  const forgotPassword = useForgotPassword();
  const [email, setEmail] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    forgotPassword.mutate(email);
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>Forgot Password</h2>
      <p>Enter your email to receive a password reset link</p>

      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="your@email.com"
        required
      />

      <button type="submit" disabled={forgotPassword.isPending}>
        {forgotPassword.isPending ? 'Sending...' : 'Send Reset Link'}
      </button>

      {forgotPassword.isSuccess && (
        <div className="success-message">
          Reset link sent! Please check your email.
        </div>
      )}
    </form>
  );
}
```

### Reset Password with Token

```typescript
import { useResetPassword } from '@/shared/lib/use-auth-api';
import { useSearchParams, useNavigate } from '@tanstack/react-router';

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token');
  const resetPassword = useResetPassword();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      alert('Passwords do not match');
      return;
    }

    if (!token) {
      alert('Invalid reset link');
      return;
    }

    resetPassword.mutate(
      { token, newPassword: password },
      {
        onSuccess: () => {
          // Redirect to login after successful reset
          setTimeout(() => navigate('/login'), 2000);
        }
      }
    );
  };

  if (!token) {
    return (
      <div>
        <h2>Invalid Reset Link</h2>
        <p>This password reset link is invalid or has expired.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit}>
      <h2>Reset Your Password</h2>

      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="New password"
        required
        minLength={8}
      />

      <input
        type="password"
        value={confirmPassword}
        onChange={(e) => setConfirmPassword(e.target.value)}
        placeholder="Confirm new password"
        required
      />

      <button type="submit" disabled={resetPassword.isPending}>
        {resetPassword.isPending ? 'Resetting...' : 'Reset Password'}
      </button>

      {resetPassword.isSuccess && (
        <div className="success-message">
          Password reset successful! Redirecting to login...
        </div>
      )}
    </form>
  );
}
```

### Change Password (Authenticated User)

```typescript
import { useChangePassword } from '@/shared/lib/use-auth-api';

function ChangePasswordForm() {
  const changePassword = useChangePassword();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      alert('New passwords do not match');
      return;
    }

    changePassword.mutate(
      { currentPassword, newPassword },
      {
        onSuccess: () => {
          // Clear form
          setCurrentPassword('');
          setNewPassword('');
          setConfirmPassword('');
        }
      }
    );
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>Change Password</h2>

      <input
        type="password"
        value={currentPassword}
        onChange={(e) => setCurrentPassword(e.target.value)}
        placeholder="Current password"
        required
      />

      <input
        type="password"
        value={newPassword}
        onChange={(e) => setNewPassword(e.target.value)}
        placeholder="New password"
        required
        minLength={8}
      />

      <input
        type="password"
        value={confirmPassword}
        onChange={(e) => setConfirmPassword(e.target.value)}
        placeholder="Confirm new password"
        required
      />

      <button type="submit" disabled={changePassword.isPending}>
        {changePassword.isPending ? 'Changing...' : 'Change Password'}
      </button>
    </form>
  );
}
```

---

## Token Management

### Validate Token

```typescript
import { useValidateToken } from '@/shared/lib/use-auth-api';

function TokenValidator() {
  const validateToken = useValidateToken();
  const [token, setToken] = useState('');

  const handleValidate = () => {
    validateToken.mutate(token, {
      onSuccess: (data) => {
        if (data.active) {
          console.log('Token is valid');
          console.log('User:', data.user);
          console.log('Expires at:', data.expiresAt);
        } else {
          console.log('Token is invalid or expired');
        }
      }
    });
  };

  return (
    <div>
      <input
        type="text"
        value={token}
        onChange={(e) => setToken(e.target.value)}
        placeholder="Enter JWT token"
      />
      <button onClick={handleValidate} disabled={validateToken.isPending}>
        Validate Token
      </button>

      {validateToken.data && (
        <div>
          <p>Status: {validateToken.data.active ? 'Valid ✓' : 'Invalid ✗'}</p>
          {validateToken.data.user && (
            <div>
              <p>User: {validateToken.data.user.username}</p>
              <p>Email: {validateToken.data.user.email}</p>
              <p>Roles: {validateToken.data.user.roles.join(', ')}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
```

### Automatic Token Refresh

```typescript
import { useEffect } from 'react';
import { useAuthStore } from '@/processes/auth';

function useAutoTokenRefresh() {
  const { accessToken, refreshTokens, isAuthenticated } = useAuthStore();

  useEffect(() => {
    if (!isAuthenticated) return;

    // Refresh token 1 minute before expiry (14 minutes for 15-minute tokens)
    const refreshInterval = 14 * 60 * 1000; // 14 minutes

    const intervalId = setInterval(async () => {
      try {
        await refreshTokens();
        console.log('Token refreshed successfully');
      } catch (error) {
        console.error('Token refresh failed:', error);
        // User will be logged out automatically
      }
    }, refreshInterval);

    return () => clearInterval(intervalId);
  }, [isAuthenticated, refreshTokens]);
}

// Use in your app
function App() {
  useAutoTokenRefresh();

  return <YourAppContent />;
}
```

### Manual Token Refresh

```typescript
import { useAuthStore } from '@/processes/auth';

function RefreshTokenButton() {
  const refreshTokens = useAuthStore((state) => state.refreshTokens);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await refreshTokens();
      alert('Token refreshed successfully');
    } catch (error) {
      alert('Failed to refresh token');
    } finally {
      setIsRefreshing(false);
    }
  };

  return (
    <button onClick={handleRefresh} disabled={isRefreshing}>
      {isRefreshing ? 'Refreshing...' : 'Refresh Token'}
    </button>
  );
}
```

---

## Advanced Use Cases

### Logout from All Devices

```typescript
import { useLogoutAll } from '@/shared/lib/use-auth-api';
import { useAuthStore } from '@/processes/auth';

function SecuritySettings() {
  const logoutAll = useLogoutAll();
  const logout = useAuthStore((state) => state.logout);

  const handleLogoutAllDevices = () => {
    if (confirm('This will log you out from all devices. Continue?')) {
      logoutAll.mutate(undefined, {
        onSuccess: () => {
          // Also logout from current device
          logout();
        }
      });
    }
  };

  return (
    <div>
      <h3>Security Settings</h3>
      <button onClick={handleLogoutAllDevices}>
        Logout from All Devices
      </button>
    </div>
  );
}
```

### Protected Route with Token Validation

```typescript
import { useEffect, useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useAuthStore } from '@/processes/auth';
import { authApi } from '@/shared/api';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();
  const { accessToken, isAuthenticated } = useAuthStore();
  const [isValidating, setIsValidating] = useState(true);

  useEffect(() => {
    async function validateAccess() {
      if (!isAuthenticated || !accessToken) {
        navigate('/login');
        return;
      }

      try {
        const validation = await authApi.validateToken(accessToken);
        if (!validation.active) {
          // Token is invalid, logout
          useAuthStore.getState().logout();
          navigate('/login');
        }
      } catch (error) {
        console.error('Token validation failed:', error);
        navigate('/login');
      } finally {
        setIsValidating(false);
      }
    }

    validateAccess();
  }, [accessToken, isAuthenticated, navigate]);

  if (isValidating) {
    return <div>Validating access...</div>;
  }

  return <>{children}</>;
}
```

### Multi-Step Registration with Email Verification

```typescript
import { useState } from 'react';
import { authApi } from '@/shared/api';

function MultiStepRegistration() {
  const [step, setStep] = useState<'register' | 'verify' | 'complete'>('register');
  const [email, setEmail] = useState('');

  // Step 1: Register
  const handleRegister = async (userData: any) => {
    try {
      const response = await authApi.signup(userData);
      setEmail(response.email);
      setStep('verify');
    } catch (error) {
      console.error('Registration failed:', error);
    }
  };

  // Step 2: Verify email
  const handleVerify = async (token: string) => {
    try {
      await authApi.verifyEmail(token);
      setStep('complete');
    } catch (error) {
      console.error('Verification failed:', error);
    }
  };

  // Step 3: Complete
  const handleComplete = () => {
    // Redirect to login or auto-login
    window.location.href = '/login';
  };

  return (
    <div>
      {step === 'register' && (
        <RegistrationForm onSubmit={handleRegister} />
      )}

      {step === 'verify' && (
        <EmailVerificationStep
          email={email}
          onVerify={handleVerify}
        />
      )}

      {step === 'complete' && (
        <CompletionStep onComplete={handleComplete} />
      )}
    </div>
  );
}
```

### Session Timeout Handler

```typescript
import { useEffect } from 'react';
import { useAuthStore } from '@/processes/auth';

function useSessionTimeout(timeoutMinutes = 30) {
  const logout = useAuthStore((state) => state.logout);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  useEffect(() => {
    if (!isAuthenticated) return;

    let timeoutId: NodeJS.Timeout;

    const resetTimeout = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        alert('Your session has expired due to inactivity');
        logout();
      }, timeoutMinutes * 60 * 1000);
    };

    // Reset timeout on user activity
    const events = ['mousedown', 'keydown', 'scroll', 'touchstart'];
    events.forEach(event => {
      document.addEventListener(event, resetTimeout);
    });

    // Initial timeout
    resetTimeout();

    return () => {
      clearTimeout(timeoutId);
      events.forEach(event => {
        document.removeEventListener(event, resetTimeout);
      });
    };
  }, [isAuthenticated, logout, timeoutMinutes]);
}

// Use in your app
function App() {
  useSessionTimeout(30); // 30 minutes

  return <YourAppContent />;
}
```

---

## Error Handling Best Practices

### Centralized Error Handler

```typescript
import { AxiosError } from "axios";

export function handleAuthError(error: unknown) {
  if (error instanceof AxiosError) {
    const status = error.response?.status;
    const data = error.response?.data;

    switch (status) {
      case 400:
        return {
          title: "Invalid Request",
          message: data?.detail || "Please check your input",
          fields: data?.fields,
        };

      case 401:
        return {
          title: "Unauthorized",
          message: "Invalid credentials or session expired",
        };

      case 403:
        return {
          title: "Forbidden",
          message: "You do not have permission to perform this action",
        };

      case 409:
        return {
          title: "Conflict",
          message: "Username or email already exists",
        };

      case 423:
        return {
          title: "Account Locked",
          message:
            "Your account has been locked due to multiple failed login attempts",
        };

      case 429:
        return {
          title: "Too Many Requests",
          message: "Please wait before trying again",
        };

      default:
        return {
          title: "Error",
          message: "An unexpected error occurred",
        };
    }
  }

  return {
    title: "Error",
    message: "An unexpected error occurred",
  };
}
```

---

## Testing Examples

### Unit Test for API Calls

```typescript
import { describe, it, expect, vi } from "vitest";
import { authApi } from "@/shared/api";

describe("Auth API", () => {
  it("should register a new user", async () => {
    const userData = {
      username: "testuser",
      email: "test@example.com",
      password: "TestPass123!",
      firstName: "Test",
      lastName: "User",
    };

    const response = await authApi.signup(userData);

    expect(response).toHaveProperty("userId");
    expect(response.username).toBe(userData.username);
    expect(response.email).toBe(userData.email);
    expect(response.emailVerified).toBe(false);
  });

  it("should login with valid credentials", async () => {
    const credentials = {
      username: "testuser",
      password: "TestPass123!",
      rememberMe: false,
    };

    const response = await authApi.login(credentials);

    expect(response).toHaveProperty("accessToken");
    expect(response).toHaveProperty("refreshToken");
    expect(response.tokenType).toBe("Bearer");
    expect(response.user).toHaveProperty("userId");
  });
});
```

---

## Related Documentation

- [API Reference](./API.md)
- [Backend Authentication Architecture](../../backend/AUTHENTICATION-ARCHITECTURE.md)
- [User Service Documentation](../../backend/gripday-user-service/README.md)
