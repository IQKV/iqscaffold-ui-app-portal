# 🛠️ Development Guide

## 🚀 **Quick Start**

### Prerequisites

- **Node.js** LTS (v18+)
- **PNPM** (v8+)
- **Git**
- **Docker** (optional, for services)

### Setup

```bash
# Clone repository
git clone <repository-url>
cd project-name

# Install dependencies
pnpm install

# Start development server
pnpm dev
```

## 📁 **Adding New Features**

### 1. **Create a New Feature**

```bash
# Create feature structure
mkdir -p src/features/my-feature/{model,ui}
touch src/features/my-feature/{index.ts,model/queries.ts,model/validation.ts,ui/my-component.tsx}
```

**Feature Structure:**

```
src/features/my-feature/
├── model/
│   ├── queries.ts      # Business logic & TanStack Query hooks
│   └── validation.ts   # Zod validation schemas
├── ui/
│   ├── my-component.tsx # Feature UI components
│   └── index.ts        # UI exports
└── index.ts           # Public API
```

**Example Feature Implementation:**

```typescript
// src/features/my-feature/model/validation.ts
import { z } from "zod";

export const myFeatureSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email"),
});

export type MyFeatureInput = z.infer<typeof myFeatureSchema>;

// src/features/my-feature/model/queries.ts
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { myFeatureSchema, type MyFeatureInput } from "./validation";

export const useMyFeature = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: MyFeatureInput) => {
      const validatedData = myFeatureSchema.parse(data);
      // Call entity API
      return myEntityApi.create(validatedData);
    },
    onSuccess: () => {
      // Business logic: invalidate related queries
      queryClient.invalidateQueries({ queryKey: ["my-entity"] });
    },
  });
};

// src/features/my-feature/index.ts
export * from "./model/queries";
export * from "./model/validation";
export * from "./ui";
```

### 2. **Create a New Entity**

```bash
# Create entity structure
mkdir -p src/entities/my-entity/{model,api,ui}
touch src/entities/my-entity/{index.ts,model/types.ts,model/queries.ts,api/my-entity-api.ts}
```

**Entity Structure:**

```
src/entities/my-entity/
├── model/
│   ├── types.ts        # TypeScript interfaces
│   └── queries.ts      # Pure CRUD queries
├── api/
│   └── my-entity-api.ts # API methods
├── ui/                 # Data display components (optional)
│   └── my-entity-card.tsx
└── index.ts           # Public API
```

**Example Entity Implementation:**

```typescript
// src/entities/my-entity/model/types.ts
export interface MyEntity {
  id: string;
  name: string;
  email: string;
  createdAt: string;
}

// src/entities/my-entity/api/my-entity-api.ts
import { api } from "@/shared/lib";
import type { MyEntity } from "../model/types";

export const myEntityApi = {
  getAll: async () => {
    const response = await api.get<MyEntity[]>("/my-entities");
    return response.data;
  },

  getById: async (id: string) => {
    const response = await api.get<MyEntity>(`/my-entities/${id}`);
    return response.data;
  },

  create: async (data: Omit<MyEntity, "id" | "createdAt">) => {
    const response = await api.post<MyEntity>("/my-entities", data);
    return response.data;
  },
};

// src/entities/my-entity/model/queries.ts
import { useQuery, useMutation } from "@tanstack/react-query";
import { myEntityApi } from "../api/my-entity-api";

export const myEntityKeys = {
  all: ["my-entity"] as const,
  lists: () => [...myEntityKeys.all, "list"] as const,
  details: () => [...myEntityKeys.all, "detail"] as const,
  detail: (id: string) => [...myEntityKeys.details(), id] as const,
};

export const useMyEntities = () => {
  return useQuery({
    queryKey: myEntityKeys.lists(),
    queryFn: myEntityApi.getAll,
  });
};

export const useMyEntity = (id: string) => {
  return useQuery({
    queryKey: myEntityKeys.detail(id),
    queryFn: () => myEntityApi.getById(id),
    enabled: !!id,
  });
};

// src/entities/my-entity/index.ts
export { myEntityApi } from "./api/my-entity-api";
export type { MyEntity } from "./model/types";
export * from "./model/queries";
```

### 3. **Create a New Page**

```bash
# Create page structure
mkdir -p src/pages/my-page/ui
touch src/pages/my-page/{index.ts,ui/my-page.tsx}
touch src/pages/my-page.tsx  # Route definition
```

**Page Implementation:**

```typescript
// src/pages/my-page/ui/my-page.tsx
import { MyFeatureComponent } from "@/features/my-feature";

export function MyPage() {
  return (
    <div>
      <h1>My Page</h1>
      <MyFeatureComponent />
    </div>
  );
}

// src/pages/my-page/index.ts
export { MyPage } from './ui/my-page';

// src/pages/my-page.tsx (Route definition)
import { createFileRoute } from "@tanstack/react-router";
import { MyPage } from "./my-page";

export const Route = createFileRoute("/my-page")({
  component: MyPage,
});
```

## 🔄 **Data Flow Patterns**

### **Query Composition Pattern**

```typescript
// Entity Query (Pure CRUD)
export const useUser = (id: string) => {
  return useQuery({
    queryKey: userKeys.detail(id),
    queryFn: () => userApi.findById(id),
  });
};

// Feature Query (Business Logic)
export const useUpdateUser = () => {
  const queryClient = useQueryClient();
  const updateMutation = useUserUpdate(); // Entity mutation

  return {
    ...updateMutation,
    mutateAsync: async (data: UserUpdateInput) => {
      // Feature-level validation
      const validatedData = userUpdateSchema.parse(data);
      const result = await updateMutation.mutateAsync(validatedData);

      // Business logic
      queryClient.invalidateQueries({ queryKey: userKeys.lists() });
      return result;
    },
  };
};

// Process Query (Cross-entity coordination)
export const useUserOnboardingProcess = () => {
  const registerMutation = useAuthRegister();
  const queryClient = useQueryClient();

  return {
    ...registerMutation,
    mutateAsync: async (data: RegisterInput) => {
      // Step 1: Register user
      const result = await registerMutation.mutateAsync(data);

      // Step 2: Cross-entity coordination
      queryClient.invalidateQueries({ queryKey: userKeys.me() });

      // Step 3: Additional processes
      // - Send welcome email
      // - Initialize user preferences

      return result;
    },
  };
};
```

### **Validation Patterns**

```typescript
// Basic validation
const userSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email"),
});

// Complex validation with refinements
const passwordChangeSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password required"),
    newPassword: passwordSchema,
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

// Conditional validation
const userUpdateSchema = z
  .object({
    name: z.string().optional(),
    email: z.string().email().optional(),
    changePassword: z.boolean().optional(),
    currentPassword: z.string().optional(),
    newPassword: z.string().optional(),
  })
  .refine(
    (data) => {
      if (data.changePassword) {
        return data.currentPassword && data.newPassword;
      }
      return true;
    },
    {
      message: "Password fields required when changing password",
      path: ["currentPassword"],
    }
  );
```

## 🧠 **State Management**

- Use **Tanstack Query** for server state management and caching
- Leverage React's built-in state management (useState, useReducer, useContext) for local component state
- For complex client-side state, consider using React Context with useReducer

## 🧪 **Testing Patterns**

### **Unit Testing Features**

```typescript
// features/auth/model/queries.test.ts
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useLogin } from './queries';

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });

  return ({ children }) => (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
};

test('useLogin should validate and call API', async () => {
  const { result } = renderHook(() => useLogin(), {
    wrapper: createWrapper(),
  });

  await waitFor(() => {
    expect(result.current.mutateAsync).toBeDefined();
  });

  // Test validation
  await expect(
    result.current.mutateAsync({ email: 'invalid', password: '' })
  ).rejects.toThrow();

  // Test successful call
  const validData = { email: 'test@example.com', password: 'password123' };
  await result.current.mutateAsync(validData);
});
```

### **Component Testing**

```typescript
// features/auth/ui/login-form.test.tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { LoginForm } from './login-form';

test('LoginForm should validate inputs', async () => {
  render(<LoginForm />);

  const submitButton = screen.getByRole('button', { name: /sign in/i });
  fireEvent.click(submitButton);

  await waitFor(() => {
    expect(screen.getByText(/email is required/i)).toBeInTheDocument();
    expect(screen.getByText(/password is required/i)).toBeInTheDocument();
  });
});
```

## 🔧 **Development Tools**

### **Available Scripts**

```bash
# Development
pnpm dev              # Start development server
pnpm build            # Build for production
pnpm preview          # Preview production build

# Code Quality
pnpm lint             # Run ESLint
pnpm lint:fix         # Fix ESLint issues
pnpm prettier:check   # Check Prettier formatting
pnpm prettier:write   # Format code with Prettier
pnpm type-check       # TypeScript type checking

# Testing
pnpm test             # Run unit tests
pnpm test:coverage    # Run tests with coverage
pnpm test:ui          # Run tests with UI
pnpm e2e              # Run E2E tests
pnpm e2e:ui           # Run E2E tests with UI

# Storybook
pnpm storybook        # Start Storybook
pnpm storybook:build  # Build Storybook

# Internationalization
pnpm messages:extract # Extract translation messages
pnpm messages:compile # Compile translation messages
```

### **VS Code Extensions**

Recommended extensions for optimal development experience:

- **ES7+ React/Redux/React-Native snippets**
- **TypeScript Importer**
- **Prettier - Code formatter**
- **ESLint**
- **Auto Rename Tag**
- **Bracket Pair Colorizer**
- **GitLens**

### **Debugging**

```typescript
// React Query Devtools (already configured)
// Available in development mode at bottom of screen

// Browser DevTools
// React DevTools extension recommended
// TanStack Router DevTools available in development
```

## 📡 **Data Fetching Patterns by Layer**

### Entities (CRUD, pure data access)

```typescript
// src/entities/user/model/queries.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { userApi } from "../api/user-api";
import {
  createKeys,
  mutationOnMutate,
  mutationOnError,
  mutationOnSettled,
} from "@/shared/lib";

export const userKeys = createKeys("user");

export const useUsers = () =>
  useQuery({ queryKey: userKeys.lists(), queryFn: userApi.getAll });

export const useUser = (id: string) =>
  useQuery({
    queryKey: userKeys.detail(id),
    queryFn: () => userApi.getById(id),
    enabled: !!id,
  });

export const useCreateUser = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: userApi.create,
    onMutate: mutationOnMutate(qc, userKeys.lists(), (prev) => [
      {
        /* optimistic item */
      } as any,
      ...(prev ?? []),
    ]),
    onError: mutationOnError(qc, userKeys.lists()),
    onSettled: mutationOnSettled(qc, [userKeys.lists()]),
  });
};
```

Guidelines:

- **Keep entities dumb**: pure CRUD, no cross-entity coordination.
- **Keys**: use `createKeys("entity")` for consistency.
- **Retries**: rely on global `standardRetry` from `AppConfig.reactQueryConfig`.

### Features (business logic, validation)

```typescript
// src/features/user-management/model/queries.ts
import { z } from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useCreateUser } from "@/entities/user";

const createSchema = z.object({
  email: z.string().email(),
  name: z.string().min(1),
});

export const useCreateUserValidated = () => {
  const base = useCreateUser();
  const qc = useQueryClient();
  return {
    ...base,
    mutateAsync: async (input: unknown) => {
      const data = createSchema.parse(input);
      const res = await base.mutateAsync(data);
      // additional feature-level side effects
      return res;
    },
  };
};
```

Guidelines:

- **Validate** inputs with Zod before delegating to entity mutations.
- **Coordinate** cross-entity invalidations only here.

### Processes (cross-feature orchestration)

```typescript
// src/processes/user-onboarding/model/queries.ts
import { useCreateUserValidated } from "@/features/user-management";
import { userKeys } from "@/entities/user";
import { useQueryClient } from "@tanstack/react-query";

export const useOnboarding = () => {
  const qc = useQueryClient();
  const createUser = useCreateUserValidated();
  return {
    start: async (payload: unknown) => {
      const user = await createUser.mutateAsync(payload);
      await qc.invalidateQueries({ queryKey: userKeys.lists() });
      return user;
    },
  };
};
```

Guidelines:

- **No raw API** here; compose lower layers.
- **Explicit invalidations** across entities.

## 🧭 **State Management Decision Tree**

- Use **TanStack Query** when:
  - **Server data** (CRUD, cacheable, async, shareable across views)
  - Needs invalidation, retries, background updates, pagination
  - Derives from HTTP/gRPC and can be refetched

- Use **React State** (useState, useReducer, useContext) when:
  - **Client-only UI state** (toggles, modals, ephemeral forms)
  - Local component state that doesn't need to be shared
  - Simple state management within component boundaries

- Use **URL State** (nuqs, search params) when:
  - State that should be shareable via URL
  - Filters, pagination, search terms
  - Navigation state that should persist across page reloads

Rule of thumb: if it comes from the server, use Query; if it’s purely UI state, use React's built-in state management; if it should be shareable/bookmarkable, use URL state.

## 🧩 **Component Composition Guidelines**

- **Container vs Presentational**:
  - Containers hold data fetching/state wiring; Presentational components receive props only.
  - Prefer co-located hooks inside containers; keep presentational components framework-agnostic.

- **Selectors to minimize re-renders**:
  - For React state, use specific selectors and avoid passing entire objects as props.
  - For Query, select small data slices in components if needed.

- **Composition over inheritance**:
  - Build complex UIs by composing small components (layout, item, list, controls).
  - Lift state only when multiple children need it.

- **Error and loading surfaces**:
  - Centralize skeleton/spinner patterns; avoid ad-hoc loaders per component.
  - Use error boundaries where appropriate for catastrophic failures.

- **Public API imports**:
  - Import from package barrels (`@/entities/user`, `@/features/auth`) not deep internal paths.

## 🔗 **Relationship Management Pattern**

Use a shared relation index to track parent-child mappings without duplicating full entities.

```typescript
// Example: users ↔ roles relationships
import {
  createRelationKeys,
  setRelation,
  unsetRelation,
  getChildren,
} from "@/shared/lib";
import { useQueryClient, useQuery } from "@tanstack/react-query";

const relKeys = createRelationKeys("user-role");

export const useUserRolesIds = (userId: string) =>
  useQuery({
    queryKey: relKeys.forParent(userId),
    queryFn: async () => getChildren(undefined, userId),
  });

export const useLinkUserToRole = () => {
  const qc = useQueryClient();
  return (userId: string, roleId: string) =>
    setRelation(qc, relKeys.index(), userId, roleId);
};

export const useUnlinkUserFromRole = () => {
  const qc = useQueryClient();
  return (userId: string, roleId: string) =>
    unsetRelation(qc, relKeys.index(), userId, roleId);
};
```

Guidelines:

- Store only IDs in relation maps; fetch full entities via their own queries.
- Invalidate derived views after linking/unlinking using `invalidateRelationViews`.
- Prefer `createRelationKeys(prefix)` to standardize keys for relations.

## 📋 **Code Review Checklist**

### **Architecture**

- [ ] Code follows FSD layer hierarchy
- [ ] Imports use public APIs (no deep imports)
- [ ] Business logic is in appropriate layer
- [ ] Validation is at feature level

### **Code Quality**

- [ ] TypeScript types are properly defined
- [ ] No ESLint errors or warnings
- [ ] Code is properly formatted
- [ ] Tests are included for new functionality

### **Performance**

- [ ] Queries are optimized and cached properly
- [ ] Components don't cause unnecessary re-renders
- [ ] Bundle size impact is considered

### **Security**

- [ ] User inputs are validated
- [ ] API calls are properly authenticated
- [ ] Sensitive data is not exposed

## 🚨 **Common Pitfalls**

### **Import Violations**

```typescript
// ❌ Wrong: Deep import bypassing public API
import { LoginForm } from "@/features/auth/ui/login-form";

// ✅ Correct: Use public API
import { LoginForm } from "@/features/auth";
```

### **Layer Violations**

```typescript
// ❌ Wrong: Entity importing from feature
import { useLogin } from "@/features/auth";

// ✅ Correct: Entity only imports from shared
import { api } from "@/shared/lib";
```

### **Validation Placement**

```typescript
// ❌ Wrong: Validation in entity layer
export const useUserUpdate = () => {
  return useMutation({
    mutationFn: (data) => {
      const validated = userSchema.parse(data); // Business logic in entity
      return userApi.update(validated);
    },
  });
};

// ✅ Correct: Validation in feature layer
export const useUpdateUser = () => {
  const updateMutation = useUserUpdate(); // Pure entity mutation

  return {
    ...updateMutation,
    mutateAsync: async (data) => {
      const validated = userSchema.parse(data); // Validation in feature
      return updateMutation.mutateAsync(validated);
    },
  };
};
```

This development guide provides patterns and examples for building features following the FSD architecture. Always refer to the existing codebase for concrete examples and maintain consistency with established patterns.
