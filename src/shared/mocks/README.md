# Mock Service Worker (MSW) Setup

This directory contains the MSW configuration for mocking API requests during development and testing.

## Overview

MSW (Mock Service Worker) intercepts network requests at the service worker level, allowing you to mock API responses without changing your application code. This setup provides:

- **Development mocking**: Test your UI with realistic API responses
- **Testing support**: Reliable, fast tests without external dependencies
- **Offline development**: Work on frontend features without a backend
- **Error simulation**: Test error handling and edge cases

## Configuration

### Environment Variables

MSW can be controlled via environment variables in your `.env` file:

```env
# Enable/disable MSW
VITE_ENABLE_MSW=true

# Control logging verbosity
VITE_LOG_LEVEL=info  # 'silent', 'info', 'debug'
```

### App Configuration

You can also control MSW programmatically using the app config:

```typescript
import { configureMSW } from "@/app/config";

// Enable MSW with custom settings
configureMSW({
  enabled: true,
  enableLogging: true,
  onUnhandledRequest: "warn",
  delay: { min: 100, max: 500 },
});
```

### Runtime Control

Use the `useMSWControl` hook for dynamic control:

```typescript
import { useMSWControl } from '@/shared/lib';

function MyComponent() {
  const { toggleMSW, isRunning, setDelay } = useMSWControl();

  return (
    <button onClick={toggleMSW}>
      {isRunning ? 'Disable' : 'Enable'} MSW
    </button>
  );
}
```

## File Structure

```
src/shared/mocks/
├── handlers/           # Request handlers organized by feature
│   ├── auth.ts        # Authentication endpoints
│   ├── users.ts       # User management endpoints
│   └── index.ts       # Export all handlers
├── browser.ts         # Browser MSW setup
├── server.ts          # Node.js MSW setup (for testing)
├── server-exports.ts  # Server-only exports
├── index.ts           # Public API
└── README.md          # This file
```

## Adding New Mocks

### 1. Create Handler File

Create a new handler file in `handlers/` directory:

```typescript
// src/shared/mocks/handlers/products.ts
import { http, HttpResponse, delay } from "msw";
import { getMSWConfig } from "@/shared/lib/msw-config";

const config = getMSWConfig();

export const productsHandlers = [
  http.get("/api/v1/products", async ({ request }) => {
    if (config.delay) {
      await delay(
        typeof config.delay === "object"
          ? Math.random() * (config.delay.max - config.delay.min) + config.delay.min
          : config.delay,
      );
    }

    if (config.enableLogging) {
      console.log("🛍️ MSW: Get products");
    }

    return HttpResponse.json({
      data: [
        { id: "1", name: "Product 1", price: 99.99 },
        { id: "2", name: "Product 2", price: 149.99 },
      ],
    });
  }),
];
```

### 2. Export Handlers

Add your handlers to the main handlers file:

```typescript
// src/shared/mocks/handlers/index.ts
import { productsHandlers } from "./products";

export const handlers = [
  ...authHandlers,
  ...usersHandlers,
  ...productsHandlers, // Add your new handlers
];

export { productsHandlers }; // Export for selective use
```

### 3. Use in Your App

Create API functions and React Query hooks:

```typescript
// src/features/products/api/products-api.ts
export async function fetchProducts() {
  const { data } = await api.get("/v1/products");
  return data;
}

// src/features/products/hooks/use-products-query.ts
export function useProductsQuery() {
  return useQuery({
    queryKey: ["products"],
    queryFn: fetchProducts,
  });
}
```

## Development Tools

The project includes a development panel for MSW control:

- **Toggle MSW**: Enable/disable mocking on the fly
- **Logging control**: Turn request logging on/off
- **Delay simulation**: Add artificial network delays
- **Error handling**: Configure unhandled request behavior

The dev tools appear as a floating panel in the bottom-right corner during development.

## Testing Integration

MSW is automatically configured for testing:

```typescript
// Tests automatically use MSW server
import { render, screen } from '@testing-library/react';
import { UsersList } from './users-list';

test('displays users from API', async () => {
  render(<UsersList />);

  // MSW will intercept the API call and return mock data
  expect(await screen.findByText('John Doe')).toBeInTheDocument();
});
```

### Custom Test Handlers

Override handlers for specific tests:

```typescript
import { server } from '@/shared/mocks/server-exports';
import { http, HttpResponse } from 'msw';

test('handles API error', async () => {
  // Override handler for this test
  server.use(
    http.get('/api/v1/users', () => {
      return HttpResponse.json(
        { error: 'Server error' },
        { status: 500 }
      );
    })
  );

  render(<UsersList />);
  expect(await screen.findByText('Error loading users')).toBeInTheDocument();
});
```

## Best Practices

### 1. Realistic Mock Data

Create realistic mock data that matches your API:

```typescript
const mockUser = {
  id: "1",
  name: "John Doe",
  email: "john@example.com",
  avatar: "https://via.placeholder.com/150",
  createdAt: "2024-01-15T10:30:00Z",
  // Include all fields your real API returns
};
```

### 2. Error Scenarios

Mock various error conditions:

```typescript
// 404 Not Found
if (!user) {
  return HttpResponse.json(
    {
      type: "https://example.com/problems/user-not-found",
      title: "User Not Found",
      status: 404,
      detail: `User with ID ${id} was not found.`,
    },
    { status: 404 },
  );
}
```

### 3. Consistent Logging

Use consistent logging patterns:

```typescript
if (config.enableLogging) {
  console.log("🔐 MSW: Login attempt", { email: body.email });
}
```

### 4. Configurable Delays

Respect the delay configuration:

```typescript
if (config.delay) {
  await delay(
    typeof config.delay === "object"
      ? Math.random() * (config.delay.max - config.delay.min) + config.delay.min
      : config.delay,
  );
}
```

## Troubleshooting

### MSW Not Starting

1. Check that `VITE_ENABLE_MSW=true` in your `.env` file
2. Ensure the service worker file exists at `/public/mockServiceWorker.js`
3. Check browser console for MSW startup messages

### Requests Not Being Intercepted

1. Verify your handler patterns match the actual request URLs
2. Check that handlers are properly exported and imported
3. Use browser dev tools to see if MSW is active

### Performance Issues

1. Reduce mock data size for large datasets
2. Implement pagination in your mocks
3. Use appropriate delays (not too high)

### Testing Issues

1. Ensure MSW server is started in `setupTests.ts`
2. Reset handlers between tests using `resetMSWServer()`
3. Check that test handlers match your expectations

## Resources

- [MSW Documentation](https://mswjs.io/)
- [MSW Examples](https://github.com/mswjs/examples)
- [React Query + MSW Guide](https://tkdodo.eu/blog/testing-react-query)
