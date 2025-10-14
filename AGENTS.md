# AI Agent Development Guide

## Project Overview

This is a modern React application built with Feature-Sliced Design (FSD) architecture, focusing on maintainability, scalability, and developer experience. The project uses React 19,
TypeScript, Mantine UI v8, and a comprehensive toolchain for building high-performance Single Page Applications.

**Key Characteristics:**

- Type-safe development with strict TypeScript configuration
- Component-driven development with Storybook integration
- Comprehensive testing strategy (Unit, Integration, E2E)
- Modern build tooling with Vite 6 and SWC
- Internationalization ready with Lingui
- Production-ready with Docker and CI/CD workflows

## Tech Stack

### Core Framework

- **React 19** - Latest React with concurrent features and improved performance
- **TypeScript** - Strict type safety with latest language features
- **Vite 6** - Lightning-fast development with SWC compiler
- **PNPM** - Fast, disk space efficient package manager

### UI & Styling

- **Mantine UI v8** - Complete component library with theming system
- **Mantine Extensions** - Carousel, Charts, Dates, Dropzone, Modals, Notifications, DataTable
- **Tabler Icons** - 4000+ SVG icons optimized for React
- **Tiptap Editor** - Rich text editor with extensions

### Routing & State

- **TanStack Router v1** - Type-safe routing with code splitting
- **TanStack Query v5** - Server state management and caching
- **Zustand** - Lightweight client state management
- **nuqs** - Type-safe URL search params state management

### Data & API

- **Axios** - HTTP client with interceptors and error handling
- **GraphQL Request** - Lightweight GraphQL client
- **Zod** - Runtime type validation and schema parsing
- **React Hook Form** - Performant forms with validation

### Development & Quality

- **Vitest** - Fast unit testing with coverage and UI
- **Playwright** - Reliable end-to-end testing
- **Storybook 8** - Component development in isolation
- **ESLint 9** - Modern linting with flat config
- **Prettier** - Code formatting with package.json plugin
- **Husky** - Git hooks for quality gates

### Internationalization & Accessibility

- **Lingui** - Modern i18n with macro support and pluralization
- **Built-in A11y** - Accessibility features and testing

## Architecture: Feature-Sliced Design (FSD)

The project follows Feature-Sliced Design methodology with strict layer hierarchy:

```
src/
├── app/          # Application layer (providers, routing, global styles)
├── pages/        # Page layer (route components)
├── widgets/      # Widget layer (complex UI blocks)
├── features/     # Feature layer (user scenarios, business logic)
├── entities/     # Entity layer (business entities, data models)
└── shared/       # Shared layer (reusable code, UI kit, utilities)
```

### FSD Layer Rules (CRITICAL)

1. **Import Rule**: Higher layers can ONLY import from lower layers
   - ❌ `shared` cannot import from `features`
   - ✅ `features` can import from `shared` and `entities`
2. **Public API**: Each slice exposes functionality through `index.ts`
   - All imports must go through public API: `from "@/features/auth"`
   - Never import internal files: `from "@/features/auth/model/store"`

3. **Cross-Feature Isolation**: Features cannot depend on each other
   - Use `shared` layer for common functionality
   - Communicate through `app` layer or events

4. **Segment Structure**: Each slice contains standardized segments
   ```
   feature-name/
   ├── ui/           # React components
   ├── model/        # Business logic, stores, types
   ├── api/          # API calls and contracts
   ├── lib/          # Utilities specific to this feature
   └── index.ts      # Public API exports
   ```

## AI Agent Development Guidelines

### Code Generation Principles

1. **Always Follow FSD Architecture**: Respect layer boundaries and public APIs
2. **Type-First Development**: Define TypeScript interfaces before implementation
3. **Component Composition**: Prefer composition over complex prop drilling
4. **Performance by Default**: Use React.memo, useMemo, useCallback appropriately
5. **Accessibility First**: Include ARIA attributes and semantic HTML
6. **Test-Driven Approach**: Generate tests alongside components

### AI-Assisted Development Workflow

```typescript
// 1. Define types first
interface UserProfileProps {
  userId: string;
  onEdit?: (user: User) => void;
  variant?: "compact" | "detailed";
}

// 2. Create component with proper FSD location
// features/user-profile/ui/user-profile.tsx

// 3. Implement with Mantine components
// 4. Add Storybook story
// 5. Write unit tests
// 6. Export through public API
```

### Code Quality Checklist for AI

- [ ] TypeScript strict mode compliance
- [ ] Proper error boundaries and loading states
- [ ] Mantine theme integration
- [ ] Responsive design with Mantine breakpoints
- [ ] Internationalization with Lingui macros
- [ ] Accessibility attributes (ARIA, semantic HTML)
- [ ] Performance optimizations (memoization)
- [ ] Unit tests with React Testing Library
- [ ] Storybook story with variants

## Development Guidelines

### Component Development Standards

1. **Mantine Components First**: Use Mantine UI components as building blocks
2. **TypeScript Interfaces**: Define strict interfaces for all props
3. **Component Naming**: PascalCase, file name matches component name
4. **Feature-Sliced Structure**: Organize by features, not by file types

```tsx
// shared/ui/form-field/form-field.tsx
import {
  TextInput,
  Select,
  Textarea,
  type TextInputProps,
} from "@mantine/core";
import { type UseFormReturnType } from "@mantine/form";
import { forwardRef } from "react";

interface BaseFormFieldProps {
  name: string;
  label: string;
  form: UseFormReturnType<any>;
  required?: boolean;
  description?: string;
}

interface TextFormFieldProps extends BaseFormFieldProps {
  type: "text" | "email" | "password" | "number";
  placeholder?: string;
}

interface SelectFormFieldProps extends BaseFormFieldProps {
  type: "select";
  data: Array<{ value: string; label: string }>;
  placeholder?: string;
  searchable?: boolean;
}

interface TextareaFormFieldProps extends BaseFormFieldProps {
  type: "textarea";
  placeholder?: string;
  rows?: number;
}

type FormFieldProps =
  | TextFormFieldProps
  | SelectFormFieldProps
  | TextareaFormFieldProps;

export const FormField = forwardRef<HTMLInputElement, FormFieldProps>(
  ({ name, label, type, form, ...props }, ref) => {
    const baseProps = {
      label,
      ...form.getInputProps(name),
      error: form.errors[name],
      required: props.required,
      description: props.description,
    };

    switch (type) {
      case "select":
        return (
          <Select
            {...baseProps}
            data={props.data}
            placeholder={props.placeholder}
            searchable={props.searchable}
          />
        );
      case "textarea":
        return (
          <Textarea
            {...baseProps}
            placeholder={props.placeholder}
            rows={props.rows}
          />
        );
      default:
        return (
          <TextInput
            {...baseProps}
            ref={ref}
            type={type}
            placeholder={props.placeholder}
          />
        );
    }
  }
);

FormField.displayName = "FormField";
```

### State Management Standards

#### TanStack Query for Server State

```tsx
// shared/lib/use-form-mutation.ts
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { type UseFormReturnType } from "@mantine/form";
import { notifications } from "@mantine/notifications";
import { IconCheck, IconX } from "@tabler/icons-react";

interface FormMutationOptions<TData, TVariables> {
  onSuccess?: (data: TData, variables: TVariables) => void;
  invalidateQueries?: string[][];
  successNotification?: {
    title: string;
    message: string;
  };
  errorNotification?: {
    title: string;
    fallback: string;
  };
}

export function useFormMutation<TData, TVariables>(
  form: UseFormReturnType<any>,
  mutationFn: (variables: TVariables) => Promise<TData>,
  options?: FormMutationOptions<TData, TVariables>
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn,
    onSuccess: (data, variables) => {
      // Clear form errors
      form.setErrors({});

      // Invalidate related queries
      if (options?.invalidateQueries) {
        options.invalidateQueries.forEach((queryKey) => {
          queryClient.invalidateQueries({ queryKey });
        });
      }

      // Show success notification
      if (options?.successNotification) {
        notifications.show({
          title: options.successNotification.title,
          message: options.successNotification.message,
          color: "green",
          icon: <IconCheck size="1rem" />,
        });
      }

      // Custom success handler
      options?.onSuccess?.(data, variables);
    },
    onError: (error: any) => {
      // Handle validation errors
      if (error.response?.data?.errors) {
        form.setErrors(error.response.data.errors);
      }

      // Show error notification
      if (options?.errorNotification) {
        notifications.show({
          title: options.errorNotification.title,
          message:
            error.response?.data?.message || options.errorNotification.fallback,
          color: "red",
          icon: <IconX size="1rem" />,
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
import { persist } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";

interface UIState {
  sidebarOpened: boolean;
  colorScheme: "light" | "dark" | "auto";
  locale: string;
  notifications: {
    enabled: boolean;
    position: "top-right" | "top-left" | "bottom-right" | "bottom-left";
  };
}

interface UIActions {
  toggleSidebar: () => void;
  setColorScheme: (scheme: UIState["colorScheme"]) => void;
  setLocale: (locale: string) => void;
  updateNotificationSettings: (
    settings: Partial<UIState["notifications"]>
  ) => void;
  reset: () => void;
}

const initialState: UIState = {
  sidebarOpened: false,
  colorScheme: "auto",
  locale: "en",
  notifications: {
    enabled: true,
    position: "top-right",
  },
};

export const useUIStore = create<UIState & UIActions>()(
  persist(
    immer((set) => ({
      ...initialState,

      toggleSidebar: () =>
        set((state) => {
          state.sidebarOpened = !state.sidebarOpened;
        }),

      setColorScheme: (scheme) =>
        set((state) => {
          state.colorScheme = scheme;
        }),

      setLocale: (locale) =>
        set((state) => {
          state.locale = locale;
        }),

      updateNotificationSettings: (settings) =>
        set((state) => {
          Object.assign(state.notifications, settings);
        }),

      reset: () => set(initialState),
    })),
    {
      name: "ui-store",
      partialize: (state) => ({
        colorScheme: state.colorScheme,
        locale: state.locale,
        notifications: state.notifications,
      }),
    }
  )
);

// Selectors for better performance
export const useSidebarOpened = () =>
  useUIStore((state) => state.sidebarOpened);
export const useColorScheme = () => useUIStore((state) => state.colorScheme);
export const useLocale = () => useUIStore((state) => state.locale);
```

### API Service Standards

```tsx
// shared/lib/client.ts
import axios, { type AxiosError, type AxiosResponse } from "axios";
import { notifications } from "@mantine/notifications";
import { IconX } from "@tabler/icons-react";

// API Error Types
export interface ApiError {
  message: string;
  code?: string;
  status?: number;
  errors?: Record<string, string[]>;
}

// Create axios instance
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
    // Add auth token
    const token = localStorage.getItem("auth_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Add request ID for tracking
    config.headers["X-Request-ID"] = crypto.randomUUID();

    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor
api.interceptors.response.use(
  (response: AxiosResponse) => response.data,
  (error: AxiosError<ApiError>) => {
    const status = error.response?.status;
    const data = error.response?.data;

    // Handle different error types
    switch (status) {
      case 401:
        // Unauthorized - redirect to login
        localStorage.removeItem("auth_token");
        window.location.href = "/login";
        break;

      case 403:
        // Forbidden - show notification
        notifications.show({
          title: "Access Denied",
          message:
            data?.message || "You don't have permission to perform this action",
          color: "red",
          icon: <IconX size="1rem" />,
        });
        break;

      case 422:
        // Validation errors - let components handle
        break;

      case 500:
        // Server error - show generic message
        notifications.show({
          title: "Server Error",
          message: "Something went wrong on our end. Please try again later.",
          color: "red",
          icon: <IconX size="1rem" />,
        });
        break;

      default:
        // Network or other errors
        if (!error.response) {
          notifications.show({
            title: "Network Error",
            message: "Please check your internet connection and try again.",
            color: "red",
            icon: <IconX size="1rem" />,
          });
        }
    }

    return Promise.reject({
      message: data?.message || error.message,
      code: data?.code,
      status,
      errors: data?.errors,
    } as ApiError);
  }
);

// Utility functions
export const isApiError = (error: unknown): error is ApiError => {
  return typeof error === "object" && error !== null && "message" in error;
};

export const getErrorMessage = (
  error: unknown,
  fallback = "An error occurred"
): string => {
  if (isApiError(error)) {
    return error.message;
  }
  return fallback;
};
```

### Form Handling Standards

```tsx
// features/user-form/model/validation.ts
import { z } from "zod";

export const userFormSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  role: z.enum(["admin", "user", "manager"]),
  bio: z.string().max(500, "Bio must be less than 500 characters").optional(),
});

export type UserFormData = z.infer<typeof userFormSchema>;

export const initialFormValues: UserFormData = {
  name: "",
  email: "",
  role: "user",
  bio: "",
};

// features/user-form/ui/user-form-feature.tsx
import { useForm, zodResolver } from "@mantine/form";
import { Modal, Stack, Button, Group, LoadingOverlay } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { Trans } from "@lingui/macro";
import { useFormMutation } from "@/shared/lib";
import { FormField } from "@/shared/ui";
import {
  userFormSchema,
  initialFormValues,
  type UserFormData,
} from "../model/validation";
import { createUser } from "../api/user-api";

interface UserFormFeatureProps {
  onSuccess?: (user: User) => void;
}

export function UserFormFeature({ onSuccess }: UserFormFeatureProps) {
  const [opened, { open, close }] = useDisclosure(false);

  const form = useForm<UserFormData>({
    initialValues: initialFormValues,
    validate: zodResolver(userFormSchema),
    transformValues: (values) => ({
      ...values,
      bio: values.bio || undefined, // Convert empty string to undefined
    }),
  });

  const mutation = useFormMutation(form, createUser, {
    successNotification: {
      title: "Success!",
      message: "User created successfully",
    },
    errorNotification: {
      title: "Error",
      fallback: "Failed to create user",
    },
    invalidateQueries: [["users"]],
    onSuccess: (user) => {
      form.reset();
      close();
      onSuccess?.(user);
    },
  });

  const handleSubmit = form.onSubmit((values) => {
    mutation.mutate(values);
  });

  return (
    <>
      <Button onClick={open}>
        <Trans>Create User</Trans>
      </Button>

      <Modal
        opened={opened}
        onClose={close}
        title={<Trans>Create New User</Trans>}
        size="md"
      >
        <LoadingOverlay visible={mutation.isPending} />

        <form onSubmit={handleSubmit}>
          <Stack gap="md">
            <FormField
              type="text"
              name="name"
              label="Full Name"
              form={form}
              required
              placeholder="Enter full name"
            />

            <FormField
              type="email"
              name="email"
              label="Email Address"
              form={form}
              required
              placeholder="user@example.com"
            />

            <FormField
              type="select"
              name="role"
              label="Role"
              form={form}
              required
              data={[
                { value: "user", label: "User" },
                { value: "admin", label: "Administrator" },
                { value: "manager", label: "Manager" },
              ]}
            />

            <FormField
              type="textarea"
              name="bio"
              label="Bio"
              form={form}
              placeholder="Optional bio..."
              rows={3}
            />

            <Group justify="flex-end" mt="md">
              <Button
                variant="subtle"
                onClick={close}
                disabled={mutation.isPending}
              >
                <Trans>Cancel</Trans>
              </Button>
              <Button type="submit" loading={mutation.isPending}>
                <Trans>Create User</Trans>
              </Button>
            </Group>
          </Stack>
        </form>
      </Modal>
    </>
  );
}

// features/user-form/api/user-api.ts
import { api } from "@/shared/lib/client";
import type { UserFormData } from "../model/validation";

export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  bio?: string;
  createdAt: string;
  updatedAt: string;
}

export async function createUser(data: UserFormData): Promise<User> {
  return api.post("/users", data);
}

// features/user-form/index.ts (Public API)
export { UserFormFeature } from "./ui/user-form-feature";
export type { UserFormData } from "./model/validation";
export type { User } from "./api/user-api";
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
