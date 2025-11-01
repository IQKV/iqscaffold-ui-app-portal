# Centralized Auth Process Layer

This project now uses a centralized auth process layer built with Zustand and Feature-Sliced Design.

## Overview

- Store: `features/auth/model/store.ts` (`useAuthStore`)
- JWT decode: `features/auth/lib/jwt.ts`
- Provider: `features/auth/provider/auth-provider.tsx`
- Guards: `features/auth/lib/guards.tsx`
- Tokens manager (multi-tab sync): `shared/lib/auth-tokens.ts`
- API client: `shared/api/base.ts` (auto token injection + refresh)
- UI: `features/auth/ui/user-menu.tsx`, `features/auth/ui/login-form.tsx`
- Pages: `/auth-demo` (login), `/dashboard` (protected), `/unauthorized`

## Usage

### App integration

```tsx
// app/app.tsx
import { AuthProvider } from "@/features/auth";

<QueryClientProvider client={queryClient}>
  <AuthProvider>
    <RouterProvider router={router} />
  </AuthProvider>
</QueryClientProvider>;
```

### Reading auth state

```tsx
import { useAuthStore } from "@/features/auth";

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
import { AuthGuard, RoleGuard, PermissionGuard } from "@/features/auth";

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

- `shared/api/base.ts` automatically injects `Authorization: Bearer <accessToken>` from the token store.
- On `401`, it performs a refresh using a concurrency-safe queue, updates tokens, and retries the original request.

### Tokens & multi-tab sync

- `shared/lib/auth-tokens.ts` stores tokens in `localStorage` and broadcasts changes via `BroadcastChannel`.
- `useAuthStore.initialize()` subscribes to token changes and schedules background refresh before expiry.

## Notes

- Run the dev server once to regenerate `routeTree.gen.ts` for new routes.
- If you had previous imports from `@/shared/lib` like `useAuth` or `ProtectedRoute`, replace them with:
  - `useAuthStore` from `@/features/auth`
  - `AuthGuard` from `@/features/auth`
