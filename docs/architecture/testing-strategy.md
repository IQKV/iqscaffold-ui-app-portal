# Testing Strategy

## Testing Philosophy

Our testing strategy follows the testing pyramid approach with emphasis on:

- **Unit Tests**: Fast, isolated tests for business logic
- **Integration Tests**: Feature-level tests with realistic scenarios
- **E2E Tests**: Critical user journeys and workflows

## Testing Stack

### Unit Testing

- **Vitest**: Fast test runner with native TypeScript support
- **Testing Library**: Simple and complete testing utilities
- **MSW**: API mocking for isolated testing

### E2E Testing

- **Playwright**: Cross-browser testing with reliable selectors
- **Visual Testing**: Screenshot comparison for UI consistency

## Test Organization

```
src/
├── __tests__/           # Global test utilities
│   ├── setup.ts        # Test environment setup
│   ├── mocks/          # Shared mocks
│   └── utils/          # Test utilities
├── entities/
│   └── user/
│       ├── model/
│       │   └── user.test.ts     # Entity tests
│       └── api/
│           └── userApi.test.ts  # API tests
├── features/
│   └── auth/
│       └── login/
│           └── LoginForm.test.tsx  # Feature tests
└── shared/
    └── ui/
        └── Button/
            └── Button.test.tsx     # Component tests
```

## Unit Testing Guidelines

### Component Testing

```typescript
// Button.test.tsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Button } from './Button';

describe('Button', () => {
  it('should render with correct text', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByRole('button', { name: /click me/i })).toBeInTheDocument();
  });

  it('should call onClick when clicked', async () => {
    const user = userEvent.setup();
    const handleClick = vi.fn();

    render(<Button onClick={handleClick}>Click me</Button>);

    await user.click(screen.getByRole('button'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('should be disabled when loading', () => {
    render(<Button loading>Click me</Button>);
    expect(screen.getByRole('button')).toBeDisabled();
  });
});
```

### Hook Testing

```typescript
// useUser.test.ts
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useUser } from './useUser';

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } }
  });

  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
};

describe('useUser', () => {
  it('should fetch user data', async () => {
    const { result } = renderHook(() => useUser('123'), {
      wrapper: createWrapper()
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toEqual(mockUser);
  });
});
```

### API Testing

```typescript
// userApi.test.ts
import { userApi } from "./userApi";
import { server } from "@/__tests__/mocks/server";
import { http, HttpResponse } from "msw";

describe("userApi", () => {
  it("should fetch users successfully", async () => {
    const mockUsers = [
      { id: "1", name: "John Doe", email: "john@example.com" },
    ];

    server.use(
      http.get("/api/users", () => {
        return HttpResponse.json(mockUsers);
      })
    );

    const users = await userApi.getUsers();
    expect(users).toEqual(mockUsers);
  });

  it("should handle API errors", async () => {
    server.use(
      http.get("/api/users", () => {
        return new HttpResponse(null, { status: 500 });
      })
    );

    await expect(userApi.getUsers()).rejects.toThrow();
  });
});
```

## Integration Testing

### Feature Testing

```typescript
// LoginForm.test.tsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { LoginForm } from './LoginForm';
import { TestProviders } from '@/__tests__/utils/TestProviders';

describe('LoginForm', () => {
  it('should login user successfully', async () => {
    const user = userEvent.setup();

    render(
      <TestProviders>
        <LoginForm />
      </TestProviders>
    );

    // Fill form
    await user.type(screen.getByLabelText(/email/i), 'user@example.com');
    await user.type(screen.getByLabelText(/password/i), 'password123');

    // Submit form
    await user.click(screen.getByRole('button', { name: /login/i }));

    // Verify success
    await waitFor(() => {
      expect(screen.getByText(/welcome/i)).toBeInTheDocument();
    });
  });

  it('should show validation errors', async () => {
    const user = userEvent.setup();

    render(
      <TestProviders>
        <LoginForm />
      </TestProviders>
    );

    // Submit empty form
    await user.click(screen.getByRole('button', { name: /login/i }));

    // Verify errors
    expect(screen.getByText(/email is required/i)).toBeInTheDocument();
    expect(screen.getByText(/password is required/i)).toBeInTheDocument();
  });
});
```

## E2E Testing

### Page Object Model

```typescript
// pages/LoginPage.ts
export class LoginPage {
  constructor(private page: Page) {}

  async goto() {
    await this.page.goto("/auth/login");
  }

  async login(email: string, password: string) {
    await this.page.fill('[data-testid="email-input"]', email);
    await this.page.fill('[data-testid="password-input"]', password);
    await this.page.click('[data-testid="login-button"]');
  }

  async expectLoginSuccess() {
    await expect(
      this.page.locator('[data-testid="welcome-message"]')
    ).toBeVisible();
  }

  async expectLoginError(message: string) {
    await expect(
      this.page.locator('[data-testid="error-message"]')
    ).toContainText(message);
  }
}
```

### E2E Test Example

```typescript
// auth.spec.ts
import { test, expect } from "@playwright/test";
import { LoginPage } from "../pages/LoginPage";

test.describe("Authentication", () => {
  test("should login with valid credentials", async ({ page }) => {
    const loginPage = new LoginPage(page);

    await loginPage.goto();
    await loginPage.login("user@example.com", "password123");
    await loginPage.expectLoginSuccess();

    // Verify navigation
    await expect(page).toHaveURL("/dashboard");
  });

  test("should show error with invalid credentials", async ({ page }) => {
    const loginPage = new LoginPage(page);

    await loginPage.goto();
    await loginPage.login("invalid@example.com", "wrongpassword");
    await loginPage.expectLoginError("Invalid credentials");
  });
});
```

## Mock Service Worker Setup

### Browser Setup

```typescript
// src/mocks/browser.ts
import { setupWorker } from "msw/browser";
import { handlers } from "./handlers";

export const worker = setupWorker(...handlers);

// Start worker in development
if (process.env.NODE_ENV === "development") {
  worker.start({
    onUnhandledRequest: "warn",
  });
}
```

### Test Setup

```typescript
// src/__tests__/setup.ts
import { beforeAll, afterEach, afterAll } from "vitest";
import { server } from "./mocks/server";

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());
```

### API Handlers

```typescript
// src/mocks/handlers.ts
import { http, HttpResponse } from "msw";

export const handlers = [
  // Auth handlers
  http.post("/api/auth/login", async ({ request }) => {
    const { email, password } = await request.json();

    if (email === "user@example.com" && password === "password123") {
      return HttpResponse.json({
        token: "mock-token",
        user: { id: "1", email, name: "John Doe" },
      });
    }

    return new HttpResponse(null, { status: 401 });
  }),

  // User handlers
  http.get("/api/users", () => {
    return HttpResponse.json([
      { id: "1", name: "John Doe", email: "john@example.com" },
      { id: "2", name: "Jane Smith", email: "jane@example.com" },
    ]);
  }),

  http.get("/api/users/:id", ({ params }) => {
    const { id } = params;
    return HttpResponse.json({
      id,
      name: "John Doe",
      email: "john@example.com",
    });
  }),
];
```

## Test Utilities

### Test Providers

```typescript
// src/__tests__/utils/TestProviders.tsx
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MantineProvider } from '@mantine/core';
import { RouterProvider, createMemoryHistory } from '@tanstack/react-router';

export function TestProviders({ children }: { children: React.ReactNode }) {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false }
    }
  });

  return (
    <QueryClientProvider client={queryClient}>
      <MantineProvider>
        {children}
      </MantineProvider>
    </QueryClientProvider>
  );
}
```

### Custom Render

```typescript
// src/__tests__/utils/render.tsx
import { render as rtlRender } from "@testing-library/react";
import { TestProviders } from "./TestProviders";

export function render(ui: React.ReactElement, options = {}) {
  return rtlRender(ui, {
    wrapper: TestProviders,
    ...options,
  });
}

export * from "@testing-library/react";
```

## Coverage Configuration

```typescript
// vitest.config.ts
export default defineConfig({
  test: {
    coverage: {
      provider: "v8",
      reporter: ["text", "html", "lcov"],
      exclude: [
        "node_modules/",
        "src/__tests__/",
        "**/*.d.ts",
        "**/*.config.*",
        "**/index.ts",
      ],
      thresholds: {
        global: {
          branches: 80,
          functions: 80,
          lines: 80,
          statements: 80,
        },
      },
    },
  },
});
```

## CI/CD Integration

```yaml
# .github/workflows/test.yml
name: Test
on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v2
      - uses: actions/setup-node@v4
        with:
          node-version: 18
          cache: "pnpm"

      - run: pnpm install
      - run: pnpm test:coverage
      - run: pnpm e2e

      - name: Upload coverage
        uses: codecov/codecov-action@v3
        with:
          file: ./coverage/lcov.info
```

## Best Practices

### Test Naming

- Use descriptive test names that explain the expected behavior
- Follow the pattern: "should [expected behavior] when [condition]"
- Group related tests using `describe` blocks

### Test Structure

- **Arrange**: Set up test data and conditions
- **Act**: Execute the code being tested
- **Assert**: Verify the expected outcome

### Mocking Guidelines

- Mock external dependencies, not internal code
- Use MSW for API mocking instead of mocking fetch/axios
- Keep mocks simple and focused on the test scenario

### Accessibility Testing

```typescript
// Add accessibility tests
import { axe, toHaveNoViolations } from 'jest-axe';

expect.extend(toHaveNoViolations);

test('should not have accessibility violations', async () => {
  const { container } = render(<LoginForm />);
  const results = await axe(container);
  expect(results).toHaveNoViolations();
});
```
