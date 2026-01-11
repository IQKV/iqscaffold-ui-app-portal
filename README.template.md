# 🚀 IQ Scaffold Application Portal

> Web application providing authenticated user experience, user management, dashboard analytics, and security settings with integration to the IQ Scaffold Platform. Reference implementation and starting point for developing microservices frontends for SaaS applications.

## Business Purpose

An application portal that demonstrates:

- **Dashboard & Analytics** - Metrics and statistics visualization
- **User Management** - User CRUD operations with role-based access control
- **Security Management** - Password change, session management, and multi-device logout
- **Email Verification** - Email status checking and verification workflow
- **Profile Management** - User profile and account settings
- **Multi-Language Support** - Internationalization with Lingui
- **Billing & Payments** - Stripe integration for modern payment processing
- **Merchant Ecosystem** - Stripe Connect onboarding for marketplace/multi-tenant sellers
- **SaaS Frontend Patterns** - Patterns for building multi-tenant SaaS frontends

Reference implementation for building microservices-based SaaS applications, demonstrating frontend architecture, authentication integration, and common application patterns.

## Overview

Main application frontend for the IQ Scaffold Platform. Provides user interface for authenticated users, integrating with the User Service and Gateway for identity management, authorization, and business operations.

Starting point for microservices frontend development, demonstrating scalable SaaS applications with separation of concerns, reusable patterns, and backend microservices integration.

## What It Demonstrates

### 🎨 Modern Frontend Architecture

- Feature-Sliced Design (FSD) methodology for scalable architecture
- React 19 with concurrent features and improved performance
- TypeScript strict mode for enhanced type safety
- Vite 7 for lightning-fast development and optimized builds
- TanStack Router for type-safe routing with code splitting

### 🔐 Authentication & Authorization

- JWT-based authentication with automatic token refresh
- Route protection with declarative guards (AuthGuard, UserManagementGuard)
- Role-based access control (RBAC) for admin features
- Permission-based access control for granular operations
- Session management across multiple devices
- Secure token storage and lifecycle management

### 📊 Data Management

- TanStack Query for server state synchronization and caching
- Optimistic updates for improved user experience
- Automatic cache invalidation and refetching
- Query key management for efficient data fetching
- Pagination and search with backend integration
- Real-time data updates with query invalidation

### 🎯 User Management

- User listing with pagination and search
- User creation with role assignment
- User editing with validation
- User deletion with confirmation
- Email verification status tracking
- Role-based access control enforcement

### 🛡️ Security Features

- Password change with current password validation
- Multi-device session management
- Logout from all devices functionality
- Security settings dashboard
- Account security recommendations
- Audit trail awareness

### 🎨 UI Components

- Mantine UI component library
- Responsive design for all device sizes
- Dark mode support with theme switching
- Accessible components (WCAG 2.1 AA compliance)
- Loading states and error handling
- Toast notifications for user feedback

### 📈 Dashboard & Analytics

- Statistics cards with trend indicators
- Real-time metrics visualization
- Business KPIs display (users, orders, revenue, growth)
- Responsive grid layout
- Icon-based visual indicators
- Percentage change tracking

### 💳 Billing & Payments

- Theme-aware Stripe Elements integration
- Flexible checkout supporting 20+ payment methods
- Merchant onboarding with Stripe Connect status tracking
- Paginated billing history with administrative refunds
- Locale-aware currency formatting at scale

### 🌍 Internationalization

- Lingui framework with macro support
- Message extraction and compilation
- Pluralization and formatting
- Language switching without page reload
- Translation-ready component architecture

### 🧪 Testing & Quality

- Vitest for unit and integration testing
- Playwright for end-to-end testing with UI mode
- Mock Service Worker for API mocking
- Testing Library for component testing
- Storybook for component development and documentation
- Coverage reporting and CI integration

### 🔍 Code Quality

- ESLint 9 with flat config and React rules
- Prettier for consistent code formatting
- Stylelint for CSS/SCSS linting
- Husky for pre-commit validation
- Commitlint for conventional commits
- Knip for dead code elimination

## Architecture Patterns

### Feature-Sliced Design Structure

```
src/
├── app/              # Application initialization and configuration
├── processes/        # Complex business processes (auth flow)
├── pages/            # Route pages and layouts
├── widgets/          # Composite UI blocks (header, sidebar)
├── features/         # User interactions (dashboard, users, security)
├── entities/         # Business entities (user, form models)
├── shared/           # Reusable infrastructure (API, UI, utils)
└── types/            # Global type definitions
```

### Authentication Process Layer

- Centralized auth state management with Zustand
- Token lifecycle management (validation, refresh, expiration)
- Route guards for protected pages (AuthGuard, UserManagementGuard)
- User context selectors and utilities
- Side effects management (token refresh, storage sync)
- HTTP interceptors for request/response handling

### API Integration Layer

- Axios-based HTTP client with interceptors
- Type-safe API contracts with TypeScript
- Error handling with standardized responses
- Request/response transformation
- Authorization header injection
- Tenant ID propagation

### State Management Strategy

- Server state with TanStack Query (users, dashboard data)
- Client state with Zustand (auth, UI preferences)
- URL state with nuqs (search params, filters)
- Form state with React Hook Form (user forms, settings)
- Immutable updates with Immer

## Technical Highlights

### Performance Optimization

- Code splitting with TanStack Router
- Lazy loading for route components
- Bundle size optimization with Vite
- Tree shaking for unused code elimination
- Image optimization in production builds
- Console statement removal in production

### Security Features

- JWT token validation and expiration checking
- Secure token storage with localStorage
- XSS prevention with input sanitization
- CSRF protection via token-based auth
- Role-based route protection
- Permission-based UI rendering

### Developer Experience

- Hot Module Replacement for instant updates
- TypeScript strict mode for type safety
- Comprehensive ESLint rules for code quality
- Prettier integration for consistent formatting
- Storybook for component development
- DevTools for debugging (React Query, Router)

### Operational Features

- Docker containerization with multi-stage builds
- Environment-specific configuration via .env
- Health checks and monitoring readiness
- Structured logging for production
- CI/CD integration with GitHub Actions
- Automated dependency updates with Dependabot

## Use Cases Implemented

### Dashboard & Analytics

- Statistics overview with key metrics
- Trend indicators (positive/negative changes)
- Real-time data visualization
- Business KPIs display
- Responsive grid layout
- Icon-based visual indicators

### User Management (Admin)

- User listing with pagination (page, limit)
- User search by username, email, or name
- User creation with role assignment
- User editing with validation
- User deletion with confirmation
- Email verification status display
- Role-based access control enforcement

### 💳 Billing & Payments

- Stripe checkout flow with client-side validation
- Modern PaymentElement integration for various methods
- Theme-aware appearance (Light/Dark mode sync)
- Paginated billing history with status visualization
- Administrative payment refund workflow
- Multi-currency support with locale intelligence

### 🏦 Merchant Onboarding

- Stripe Connect account link generation
- Automated redirect to onboarding portal
- Onboarding completeness status tracking
- Direct access to Stripe Dashboard for configured accounts
- Environment-specific return/refresh URL handling

### Security Management

- Password change with validation
- Current password verification
- Password strength requirements
- Multi-device session management
- Logout from all devices
- Security recommendations display

### Email Verification

- Email verification status checking
- Verification workflow integration
- Resend verification email
- Email verification confirmation
- Status display in user profile

### Profile Management

- Current user profile display
- User information viewing
- Account settings access
- Role and permission display
- Tenant information display

### Route Protection

- Public routes (redirected to auth portal)
- Protected routes (requires authentication)
- Admin routes (requires ADMIN/SUPER_ADMIN role)
- Permission-based routes (requires specific permissions)
- Automatic redirect for unauthorized access
- Email verification requirement enforcement

## API Integration

### Backend Endpoints

The application integrates with the User Service API:

**Authentication Endpoints:**

- `POST /api/v1/auth/login` - Authenticate user
- `POST /api/v1/auth/signup` - Register new user
- `POST /api/v1/auth/refresh` - Refresh access token
- `POST /api/v1/auth/logout` - Logout current session
- `POST /api/v1/auth/logout-all` - Logout all sessions
- `POST /api/v1/auth/validate` - Validate JWT token
- `POST /api/v1/auth/password/forgot` - Request password reset
- `POST /api/v1/auth/password/reset` - Reset password with token
- `POST /api/v1/auth/email/verify` - Verify email with token
- `POST /api/v1/auth/email/resend` - Resend verification email
- `GET /api/v1/auth/email/status` - Get email verification status

**User Endpoints:**

- `PATCH /api/v1/users/me/password` - Change password for authenticated user
- `GET /api/v1/users/me/preferences` - Get current user's preferences
- `PATCH /api/v1/users/me/preferences` - Update current user's preferences
- `DELETE /api/v1/users/me/preferences` - Delete current user's preferences

**User Management Endpoints (Requires ADMIN/SUPER_ADMIN Role):**

- `GET /api/v1/admin/users` - List users with pagination and search
- `GET /api/v1/admin/users/{id}` - Get user by ID
- `POST /api/v1/admin/users` - Create new user
- `PUT /api/v1/admin/users/{id}` - Update user
- `DELETE /api/v1/admin/users/{id}` - Delete user

**Organization Management Endpoints (Requires ADMIN/SUPER_ADMIN Role):**

- `GET /api/v1/admin/organizations` - List organizations with pagination
- `GET /api/v1/admin/organizations/{id}` - Get organization by ID
- `POST /api/v1/admin/organizations` - Create organization (SUPER_ADMIN only)
- `PUT /api/v1/admin/organizations/{id}` - Update organization
- `DELETE /api/v1/admin/organizations/{id}` - Delete organization (SUPER_ADMIN only)
- `GET /api/v1/admin/organizations/tenant/{tenantId}` - Get organization by tenant ID (SUPER_ADMIN only)

**Tenant Management Endpoints (Requires SUPER_ADMIN Role):**

- `GET /api/v1/admin/tenants` - Get all tenants
- `GET /api/v1/admin/tenants/{tenantId}` - Get tenant by ID
- `POST /api/v1/admin/tenants` - Create new tenant
- `PUT /api/v1/admin/tenants/{tenantId}` - Update tenant
- `PATCH /api/v1/admin/tenants/{tenantId}/enabled` - Enable or disable tenant
- `DELETE /api/v1/admin/tenants/{tenantId}` - Delete tenant
- `GET /api/v1/admin/tenants/statistics` - Get tenant statistics

**Billing & Payment Endpoints:**

- `POST /api/v1/billing/payments/intent` - Create Stripe Payment Intent
- `GET /api/v1/billing/payments` - List payments with pagination
- `GET /api/v1/billing/payments/{id}` - Get payment details
- `POST /api/v1/billing/payments/{id}/refund` - Refund payment
- `GET /api/v1/billing/payouts` - List payouts with pagination
- `GET /api/v1/billing/payouts/{id}` - Get payout details

**Merchant & Gateway Configuration Endpoints (Requires ADMIN Role):**

- `POST /api/v1/admin/billing/merchants/onboard` - Initiate Stripe Connect onboarding
- `GET /api/v1/admin/billing/merchants/status/{organizationId}` - Get merchant onboarding status
- `POST /api/v1/admin/billing/gateway-config` - Create gateway configuration
- `GET /api/v1/admin/billing/gateway-config` - List all gateway configurations
- `GET /api/v1/admin/billing/gateway-config/active` - List active gateway configurations
- `GET /api/v1/admin/billing/gateway-config/primary` - Get primary gateway configuration
- `GET /api/v1/admin/billing/gateway-config/{provider}` - Get gateway configuration by provider
- `PUT /api/v1/admin/billing/gateway-config/{provider}` - Update gateway configuration
- `DELETE /api/v1/admin/billing/gateway-config/{provider}` - Delete gateway configuration
- `POST /api/v1/admin/billing/gateway-config/{provider}/activate` - Activate gateway
- `POST /api/v1/admin/billing/gateway-config/{provider}/deactivate` - Deactivate gateway
- `POST /api/v1/admin/billing/gateway-config/{provider}/set-primary` - Set primary gateway

### Configuration

Environment variables for API integration:

- `VITE_API_URL_SERVER` - Backend API base URL (User Service)
- `VITE_AUTH_DOMAIN_AUTH` - Auth portal domain for login redirect
- `VITE_AUTH_DOMAIN_APP` - Main application domain
- `VITE_AUTH_REDIRECT_AFTER_LOGIN` - Post-login redirect URL (default: /dashboard)
- `VITE_AUTH_REDIRECT_AFTER_LOGOUT` - Post-logout redirect URL (default: /)
- `VITE_ENABLE_MSW` - Enable Mock Service Worker for development
- `VITE_STRIPE_PUBLIC_KEY` - Stripe publishable key for frontend elements
- `VITE_LOG_LEVEL` - Console logging verbosity (silent/info/debug)

## Learning Points

This implementation serves as a reference for:

- Building modern web applications with React and TypeScript
- Implementing Feature-Sliced Design for scalable architecture
- Managing authentication and authorization in SPAs
- Handling JWT token lifecycle and refresh patterns
- Creating admin interfaces with CRUD operations
- Implementing role-based and permission-based access control
- Using TanStack Query for server state management
- Building accessible and responsive UI with Mantine
- Implementing internationalization with Lingui
- Testing frontend applications with Vitest and Playwright
- Integrating with RESTful APIs and microservices
- Managing environment-specific configuration

## Starting Point for SaaS Frontend Development

Starting point for building microservices frontends for SaaS applications:

### Foundation for SaaS Applications

- **Multi-Tenant Architecture** - Tenant context propagation and isolation patterns
- **Authentication Integration** - Seamless integration with centralized auth services
- **Role-Based Access Control** - Admin, user, and custom role management
- **Billing & Payments** - Production-ready Stripe integration with Connect support
- **Scalable Architecture** - Feature-Sliced Design for growing codebases

### Reusable Patterns for Microservices

- **API Integration Layer** - Type-safe communication with backend microservices
- **State Management** - Server state (TanStack Query) and client state (Zustand) patterns
- **Route Protection** - Declarative guards for authentication and authorization
- **Error Handling** - Consistent error handling across all features
- **Loading States** - Optimistic updates and loading indicators

### Common SaaS Features

- **User Management** - CRUD operations for user administration
- **Dashboard Analytics** - Metrics visualization and KPI tracking
- **Security Settings** - Password management and session control
- **Profile Management** - User profile and account settings
- **Email Verification** - Email verification workflow integration

## Adapting for Your Domain

Patterns applicable to various SaaS scenarios:

### SaaS Application Types

- Multi-tenant B2B SaaS platforms
- Enterprise management consoles
- Customer relationship management (CRM)
- Project management tools
- Analytics and reporting platforms
- E-commerce admin panels

### Extending the Foundation

- Add subscription and billing features (Stripe integration ready)
- Implement team and organization management
- Add domain-specific business features
- Integrate with additional microservices
- Customize dashboard with domain metrics
- Add notification and messaging systems

### Architecture Benefits

- Feature-Sliced Design for scalable codebases
- State management patterns (server/client/URL/form)
- API integration strategies with type safety
- Testing and quality assurance setup
- CI/CD pipeline configuration
- Docker containerization for deployment

Patterns apply to SaaS applications requiring web frontends with authentication, authorization, user management, and microservices integration.

## Integration with Backend Services

### User Service Integration

The application communicates with the User Service for all operations:

```typescript
// Fetch users with pagination
const { data, isLoading } = useUsersQuery({
  page: 1,
  limit: 10,
  search: "john",
});

// Create new user
const createMutation = useCreateUserMutation();
createMutation.mutate({
  username: "john.doe",
  email: "john.doe@example.com",
  password: "SecurePass123!",
  firstName: "John",
  lastName: "Doe",
  roles: ["USER"],
});
```

### Gateway Integration

Requests to protected endpoints include JWT tokens and tenant ID:

```typescript
// Automatic token and tenant injection via interceptor
axios.interceptors.request.use((config) => {
  const token = tokenManager.getAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
    config.headers["X-Tenant-ID"] = "default";
  }
  return config;
});
```

### Auth Portal Integration

Unauthenticated users are redirected to the auth portal:

```typescript
// Redirect to auth portal for login
if (!isAuthenticated) {
  window.location.href = `${config.authDomain}/login`;
}

// Receive user after successful login from auth portal
// Auth portal redirects to app with session established
```

### Token Refresh Flow

Automatic token refresh before expiration:

```typescript
// Monitor token expiration and refresh
useEffect(() => {
  const interval = setInterval(() => {
    if (isTokenExpiringSoon()) {
      refreshTokens();
    }
  }, 60000); // Check every minute

  return () => clearInterval(interval);
}, []);
```

### Query Cache Management

Efficient data fetching with TanStack Query:

```typescript
// Query keys for cache management
const usersKeys = {
  all: ["users"],
  lists: () => [...usersKeys.all, "list"],
  list: (params) => [...usersKeys.lists(), params],
  details: () => [...usersKeys.all, "detail"],
  detail: (id) => [...usersKeys.details(), id],
};

// Automatic cache invalidation after mutations
onSuccess: () => {
  queryClient.invalidateQueries({ queryKey: usersKeys.lists() });
};
```

---

**Use this as a blueprint** for building web applications with React, TypeScript, and Feature-Sliced Design. Demonstrates patterns for authentication, authorization, user management, dashboard analytics, and microservices integration.
