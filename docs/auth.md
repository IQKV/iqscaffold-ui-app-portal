# Centralized Auth Process Layer

This project now uses a centralized auth process layer built with Zustand and Feature-Sliced Design.

## Overview

- Store: `processes/auth/model/store.ts` (`useAuthStore`)
- JWT decode: `processes/auth/lib/jwt.ts`
- Provider: `processes/auth/provider/auth-provider.tsx`
- Guards: `processes/auth/lib/guards.tsx`
- Tokens manager (multi-tab sync): `shared/lib/auth-tokens.ts`
- API client: `shared/lib/client.ts` (axios instance with global error normalization)
- UI: `processes/auth/ui/user-menu.tsx`, `processes/auth/ui/login-form.tsx`
- Pages: `/auth-demo` (login), `/dashboard` (protected), `/unauthorized`

## Usage

### App integration

```tsx
// app/app.tsx
import { AuthProvider } from "@/processes/auth";

<QueryClientProvider client={queryClient}>
  <AuthProvider>
    <RouterProvider router={router} />
  </AuthProvider>
</QueryClientProvider>;
```

### Reading auth state

```tsx
import { useAuthStore } from "@/processes/auth";

const user = useAuthStore((s) => s.user);
const status = useAuthStore((s) => s.status); // "authenticated" | "unauthenticated" | "initializing"
```

### Login / Logout

```tsx
const login = useAuthStore((s) => s.login);
await login({ username, password });

const logout = useAuthStore((s) => s.logout);
await logout();
```

### Guards

```tsx
import { AuthGuard, RoleGuard, PermissionGuard } from "@/processes/auth";

<AuthGuard>
  <Dashboard />
</AuthGuard>

<RoleGuard roles={["ADMIN"]}>
  <AdminArea />
</RoleGuard>

<PermissionGuard permissions={["users:read", "users:write"]}>
  <UsersEditor />
</PermissionGuard>
```

### API client

- Use `shared/lib/client.ts` (`api` axios instance) for HTTP. Token injection/refresh logic can be added via interceptors if your backend requires it. See `shared/lib/http-error.ts` and notifications for standardized handling.

### Tokens & multi-tab sync

- `shared/lib/auth-tokens.ts` stores tokens in `localStorage` and broadcasts changes via `BroadcastChannel`.
- `useAuthStore.initialize()` subscribes to token changes and schedules background refresh before expiry.

## Notes

- Run the dev server once to regenerate `routeTree.gen.ts` for new routes.
- Migration from legacy:
  - Replace `useAuth` with `useAuthStore` from `@/processes/auth` (a compatibility shim `useAuth` in `@/shared/lib` exists but prefer the store directly).
  - Replace any `ProtectedRoute` usages with `AuthGuard` from `@/processes/auth`.
  - Move any auth UI to `@/processes/auth/ui`.

### Testing tips

- For unit tests, you can set auth state via the store:
  ```ts
  import { useAuthStore } from "@/processes/auth";
  useAuthStore.setState({
    status: "authenticated",
    user: {
      /* ... */
    },
  } as any);
  ```
