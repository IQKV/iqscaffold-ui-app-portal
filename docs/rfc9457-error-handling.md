# RFC 9457 Problem Details Error Handling

This document describes the enhanced error handling system that implements RFC 9457 Problem Details for HTTP APIs.

## Overview

The error handling system has been upgraded from RFC 7807 to RFC 9457 compliance, providing:

- Standardized error response format
- Enhanced error type detection
- Sophisticated retry logic with exponential backoff
- Comprehensive field validation error handling
- Better user experience with normalized error messages

## Key Features

### 1. RFC 9457 Problem Details Compliance

All errors now conform to the RFC 9457 Problem Details specification:

```typescript
interface ProblemDetail {
  type?: string; // URI identifying the problem type
  title?: string; // Short, human-readable summary
  status?: number; // HTTP status code
  detail?: string; // Human-readable explanation
  instance?: string; // URI identifying specific occurrence
  [key: string]: unknown; // Extension members
}
```

### 2. Enhanced Error Types

The system recognizes these error types with sophisticated detection:

- `auth` - Authentication/authorization errors (401, 403)
- `validation` - Input validation errors (400, 422 with field errors)
- `client` - Other client errors (404, etc.)
- `server` - Server errors (500-599)
- `network` - Network connectivity issues
- `timeout` - Request timeouts
- `rate-limit` - Rate limiting (429)
- `canceled` - Canceled requests
- `unknown` - Unrecognized errors

### 3. Retry Logic

Automatic retry with exponential backoff for appropriate error types:

```typescript
const retryConfigs = {
  network: { maxAttempts: 3, baseDelay: 1000, backoffMultiplier: 2 },
  timeout: { maxAttempts: 2, baseDelay: 2000, backoffMultiplier: 2 },
  "rate-limit": { maxAttempts: 3, baseDelay: 5000, backoffMultiplier: 2 },
  server: { maxAttempts: 2, baseDelay: 1000, backoffMultiplier: 2 },
};
```

## Usage Examples

### Basic Error Handling

```typescript
import { errorFromAxios, formatErrorForDisplay } from "@/shared/lib";

try {
  const response = await apiClient.get("/users");
  return response.data;
} catch (error) {
  const appError = errorFromAxios(error);

  // Access RFC 9457 fields
  console.log(appError.type); // Problem type URI
  console.log(appError.title); // "Validation Error"
  console.log(appError.detail); // Detailed message
  console.log(appError.instance); // "/errors/req-123"

  // Access application fields
  console.log(appError.errorType); // "validation"
  console.log(appError.retryable); // false
  console.log(appError.requestId); // "req-123"
}
```

### Form Validation with Enhanced Error Handling

```typescript
import { useFormMutation, errorFromAxios } from "@/shared/lib";

const mutation = useFormMutation(
  form,
  async (data) => {
    return await apiClient.post("/users", data);
  },
  {
    // Enhanced error notifications with Problem Details
    notifyError: {
      title: "Registration Failed",
      includeFieldErrorsInMessage: true,
    },
    // Field mapping for normalized names
    mapField: (errors) => ({
      ...errors,
      password_confirmation: errors.passwordConfirmation,
    }),
  }
);
```

### Retry-Enabled Requests

```typescript
import { executeWithRetry, withRetry } from "@/shared/lib";

// Direct API request with retry
const data = await executeWithRetry(
  { method: "GET", url: "/users" },
  {
    retryConfig: { maxAttempts: 5 },
    onRetry: (context, error) => {
      console.log(`Retry attempt ${context.attempt} after ${error.message}`);
    },
  }
);

// Wrap existing function with retry
const fetchUserWithRetry = withRetry(() => apiClient.get("/users/123"), {
  shouldRetry: (error, attempt) => {
    return error.errorType === "network" && attempt < 3;
  },
});
```

### Circuit Breaker Pattern

```typescript
import { CircuitBreaker } from "@/shared/lib";

const circuitBreaker = new CircuitBreaker(5, 60000); // 5 failures, 1 minute recovery

const fetchData = async () => {
  return await circuitBreaker.execute(async () => {
    const response = await apiClient.get("/data");
    return response.data;
  });
};
```

### Custom Problem Details

```typescript
import { createProblemDetail, PROBLEM_TYPES } from "@/shared/lib";

// Create custom problem detail
const problem = createProblemDetail(
  PROBLEM_TYPES.VALIDATION_ERROR,
  "Validation Error",
  422,
  "The user registration data is invalid",
  "/users/register",
  {
    errors: [
      { field: "email", message: "Email already exists" },
      { field: "password", message: "Password too weak" },
    ],
    timestamp: new Date().toISOString(),
  }
);
```

## Error Response Examples

### RFC 9457 Validation Error

```json
{
  "type": "https://example.com/probs/validation-error",
  "title": "Validation Error",
  "status": 422,
  "detail": "The request contains invalid data",
  "instance": "/users/register",
  "errors": [
    {
      "field": "email",
      "message": "Invalid email format"
    },
    {
      "field": "password",
      "message": "Password must be at least 8 characters"
    }
  ],
  "timestamp": "2023-10-01T12:00:00Z"
}
```

### Rate Limiting Error

```json
{
  "type": "https://example.com/probs/rate-limit-exceeded",
  "title": "Rate Limit Exceeded",
  "status": 429,
  "detail": "Too many requests. Please try again later.",
  "instance": "/api/users",
  "retryAfter": 60,
  "limit": 100,
  "remaining": 0,
  "resetTime": "2023-10-01T12:01:00Z"
}
```

### Server Error with Trace

```json
{
  "type": "https://example.com/probs/server-error",
  "title": "Internal Server Error",
  "status": 500,
  "detail": "An unexpected error occurred while processing the request",
  "instance": "/errors/req-abc123",
  "traceId": "abc123def456",
  "timestamp": "2023-10-01T12:00:00Z"
}
```

## Configuration

### Axios Configuration

The API client is automatically configured with RFC 9457 headers:

```typescript
const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json, application/problem+json",
  },
  withCredentials: true,
});
```

### Custom Problem Types

Define your own problem types:

```typescript
export const CUSTOM_PROBLEM_TYPES = {
  BUSINESS_RULE_VIOLATION: "https://myapp.com/probs/business-rule-violation",
  QUOTA_EXCEEDED: "https://myapp.com/probs/quota-exceeded",
  MAINTENANCE_MODE: "https://myapp.com/probs/maintenance-mode",
} as const;
```

### Retry Configuration

Customize retry behavior:

```typescript
const customRetryConfig = {
  maxAttempts: 5,
  baseDelay: 2000,
  maxDelay: 30000,
  backoffMultiplier: 1.5,
  jitterFactor: 0.2,
  retryableStatusCodes: [500, 502, 503, 504, 429],
};
```

## Migration Guide

### Breaking Changes

1. **Error Handler Callbacks**: Now receive normalized `AppError` objects instead of raw errors
2. **Form Mutations**: Use `errorFromAxios` instead of direct error notifications
3. **Error Type Field**: Changed from `type` to `errorType` (RFC 9457 `type` is now the problem type URI)

### Migration Steps

1. **Update Error Handlers**:

   ```typescript
   // Before
   .catch((error) => {
     if (error.response?.status === 401) {
       // handle auth error
     }
   })

   // After
   .catch((rawError) => {
     const error = errorFromAxios(rawError);
     if (error.errorType === "auth") {
       // handle auth error
     }
   })
   ```

2. **Update Form Mutations**:

   ```typescript
   // Before
   onError: (error) => {
     notificationService.error({
       title: "Error",
       message: error.message,
     });
   };

   // After
   onError: (error) => {
     const appError = errorFromAxios(error);
     notificationService.fromAppError(appError);
   };
   ```

3. **Update Error Type Checks**:

   ```typescript
   // Before
   if (error.type === "server") { ... }

   // After
   if (error.errorType === "server") { ... }
   ```

## Mantine UI Integration

### Enhanced Notifications

The error handling system is fully integrated with Mantine's notification system:

```typescript
// Enhanced error notifications with Problem Details
notificationService.fromAppError(error, {
  retryAction: () => refetch(),
  showTechnicalDetails: isDevelopment,
});

// Validation-specific notifications
notificationService.validationError({
  title: "Form Validation Failed",
  fieldErrors: {
    email: ["Email is required", "Invalid format"],
    password: ["Too short", "Missing special character"],
  },
});

// Loading notifications with progress
const loadingId = notificationService.showLoading({
  title: "Processing",
  message: "Uploading files...",
});

notificationService.updateLoadingNotification(loadingId, {
  title: "Upload Complete",
  message: "All files uploaded successfully",
  type: "success",
});
```

### Form Integration

Enhanced form mutation hook with Mantine forms:

```typescript
const mutation = useFormMutation(form, submitFn, {
  showLoadingNotification: true,
  clearOnSuccess: true,
  focusErrorField: true,
  notifyError: {
    enableRetry: true,
    showTechnicalDetails: isDevelopment,
  },
});
```

### Error Boundary Components

Mantine-styled error boundaries:

```typescript
<ErrorBoundary
  showReportButton={true}
  showTechnicalDetails={isDevelopment}
  onError={(error, errorInfo) => {
    // Send to error reporting service
  }}
>
  <YourComponent />
</ErrorBoundary>
```

### Loading States

Comprehensive loading components:

```typescript
// Basic loading
<LoadingState message="Loading data..." />

// Skeleton loading
<SkeletonLoading lines={4} includeAvatar />

// Progress loading
<ProgressLoading value={progress} message="Uploading..." />

// Retryable loading for errors
<RetryableLoading error={error} onRetry={retry} />
```

## Best Practices

1. **Always use `errorFromAxios`** to convert axios errors to `AppError`
2. **Use `formatErrorForDisplay`** for user-facing error messages
3. **Include reference IDs** in error notifications for debugging
4. **Implement proper retry logic** for transient errors
5. **Use circuit breakers** for external service calls
6. **Validate Problem Details** when receiving from external APIs
7. **Provide meaningful problem type URIs** in your API responses
8. **Use Mantine's design tokens** for consistent error styling
9. **Implement proper loading states** with skeleton components
10. **Focus error fields** automatically for better UX
11. **Show validation errors** in context with field details
12. **Use appropriate notification persistence** based on error severity

## Testing

The error handling system includes comprehensive test coverage:

- RFC 9457 Problem Details validation
- Error type detection patterns
- Retry logic with exponential backoff
- Circuit breaker functionality
- Field error extraction and normalization

Run tests with:

```bash
npm test src/shared/lib/rfc9457-problem-details.test.ts
npm test src/shared/lib/http-error.test.ts
npm test src/shared/lib/retry-utils.test.ts
```
