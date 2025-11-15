# Authentication API Documentation

Welcome to the auth.gripday.com authentication API documentation. This directory contains comprehensive guides for using the authentication system.

## � Doccumentation Index

### 1. [Quick Start Guide](./QUICK_START.md)

**Start here!** Quick reference for common authentication tasks.

- Basic usage examples
- Common patterns
- Hook reference
- Configuration guide

**Best for**: Getting started quickly, quick reference

---

### 2. [Complete API Reference](./API.md)

Comprehensive documentation of all authentication endpoints.

- All API endpoints
- Request/response schemas
- Security features
- Rate limiting
- Error handling
- JWT token structure
- Configuration guide

**Best for**: Detailed API information, integration reference

---

### 3. [Usage Examples](./API_USAGE_EXAMPLES.md)

Practical code examples and implementation patterns.

- Complete authentication flows
- React component examples
- Advanced use cases
- Error handling patterns
- Testing examples
- Best practices

**Best for**: Learning by example, implementation guidance

---

### 4. [Refactoring Summary](./REFACTORING_SUMMARY.md)

Overview of the authentication API refactoring.

- Changes made
- Backend alignment
- Migration guide
- Architecture benefits
- Feature comparison

**Best for**: Understanding the refactoring, migration planning

---

## 🚀 Quick Links

### Common Tasks

- **Register a user**: [Quick Start](./QUICK_START.md#1-user-registration) | [Examples](./API_USAGE_EXAMPLES.md#user-registration)
- **Login**: [Quick Start](./QUICK_START.md#3-user-login) | [Examples](./API_USAGE_EXAMPLES.md#basic-authentication-flow)
- **Email verification**: [Quick Start](./QUICK_START.md#2-email-verification) | [Examples](./API_USAGE_EXAMPLES.md#email-verification)
- **Password reset**: [Quick Start](./QUICK_START.md#4-password-reset) | [Examples](./API_USAGE_EXAMPLES.md#password-management)
- **Token management**: [Quick Start](./QUICK_START.md#5-token-management) | [Examples](./API_USAGE_EXAMPLES.md#token-management)

### API Endpoints

- **All endpoints**: [API Reference](./API.md#api-endpoints)
- **Authentication**: [API Reference](./API.md#authentication-endpoints)
- **Email verification**: [API Reference](./API.md#email-verification-endpoints)
- **Password management**: [API Reference](./API.md#password-management-endpoints)

### React Hooks

- **Hook reference**: [Quick Start](./QUICK_START.md#available-hooks)
- **Hook examples**: [Usage Examples](./API_USAGE_EXAMPLES.md#email-verification)

---

## 🎯 Use Cases

### I want to...

#### Implement user registration

1. Read: [Quick Start - User Registration](./QUICK_START.md#1-user-registration)
2. See example: [Usage Examples - User Registration](./API_USAGE_EXAMPLES.md#user-registration)
3. API details: [API Reference - User Signup](./API.md#1-user-registration-signup)

#### Add email verification

1. Read: [Quick Start - Email Verification](./QUICK_START.md#2-email-verification)
2. See example: [Usage Examples - Email Verification](./API_USAGE_EXAMPLES.md#email-verification)
3. API details: [API Reference - Email Verification](./API.md#email-verification-endpoints)

#### Implement password reset

1. Read: [Quick Start - Password Reset](./QUICK_START.md#4-password-reset)
2. See example: [Usage Examples - Password Reset API](./API_USAGE_EXAMPLES.md#password-management)
3. API details: [API Reference - Password Reset API](./API.md#password-management-endpoints)

#### Manage user sessions

1. Read: [Quick Start - Token Management](./QUICK_START.md#5-token-management)
2. See example: [Usage Examples - Token Management](./API_USAGE_EXAMPLES.md#token-management)
3. API details: [API Reference - Token Refresh](./API.md#3-token-refresh)

#### Handle authentication errors

1. Read: [Quick Start - Error Handling](./QUICK_START.md#error-handling)
2. See example: [Usage Examples - Error Handling](./API_USAGE_EXAMPLES.md#error-handling-best-practices)
3. API details: [API Reference - Error Handling](./API.md#error-handling)

---

## 🏗️ Architecture

### Frontend (auth.gripday.com)

```
src/
├── app/config/
│   └── auth-config.ts          # API endpoint configuration
├── shared/
│   ├── api/
│   │   ├── auth-api.ts         # API implementation
│   │   └── index.ts            # Exports
│   └── lib/
│       └── use-auth-api.ts     # React hooks
└── processes/auth/
    └── model/
        └── auth-store.ts       # Auth state management
```

### Backend Services

- **User Service** (Port 8080): Authentication authority
- **Gateway Service** (Port 8080): API gateway with JWT validation

### Authentication Flow

```
Client → Gateway → User Service
         ↓
    JWT Validation
         ↓
    User Context
```

For detailed architecture, see [Backend Authentication Architecture](../../backend/AUTHENTICATION-ARCHITECTURE.md).

---

## 🔐 Security Features

### Token Security

- **Algorithm**: RSA256 (asymmetric encryption)
- **Access Token**: 15 minutes expiry
- **Refresh Token**: 7 days (30 days with rememberMe)
- **Token Blacklisting**: Immediate invalidation on logout

### Account Protection

- **Account Lockout**: 5 failed attempts = 15-minute lockout
- **Email Verification**: Required before login
- **Password Requirements**: Strong password enforcement
- **Rate Limiting**: Per-endpoint limits

### Audit & Monitoring

- All authentication events logged
- Failed login attempts tracked
- Token operations monitored
- Correlation IDs for tracing

---

## 📊 API Endpoints Summary

| Category                | Endpoints        | Documentation                                  |
| ----------------------- | ---------------- | ---------------------------------------------- |
| **Authentication**      | 6 endpoints      | [View](./API.md#authentication-endpoints)      |
| **Email Verification**  | 3 endpoints      | [View](./API.md#email-verification-endpoints)  |
| **Password Reset API** | 3 endpoints      | [View](./API.md#password-management-endpoints) |
| **Total**               | **12 endpoints** | [View All](./API.md#api-endpoints)             |

---

## 🎨 React Hooks Summary

| Hook                      | Purpose                 | Documentation                            |
| ------------------------- | ----------------------- | ---------------------------------------- |
| `useValidateToken()`      | Validate JWT tokens     | [View](./QUICK_START.md#available-hooks) |
| `useChangePassword()`     | Change user password    | [View](./QUICK_START.md#available-hooks) |
| `useLogoutAll()`          | Logout from all devices | [View](./QUICK_START.md#available-hooks) |
| `useEmailStatus()`        | Query email status      | [View](./QUICK_START.md#available-hooks) |
| `useResendVerification()` | Resend verification     | [View](./QUICK_START.md#available-hooks) |
| `useVerifyEmail()`        | Verify email            | [View](./QUICK_START.md#available-hooks) |
| `useForgotPassword()`     | Request password reset  | [View](./QUICK_START.md#available-hooks) |
| `useResetPassword()`      | Reset password          | [View](./QUICK_START.md#available-hooks) |

---

## 🔧 Configuration

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

See [API Reference - Configuration](./API.md#configuration) for details.

---

## 📈 Rate Limits

| Endpoint       | Requests/Minute | Burst Capacity |
| -------------- | --------------- | -------------- |
| Login          | 10              | 20             |
| Signup         | 5               | 10             |
| Email Resend   | 3               | 5              |
| Password Reset | 3               | 5              |

See [API Reference - Rate Limiting](./API.md#rate-limiting) for complete list.

---

## 🧪 Testing

### Quick Test

```typescript
import { authApi } from "@/shared/api";

// Register
const user = await authApi.signup({
  username: "test",
  email: "test@example.com",
  password: "Test123!",
  firstName: "Test",
  lastName: "User",
});

// Login
const session = await authApi.login({
  username: "test",
  password: "Test123!",
  rememberMe: false,
});

console.log("Access token:", session.accessToken);
```

See [Usage Examples - Testing](./API_USAGE_EXAMPLES.md#testing-examples) for more.

---

## 🆘 Troubleshooting

### Common Issues

#### 401 Unauthorized

- Check token expiry
- Verify token signature
- Ensure email is verified

#### 423 Account Locked

- Wait 15 minutes
- Contact support if persistent

#### 429 Too Many Requests

- Wait before retrying
- Check rate limits

See [API Reference - Error Handling](./API.md#error-handling) for complete guide.

---

## 📚 Additional Resources

### Backend Documentation

- [Authentication Architecture](../../backend/AUTHENTICATION-ARCHITECTURE.md)
- [User Service README](../../backend/gripday-user-service/README.md)
- [Gateway Service README](../../backend/gripday-gateway-service/README.md)

### Frontend Documentation

- [Refactoring Changelog](../CHANGELOG_AUTH_REFACTOR.md)
- [Project README](../README.md)

---

## 🤝 Contributing

When updating authentication features:

1. Update API implementation in `src/shared/api/auth-api.ts`
2. Add/update hooks in `src/shared/lib/use-auth-api.ts`
3. Update configuration in `src/app/config/auth-config.ts`
4. Update documentation in this directory
5. Add examples to `API_USAGE_EXAMPLES.md`
6. Update changelog

---

## 📞 Support

### Getting Help

1. **Check Documentation**: Start with [Quick Start](./QUICK_START.md)
2. **Review Examples**: See [Usage Examples](./API_USAGE_EXAMPLES.md)
3. **API Reference**: Check [API Documentation](./API.md)
4. **Backend Docs**: Review [Backend Architecture](../../backend/AUTHENTICATION-ARCHITECTURE.md)

### Reporting Issues

When reporting issues, include:

- Error message and status code
- Request/response details
- Steps to reproduce
- Environment information

---

## 📝 Documentation Versions

- **Current Version**: 2.0.0
- **Last Updated**: 2024
- **Status**: ✅ Complete and up-to-date

---

## 🎯 Next Steps

1. **New to the API?** Start with [Quick Start Guide](./QUICK_START.md)
2. **Need details?** Check [API Reference](./API.md)
3. **Want examples?** See [Usage Examples](./API_USAGE_EXAMPLES.md)
4. **Migrating?** Read [Refactoring Summary](./REFACTORING_SUMMARY.md)

---

**Happy coding! 🚀**
