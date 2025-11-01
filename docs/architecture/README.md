# 📜 Architecture Overview

## Project Architecture

This project follows **Feature-Sliced Design (FSD)** methodology, providing a scalable and maintainable frontend architecture.

## Technology Stack

### Core Framework

- **React 19** - Latest React with concurrent features
- **TypeScript** - Type-safe development
- **Vite 7** - Fast build tool and dev server

### Routing & State Management

- **TanStack Router** - Type-safe routing with code splitting
- **TanStack Query** - Server state management and caching
- **Zustand** - Client state management
- **Mantine Forms + Zod** - Form state and validation with zodResolver
- **Lingui** - Internationalization for forms and UI

### UI & Styling

- **Mantine UI** - Component library with theming
- **PostCSS** - CSS processing with Mantine preset
- **Tabler Icons** - Icon library
- **FormField Component** - Unified form field with 15+ types, validation status, and UX enhancements

### Development Tools

- **SWC** - Fast TypeScript/JavaScript compiler
- **ESLint 9** - Code linting with flat config
- **Prettier** - Code formatting
- **Vitest** - Unit testing
- **Playwright** - E2E testing

## Feature-Sliced Design Structure

```
src/
├── app/                    # Application layer
│   ├── providers/         # Global providers
│   ├── router/           # Router configuration
│   └── styles/           # Global styles
├── pages/                 # Pages layer
│   ├── home/             # Home page
│   └── users/            # Users page
├── widgets/              # Widgets layer
│   ├── header/           # Header widget
│   └── sidebar/          # Sidebar widget
├── features/             # Features layer
│   ├── auth/             # Authentication feature
│   └── user-management/  # User management feature
├── entities/             # Entities layer
│   ├── user/             # User entity
│   └── session/          # Session entity
└── shared/               # Shared layer
    ├── ui/               # Shared UI components
    │   ├── enhanced-form-field/  # Comprehensive FormField component
    │   ├── loading-overlay/      # Loading states
    │   └── error-boundary/       # Error handling
    ├── lib/              # Shared utilities
    ├── api/              # API clients
    └── config/           # Configuration
```

### Layer Responsibilities

#### 1. App Layer (`src/app/`)

- Application initialization
- Global providers setup
- Router configuration
- Global styles and theme

```typescript
// src/app/App.tsx
export function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <MantineProvider theme={theme}>
        <RouterProvider router={router} />
      </MantineProvider>
    </QueryClientProvider>
  );
}
```

#### 2. Pages Layer (`src/pages/`)

- Route components
- Page-level layouts
- SEO metadata

```typescript
// src/pages/users/UsersPage.tsx
export function UsersPage() {
  return (
    <PageLayout>
      <Helmet>
        <title>Users - My App</title>
      </Helmet>
      <UsersWidget />
    </PageLayout>
  );
}
```

#### 3. Widgets Layer (`src/widgets/`)

- Complex UI blocks
- Business logic composition
- Feature orchestration

```typescript
// src/widgets/users-list/UsersListWidget.tsx
export function UsersListWidget() {
  return (
    <Card>
      <UserFilters />
      <UsersList />
      <UsersPagination />
    </Card>
  );
}
```

#### 4. Features Layer (`src/features/`)

- Business features
- User interactions
- Feature-specific logic

```typescript
// src/features/user-management/create-user/CreateUserForm.tsx
export function CreateUserForm() {
  const createUser = useCreateUser();

  return (
    <form onSubmit={handleSubmit}>
      <UserFormFields />
      <Button type="submit">Create User</Button>
    </form>
  );
}
```

#### 5. Entities Layer (`src/entities/`)

- Business entities
- Domain models
- Entity-specific operations

```typescript
// src/entities/user/model/types.ts
export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

// src/entities/user/api/userApi.ts
export const userApi = {
  getUsers: () => apiClient.get<User[]>("/users"),
  getUser: (id: string) => apiClient.get<User>(`/users/${id}`),
  createUser: (data: CreateUserData) => apiClient.post<User>("/users", data),
};
```

#### 6. Shared Layer (`src/shared/`)

- Reusable utilities
- UI components
- Configuration
- Common types

```typescript
// src/shared/ui/Button/Button.tsx
export function Button({ children, variant = 'primary', ...props }) {
  return (
    <MantineButton variant={variant} {...props}>
      {children}
    </MantineButton>
  );
}
```

## Import Rules

FSD enforces strict import rules to maintain architecture integrity:

```typescript
// ✅ Allowed imports
import { Button } from "@/shared/ui"; // From shared
import { userApi } from "@/entities/user"; // From entities
import { CreateUserForm } from "@/features"; // From features

// ❌ Forbidden imports
import { UsersPage } from "@/pages"; // Pages can't be imported
import { Header } from "@/widgets"; // Cross-widget imports
```

## State Management Architecture

### Server State (TanStack Query)

- API data caching
- Background updates
- Optimistic updates
- Error handling

```typescript
// Query configuration
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 10 * 60 * 1000, // 10 minutes
      retry: 3,
      refetchOnWindowFocus: false,
    },
  },
});
```

### Client State (Zustand)

- UI state
- User preferences
- Temporary data

```typescript
// src/shared/store/useAppStore.ts
interface AppState {
  theme: "light" | "dark";
  sidebarOpen: boolean;
  setTheme: (theme: "light" | "dark") => void;
  toggleSidebar: () => void;
}

export const useAppStore = create<AppState>((set) => ({
  theme: "light",
  sidebarOpen: false,
  setTheme: (theme) => set({ theme }),
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
}));
```

### Form State (Mantine Forms + Zod)

- Zod schema validation
- Mantine form management
- Lingui internationalization
- Enhanced UX features

```typescript
// Form with Zod validation and Mantine integration
const form = useForm<UserFormData>({
  validate: zodResolver(userSchema),
  initialValues: {
    name: "",
    email: "",
    role: "user",
  },
});

// Comprehensive FormField usage
<FormField
  type="email"
  name="email"
  label={msg`Email Address`}
  placeholder={msg`Enter your email`}
  form={form}
  withAsterisk
  showValidationStatus
/>
```

## Routing Architecture

### File-based Routing

Using TanStack Router with file-based routing:

```
src/routes/
├── __root.tsx           # Root layout
├── index.tsx           # Home page (/)
├── users/
│   ├── index.tsx       # Users list (/users)
│   └── $userId.tsx     # User detail (/users/:userId)
└── auth/
    ├── login.tsx       # Login page (/auth/login)
    └── register.tsx    # Register page (/auth/register)
```

### Route Configuration

```typescript
// src/routes/__root.tsx
export const Route = createRootRoute({
  component: RootLayout,
  beforeLoad: ({ context }) => {
    // Global auth check
    if (!context.auth.isAuthenticated) {
      throw redirect({ to: "/auth/login" });
    }
  },
});
```

### Type-safe Navigation

```typescript
// Type-safe navigation
const navigate = useNavigate();

navigate({
  to: "/users/$userId",
  params: { userId: "123" },
  search: { tab: "profile" },
});
```

## Form Architecture

### Unified FormField Component

The project uses a comprehensive `FormField` component that integrates Mantine UI, Zod validation, and Lingui internationalization:

```typescript
// 15+ field types supported
<FormField type="text" name="firstName" label={msg`First Name`} form={form} />
<FormField type="email" name="email" label={msg`Email`} form={form} showValidationStatus />
<FormField type="password" name="password" label={msg`Password`} form={form} showStrengthIndicator />
<FormField type="select" name="country" label={msg`Country`} data={countries} form={form} searchable />
<FormField type="multiselect" name="interests" label={msg`Interests`} data={interests} form={form} maxValues={5} />
<FormField type="textarea" name="bio" label={msg`Bio`} form={form} showCharacterCount maxLength={500} />
<FormField type="number" name="age" label={msg`Age`} form={form} min={18} max={120} />
<FormField type="date" name="birthDate" label={msg`Birth Date`} form={form} />
<FormField type="checkbox" name="agree" label={msg`Terms`} checkboxLabel={msg`I agree`} form={form} />
<FormField type="switch" name="notifications" label={msg`Notifications`} form={form} />
<FormField type="radio" name="plan" label={msg`Plan`} data={plans} form={form} />
```

### Form Validation Strategy

1. **HTML5 Validation Disabled**: All forms use `noValidate` attribute
2. **Zod Schema Validation**: Comprehensive validation rules with custom messages
3. **Real-time Feedback**: Validation status indicators and error messages
4. **Internationalization**: All validation messages support Lingui

```typescript
// Zod schema with i18n messages
const userSchema = z.object({
  email: z
    .string()
    .min(1, _(msg`Email is required`))
    .email(_(msg`Please enter a valid email address`)),

  password: z
    .string()
    .min(8, _(msg`Password must be at least 8 characters`))
    .regex(/[A-Z]/, _(msg`Password must contain uppercase letter`))
    .regex(/[a-z]/, _(msg`Password must contain lowercase letter`))
    .regex(/[0-9]/, _(msg`Password must contain number`)),
});

// Form setup with zodResolver
const form = useForm<UserFormData>({
  validate: zodResolver(userSchema),
  initialValues: { email: "", password: "" },
});
```

### Enhanced UX Features

- **Validation Status Indicators**: Visual checkmarks and X icons
- **Password Strength Meter**: Real-time strength calculation with progress bar
- **Character Counters**: Smart counting with color-coded limits
- **Tooltips**: Contextual help with info icons
- **Loading States**: Proper disabled states during async operations
- **Accessibility**: Full ARIA support and screen reader compatibility

### Form Submission Pattern

```typescript
// Unified form submission with error handling
const handleSubmit = async (values: FormData) => {
  setIsLoading(true);

  try {
    await submitForm(values);
    form.reset();
    notifications.show({
      title: _(msg`Success`),
      message: _(msg`Form submitted successfully`),
      color: "green",
    });
  } catch (error) {
    notifications.show({
      title: _(msg`Error`),
      message: _(msg`Form submission failed`),
      color: "red",
    });
  } finally {
    setIsLoading(false);
  }
};

// Form with noValidate to disable HTML5 validation
<form onSubmit={form.onSubmit(handleSubmit)} noValidate>
  <Stack gap="md">
    <FormField type="email" name="email" label={msg`Email`} form={form} withAsterisk />
    <FormField type="password" name="password" label={msg`Password`} form={form} withAsterisk showStrengthIndicator />
    <Button type="submit" loading={isLoading}>
      {_(msg`Submit`)}
    </Button>
  </Stack>
</form>
```

## Component Architecture

### Component Composition

```typescript
// Compound component pattern
export function UserCard({ user }) {
  return (
    <Card>
      <UserCard.Header>
        <UserCard.Avatar src={user.avatar} />
        <UserCard.Title>{user.name}</UserCard.Title>
      </UserCard.Header>
      <UserCard.Content>
        <UserCard.Email>{user.email}</UserCard.Email>
        <UserCard.Role>{user.role}</UserCard.Role>
      </UserCard.Content>
      <UserCard.Actions>
        <Button>Edit</Button>
        <Button variant="outline">Delete</Button>
      </UserCard.Actions>
    </Card>
  );
}
```

### Custom Hooks

```typescript
// Business logic hooks
export function useUser(userId: string) {
  return useQuery({
    queryKey: ["user", userId],
    queryFn: () => userApi.getUser(userId),
    enabled: !!userId,
  });
}

export function useCreateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: userApi.createUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
  });
}
```

## Error Handling Architecture

### Error Boundaries

```typescript
// Global error boundary
export function AppErrorBoundary({ children }) {
  return (
    <ErrorBoundary
      FallbackComponent={ErrorFallback}
      onError={(error, errorInfo) => {
        console.error('App Error:', error, errorInfo);
        // Send to error reporting service
      }}
    >
      {children}
    </ErrorBoundary>
  );
}
```

### API Error Handling

```typescript
// Axios interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle authentication error
      authStore.logout();
      router.navigate({ to: "/auth/login" });
    }
    return Promise.reject(error);
  }
);
```

## Performance Optimization

### Code Splitting

```typescript
// Route-based code splitting
const UsersPage = lazy(() => import("@/pages/users"));
const UserDetailPage = lazy(() => import("@/pages/users/detail"));

// Component-based code splitting
const HeavyComponent = lazy(() => import("./HeavyComponent"));
```

### Bundle Analysis

```typescript
// vite.config.ts
export default defineConfig({
  plugins: [
    react(),
    bundleAnalyzer({
      analyzerMode: "static",
      openAnalyzer: false,
    }),
  ],
});
```

### Memoization

```typescript
// Expensive calculations
const expensiveValue = useMemo(() => {
  return heavyCalculation(data);
}, [data]);

// Callback memoization
const handleClick = useCallback(
  (id: string) => {
    onItemClick(id);
  },
  [onItemClick]
);
```

## Testing Architecture

### Unit Testing Strategy

- Test business logic in isolation
- Mock external dependencies
- Focus on user interactions

```typescript
// Component testing
test('should display user information', () => {
  render(<UserCard user={mockUser} />);

  expect(screen.getByText(mockUser.name)).toBeInTheDocument();
  expect(screen.getByText(mockUser.email)).toBeInTheDocument();
});
```

### Integration Testing

- Test feature workflows
- Use MSW for API mocking
- Test routing and navigation

```typescript
// Feature testing
test('should create new user', async () => {
  const user = userEvent.setup();
  render(<CreateUserForm />);

  await user.type(screen.getByLabelText(/name/i), 'John Doe');
  await user.type(screen.getByLabelText(/email/i), 'john@example.com');
  await user.click(screen.getByRole('button', { name: /create/i }));

  await waitFor(() => {
    expect(screen.getByText(/user created/i)).toBeInTheDocument();
  });
});
```

### E2E Testing

- Test complete user journeys
- Verify critical business flows
- Cross-browser compatibility

```typescript
// E2E test
test("user management workflow", async ({ page }) => {
  await page.goto("/users");

  // Create user
  await page.click('[data-testid="create-user-button"]');
  await page.fill('[data-testid="name-input"]', "John Doe");
  await page.fill('[data-testid="email-input"]', "john@example.com");
  await page.click('[data-testid="submit-button"]');

  // Verify user appears in list
  await expect(page.locator("text=John Doe")).toBeVisible();
});
```

## Security Architecture

### Authentication Flow

1. User submits credentials
2. Server validates and returns JWT
3. Token stored in secure cookie
4. Token included in API requests
5. Server validates token on each request

### Authorization Patterns

```typescript
// Route protection
export const Route = createFileRoute('/admin')({
  beforeLoad: ({ context }) => {
    if (!context.auth.user?.isAdmin) {
      throw redirect({ to: '/unauthorized' });
    }
  }
});

// Component-level authorization
export function AdminPanel() {
  const { user } = useAuth();

  if (!user?.isAdmin) {
    return <UnauthorizedMessage />;
  }

  return <AdminContent />;
}
```

### Data Validation

```typescript
// Input validation with Zod
const userSchema = z.object({
  name: z.string().min(2).max(50),
  email: z.string().email(),
  password: z
    .string()
    .min(8)
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/),
});
```

## Internationalization Architecture

### Message Management

```typescript
// Message extraction and compilation
// Extract: pnpm messages:extract
// Compile: pnpm messages:compile

// Usage in components
import { Trans, t } from '@lingui/macro';

function WelcomeMessage({ name }) {
  return (
    <div>
      <Trans>Welcome, {name}!</Trans>
      <p>{t`Click here to get started`}</p>
    </div>
  );
}
```

### Locale Management

```typescript
// Locale provider
export function LocaleProvider({ children }) {
  const [locale, setLocale] = useState('en');

  useEffect(() => {
    i18n.activate(locale);
  }, [locale]);

  return (
    <I18nProvider i18n={i18n}>
      {children}
    </I18nProvider>
  );
}
```

## Build & Deployment Architecture

### Build Process

1. TypeScript compilation
2. Message extraction and compilation
3. Asset optimization
4. Bundle generation
5. Static analysis

### Environment Configuration

```typescript
// Environment-specific builds
const config = {
  development: {
    apiUrl: "http://localhost:3000",
    enableDevTools: true,
  },
  production: {
    apiUrl: "https://api.example.com",
    enableDevTools: false,
  },
};
```

This architecture provides a solid foundation for scalable React applications with clear separation of concerns, type safety, and maintainable code structure.
