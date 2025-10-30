# MSW Implementation Summary

## Overview

Successfully implemented a comprehensive Mock Service Worker (MSW) setup that can be enabled/disabled via app configuration and environment variables. The implementation provides a robust foundation for API mocking during development and testing.

## Key Features Implemented

### 1. **Configurable MSW Setup**

- Environment variable control (`VITE_ENABLE_MSW`)
- App-level configuration with runtime overrides
- Centralized configuration management

### 2. **Comprehensive Mock Handlers**

- **Authentication endpoints**: Login, signup, refresh, logout, forgot password, reset password
- **User management endpoints**: CRUD operations with pagination and search
- **Error handling**: Realistic error responses with RFC 7807 format
- **Configurable delays**: Simulate network latency

### 3. **Development Tools**

- Floating MSW dev panel for runtime control
- Toggle MSW on/off without restart
- Configure logging, delays, and error handling
- Real-time status monitoring

### 4. **Testing Integration**

- Automatic MSW server setup for tests
- Handler reset between tests
- Easy test-specific handler overrides
- Comprehensive test examples

### 5. **React Query Integration**

- Custom hooks following best practices
- Proper query key management
- Optimistic updates and cache invalidation
- Error handling patterns

## File Structure Created

```
src/
├── app/config/
│   └── msw-config.ts              # App-level MSW configuration
├── shared/
│   ├── lib/
│   │   ├── msw-config.ts          # Core MSW configuration
│   │   └── use-msw-control.ts     # Runtime MSW control hook
│   ├── mocks/
│   │   ├── handlers/
│   │   │   ├── auth.ts            # Auth endpoint mocks
│   │   │   ├── users.ts           # User endpoint mocks
│   │   │   └── index.ts           # Handler exports
│   │   ├── browser.ts             # Browser MSW setup
│   │   ├── server.ts              # Node.js MSW setup
│   │   ├── index.ts               # Public API
│   │   └── README.md              # Comprehensive documentation
│   └── ui/
│       └── msw-dev-tools.tsx      # Development control panel
├── features/users/
│   ├── api/
│   │   └── users-api.ts           # API client functions
│   ├── hooks/
│   │   └── use-users-query.ts     # React Query hooks
│   └── components/
│       ├── users-list.tsx         # Example component
│       └── users-list.test.tsx    # Comprehensive tests
├── pages/
│   └── msw-demo.tsx               # Demo page
└── setupTests.ts                  # Updated with MSW setup
```

## Configuration Options

### Environment Variables

```env
# Enable/disable MSW
VITE_ENABLE_MSW=true

# Control logging
VITE_LOG_LEVEL=info  # 'silent', 'info', 'debug'
```

### Runtime Configuration

```typescript
import { configureMSW } from "@/app/config";

configureMSW({
  enabled: true,
  enableLogging: true,
  onUnhandledRequest: "warn",
  delay: { min: 100, max: 500 },
});
```

### Hook-based Control

```typescript
import { useMSWControl } from "@/shared/lib";

const { toggleMSW, isRunning, setDelay } = useMSWControl();
```

## Usage Examples

### 1. **Adding New Mock Endpoints**

```typescript
// Create handler file
export const productsHandlers = [
  http.get("/api/v1/products", async () => {
    return HttpResponse.json({ data: mockProducts });
  }),
];

// Export in handlers/index.ts
export const handlers = [...authHandlers, ...productsHandlers];
```

### 2. **Using in Components**

```typescript
// API function
export async function fetchUsers() {
  const { data } = await apiClient.get("/api/v1/users");
  return data;
}

// React Query hook
export function useUsersQuery() {
  return useQuery({
    queryKey: ["users"],
    queryFn: fetchUsers,
  });
}

// Component
export function UsersList() {
  const { data, isLoading } = useUsersQuery();
  // Component renders mock data when MSW is enabled
}
```

### 3. **Testing with MSW**

```typescript
// Override handler for specific test
server.use(
  http.get("/api/v1/users", () => {
    return HttpResponse.json({ error: "Server error" }, { status: 500 });
  })
);

// Test error handling
expect(await screen.findByText("Error loading users")).toBeInTheDocument();
```

## Benefits

### For Development

- **Faster iteration**: No need to wait for backend APIs
- **Offline development**: Work without internet connection
- **Error testing**: Easily simulate error conditions
- **Consistent data**: Predictable responses for UI development

### For Testing

- **Reliable tests**: No external dependencies
- **Fast execution**: No network calls
- **Deterministic**: Consistent test results
- **Easy mocking**: Simple handler overrides

### For Team Collaboration

- **Frontend/Backend independence**: Teams can work in parallel
- **API contract testing**: Validate API expectations
- **Documentation**: Handlers serve as API documentation
- **Onboarding**: New developers can run the app immediately

## Best Practices Implemented

1. **Realistic mock data** with proper data types and relationships
2. **Error scenarios** covering common HTTP status codes
3. **Configurable delays** for network simulation
4. **Consistent logging** with emoji prefixes for easy identification
5. **RFC 7807 error format** for standardized error responses
6. **Pagination support** for list endpoints
7. **Search functionality** in mock handlers
8. **Proper TypeScript types** for all mock data
9. **Test isolation** with handler resets
10. **Development tools** for easy debugging

## Next Steps

1. **Add more endpoints** as needed for your application
2. **Customize mock data** to match your domain
3. **Configure Storybook** to use MSW for component stories
4. **Add GraphQL support** if using GraphQL APIs
5. **Implement WebSocket mocking** for real-time features

## Resources

- [MSW Documentation](https://mswjs.io/)
- [React Query Best Practices](https://tkdodo.eu/blog/practical-react-query)
- [Testing with MSW](https://kentcdodds.com/blog/stop-mocking-fetch)

The implementation provides a solid foundation for API mocking that scales with your application and supports both development and testing workflows effectively.
