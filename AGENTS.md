# Mantine UI Project Development Guide

## Project Overview

This is a modern React application built with Feature-Sliced Design (FSD) architecture, focusing on maintainability, scalability, and developer experience. The project uses React 19, TypeScript, Mantine UI, and a comprehensive toolchain for building high-performance Single Page Applications.

## Tech Stack

- **Frontend Framework**: React 19 + TypeScript
- **Build Tool**: Vite with SWC
- **Architecture**: Feature-Sliced Design (FSD)
- **UI Library**: Mantine UI v8 + Tabler Icons
- **Routing**: TanStack Router v1
- **State Management**: Zustand + TanStack Query v5
- **HTTP Client**: Axios with interceptors
- **Forms**: Mantine Form + React Hook Form
- **Internationalization**: Lingui
- **Testing**: Vitest + React Testing Library + Playwright
- **Code Quality**: ESLint (Mantine config) + Prettier + Husky
- **Package Manager**: pnpm

## Architecture: Feature-Sliced Design (FSD)

The project follows Feature-Sliced Design methodology with the following layers:

```
src/
├── app/          # Application layer (providers, routing, global styles)
├── pages/        # Page layer (route components)
├── widgets/      # Widget layer (complex UI blocks)
├── features/     # Feature layer (user scenarios, business logic)
├── entities/     # Entity layer (business entities, data models)
└── shared/       # Shared layer (reusable code, UI kit, utilities)
```

### Layer Rules

1. **Import Rule**: Higher layers can import from lower layers only
2. **Public API**: Each layer exposes functionality through `index.ts`
3. **Isolation**: Features should not depend on each other directly

## Development Guidelines

### Component Development Standards

1. **Mantine Components First**: Use Mantine UI components as building blocks
2. **TypeScript Interfaces**: Define strict interfaces for all props
3. **Component Naming**: PascalCase, file name matches component name
4. **Feature-Sliced Structure**: Organize by features, not by file types

```tsx
// shared/ui/form-field/form-field.tsx
import { TextInput, Select, Textarea } from "@mantine/core";
import { UseFormReturnType } from "@mantine/form";

interface FormFieldProps {
  name: string;
  label: string;
  type: "text" | "email" | "select" | "textarea";
  form: UseFormReturnType<any>;
  data?: Array<{ value: string; label: string }>;
  placeholder?: string;
  required?: boolean;
}

export function FormField({
  name,
  label,
  type,
  form,
  data,
  ...props
}: FormFieldProps) {
  const baseProps = {
    label,
    ...form.getInputProps(name),
    ...props,
  };

  switch (type) {
    case "select":
      return <Select {...baseProps} data={data} />;
    case "textarea":
      return <Textarea {...baseProps} />;
    default:
      return <TextInput {...baseProps} type={type} />;
  }
}
```

### State Management Standards

#### TanStack Query for Server State

```tsx
// shared/lib/use-form-mutation.ts
import { useMutation } from "@tanstack/react-query";
import { UseFormReturnType } from "@mantine/form";
import { notificationService } from "./notifications";

export function useFormMutation<TData, TVariables>(
  form: UseFormReturnType<any>,
  mutationFn: (variables: TVariables) => Promise<TData>,
  options?: {
    notifySuccess?: { title: string; message: string };
    notifyError?: { title: string; fallback: string };
  }
) {
  return useMutation({
    mutationFn,
    onSuccess: (data, variables) => {
      form.setErrors({});
      if (options?.notifySuccess) {
        notificationService.success(options.notifySuccess);
      }
    },
    onError: (error) => {
      // Handle field errors and notifications
      if (options?.notifyError) {
        notificationService.error({
          title: options.notifyError.title,
          message: getErrorMessage(error, options.notifyError.fallback),
        });
      }
    },
  });
}
```

#### Zustand for Client State

```tsx
// shared/lib/stores/ui-store.ts
import { create } from "zustand";

interface UIState {
  sidebarOpened: boolean;
  theme: "light" | "dark";
  toggleSidebar: () => void;
  setTheme: (theme: "light" | "dark") => void;
}

export const useUIStore = create<UIState>((set) => ({
  sidebarOpened: false,
  theme: "light",
  toggleSidebar: () =>
    set((state) => ({ sidebarOpened: !state.sidebarOpened })),
  setTheme: (theme) => set({ theme }),
}));
```

### API Service Standards

```tsx
// shared/lib/client.ts
import axios from "axios";
import { normalizeAxiosError } from "./http-error";

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "/api",
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("auth_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(normalizeAxiosError(error))
);

// Response interceptor
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const normalizedError = normalizeAxiosError(error);

    // Handle auth errors globally
    if (normalizedError.type === "auth") {
      localStorage.removeItem("auth_token");
      window.location.href = "/login";
    }

    return Promise.reject(normalizedError);
  }
);
```

### Form Handling Standards

```tsx
// features/sample-form/ui/sample-form-feature.tsx
import { useForm } from "@mantine/form";
import { Modal, Stack, Button, Group } from "@mantine/core";
import { useFormMutation } from "@/shared/lib";
import { FormField } from "@/shared/ui";
import { validateSampleForm, initialFormValues } from "../model/validation";

export function SampleFormFeature() {
  const [opened, { open, close }] = useDisclosure(false);

  const form = useForm({
    initialValues: initialFormValues,
    validate: validateSampleForm,
  });

  const mutation = useFormMutation(
    form,
    async (values) => {
      return api.post("/forms", values);
    },
    {
      notifySuccess: {
        title: "Success!",
        message: "Form submitted successfully",
      },
      notifyError: {
        title: "Error",
        fallback: "Failed to submit form",
      },
      onSuccess: () => {
        form.reset();
        close();
      },
    }
  );

  return (
    <>
      <Button onClick={open}>Open Form</Button>

      <Modal opened={opened} onClose={close} title="Sample Form">
        <form
          onSubmit={form.onSubmit((values) => mutation.mutateAsync(values))}
        >
          <Stack>
            <FormField
              type="text"
              name="name"
              label="Name"
              form={form}
              required
            />
            <FormField
              type="email"
              name="email"
              label="Email"
              form={form}
              required
            />

            <Group justify="flex-end">
              <Button variant="subtle" onClick={close}>
                Cancel
              </Button>
              <Button type="submit" loading={mutation.isPending}>
                Submit
              </Button>
            </Group>
          </Stack>
        </form>
      </Modal>
    </>
  );
}
```

## Environment Setup

### Development Requirements

- **Node.js**: >= 22.0.0
- **Package Manager**: pnpm (required)
- **Editor**: VS Code with recommended extensions

### Recommended VS Code Extensions

```json
// .vscode/extensions.json
{
  "recommendations": [
    "bradlc.vscode-tailwindcss",
    "esbenp.prettier-vscode",
    "dbaeumer.vscode-eslint",
    "ms-vscode.vscode-typescript-next",
    "formulahendry.auto-rename-tag",
    "christian-kohler.path-intellisense"
  ]
}
```

### Environment Variables

```env
# .env.local
VITE_API_URL=http://localhost:3001/api
VITE_APP_TITLE=Mantine UI Project
VITE_ENABLE_MOCK=false
VITE_LINGUI_LOCALE=en
```

### Editor Configuration

The project uses these formatting rules:

```yaml
# .prettierrc
endOfLine: lf
trailingComma: es5
tabWidth: 2
semi: true
singleQuote: false
```

### Development Scripts

```bash
# Development
pnpm dev                    # Start development server
pnpm build                  # Build for production
pnpm preview               # Preview production build

# Testing
pnpm test                  # Run unit tests
pnpm test:coverage         # Run tests with coverage
pnpm test:ui               # Run tests with UI
pnpm e2e                   # Run E2E tests

# Code Quality
pnpm lint                  # Run ESLint
pnpm lint:fix              # Fix ESLint issues
pnpm prettier:check        # Check formatting
pnpm prettier:write        # Format code
pnpm type-check            # TypeScript type checking

# Internationalization
pnpm messages:extract      # Extract translation messages
pnpm messages:compile      # Compile translations

# Storybook
pnpm storybook             # Start Storybook
pnpm storybook:build       # Build Storybook
```

## Testing Strategy

### Testing Stack

- **Unit Tests**: Vitest + React Testing Library
- **E2E Tests**: Playwright
- **Component Tests**: Storybook with interactions
- **Coverage**: Vitest coverage with v8

### Unit Testing with Mantine Components

```tsx
// shared/ui/form-field/form-field.test.tsx
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MantineProvider } from "@mantine/core";
import { useForm } from "@mantine/form";
import { FormField } from "./form-field";

const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <MantineProvider>{children}</MantineProvider>
);

const FormFieldTestComponent = ({ type, ...props }: any) => {
  const form = useForm({
    initialValues: { testField: "" },
  });

  return (
    <FormField
      name="testField"
      label="Test Field"
      form={form}
      type={type}
      {...props}
    />
  );
};

describe("FormField", () => {
  it("renders text input correctly", () => {
    render(
      <TestWrapper>
        <FormFieldTestComponent type="text" placeholder="Enter text" />
      </TestWrapper>
    );

    const input = screen.getByLabelText("Test Field");
    expect(input).toBeInTheDocument();
    expect(input).toHaveAttribute("type", "text");
    expect(input).toHaveAttribute("placeholder", "Enter text");
  });

  it("handles user input correctly", async () => {
    const user = userEvent.setup();

    render(
      <TestWrapper>
        <FormFieldTestComponent type="text" />
      </TestWrapper>
    );

    const input = screen.getByLabelText("Test Field");
    await user.type(input, "test value");

    expect(input).toHaveValue("test value");
  });
});
```

### Feature Testing with TanStack Query

```tsx
// features/sample-form/ui/sample-form-feature.test.tsx
import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MantineProvider } from "@mantine/core";
import { SampleFormFeature } from "./sample-form-feature";

// Mock the form mutation hook
vi.mock("@/shared/lib", () => ({
  ...vi.importActual("@/shared/lib"),
  useFormMutation: vi.fn(),
}));

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      <MantineProvider>{children}</MantineProvider>
    </QueryClientProvider>
  );
};

describe("SampleFormFeature", () => {
  const mockMutation = {
    mutateAsync: vi.fn(),
    isPending: false,
  };

  beforeEach(async () => {
    vi.clearAllMocks();
    const { useFormMutation } = await import("@/shared/lib");
    (useFormMutation as any).mockReturnValue(mockMutation);
  });

  it("submits form with valid data", async () => {
    const user = userEvent.setup();
    mockMutation.mutateAsync.mockResolvedValue(undefined);

    render(<SampleFormFeature />, { wrapper: createWrapper() });

    // Open modal
    const openButton = screen.getByRole("button", { name: /open form/i });
    await user.click(openButton);

    // Fill form
    const nameInput = screen.getByLabelText("Name");
    const emailInput = screen.getByLabelText("Email");

    await user.type(nameInput, "John Doe");
    await user.type(emailInput, "john@example.com");

    // Submit
    const submitButton = screen.getByRole("button", { name: /submit/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(mockMutation.mutateAsync).toHaveBeenCalledWith({
        name: "John Doe",
        email: "john@example.com",
      });
    });
  });
});
```

### Test Setup Configuration

```tsx
// src/setupTests.ts
import "@testing-library/jest-dom";

// Mock window.matchMedia for Mantine components
Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => {},
  }),
});

// Mock ResizeObserver
global.ResizeObserver = class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
};
```

## Performance Optimization

### Code Splitting with TanStack Router

```tsx
// pages/examples.tsx
import { createFileRoute } from "@tanstack/react-router";
import { lazy, Suspense } from "react";
import { LoadingOverlay } from "@/shared/ui";

const ExamplesPage = lazy(() => import("../widgets/examples-page"));

export const Route = createFileRoute("/examples")({
  component: () => (
    <Suspense
      fallback={<LoadingOverlay visible message="Loading examples..." />}
    >
      <ExamplesPage />
    </Suspense>
  ),
});
```

### Mantine Component Optimization

```tsx
// shared/ui/data-table/data-table.tsx
import { memo, useMemo } from "react";
import { DataTable as MantineDataTable } from "mantine-datatable";
import type { DataTableProps } from "mantine-datatable";

interface OptimizedDataTableProps<T>
  extends Omit<DataTableProps<T>, "records"> {
  data: T[];
  searchQuery?: string;
  searchFields?: (keyof T)[];
}

export const DataTable = memo(
  <T extends Record<string, any>>({
    data,
    searchQuery,
    searchFields = [],
    ...props
  }: OptimizedDataTableProps<T>) => {
    const filteredData = useMemo(() => {
      if (!searchQuery || !searchFields.length) return data;

      return data.filter((item) =>
        searchFields.some((field) =>
          String(item[field]).toLowerCase().includes(searchQuery.toLowerCase())
        )
      );
    }, [data, searchQuery, searchFields]);

    return (
      <MantineDataTable
        records={filteredData}
        highlightOnHover
        striped
        {...props}
      />
    );
  }
);
```

### TanStack Query Optimization

```tsx
// shared/lib/queries/use-users-query.ts
import { useQuery } from "@tanstack/react-query";
import { api } from "../client";

export function useUsersQuery(params?: {
  page?: number;
  search?: string;
  enabled?: boolean;
}) {
  return useQuery({
    queryKey: ["users", params],
    queryFn: () => api.get("/users", { params }),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    enabled: params?.enabled ?? true,
  });
}

// Prefetch for better UX
export function usePrefetchUsers() {
  const queryClient = useQueryClient();

  return useCallback(
    (params?: { page?: number; search?: string }) => {
      queryClient.prefetchQuery({
        queryKey: ["users", params],
        queryFn: () => api.get("/users", { params }),
        staleTime: 5 * 60 * 1000,
      });
    },
    [queryClient]
  );
}
```

## Internationalization with Lingui

### Setup and Usage

```tsx
// shared/lib/i18n.ts
import { i18n } from "@lingui/core";
import { messages as enMessages } from "../locales/en/messages";
import { messages as esMessages } from "../locales/es/messages";

i18n.load({
  en: enMessages,
  es: esMessages,
});

i18n.activate("en");

export { i18n };
```

```tsx
// Component with translations
import { Trans, t } from "@lingui/macro";
import { useLingui } from "@lingui/react";

export function WelcomeMessage({ userName }: { userName: string }) {
  const { _ } = useLingui();

  return (
    <div>
      <h1>
        <Trans>Welcome, {userName}!</Trans>
      </h1>
      <p>{_(t`Click the button below to get started.`)}</p>
    </div>
  );
}
```

## Error Handling Best Practices

### Global Error Boundary

```tsx
// shared/ui/error-boundary/error-boundary.tsx
import { Alert, Button, Container, Stack, Title } from "@mantine/core";
import { IconAlertCircle, IconRefresh } from "@tabler/icons-react";
import { Component, ErrorInfo, ReactNode } from "react";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Error caught by boundary:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <Container size="sm" py="xl">
          <Stack align="center" gap="lg">
            <Title order={2}>Something went wrong</Title>

            <Alert
              icon={<IconAlertCircle size="1rem" />}
              title="Application Error"
              color="red"
              variant="light"
            >
              {this.state.error?.message || "An unexpected error occurred"}
            </Alert>

            <Button
              leftSection={<IconRefresh size="1rem" />}
              onClick={() => window.location.reload()}
            >
              Reload Page
            </Button>
          </Stack>
        </Container>
      );
    }

    return this.props.children;
  }
}
```

## Code Quality Standards

### ESLint Configuration

The project uses Mantine's ESLint configuration with additional rules:

- **TanStack Query**: Enforces query best practices
- **TanStack Router**: Ensures proper route configuration
- **Lingui**: Validates translation usage
- **React Hooks**: Prevents common hook mistakes

### Commit Standards

```bash
# Conventional Commits with Commitizen
pnpm commit  # Interactive commit with proper formatting

# Examples:
feat: add user profile form
fix: resolve validation error in login form
docs: update API documentation
test: add unit tests for form components
```

### Pre-commit Hooks

```json
// package.json
{
  "lint-staged": {
    "*": ["pnpm prettier:check"],
    "package.json": ["sort-package-json"]
  }
}
```

## Deployment Considerations

### Build Optimization

```typescript
// vite.config.ts
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ["react", "react-dom"],
          mantine: ["@mantine/core", "@mantine/hooks"],
          tanstack: ["@tanstack/react-query", "@tanstack/react-router"],
        },
      },
    },
  },
});
```

### Environment-specific Configuration

```bash
# Production build
pnpm build

# Preview production build locally
pnpm preview

# Type checking before deployment
pnpm type-check
```
