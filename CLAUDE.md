# CLAUDE AI - Development Guidelines & Best Practices

## Table of Contents
- [Overview](#overview)
- [Feature-Sliced Design Architecture](#feature-sliced-design-architecture)
- [React 19 Best Practices](#react-19-best-practices)
- [TypeScript Strict Mode](#typescript-strict-mode)
- [Mantine UI Integration](#mantine-ui-integration)
- [TanStack Router Patterns](#tanstack-router-patterns)
- [TanStack Query & Server State](#tanstack-query--server-state)
- [State Management Strategy](#state-management-strategy)
- [Form Handling & Validation](#form-handling--validation)
- [Internationalization (i18n)](#internationalization-i18n)
- [Testing Strategy](#testing-strategy)
- [Performance Optimization](#performance-optimization)
- [Accessibility Guidelines](#accessibility-guidelines)
- [Code Quality & Tooling](#code-quality--tooling)
- [Development Workflow](#development-workflow)

## Overview

This document provides comprehensive development guidelines for building scalable React applications using modern tools and architectural patterns. The project leverages Feature-Sliced Design (FSD) methodology, React 19, TypeScript strict mode, and a carefully curated tech stack for optimal developer experience and application performance.

### Key Principles

1. **Type Safety First**: Strict TypeScript configuration with runtime validation
2. **Component Composition**: Prefer composition over complex inheritance
3. **Performance by Default**: Built-in optimizations and best practices
4. **Accessibility First**: WCAG 2.1 AA compliance as standard
5. **Developer Experience**: Comprehensive tooling and clear patterns
6. **Maintainability**: Clear architecture boundaries and public APIs

### Project Characteristics

- **Modern React**: React 19 with concurrent features and automatic batching
- **Build Performance**: Vite 6 with SWC for lightning-fast development
- **Type Safety**: Strict TypeScript with Zod runtime validation
- **UI Consistency**: Mantine UI v8 with comprehensive theming
- **Testing Coverage**: Unit, integration, and E2E testing strategies
- **Production Ready**: Docker, CI/CD, and monitoring integration

## Feature-Sliced Design Architecture

### Architecture Overview

Feature-Sliced Design (FSD) is the core architectural methodology that provides clear boundaries and scalable structure:

```
src/
├── app/          # Application layer - providers, routing, global config
├── pages/        # Page layer - route components and page-specific logic  
├── widgets/      # Widget layer - complex UI blocks combining features
├── features/     # Feature layer - user scenarios and business logic
├── entities/     # Entity layer - business entities and data models
└── shared/       # Shared layer - reusable utilities, UI kit, libraries
```

### FSD Rules (CRITICAL - NEVER VIOLATE)

1. **Strict Import Hierarchy**: Higher layers can ONLY import from lower layers
   ```typescript
   // ✅ Allowed
   import { Button } from "@/shared/ui";           // features → shared
   import { User } from "@/entities/user";         // features → entities
   
   // ❌ FORBIDDEN
   import { UserForm } from "@/features/user";     // shared → features
   import { Dashboard } from "@/pages/dashboard";  // features → pages
   ```

2. **Public API Only**: All imports must go through index.ts files
   ```typescript
   // ✅ Correct
   import { UserCard, useUserQuery } from "@/entities/user";
   
   // ❌ Wrong - bypassing public API
   import { UserCard } from "@/entities/user/ui/user-card";
   ```

3. **Feature Isolation**: Features cannot import from each other
   ```typescript
   // ❌ Features cannot depend on each other
   import { AuthForm } from "@/features/auth";     // from features/user
   
   // ✅ Use shared layer or app layer for communication
   import { useAuthStore } from "@/shared/stores";
   ```

### Slice Structure Standard

Each slice follows this segment structure:

```
feature-name/
├── ui/           # React components and UI logic
├── model/        # Business logic, stores, types, validation
├── api/          # API calls, contracts, and data fetching
├── lib/          # Feature-specific utilities and helpers
├── config/       # Feature configuration and constants
└── index.ts      # Public API - ONLY exports what other layers need
```

### Public API Design

```typescript
// features/user-profile/index.ts
export { UserProfileWidget } from "./ui/user-profile-widget";
export { useUserProfile } from "./model/use-user-profile";
export type { UserProfile, UserProfileFormData } from "./model/types";

// DO NOT export internal implementation details
// ❌ export { UserProfileForm } from "./ui/user-profile-form";
// ❌ export { userProfileStore } from "./model/store";
```

## React 19 Best Practices

### Modern React Patterns

#### Functional Components with TypeScript

Always use functional components with proper TypeScript interfaces:

```tsx
// ✅ Proper component definition
interface UserProfileProps {
  userId: string;
  variant?: "compact" | "detailed";
  onEdit?: (user: User) => void;
}

function UserProfile({ userId, variant = "detailed", onEdit }: UserProfileProps) {
  const { data: user, isLoading, error } = useUserQuery(userId);
  
  if (isLoading) return <UserProfileSkeleton />;
  if (error) return <ErrorState error={error} />;
  if (!user) return <EmptyState />;
  
  return (
    <Card>
      <UserAvatar user={user} size={variant === "compact" ? "sm" : "lg"} />
      <UserDetails user={user} variant={variant} />
      {onEdit && <Button onClick={() => onEdit(user)}>Edit</Button>}
    </Card>
  );
}

// ❌ Avoid class components
class UserProfile extends React.Component<UserProfileProps, UserProfileState> {
  // Legacy pattern - don't use
}
```

#### React 19 Concurrent Features

Leverage React 19's automatic batching and concurrent rendering:

```tsx
// ✅ Automatic batching works out of the box
function UserActions({ userId }: { userId: string }) {
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState<string>("");
  
  const handleAction = async () => {
    // These state updates are automatically batched in React 19
    setIsLoading(true);
    setStatus("Processing...");
    
    try {
      await performUserAction(userId);
      setStatus("Success!");
    } catch (error) {
      setStatus("Error occurred");
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <Button onClick={handleAction} loading={isLoading}>
      {status || "Perform Action"}
    </Button>
  );
}

// ✅ Use Suspense for data fetching
function UserProfilePage({ userId }: { userId: string }) {
  return (
    <Suspense fallback={<UserProfileSkeleton />}>
      <UserProfile userId={userId} />
    </Suspense>
  );
}
```
### Custom Hooks

- Extract complex logic into custom hooks for reusability and testability.
- Name custom hooks with the `use` prefix according to React conventions.
```tsx
// Custom hook example
function useUserData(userId: string) {
const [user, setUser] = useState<User | null>(null);
const [loading, setLoading] = useState(true);
const [error, setError] = useState<Error | null>(null);

useEffect(() => {
// Fetch user data logic here
}, [userId]);

return { user, loading, error };
}
```
### Component Organization

- Keep components focused on a single responsibility.
- Break down large components into smaller, reusable ones.
- Co-locate related components in the same directory if they're not used elsewhere.

### Props and PropTypes

- Use TypeScript interfaces for props instead of PropTypes.
- Provide meaningful names for props and interfaces.
- Use default props when applicable.
```tsx
interface UserCardProps {
name: string;
email: string;
role?: string; // Optional prop
onEdit: (id: string) => void;
}

function UserCard({ name, email, role = 'User', onEdit }: UserCardProps) {
// Component implementation
}
```
### Event Handling

- Use callbacks passed as props for component communication.
- Name handler props with the `on` prefix and handler functions with `handle` prefix.
```tsx
function ParentComponent() {
const handleUserUpdate = (userData: UserData) => {
// Update user logic
};

return <UserForm onSubmit={handleUserUpdate} />;
}
```
## TanStack Router

### File-Based Routing

- Use the file-based routing system of TanStack Router for organized route definition.
- Place route files in the `src/routes` directory following the TanStack Router conventions.
```tsx
// src/routes/users.tsx
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/users")({
component: Users,
});

function Users() {
// Component implementation
}
```
### Route Parameters

- Define route parameters using TanStack Router's parameter syntax.
- Validate and type parameters using TypeScript and TanStack Router's validation features.
```tsx
// src/routes/users/$userId.tsx
import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";

export const Route = createFileRoute("/users/$userId")({
validateParams: (params) => ({
userId: z.string().min(1).parse(params.userId),
}),
component: UserDetail,
});

function UserDetail() {
const { userId } = Route.useParams();
// Component implementation using userId
}
```
### Route Loaders

- Use route loaders to prefetch data needed for a route.
- Handle loading states and errors gracefully.
```tsx
export const Route = createFileRoute("/users/$userId")({
loader: ({ params }) => {
return queryClient.ensureQueryData({
queryKey: ["user", params.userId],
queryFn: () => fetchUser(params.userId),
});
},
component: UserDetail,
});
```
### Nested Routing

- Use nested routes for hierarchical UI structures.
- Share layouts between related routes using parent routes.
```tsx
// src/routes/users/__layout.tsx
import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/users/")({
component: UsersLayout,
});

function UsersLayout() {
return (
<div className="users-layout">
<UsersNavigation />
<div className="content">
<Outlet /> {/* Child routes will render here */}
</div>
</div>
);
}
```
## TanStack Query

### Query Keys

- Use structured and consistent query keys for caching and invalidation.
- Organize query keys hierarchically for related data.
```tsx
// Good query key structure
const userKey = ["users", userId];
const userSettingsKey = ["users", userId, "settings"];

// Use these in query functions
const { data: user } = useQuery({
queryKey: userKey,
queryFn: () => fetchUser(userId),
});
```
### Query Functions

- Isolate API calls in separate functions outside of the query hook.
- Handle errors and edge cases in query functions.
```tsx
// API function
async function fetchUser(userId: string): Promise<User> {
const response = await axios.get(`/api/users/${userId}`);
if (response.status !== 200) {
throw new Error(`Failed to fetch user: ${response.statusText}`);
}
return response.data;
}

// In component
const { data, error, isLoading } = useQuery({
queryKey: ["users", userId],
queryFn: () => fetchUser(userId),
});
```
### Data Mutations

- Use mutations for data modification operations.
- Update the cache after mutations using `invalidateQueries` or `setQueryData`.
```tsx
const updateUserMutation = useMutation({
mutationFn: updateUser,
onSuccess: (data, variables) => {
// Invalidate affected queries
queryClient.invalidateQueries({ queryKey: ["users", variables.id] });

    // Or update cache directly
    queryClient.setQueryData(["users", variables.id], data);
},
});
```
### Query Options

- Configure appropriate staleTime and cacheTime based on data volatility.
- Use retry and retryDelay options for transient failures.
```tsx
const { data } = useQuery({
queryKey: ["users"],
queryFn: fetchUsers,
staleTime: 5 * 60 * 1000, // 5 minutes
cacheTime: 30 * 60 * 1000, // 30 minutes
retry: 3,
retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
});
```
### Global Query Configuration

- Set up sensible global defaults in the QueryClient configuration.
- Configure global error handling and retry logic.
```tsx
// src/lib/query-client.ts
import { QueryClient } from "@tanstack/react-query";

export const queryClient = new QueryClient({
defaultOptions: {
queries: {
staleTime: 60 * 1000, // 1 minute
cacheTime: 10 * 60 * 1000, // 10 minutes
retry: 2,
refetchOnWindowFocus: process.env.NODE_ENV === "production",
},
mutations: {
retry: 1,
},
},
});
```
## State Management

### Component State

- Use `useState` for simple component-level state.
- Consider using `useReducer` for complex state logic within a component.
```tsx
// Using useState
const [users, setUsers] = useState<User[]>([]);

// Using useReducer for complex state
const [state, dispatch] = useReducer(userReducer, initialState);
```
### Context API

- Use React Context for state that needs to be accessed by multiple components.
- Keep context providers focused on specific concerns.
```tsx
// src/contexts/AuthContext.tsx
const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
const [user, setUser] = useState<User | null>(null);

// Auth-related logic here

return (
<AuthContext.Provider value={{ user, login, logout }}>
{children}
</AuthContext.Provider>
);
}

export function useAuth() {
const context = useContext(AuthContext);
if (context === undefined) {
throw new Error("useAuth must be used within an AuthProvider");
}
return context;
}
```
### Global State

- Leverage TanStack Query for server state management.
- For client-only global state, use React Context or a lightweight state management library if needed.

## Form Handling & Validation

### Zod + Mantine Form Integration

Combine Zod schemas with Mantine forms for type-safe validation:

```typescript
// features/user-form/model/validation.ts
import { z } from "zod";

export const userFormSchema = z.object({
  name: z.string()
    .min(2, "Name must be at least 2 characters")
    .max(50, "Name must be less than 50 characters"),
  email: z.string()
    .email("Please enter a valid email address"),
  role: z.enum(["admin", "user", "manager"], {
    errorMap: () => ({ message: "Please select a valid role" })
  }),
  bio: z.string()
    .max(500, "Bio must be less than 500 characters")
    .optional(),
  preferences: z.object({
    notifications: z.boolean().default(true),
    theme: z.enum(["light", "dark", "auto"]).default("auto"),
  }).optional(),
});

export type UserFormData = z.infer<typeof userFormSchema>;

// Transform for API
export const transformUserFormData = (data: UserFormData) => ({
  ...data,
  bio: data.bio?.trim() || undefined,
  preferences: data.preferences || {
    notifications: true,
    theme: "auto" as const,
  },
});
```

### Advanced Form Component

```tsx
// features/user-form/ui/user-form.tsx
import { useForm, zodResolver } from "@mantine/form";
import { 
  TextInput, 
  Textarea, 
  Select, 
  Switch, 
  Button, 
  Stack, 
  Group,
  Paper,
  Title,
  Divider,
  LoadingOverlay
} from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { IconCheck, IconX } from "@tabler/icons-react";
import { Trans, t } from "@lingui/macro";
import { useLingui } from "@lingui/react";

import { userFormSchema, type UserFormData, transformUserFormData } from "../model/validation";
import { useCreateUser, useUpdateUser } from "../api/user-mutations";

interface UserFormProps {
  user?: User;
  onSuccess?: (user: User) => void;
  onCancel?: () => void;
}

export function UserForm({ user, onSuccess, onCancel }: UserFormProps) {
  const { _ } = useLingui();
  const isEditing = Boolean(user);
  
  const form = useForm<UserFormData>({
    initialValues: {
      name: user?.name || "",
      email: user?.email || "",
      role: user?.role || "user",
      bio: user?.bio || "",
      preferences: user?.preferences || {
        notifications: true,
        theme: "auto",
      },
    },
    validate: zodResolver(userFormSchema),
    transformValues: transformUserFormData,
  });

  const createMutation = useCreateUser({
    onSuccess: (newUser) => {
      notifications.show({
        title: _(t`Success`),
        message: _(t`User created successfully`),
        color: "green",
        icon: <IconCheck size="1rem" />,
      });
      form.reset();
      onSuccess?.(newUser);
    },
    onError: (error) => {
      notifications.show({
        title: _(t`Error`),
        message: error.message || _(t`Failed to create user`),
        color: "red",
        icon: <IconX size="1rem" />,
      });
    },
  });

  const updateMutation = useUpdateUser({
    onSuccess: (updatedUser) => {
      notifications.show({
        title: _(t`Success`),
        message: _(t`User updated successfully`),
        color: "green",
        icon: <IconCheck size="1rem" />,
      });
      onSuccess?.(updatedUser);
    },
    onError: (error) => {
      notifications.show({
        title: _(t`Error`),
        message: error.message || _(t`Failed to update user`),
        color: "red",
        icon: <IconX size="1rem" />,
      });
    },
  });

  const handleSubmit = form.onSubmit((values) => {
    if (isEditing && user) {
      updateMutation.mutate({ id: user.id, data: values });
    } else {
      createMutation.mutate(values);
    }
  });

  const isLoading = createMutation.isPending || updateMutation.isPending;

  return (
    <Paper p="lg" radius="md" withBorder>
      <LoadingOverlay visible={isLoading} />
      
      <Title order={3} mb="lg">
        {isEditing ? <Trans>Edit User</Trans> : <Trans>Create New User</Trans>}
      </Title>

      <form onSubmit={handleSubmit}>
        <Stack gap="md">
          <Group grow>
            <TextInput
              label={_(t`Full Name`)}
              placeholder={_(t`Enter full name`)}
              required
              {...form.getInputProps("name")}
            />
            
            <TextInput
              label={_(t`Email Address`)}
              placeholder={_(t`user@example.com`)}
              type="email"
              required
              {...form.getInputProps("email")}
            />
          </Group>

          <Select
            label={_(t`Role`)}
            placeholder={_(t`Select role`)}
            required
            data={[
              { value: "user", label: _(t`User`) },
              { value: "admin", label: _(t`Administrator`) },
              { value: "manager", label: _(t`Manager`) },
            ]}
            {...form.getInputProps("role")}
          />

          <Textarea
            label={_(t`Bio`)}
            placeholder={_(t`Optional bio...`)}
            rows={3}
            {...form.getInputProps("bio")}
          />

          <Divider label={_(t`Preferences`)} labelPosition="left" />

          <Group>
            <Switch
              label={_(t`Enable notifications`)}
              {...form.getInputProps("preferences.notifications", { type: "checkbox" })}
            />
            
            <Select
              label={_(t`Theme`)}
              data={[
                { value: "light", label: _(t`Light`) },
                { value: "dark", label: _(t`Dark`) },
                { value: "auto", label: _(t`Auto`) },
              ]}
              {...form.getInputProps("preferences.theme")}
            />
          </Group>

          <Group justify="flex-end" mt="lg">
            {onCancel && (
              <Button 
                variant="subtle" 
                onClick={onCancel}
                disabled={isLoading}
              >
                <Trans>Cancel</Trans>
              </Button>
            )}
            
            <Button 
              type="submit" 
              loading={isLoading}
            >
              {isEditing ? <Trans>Update User</Trans> : <Trans>Create User</Trans>}
            </Button>
          </Group>
        </Stack>
      </form>
    </Paper>
  );
}
```

### Form Validation Patterns

```typescript
// Custom validation with async checks
export const createUserFormSchema = (existingEmails: string[] = []) => 
  z.object({
    email: z.string()
      .email("Invalid email format")
      .refine(
        (email) => !existingEmails.includes(email.toLowerCase()),
        "Email already exists"
      ),
    // ... other fields
  });

// Conditional validation
export const userFormSchema = z.object({
  role: z.enum(["admin", "user", "manager"]),
  permissions: z.array(z.string()).optional(),
}).refine(
  (data) => {
    if (data.role === "admin" && (!data.permissions || data.permissions.length === 0)) {
      return false;
    }
    return true;
  },
  {
    message: "Admin users must have at least one permission",
    path: ["permissions"],
  }
);
```

## Component Design

### Atomic Design Methodology

- Organize components following atomic design principles:
  - **Atoms**: Basic building blocks (buttons, inputs, icons)
  - **Molecules**: Groups of atoms (form fields, card headers)
  - **Organisms**: Complex UI sections (forms, data tables)
  - **Templates**: Page layouts
  - **Pages**: Specific instances of templates with real data

### Component API Design

- Keep component APIs intuitive and consistent.
- Use composition over complex prop APIs.
```tsx
// Good: Using composition
<Card>
<Card.Header>User Profile</Card.Header>
<Card.Body>
<UserDetails user={user} />
</Card.Body>
<Card.Footer>
<Button>Edit</Button>
</Card.Footer>
</Card>

// Avoid: Too many props
<Card
title="User Profile"
footerButtons={[{ label: 'Edit', onClick: handleEdit }]}
user={user}
/>
```
### Error Boundaries

- Implement error boundaries to prevent UI crashes.
- Provide meaningful fallback UIs.
```tsx
// src/components/ErrorBoundary.tsx
import { Component, ErrorInfo, ReactNode } from 'react';

interface ErrorBoundaryProps {
fallback?: ReactNode;
children: ReactNode;
}

interface ErrorBoundaryState {
hasError: boolean;
error?: Error;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
constructor(props: ErrorBoundaryProps) {
super(props);
this.state = { hasError: false };
}

static getDerivedStateFromError(error: Error): ErrorBoundaryState {
return { hasError: true, error };
}

componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
console.error('ErrorBoundary caught an error:', error, errorInfo);
// Log to error monitoring service
}

render(): ReactNode {
if (this.state.hasError) {
return this.props.fallback || <div>Something went wrong.</div>;
}

    return this.props.children;
}
}

export default ErrorBoundary;
```
## TypeScript Strict Mode

### Strict Type Configuration

The project uses TypeScript strict mode with enhanced type safety:

```json
// tsconfig.json (key settings)
{
  "compilerOptions": {
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "exactOptionalPropertyTypes": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "noImplicitOverride": true
  }
}
```

### Type-First Development

Define types before implementation and use Zod for runtime validation:

```typescript
// entities/user/model/types.ts
import { z } from "zod";

// Runtime schema with Zod
export const userSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1).max(100),
  email: z.string().email(),
  role: z.enum(["admin", "user", "manager"]),
  status: z.enum(["active", "inactive", "pending"]),
  avatar: z.string().url().optional(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  preferences: z.object({
    theme: z.enum(["light", "dark", "auto"]),
    notifications: z.boolean(),
    locale: z.string(),
  }).optional(),
});

// TypeScript type inferred from schema
export type User = z.infer<typeof userSchema>;

// Partial types for forms and updates
export type UserCreateData = z.infer<typeof userSchema.omit({ 
  id: true, 
  createdAt: true, 
  updatedAt: true 
})>;

export type UserUpdateData = Partial<UserCreateData>;

// API response types
export interface UsersResponse {
  users: User[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Component prop types
export interface UserCardProps {
  user: User;
  variant?: "compact" | "detailed" | "minimal";
  showActions?: boolean;
  onEdit?: (user: User) => void;
  onDelete?: (userId: string) => void;
}
```
### Type Safety

- Avoid using `any` type, use proper typing or `unknown` when necessary.
- Use type narrowing and type guards for runtime type checking.
```tsx
// Type narrowing example
function processData(data: unknown): string {
if (typeof data === 'string') {
return data.toUpperCase();
}

if (Array.isArray(data) && data.every(item => typeof item === 'string')) {
return data.join(', ').toUpperCase();
}

throw new Error('Invalid data format');
}
```
### Generic Components

- Use generics for components that work with different data types.
```tsx
interface DataTableProps<T> {
data: T[];
columns: Array<{
key: keyof T;
header: string;
render?: (item: T) => ReactNode;
}>;
onRowClick?: (item: T) => void;
}

function DataTable<T extends { id: string }>({ data, columns, onRowClick }: DataTableProps<T>) {
// Component implementation
}
```
## Internationalization (i18n)

### Lingui Setup and Usage

The project uses Lingui for modern internationalization with macro support:

```typescript
// app/i18n.ts
import { i18n } from "@lingui/core";
import { messages as enMessages } from "../locales/en/messages";
import { messages as esMessages } from "../locales/es/messages";
import { messages as frMessages } from "../locales/fr/messages";

i18n.load({
  en: enMessages,
  es: esMessages,
  fr: frMessages,
});

// Set initial locale
const savedLocale = localStorage.getItem("locale") || "en";
i18n.activate(savedLocale);

export { i18n };
```

### Translation Patterns

```tsx
// Component with translations
import { Trans, t, Plural } from "@lingui/macro";
import { useLingui } from "@lingui/react";

function UserNotifications({ user, unreadCount }: { user: User; unreadCount: number }) {
  const { _ } = useLingui();

  return (
    <div>
      {/* Simple text translation */}
      <h2><Trans>Notifications</Trans></h2>
      
      {/* Translation with variables */}
      <p>
        <Trans>Welcome back, {user.name}!</Trans>
      </p>
      
      {/* Pluralization */}
      <p>
        <Plural
          value={unreadCount}
          zero="No new notifications"
          one="# new notification"
          other="# new notifications"
        />
      </p>
      
      {/* Programmatic translation (for attributes, etc.) */}
      <button 
        title={_(t`Mark all as read`)}
        aria-label={_(t`Mark all notifications as read`)}
      >
        <Trans>Mark all read</Trans>
      </button>
      
      {/* Conditional translations */}
      <p>
        {user.status === "active" ? (
          <Trans>Your account is active</Trans>
        ) : (
          <Trans>Please activate your account</Trans>
        )}
      </p>
    </div>
  );
}
```

### Date and Number Formatting

```tsx
// Locale-aware formatting
import { useLingui } from "@lingui/react";
import dayjs from "dayjs";

function UserActivity({ user, lastLogin }: { user: User; lastLogin: Date }) {
  const { i18n } = useLingui();
  
  // Format dates according to locale
  const formatDate = (date: Date) => {
    return dayjs(date).locale(i18n.locale).format("LLL");
  };
  
  // Format numbers according to locale
  const formatNumber = (num: number) => {
    return new Intl.NumberFormat(i18n.locale).format(num);
  };
  
  return (
    <div>
      <p>
        <Trans>Last login: {formatDate(lastLogin)}</Trans>
      </p>
      <p>
        <Trans>Total posts: {formatNumber(user.postCount)}</Trans>
      </p>
    </div>
  );
}
```

### Locale Switching

```tsx
// Locale switcher component
import { Select } from "@mantine/core";
import { useLingui } from "@lingui/react";
import { Trans } from "@lingui/macro";

const LOCALES = [
  { value: "en", label: "English" },
  { value: "es", label: "Español" },
  { value: "fr", label: "Français" },
];

export function LocaleSwitcher() {
  const { i18n } = useLingui();
  
  const handleLocaleChange = (locale: string) => {
    i18n.activate(locale);
    localStorage.setItem("locale", locale);
    // Optionally reload the page or update URL
  };
  
  return (
    <Select
      label={<Trans>Language</Trans>}
      value={i18n.locale}
      onChange={handleLocaleChange}
      data={LOCALES}
    />
  );
}
```

### Message Extraction Workflow

```bash
# Extract messages from code
pnpm messages:extract

# Compile messages for production
pnpm messages:compile

# The workflow creates/updates:
# - locales/en/messages.po (source messages)
# - locales/es/messages.po (translations)
# - locales/*/messages.js (compiled for runtime)
```

## Performance Optimization

### Memoization

- Use `useMemo` for expensive calculations.
- Use `useCallback` for function references passed to child components.
```tsx
// Memoize expensive calculations
const sortedUsers = useMemo(() => {
return [...users].sort((a, b) => a.name.localeCompare(b.name));
}, [users]);

// Memoize callback functions
const handleUserEdit = useCallback((userId: string) => {
// Edit user logic
}, [/* dependencies */]);
```
### React.memo

- Use `React.memo` for components that render often but with the same props.
- Implement custom equality functions for complex prop objects.
```tsx
const UserCard = React.memo(function UserCard({ user, onEdit }: UserCardProps) {
// Component implementation
});

// With custom equality check
const UserCard = React.memo(
function UserCard({ user, onEdit }: UserCardProps) {
// Component implementation
},
(prevProps, nextProps) => {
return prevProps.user.id === nextProps.user.id &&
prevProps.user.lastUpdated === nextProps.user.lastUpdated;
}
);
```
### Code Splitting

- Use dynamic imports for route-based code splitting.
- Lazy load components that are not immediately needed.
```tsx
// Dynamic import with React.lazy
const Settings = React.lazy(() => import('./pages/Settings'));

// Use with Suspense
<Suspense fallback={<LoadingSpinner />}>
<Settings />
</Suspense>
```
### Virtual Lists

- Use virtualization for long lists to improve performance.
- Consider libraries like `react-virtual` or `react-window`.
```tsx
// Example with react-virtual
function UserList({ users }: { users: User[] }) {
const { rows } = useVirtualizer({
count: users.length,
getScrollElement: () => parentRef.current,
estimateSize: () => 50,
});

return (
<div ref={parentRef} style={{ height: '500px', overflow: 'auto' }}>
<div style={{ height: `${rows.totalSize}px`, position: 'relative' }}>
{rows.map((row) => (
<div
key={users[row.index].id}
style={{
position: 'absolute',
top: 0,
left: 0,
width: '100%',
height: `${row.size}px`,
transform: `translateY(${row.start}px)`,
}}
>
<UserCard user={users[row.index]} />
</div>
))}
</div>
</div>
);
}
```
## Testing Approach

### Unit Testing

- Test individual components, hooks, and utility functions.
- Focus on behavior rather than implementation details.
```tsx
// Button component test
test('Button triggers onClick when clicked', () => {
const handleClick = vi.fn();
render(<Button onClick={handleClick}>Click Me</Button>);

userEvent.click(screen.getByText('Click Me'));

expect(handleClick).toHaveBeenCalledTimes(1);
});
```
### Integration Testing

- Test component integration and interactions.
- Mock external dependencies using tools like MSW.
```tsx
// User list integration test
test('User list displays users from API', async () => {
// Setup MSW to mock API response
server.use(
rest.get('/api/users', (req, res, ctx) => {
return res(ctx.json([
{ id: '1', name: 'John Doe', email: 'john@example.com' },
{ id: '2', name: 'Jane Smith', email: 'jane@example.com' }
]));
})
);

render(<UserList />);

// Wait for users to be displayed
await screen.findByText('John Doe');

expect(screen.getByText('John Doe')).toBeInTheDocument();
expect(screen.getByText('Jane Smith')).toBeInTheDocument();
});
```
### End-to-End Testing

- Use Playwright for critical user flows.
- Focus on key user journeys rather than exhaustive testing.
```typescript
// Playwright E2E test example
test('User can log in and access dashboard', async ({ page }) => {
await page.goto('/login');

await page.fill('input[name="email"]', 'test@example.com');
await page.fill('input[name="password"]', 'password123');
await page.click('button[type="submit"]');

// Verify redirect to dashboard
await expect(page).toHaveURL('/dashboard');
await expect(page.getByText('Welcome back')).toBeVisible();
});
```
### Component Stories

- Create Storybook stories for component variations.
- Use stories for visual testing and documentation.
```tsx
// UserCard.stories.tsx
import type { Meta, StoryObj } from '@storybook/react';
import { UserCard } from './UserCard';

const meta: Meta<typeof UserCard> = {
component: UserCard,
title: 'Components/UserCard',
tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof UserCard>;

export const Default: Story = {
args: {
user: {
id: '1',
name: 'John Doe',
email: 'john@example.com',
role: 'User',
status: 'active',
},
},
};

export const AdminUser: Story = {
args: {
user: {
id: '2',
name: 'Jane Smith',
email: 'jane@example.com',
role: 'Admin',
status: 'active',
},
},
};
```
## Mantine UI Integration

### Theme Configuration

Configure Mantine theme for consistent design system:

```typescript
// app/theme.ts
import { createTheme, MantineColorsTuple } from "@mantine/core";

const brandBlue: MantineColorsTuple = [
  "#e7f5ff",
  "#d0ebff", 
  "#a5d8ff",
  "#74c0fc",
  "#339af0",
  "#228be6", // Primary shade
  "#1c7ed6",
  "#1971c2",
  "#1864ab",
  "#0b5394"
];

export const theme = createTheme({
  primaryColor: "brandBlue",
  colors: {
    brandBlue,
  },
  fontFamily: "Inter, -apple-system, BlinkMacSystemFont, sans-serif",
  fontFamilyMonospace: "JetBrains Mono, Consolas, monospace",
  headings: {
    fontFamily: "Inter, -apple-system, BlinkMacSystemFont, sans-serif",
    fontWeight: "600",
  },
  defaultRadius: "md",
  cursorType: "pointer",
  focusRing: "auto",
  spacing: {
    xs: "0.5rem",
    sm: "0.75rem", 
    md: "1rem",
    lg: "1.5rem",
    xl: "2rem",
  },
  breakpoints: {
    xs: "30em",
    sm: "48em", 
    md: "64em",
    lg: "74em",
    xl: "90em",
  },
});
```

### Component Patterns

#### Consistent Component Structure

```tsx
// shared/ui/user-card/user-card.tsx
import { Card, Avatar, Text, Badge, Group, ActionIcon, Tooltip } from "@mantine/core";
import { IconEdit, IconTrash } from "@tabler/icons-react";
import { forwardRef } from "react";
import type { User } from "@/entities/user";
import classes from "./user-card.module.css";

interface UserCardProps {
  user: User;
  variant?: "compact" | "detailed";
  showActions?: boolean;
  onEdit?: (user: User) => void;
  onDelete?: (userId: string) => void;
}

export const UserCard = forwardRef<HTMLDivElement, UserCardProps>(
  ({ user, variant = "detailed", showActions = false, onEdit, onDelete }, ref) => {
    const isCompact = variant === "compact";
    
    return (
      <Card 
        ref={ref}
        shadow="sm" 
        padding={isCompact ? "sm" : "lg"} 
        radius="md" 
        withBorder
        className={classes.card}
      >
        <Group justify="space-between" mb={isCompact ? "xs" : "md"}>
          <Group>
            <Avatar 
              src={user.avatar} 
              alt={user.name}
              size={isCompact ? "md" : "lg"}
              radius="xl"
            />
            <div>
              <Text fw={500} size={isCompact ? "sm" : "md"}>
                {user.name}
              </Text>
              <Text c="dimmed" size="xs">
                {user.email}
              </Text>
            </div>
          </Group>
          
          <Group gap="xs">
            <Badge 
              color={user.status === "active" ? "green" : "gray"}
              variant="light"
              size="sm"
            >
              {user.status}
            </Badge>
            
            {showActions && (
              <Group gap="xs">
                {onEdit && (
                  <Tooltip label="Edit user">
                    <ActionIcon 
                      variant="subtle" 
                      onClick={() => onEdit(user)}
                      aria-label={`Edit ${user.name}`}
                    >
                      <IconEdit size="1rem" />
                    </ActionIcon>
                  </Tooltip>
                )}
                
                {onDelete && (
                  <Tooltip label="Delete user">
                    <ActionIcon 
                      variant="subtle" 
                      color="red"
                      onClick={() => onDelete(user.id)}
                      aria-label={`Delete ${user.name}`}
                    >
                      <IconTrash size="1rem" />
                    </ActionIcon>
                  </Tooltip>
                )}
              </Group>
            )}
          </Group>
        </Group>
        
        {!isCompact && (
          <>
            <Text size="sm" c="dimmed" mb="sm">
              Role: {user.role}
            </Text>
            
            {user.preferences && (
              <Text size="xs" c="dimmed">
                Theme: {user.preferences.theme} • 
                Notifications: {user.preferences.notifications ? "On" : "Off"}
              </Text>
            )}
          </>
        )}
      </Card>
    );
  }
);

UserCard.displayName = "UserCard";
```

#### CSS Modules for Custom Styles

```css
/* shared/ui/user-card/user-card.module.css */
.card {
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: var(--mantine-shadow-md);
  }
}

.card[data-variant="compact"] {
  padding: var(--mantine-spacing-sm);
}

@media (max-width: 768px) {
  .card {
    padding: var(--mantine-spacing-sm);
  }
}
```

### Responsive Design

Use Mantine's responsive utilities and breakpoints:

```tsx
// Responsive component example
function ResponsiveLayout({ children }: { children: React.ReactNode }) {
  return (
    <Container size="xl">
      <SimpleGrid
        cols={{ base: 1, sm: 2, lg: 3 }}
        spacing={{ base: "sm", sm: "md", lg: "lg" }}
        verticalSpacing={{ base: "sm", sm: "md", lg: "lg" }}
      >
        {children}
      </SimpleGrid>
    </Container>
  );
}

// Responsive text and spacing
function UserProfile({ user }: { user: User }) {
  return (
    <Stack gap={{ base: "sm", sm: "md", lg: "lg" }}>
      <Title 
        order={{ base: 2, sm: 1 }}
        size={{ base: "h3", sm: "h2", lg: "h1" }}
      >
        {user.name}
      </Title>
      
      <Text 
        size={{ base: "sm", sm: "md" }}
        c="dimmed"
      >
        {user.email}
      </Text>
    </Stack>
  );
}
```

## Styling Guidelines

### Mantine Components

- Use Mantine components for consistent UI.
- Follow Mantine's theming and customization approach.
```tsx
// Configure Mantine theme
const theme = createTheme({
colors: {
adminBlue: [
'#e9f0ff',
'#ccd8ff',
'#a9bcff',
'#839dff',
'#6582ff',
'#4e6aff',
'#3b54ff',
'#2a42e6',
'#1a33cf',
'#0024b8',
],
},
primaryColor: 'adminBlue',
fontFamily: 'Inter, sans-serif',
defaultRadius: 'md',
});

// Use Mantine components
function UserProfile({ user }: { user: User }) {
return (
<Card shadow="sm" padding="lg" radius="md" withBorder>
<Card.Section p="md">
<Group>
<Avatar size="xl" src={user.avatar} alt={user.name} radius="xl" />
<div>
<Text fw={500} size="lg">{user.name}</Text>
<Text c="dimmed" size="sm">{user.email}</Text>
</div>
</Group>
</Card.Section>
<Divider my="sm" />
<Text size="sm">
Role: <Badge color={user.role === 'Admin' ? 'blue' : 'gray'}>{user.role}</Badge>
</Text>
</Card>
);
}
```
### CSS Approach

- Use Mantine's styling system for component-specific styles.
- Use global CSS variables for design tokens.
```tsx
// Using Mantine's styling
function CustomComponent() {
return (
<Box
style={(theme) => ({
backgroundColor: theme.colors.gray[0],
padding: theme.spacing.md,
borderRadius: theme.radius.md,
boxShadow: theme.shadows.sm,
})}
>
Content
</Box>
);
}
```
### Theme Consistency

- Maintain consistent spacing, colors, and typography using theme tokens.
- Avoid hardcoded values for colors, spacing, and other design properties.
```tsx
// Good: Using theme tokens
<Box p="md" m="sm" bg="gray.1" style={{ borderRadius: theme.radius.md }}>

// Avoid: Hardcoded values
<Box style={{ padding: '16px', margin: '8px', backgroundColor: '#f9f9f9', borderRadius: '8px' }}>
```
## Accessibility Guidelines

### WCAG 2.1 AA Compliance

Ensure all components meet accessibility standards:

```tsx
// Accessible form component
function AccessibleUserForm() {
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  return (
    <form role="form" aria-labelledby="form-title">
      <h2 id="form-title">User Registration</h2>
      
      {/* Proper labeling and error association */}
      <TextInput
        label="Full Name"
        required
        error={errors.name}
        aria-describedby={errors.name ? "name-error" : undefined}
        aria-invalid={Boolean(errors.name)}
      />
      {errors.name && (
        <Text id="name-error" c="red" size="sm" role="alert">
          {errors.name}
        </Text>
      )}
      
      {/* Fieldset for grouped inputs */}
      <fieldset>
        <legend>Contact Preferences</legend>
        <Switch
          label="Email notifications"
          description="Receive updates via email"
        />
        <Switch
          label="SMS notifications" 
          description="Receive updates via SMS"
        />
      </fieldset>
      
      {/* Clear button purposes */}
      <Button 
        type="submit"
        aria-describedby="submit-help"
      >
        Create Account
      </Button>
      <Text id="submit-help" size="sm" c="dimmed">
        By creating an account, you agree to our terms of service
      </Text>
    </form>
  );
}
```

### Keyboard Navigation

```tsx
// Accessible data table with keyboard navigation
function AccessibleDataTable({ data }: { data: User[] }) {
  const [focusedRow, setFocusedRow] = useState(0);
  
  const handleKeyDown = (event: React.KeyboardEvent) => {
    switch (event.key) {
      case "ArrowDown":
        event.preventDefault();
        setFocusedRow(prev => Math.min(prev + 1, data.length - 1));
        break;
      case "ArrowUp":
        event.preventDefault();
        setFocusedRow(prev => Math.max(prev - 1, 0));
        break;
      case "Enter":
      case " ":
        event.preventDefault();
        // Handle selection
        break;
    }
  };
  
  return (
    <Table
      role="table"
      aria-label="Users table"
      onKeyDown={handleKeyDown}
    >
      <Table.Thead>
        <Table.Tr role="row">
          <Table.Th role="columnheader">Name</Table.Th>
          <Table.Th role="columnheader">Email</Table.Th>
          <Table.Th role="columnheader">Actions</Table.Th>
        </Table.Tr>
      </Table.Thead>
      <Table.Tbody>
        {data.map((user, index) => (
          <Table.Tr
            key={user.id}
            role="row"
            tabIndex={index === focusedRow ? 0 : -1}
            aria-selected={index === focusedRow}
            data-focused={index === focusedRow}
          >
            <Table.Td role="cell">{user.name}</Table.Td>
            <Table.Td role="cell">{user.email}</Table.Td>
            <Table.Td role="cell">
              <Group gap="xs">
                <ActionIcon
                  aria-label={`Edit ${user.name}`}
                  title={`Edit ${user.name}`}
                >
                  <IconEdit size="1rem" />
                </ActionIcon>
                <ActionIcon
                  aria-label={`Delete ${user.name}`}
                  title={`Delete ${user.name}`}
                  color="red"
                >
                  <IconTrash size="1rem" />
                </ActionIcon>
              </Group>
            </Table.Td>
          </Table.Tr>
        ))}
      </Table.Tbody>
    </Table>
  );
}
```

### Screen Reader Support

```tsx
// Accessible loading and error states
function AccessibleUserList() {
  const { data: users, isLoading, error } = useUsersQuery();
  
  if (isLoading) {
    return (
      <div role="status" aria-live="polite">
        <LoadingOverlay visible />
        <span className="sr-only">Loading users...</span>
      </div>
    );
  }
  
  if (error) {
    return (
      <Alert
        color="red"
        role="alert"
        aria-live="assertive"
        title="Error loading users"
      >
        {error.message}
      </Alert>
    );
  }
  
  return (
    <div>
      <h2 id="users-heading">Users ({users?.length || 0})</h2>
      <div 
        role="region" 
        aria-labelledby="users-heading"
        aria-live="polite"
      >
        {users?.map(user => (
          <UserCard key={user.id} user={user} />
        ))}
      </div>
    </div>
  );
}
```

### Focus Management

```tsx
// Modal with proper focus management
function AccessibleModal({ opened, onClose, children }: ModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);
  
  useEffect(() => {
    if (opened) {
      // Store previous focus
      previousFocusRef.current = document.activeElement as HTMLElement;
      
      // Focus modal
      modalRef.current?.focus();
      
      // Trap focus within modal
      const handleKeyDown = (event: KeyboardEvent) => {
        if (event.key === "Escape") {
          onClose();
        }
        
        if (event.key === "Tab") {
          // Focus trap logic here
        }
      };
      
      document.addEventListener("keydown", handleKeyDown);
      
      return () => {
        document.removeEventListener("keydown", handleKeyDown);
        
        // Restore previous focus
        previousFocusRef.current?.focus();
      };
    }
  }, [opened, onClose]);
  
  return (
    <Modal
      opened={opened}
      onClose={onClose}
      ref={modalRef}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      tabIndex={-1}
    >
      {children}
    </Modal>
  );
}
```

## API Integration

### API Client Setup

- Use Axios with interceptors for consistent API handling.
- Centralize API configuration and error handling.

```tsx
// src/lib/api-client.ts
import axios from 'axios';

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized errors (e.g., redirect to login)
    }
    return Promise.reject(error);
  }
);

export default apiClient;
```


### API Services

- Create service modules for different API domains.
- Keep API calls separate from components.

```typescript
// src/services/users-service.ts
import apiClient from '../lib/api-client';
import type { User, UserCreateData, UserUpdateData } from '../types/user';

export async function getUsers(params?: { page?: number; limit?: number }): Promise<User[]> {
  const response = await apiClient.get('/users', { params });
  return response.data;
}

export async function getUser(id: string): Promise<User> {
  const response = await apiClient.get(`/users/${id}`);
  return response.data;
}

export async function createUser(data: UserCreateData): Promise<User> {
  const response = await apiClient.post('/users', data);
  return response.data;
}

export async function updateUser(id: string, data: UserUpdateData): Promise<User> {
  const response = await apiClient.put(`/users/${id}`, data);
  return response.data;
}

export async function deleteUser(id: string): Promise<void> {
  await apiClient.delete(`/users/${id}`);
}
```


### Error Handling

- Implement consistent error handling for API requests.
- Show user-friendly error messages.

```typescript
// Hook for API error handling
function useApiError() {
  const { showNotification } = useNotifications();
  
  const handleApiError = useCallback((error: unknown) => {
    if (axios.isAxiosError(error)) {
      const status = error.response?.status;
      const message = error.response?.data?.message || error.message;
      
      if (status === 404) {
        showNotification({
          title: 'Resource Not Found',
          message,
          color: 'orange',
        });
      } else if (status === 403) {
        showNotification({
          title: 'Access Denied',
          message: 'You do not have permission to perform this action.',
          color: 'red',
        });
      } else {
        showNotification({
          title: 'Error',
          message: message || 'An unexpected error occurred',
          color: 'red',
        });
      }
    } else {
      showNotification({
        title: 'Error',
        message: 'An unexpected error occurred',
        color: 'red',
      });
    }
  }, [showNotification]);
  
  return { handleApiError };
}
```


## Project Structure

### Directory Organization

```
src/
├── assets/             # Static assets like images, fonts
├── components/         # Reusable UI components
│   ├── Layout/         # Layout components
│   ├── Form/           # Form-related components
│   └── UI/             # Generic UI components
├── contexts/           # React context providers
├── hooks/              # Custom hooks
├── lib/                # Utility libraries and setup
│   ├── api-client.ts   # API client setup
│   └── query-client.ts # TanStack Query client setup
├── routes/             # Route components (TanStack Router)
├── services/           # API service modules
├── stores/             # State management stores
├── types/              # TypeScript type definitions
└── utils/              # Utility functions
```


### Naming Conventions

- **Files**: Use PascalCase for component files (e.g., `UserCard.tsx`).
- **Directories**: Use kebab-case for directories (e.g., `user-settings/`).
- **Functions**: Use camelCase for functions and methods.
- **Components**: Use PascalCase for component names.
- **Hooks**: Prefix with `use` (e.g., `useUserData`).
- **Context**: Suffix with `Context` (e.g., `AuthContext`).
- **Types/Interfaces**: Use PascalCase (e.g., `UserProfile`).

## Code Quality & Tooling

### ESLint Configuration

The project uses ESLint 9 with flat config and comprehensive rules:

```javascript
// eslint.config.js
import { defineConfig } from "eslint-define-config";
import mantineConfig from "eslint-config-mantine";

export default defineConfig([
  ...mantineConfig,
  {
    rules: {
      // React 19 specific rules
      "react/react-in-jsx-scope": "off",
      "react-hooks/exhaustive-deps": "error",
      
      // TypeScript strict rules
      "@typescript-eslint/no-unused-vars": "error",
      "@typescript-eslint/explicit-function-return-type": "warn",
      
      // Import organization
      "simple-import-sort/imports": "error",
      "simple-import-sort/exports": "error",
      
      // Accessibility
      "jsx-a11y/alt-text": "error",
      "jsx-a11y/aria-role": "error",
      
      // Performance
      "react/jsx-no-bind": "warn",
      "react/jsx-no-leaked-render": "error",
    },
  },
]);
```

### Pre-commit Hooks

```json
// .husky/pre-commit
#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"

# Type checking
pnpm type-check

# Linting
pnpm lint

# Testing
pnpm test --run

# Format check
pnpm prettier:check
```

### Commit Message Standards

```javascript
// commitlint.config.js
module.exports = {
  extends: ["@commitlint/config-conventional"],
  rules: {
    "type-enum": [
      2,
      "always",
      [
        "feat",     // New feature
        "fix",      // Bug fix
        "docs",     // Documentation
        "style",    // Formatting
        "refactor", // Code refactoring
        "test",     // Adding tests
        "chore",    // Maintenance
        "perf",     // Performance improvements
        "ci",       // CI/CD changes
      ],
    ],
    "scope-enum": [
      2,
      "always",
      [
        "ui",       // UI components
        "api",      // API changes
        "auth",     // Authentication
        "forms",    // Form handling
        "routing",  // Routing changes
        "i18n",     // Internationalization
        "tests",    // Test changes
        "deps",     // Dependencies
      ],
    ],
  },
};
```

## Development Workflow

### Feature Development Process

1. **Create Feature Branch**
   ```bash
   git checkout -b feat/user-management
   ```

2. **Follow FSD Architecture**
   ```
   features/user-management/
   ├── ui/
   │   ├── user-list.tsx
   │   ├── user-form.tsx
   │   └── user-card.tsx
   ├── model/
   │   ├── types.ts
   │   ├── validation.ts
   │   └── store.ts
   ├── api/
   │   ├── user-queries.ts
   │   └── user-mutations.ts
   └── index.ts
   ```

3. **Write Tests First (TDD)**
   ```typescript
   // features/user-management/ui/user-list.test.tsx
   describe("UserList", () => {
     it("displays users correctly", () => {
       // Test implementation
     });
   });
   ```

4. **Implement Component**
   ```typescript
   // features/user-management/ui/user-list.tsx
   export function UserList() {
     // Implementation
   }
   ```

5. **Create Storybook Story**
   ```typescript
   // features/user-management/ui/user-list.stories.tsx
   export default {
     component: UserList,
     title: "Features/UserManagement/UserList",
   };
   ```

6. **Update Public API**
   ```typescript
   // features/user-management/index.ts
   export { UserList } from "./ui/user-list";
   export type { User } from "./model/types";
   ```

### Quality Gates

Before merging, ensure:

- [ ] All tests pass (`pnpm test`)
- [ ] Type checking passes (`pnpm type-check`)
- [ ] Linting passes (`pnpm lint`)
- [ ] Build succeeds (`pnpm build`)
- [ ] Storybook stories created
- [ ] Accessibility tested
- [ ] Performance optimized
- [ ] Documentation updated

### Code Review Checklist

#### Architecture & Design
- [ ] Follows FSD layer boundaries
- [ ] Uses public APIs only
- [ ] Proper separation of concerns
- [ ] No circular dependencies

#### Code Quality
- [ ] TypeScript strict mode compliance
- [ ] Proper error handling
- [ ] Performance optimizations applied
- [ ] Accessibility requirements met

#### Testing
- [ ] Unit tests cover main functionality
- [ ] Integration tests for complex flows
- [ ] Storybook stories for UI components
- [ ] E2E tests for critical paths

#### Documentation
- [ ] Code is self-documenting
- [ ] Complex logic has comments
- [ ] Public APIs are documented
- [ ] README updated if needed

### Deployment Pipeline

```yaml
# .github/workflows/ci.yml
name: CI/CD Pipeline

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: pnpm
      
      - run: pnpm install --frozen-lockfile
      - run: pnpm type-check
      - run: pnpm lint
      - run: pnpm test --coverage
      - run: pnpm build
      
      - name: Upload coverage
        uses: codecov/codecov-action@v3
```

This comprehensive guide ensures consistent, high-quality development practices across the entire project lifecycle.

### Review Checklist

Before submitting code for review, ensure the following:

1. **Code Quality**
  - Code follows the patterns and practices outlined in this document
  - No TypeScript errors or warnings
  - ESLint and Prettier rules are satisfied
  - No unnecessary console logs or comments

2. **Testing**
  - New components have appropriate tests
  - Test coverage is maintained or improved
  - All tests pass

3. **Performance**
  - No obvious performance issues (unnecessary re-renders, etc.)
  - Heavy operations are memoized where appropriate

4. **Accessibility**
  - Components use semantic HTML
  - Interactive elements are keyboard accessible
  - Proper ARIA attributes are used where needed

5. **Security**
  - No sensitive data exposed in client code
  - User inputs are properly validated
  - Authentication and authorization checks are in place

6. **Documentation**
  - Code is self-documenting where possible
  - Complex logic has explanatory comments
  - New components have Storybook stories
