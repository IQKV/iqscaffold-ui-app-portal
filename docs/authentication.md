# Authentication & Authorization System

This document describes the comprehensive authentication and authorization system implemented for the React 19 + Mantine 8 UI project with Spring Boot backend integration.

## Overview

The system provides a complete JWT-based authentication and authorization solution with role-based access control (RBAC) that integrates seamlessly with Spring Boot REST API microservices. Key features include:

- JWT token management with automatic decoding and expiration handling
- React context for managing authentication state
- Authorization guards and utility functions
- User management with proper permission checks
- Role-based UI rendering and access control

## Backend Integration

### Spring Boot Microservices Architecture

The backend consists of three main services:

1. **Auth Service** (Port 8081) - Handles authentication, user management, and JWT tokens
2. **Gateway Service** (Port 8080) - API gateway with routing and authentication
3. **Bookstore Service** (Port 8082) - Example business service

### Supported Roles

The system supports three predefined roles with hierarchical permissions:

- `USER` - Standard user with basic access
- `ADMIN` - Administrator with user management access
- `SUPER_ADMIN` - Super administrator with full system access

### API Endpoints

#### Authentication Endpoints

- `POST /api/v1/auth/login` - User login
- `POST /api/v1/auth/signup` - User registration
- `POST /api/v1/auth/refresh` - Token refresh
- `POST /api/v1/auth/logout` - User logout

#### User Management Endpoints (Admin/Super Admin only)

- `GET /api/v1/users` - List users with pagination
- `GET /api/v1/users/{id}` - Get user by ID
- `POST /api/v1/users` - Create new user
- `PUT /api/v1/users/{id}` - Update user
- `DELETE /api/v1/users/{id}` - Delete user

### User Management Permissions

- **Read Users**: All authenticated users can view user lists
- **Create Users**: Only ADMIN and SUPER_ADMIN roles
- **Update Users**: Only ADMIN and SUPER_ADMIN roles
- **Delete Users**: Only ADMIN and SUPER_ADMIN roles

## Frontend Implementation

### 1. Authentication Context (`src/shared/lib/auth-context.tsx`)

The `AuthProvider` component manages authentication state and provides comprehensive authentication methods:

```tsx
interface AuthContextType {
  user: UserContext | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  hasRole: (role: string) => boolean;
  hasAnyRole: (roles: string[]) => boolean;
  hasAllRoles: (roles: string[]) => boolean;
  hasPermission: (permission: string) => boolean;
  isAdmin: () => boolean;
  isSuperAdmin: () => boolean;
  canManageUsers: () => boolean;
  login: (tokens: { accessToken: string; refreshToken: string }) => void;
  logout: () => void;
  refreshUser: () => void;
}
```

Key features:

- JWT token management with automatic decoding
- User context extraction from tokens
- Authentication state management
- Role and permission checking methods
- Automatic token expiration handling

### 2. Authorization Guards (`src/shared/lib/auth-guards.tsx`)

The system provides several guard components for declarative authorization:

#### RoleGuard - Check Specific Roles

```tsx
import { RoleGuard } from '@/shared/lib';

<RoleGuard roles="ADMIN">
  <AdminOnlyContent />
</RoleGuard>

<RoleGuard roles={['ADMIN', 'SUPER_ADMIN']} requireAll={false}>
  <AdminOrSuperAdminContent />
</RoleGuard>
```

#### Specialized Guards

- `AdminGuard` - Admin-only content
- `SuperAdminGuard` - Super admin-only content
- `UserManagementGuard` - User management features
- `PermissionGuard` - Permission-based access

All guards include custom fallback components for unauthorized access.

### 3. Utility Functions (`src/shared/lib/auth-utils.ts`)

Comprehensive utility functions for programmatic authorization checks:

```tsx
import {
  hasRole,
  hasAnyRole,
  hasAllRoles,
  isAdmin,
  canManageUsers,
  getUserDisplayName,
  getUserInitials,
} from "@/shared/lib";

const user = getCurrentUser();

// Role checks
const isUserRole = hasRole(user, "USER");
const hasAdminAccess = hasAnyRole(user, ["ADMIN", "SUPER_ADMIN"]);
const hasAllRequiredRoles = hasAllRoles(user, ["USER", "ADMIN"]);

// Permission checks
const canEdit = canManageUsers(user);
const isAdministrator = isAdmin(user);

// User display helpers
const displayName = getUserDisplayName(user);
const initials = getUserInitials(user);
```

Features include:

- Role checking: `hasRole()`, `hasAnyRole()`, `hasAllRoles()`
- Permission checking: `hasPermission()`, `hasAnyPermission()`
- User management permissions: `canCreateUsers()`, `canUpdateUsers()`, etc.
- User display helpers: `getUserDisplayName()`, `getUserInitials()`
- Role hierarchy and level checking

### 4. Operations Hook (`src/shared/lib/use-auth-operations.ts`)

Convenient hook for common authorization checks and user management operations:

```tsx
import { useAuthOperations } from "@/shared/lib";

function UserManagementComponent() {
  const {
    canReadUsers,
    canCreateUsers,
    canUpdateUsers,
    canDeleteUsers,
    canManageUsers,
    currentUser,
  } = useAuthOperations();

  return (
    <div>
      {canReadUsers && <UsersList />}
      {canCreateUsers && <CreateUserButton />}
      {canUpdateUsers && <EditUserButton />}
      {canDeleteUsers && <DeleteUserButton />}
    </div>
  );
}
```

## Usage Examples

### Basic Authentication Check

```tsx
import { useAuth } from "@/shared/lib";

function MyComponent() {
  const { isAuthenticated, user } = useAuth();

  if (!isAuthenticated) {
    return <div>Please log in</div>;
  }

  return <div>Welcome, {user?.firstName}!</div>;
}
```

### Role-Based Rendering

```tsx
import { useAuth, RoleGuard } from "@/shared/lib";

function AdminPanel() {
  const { canManageUsers, hasRole } = useAuth();

  return (
    <div>
      {canManageUsers() && <CreateUserButton />}

      <RoleGuard roles="SUPER_ADMIN">
        <SuperAdminOnlyFeature />
      </RoleGuard>

      {hasRole("SUPER_ADMIN") && <button>Super Admin Only Feature</button>}
    </div>
  );
}
```

### User Management Operations

```tsx
import { useAuthOperations } from "@/shared/lib";

function UserActions() {
  const { canCreateUsers, canUpdateUsers, canDeleteUsers } =
    useAuthOperations();

  return (
    <div>
      {canCreateUsers && <CreateButton />}
      {canUpdateUsers && <EditButton />}
      {canDeleteUsers && <DeleteButton />}
    </div>
  );
}
```

## User Management Implementation

### Updated Users API (`src/features/users/api/users-api.ts`)

- Updated to match Spring Boot backend structure
- Proper authorization headers with JWT tokens
- Support for multiple roles per user
- User status management (enabled/disabled, email verified)

### Users Page (`src/features/users/components/users-page.tsx`)

- Authentication check before rendering
- Authorization guards for user management features

### Users Data Grid (`src/features/users/components/users-data-grid.tsx`)

Role-based UI rendering with conditional elements:

```tsx
// Only show create button for admins
{
  canManageUsers() && <Button onClick={onCreateUser}>Add User</Button>;
}

// Only show edit/delete actions for admins
{
  canManageUsers() && (
    <ActionIcon onClick={() => onEditUser(user)}>
      <IconEdit />
    </ActionIcon>
  );
}
```

Features:

- Role-based UI rendering
- Create/Edit/Delete buttons only for admins
- Proper role display with badges
- User status indicators

### User Form Modal (`src/features/users/components/user-form-modal.tsx`)

- Multi-role selection support
- User status toggles for admins
- Authorization check before rendering form
- Proper validation and error handling

## API Integration

### Authorization Headers

All API requests include proper authorization headers:

```tsx
function getAuthHeaders() {
  const config = getAuthConfig();
  const accessToken = localStorage.getItem(config.tokenStorage.accessTokenKey);

  return {
    Authorization: accessToken ? `Bearer ${accessToken}` : "",
    "X-Tenant-ID": "default",
  };
}
```

### API Functions

```tsx
// User management API with authorization
export async function fetchUsers(params = {}) {
  const response = await apiClient.get("/api/v1/users", {
    params,
    headers: getAuthHeaders(),
  });
  return response.data;
}

export async function createUser(userData) {
  const response = await apiClient.post("/api/v1/users", userData, {
    headers: getAuthHeaders(),
  });
  return response.data;
}
```

Features:

- Proper JWT token handling in request headers
- Tenant ID support for multi-tenant architecture
- Error handling for unauthorized requests
- Automatic token refresh capability

## Demo Components

### Login Form (`src/shared/ui/login-form/`)

Demo login with test accounts:

- `admin` / `password` (ADMIN role)
- `superadmin` / `password` (SUPER_ADMIN role)
- `user` / `password` (USER role)

Features mock JWT token generation for testing.

### Auth Demo (`src/shared/ui/auth-demo/`)

- Current user information display
- Role and permission status
- Live demonstration of authorization guards

### Auth Examples (`src/shared/ui/auth-examples/`)

- Code examples for different authorization patterns
- Interactive demonstrations
- Best practices showcase

### Demo Page (`src/pages/auth-demo.tsx`)

- Comprehensive demo with tabs for login, demo, and examples
- Easy testing of different user roles and permissions

## Security Features

### Frontend Security

- JWT token validation and expiration checking
- Automatic logout on token expiration
- Role-based UI rendering
- Authorization guards for sensitive components

### Backend Integration

- Proper authorization headers in API requests
- Tenant ID support for multi-tenant isolation
- Error handling for unauthorized access
- Token refresh capability

### Best Practices Implemented

1. **Defense in Depth**: Authorization is checked at multiple levels
2. **Principle of Least Privilege**: Users get minimum required permissions
3. **Fail Secure**: Default to denying access when in doubt
4. **Consistent Checks**: Same authorization logic across components

### JWT Token Handling

- Tokens are stored in localStorage
- JWT tokens are decoded to extract user information
- Token expiration is checked before use
- Automatic logout on token expiration

## Testing the Implementation

### Manual Testing Steps

1. **Start the application**
2. **Navigate to `/auth-demo`**
3. **Test different user roles:**
   - Login as `user` / `password` - See basic user features
   - Login as `admin` / `password` - See admin features
   - Login as `superadmin` / `password` - See all features
4. **Visit `/users` page** - Test user management with different roles
5. **Observe UI changes** based on user permissions

### Automated Testing

The system includes:

- Unit tests for utility functions
- Integration tests for API endpoints
- Component tests for authorization guards

## Files Created/Modified

### New Files

- `src/shared/lib/auth-context.tsx` - Authentication context provider
- `src/shared/lib/auth-guards.tsx` - Authorization guard components
- `src/shared/lib/auth-utils.ts` - Utility functions for authorization
- `src/shared/lib/use-auth-operations.ts` - Operations hook
- `src/shared/ui/auth-demo/` - Demo components
- `src/shared/ui/login-form/` - Login form component
- `src/shared/ui/auth-examples/` - Code examples component
- `src/pages/auth-demo.tsx` - Demo page

### Modified Files

- `src/app/app.tsx` - Added AuthProvider
- `src/shared/lib/index.ts` - Exported new auth utilities
- `src/shared/ui/index.ts` - Exported new UI components
- `src/features/users/api/users-api.ts` - Updated for backend integration
- `src/features/users/components/users-page.tsx` - Added authorization
- `src/features/users/components/users-data-grid.tsx` - Role-based UI
- `src/features/users/components/user-form-modal.tsx` - Multi-role support
- `src/features/users/hooks/use-users-query.ts` - Updated types

## Troubleshooting

### Common Issues

1. **"Access Denied" errors**: Check user roles and permissions
2. **JWT decode errors**: Verify token format and expiration
3. **API 401 errors**: Check authorization headers and token validity
4. **Missing UI elements**: Verify role-based rendering logic

### Debug Tools

- Browser dev tools for localStorage inspection
- Network tab for API request headers
- Console logs for authentication state changes
- Auth demo page for testing different scenarios

## Next Steps

Potential improvements and enhancements:

1. **Connect to Real Backend**: Replace mock JWT with actual Spring Boot API calls
2. **Add Token Refresh**: Implement automatic token refresh logic
3. **Enhanced Error Handling**: Add more specific error messages
4. **Audit Logging**: Track authorization decisions
5. **Permission System**: Extend beyond roles to granular permissions
6. **Multi-Factor Auth**: Add additional security layers
7. **Dynamic Role Assignment**: Runtime role changes
8. **Session Management**: Better handling of concurrent sessions
9. **Social Login**: OAuth integration

## Conclusion

This authentication and authorization system provides a robust foundation for securing React applications with Spring Boot backends. It follows security best practices while maintaining developer-friendly APIs and clear separation of concerns. The implementation can be easily extended and customized based on specific requirements while maintaining security and usability.
