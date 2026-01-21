# 🚀 IQ Scaffold Application Portal

> Web application providing authenticated user experience, user management, dashboard analytics, and security settings with integration to the IQ Scaffold Platform. Reference implementation and starting point for developing microservices frontends for SaaS applications.

## Table of Contents

- [Business Purpose](#business-purpose)
- [Overview](#overview)
- [Use Cases Implemented](#use-cases-implemented)
- [Configuration](#configuration)
- [What It Demonstrates](#what-it-demonstrates)
- [Architecture Patterns](#architecture-patterns)
- [Technical Highlights](#technical-highlights)
- [Learning Points](#learning-points)
- [Starting Point for SaaS Frontend Development](#starting-point-for-saas-frontend-development)
- [Adapting for Your Domain](#adapting-for-your-domain)
- [Integration with Backend Services](#integration-with-backend-services)

## Business Purpose

An application portal that demonstrates:

- **Feature-Gated Dashboard** - Subscription-based feature access with usage tracking and analytics
- **User Management** - Complete user CRUD operations with role-based access control
- **Security Management** - Password change, session management, and multi-device logout
- **Email Verification** - Email status checking and verification workflow
- **Subscription Management** - Plan selection, billing cycles, and subscription lifecycle
- **Payment Processing** - Stripe checkout with multiple payment methods and refund capabilities
- **Invoice Management** - Automated invoice generation, viewing, and download functionality
- **Gateway Configuration** - Multi-provider payment gateway setup and management
- **Merchant Onboarding** - Stripe Connect integration for marketplace sellers
- **CRM System** - Complete lead management, contact tracking, and sales pipeline
- **Multi-Language Support** - Internationalization with Lingui framework
- **User Preferences** - Theme switching, locale settings, and personalization
- **SaaS Frontend Patterns** - Patterns for building scalable multi-tenant SaaS applications

Reference implementation for building microservices-based SaaS applications, demonstrating modern frontend architecture, subscription management, payment processing, and CRM functionality.

## Overview

Main application frontend for the IQ Scaffold Platform. Provides user interface for authenticated users, integrating with the User Service and Gateway for identity management, authorization, and business operations.

Starting point for microservices frontend development, demonstrating scalable SaaS applications with separation of concerns, reusable patterns, and backend microservices integration.

## Use Cases Implemented

### Feature-Gated Dashboard & Analytics

- Subscription-based feature access control with FeatureGate components
- Feature usage tracking and quota management
- Subscription information display with upgrade prompts
- Enabled features listing with dynamic access control
- Business metrics visualization with responsive grid layout
- Real-time feature availability based on subscription tier

### User Management (Admin)

- User listing with pagination, search, and filtering
- User creation with role assignment and validation
- User editing with comprehensive form validation
- User deletion with confirmation dialogs
- Email verification status tracking and management
- Role-based access control enforcement (USER, ADMIN, SUPER_ADMIN)
- Bulk user operations and administrative controls

### 💳 Subscription Management

- Subscription plan selection with feature comparison
- Active subscription display with billing cycle information
- Plan upgrade/downgrade workflow with prorated billing
- Subscription cancellation and renewal management
- Feature usage monitoring against subscription limits
- Billing history integration with subscription events

### 💰 Payment Processing & Billing

- Stripe checkout flow with PaymentElement integration
- Multi-payment method support (cards, wallets, bank transfers)
- Theme-aware payment UI (Light/Dark mode synchronization)
- Payment intent creation and confirmation workflow
- Paginated billing history with transaction details
- Administrative payment refund capabilities
- Multi-currency support with locale-aware formatting

### 📄 Invoice Management

- Automated invoice generation for subscriptions and payments
- Invoice listing with status tracking (draft, sent, paid, overdue)
- PDF invoice download and email delivery
- Invoice search and filtering by date, status, and amount
- Payment reconciliation with invoice matching
- Tax calculation and compliance features

### 🏦 Payment Gateway Configuration

- Multi-provider gateway setup (Stripe, PayPal, Square)
- Gateway activation/deactivation controls
- Primary gateway selection for payment routing
- Configuration validation and testing tools
- Environment-specific gateway management
- Administrative access controls for gateway settings

### 🤝 Merchant Onboarding

- Stripe Connect account creation and linking
- Onboarding progress tracking with completion status
- Direct access to Stripe Dashboard for merchants
- Return URL handling for onboarding completion
- Merchant verification status monitoring
- Multi-organization merchant management

### 📊 CRM System

- **Lead Management**: Complete lead lifecycle from creation to conversion
- **Contact Management**: Customer contact database with interaction history
- **Sales Pipeline**: Visual Kanban-style pipeline with drag-and-drop functionality
- **CRM Dashboard**: Analytics and metrics for sales performance
- **Follow-up Management**: Automated follow-up scheduling and tracking
- **Lead Conversion**: Conversion tracking and analytics
- **Activity Logging**: Comprehensive interaction and communication history

### Security Management

- Password change with current password validation
- Password strength requirements and validation
- Multi-device session management and monitoring
- Logout from all devices functionality
- Security settings dashboard with recommendations
- Account security audit trail

### Email Verification

- Email verification status checking and display
- Verification workflow integration with backend
- Resend verification email functionality
- Email verification confirmation handling
- Status display in user profiles and admin panels
- Automated verification reminders

### User Preferences & Personalization

- Theme switching (Light/Dark mode) with system preference detection
- Locale selection with real-time language switching
- User preference persistence across sessions
- Quick theme switcher in navigation
- Personalized dashboard layouts
- Accessibility preferences and settings

### Route Protection & Access Control

- Public routes with automatic auth portal redirection
- Protected routes requiring authentication
- Admin routes requiring ADMIN/SUPER_ADMIN roles
- Permission-based routes for granular access control
- Feature-gated routes based on subscription tier
- Email verification requirement enforcement
- Automatic redirect handling for unauthorized access

### Internationalization

- Multi-language support with Lingui framework
- Message extraction and compilation workflow
- Pluralization and number formatting
- Date and currency localization
- Language switching without page reload
- Translation-ready component architecture

## Configuration

Environment variables for API integration:

- `VITE_API_URL_SERVER` - Backend API base URL (User Service)
- `VITE_AUTH_DOMAIN_AUTH` - Auth portal domain for login redirect
- `VITE_AUTH_DOMAIN_APP` - Main application domain
- `VITE_AUTH_REDIRECT_AFTER_LOGIN` - Post-login redirect URL (default: /dashboard)
- `VITE_AUTH_REDIRECT_AFTER_LOGOUT` - Post-logout redirect URL (default: /)
- `VITE_ENABLE_MSW` - Enable Mock Service Worker for development
- `VITE_STRIPE_PUBLIC_KEY` - Stripe publishable key for frontend elements
- `VITE_LOG_LEVEL` - Console logging verbosity (silent/info/debug)

## What It Demonstrates

### Modern Frontend Architecture

- Feature-Sliced Design (FSD) methodology for scalable architecture
- React 19 with concurrent features and improved performance
- TypeScript strict mode for enhanced type safety
- Vite 7 for lightning-fast development and optimized builds
- TanStack Router for type-safe routing with code splitting

### Authentication & Authorization

- JWT-based authentication with automatic token refresh
- Route protection with declarative guards (AuthGuard, UserManagementGuard)
- Role-based access control (RBAC) for admin features
- Permission-based access control for granular operations
- Session management across multiple devices
- Secure token storage and lifecycle management

### Data Management

- TanStack Query for server state synchronization and caching
- Optimistic updates for improved user experience
- Automatic cache invalidation and refetching
- Query key management for efficient data fetching
- Pagination and search with backend integration
- Real-time data updates with query invalidation

### User Management

- User listing with pagination and search
- User creation with role assignment
- User editing with validation
- User deletion with confirmation
- Email verification status tracking
- Role-based access control enforcement

### Security Features

- Password change with current password validation
- Multi-device session management
- Logout from all devices functionality
- Security settings dashboard
- Account security recommendations
- Audit trail awareness

### UI Components

- Mantine UI component library
- Responsive design for all device sizes
- Dark mode support with theme switching
- Accessible components (WCAG 2.1 AA compliance)
- Loading states and error handling
- Toast notifications for user feedback

### Dashboard & Analytics

- Statistics cards with trend indicators
- Real-time metrics visualization
- Business KPIs display (users, orders, revenue, growth)
- Responsive grid layout
- Icon-based visual indicators
- Percentage change tracking

### Billing & Payments

- Theme-aware Stripe Elements integration
- Flexible checkout supporting 20+ payment methods
- Merchant onboarding with Stripe Connect status tracking
- Paginated billing history with administrative refunds
- Locale-aware currency formatting at scale

### Internationalization

- Lingui framework with macro support
- Message extraction and compilation
- Pluralization and formatting
- Language switching without page reload
- Translation-ready component architecture

### Testing & Quality

- Vitest for unit and integration testing
- Playwright for end-to-end testing with UI mode
- Mock Service Worker for API mocking
- Testing Library for component testing
- Storybook for component development and documentation
- Coverage reporting and CI integration

### Code Quality

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
