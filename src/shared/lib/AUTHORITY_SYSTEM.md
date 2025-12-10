# Role-Based Access Control (RBAC) System

This document describes the implementation of the role-based access control system for billing operations in the IQ Scaffold application.

## Overview

The authority system provides fine-grained access control for billing operations, ensuring users can only perform actions appropriate to their authority level and tenant scope.

## Authority Levels

### TENANT_ADMIN

- **Scope**: Single tenant
- **Capabilities**: Full subscription and billing management within their tenant
- **Can Access**:
  - Subscription management (read, update, cancel, upgrade, downgrade)
  - Payment methods (CRUD operations)
  - Invoices (read, download, retry payment)
  - Usage metrics (read)

### PLATFORM_ADMIN

- **Scope**: Cross-tenant
- **Capabilities**: System-wide administrative access
- **Can Access**:
  - All tenant admin capabilities across all tenants
  - Revenue analytics and reporting
  - Tenant management
  - System health monitoring
  - Audit logs

### SUPPORT_AGENT

- **Scope**: Assigned tenants (with approval workflows)
- **Capabilities**: Customer assistance with limited modification rights
- **Can Access**:
  - Read-only subscription and billing data
  - Trial extensions (with approval)
  - Payment retry (with approval)
  - Refund processing (with approval, up to limits)

### BILLING_VIEWER

- **Scope**: Single tenant (read-only)
- **Capabilities**: View billing information and reports
- **Can Access**:
  - Read-only subscription data
  - Invoice viewing and download
  - Usage analytics
  - Billing reports

## Implementation Components

### Core Types

- `Authority` enum - Defines the four authority levels
- `SecurityContext` interface - Provides user and tenant context
- `AuthorityRule` interface - Defines access rules for resources and actions

### Security Guard Service

- `BillingSecurityGuard` class - Core access control logic
- `canAccess()` method - Validates authority for specific resource/action
- `filterData()` method - Filters data based on tenant scope
- `checkWidgetVisibility()` method - Determines widget visibility

### React Components

#### Guards

- `AuthorityGuard` - General authority-based component protection
- `TenantAdminGuard` - Tenant admin specific protection
- `PlatformAdminGuard` - Platform admin specific protection
- `SupportAgentGuard` - Support agent specific protection
- `BillingViewerGuard` - Billing viewer specific protection

#### Protected Actions

- `ProtectedActionButton` - Authority-protected action buttons
- `SubscriptionActions` - Pre-configured subscription action buttons
- `PaymentMethodActions` - Pre-configured payment method actions
- `InvoiceActions` - Pre-configured invoice actions

#### Route Protection

- `AuthorityProtectedRoute` - Route-level authority protection
- `TenantAdminRoute` - Tenant admin protected routes
- `PlatformAdminRoute` - Platform admin protected routes

#### Conditional Rendering

- `ConditionalWidget` - Authority-based widget rendering
- `withWidgetVisibility` - HOC for widget visibility
- `ProtectedWidgetContainer` - Container with authority checks

### Hooks

- `useAuthorities()` - Get current user authorities
- `useAuthorityGuard()` - Main authority checking hook
- `useAuthorizedActions()` - Get available actions for a resource
- `useWidgetVisibility()` - Check widget visibility
- `useAuthorizedData()` - Fetch and filter data based on authorities

## Usage Examples

### Basic Authority Guard

```tsx
import { AuthorityGuard, Authority } from "@/shared/ui";

<AuthorityGuard authorities={[Authority.TENANT_ADMIN]}>
  <SubscriptionManagementPanel />
</AuthorityGuard>;
```

### Protected Action Button

```tsx
import { ProtectedActionButton } from "@/shared/ui";

<ProtectedActionButton
  action="upgrade"
  resource="subscription"
  onClick={handleUpgrade}
>
  Upgrade Plan
</ProtectedActionButton>;
```

### Route Protection

```tsx
import { TenantAdminRoute } from "@/shared/ui";

<TenantAdminRoute>
  <BillingDashboard />
</TenantAdminRoute>;
```

### Conditional Widget

```tsx
import { ConditionalWidget } from "@/shared/ui";

<ConditionalWidget
  name="PaymentMethods"
  component={PaymentMethodsWidget}
  fallback={<Text>Payment methods not available</Text>}
/>;
```

### Authority Checking Hook

```tsx
import { useAuthorityGuard } from "@/shared/lib";

function MyComponent() {
  const { canAccess, hasAuthority } = useAuthorityGuard();

  const canUpgrade = canAccess("subscription", "upgrade");
  const isTenantAdmin = hasAuthority(Authority.TENANT_ADMIN);

  return (
    <div>
      {canUpgrade && <UpgradeButton />}
      {isTenantAdmin && <AdminPanel />}
    </div>
  );
}
```

## Security Features

### Audit Logging

All access attempts are logged with:

- User ID and tenant context
- Requested resource and action
- Success/failure status
- Timestamp and session information

### Data Filtering

- Automatic tenant scoping for tenant-level authorities
- Sensitive field filtering based on authority level
- Cross-tenant access only for platform admins

### Tenant Isolation

- Tenant admins can only access their tenant's data
- Support agents can only access assigned tenants
- Platform admins have cross-tenant access with full audit trail

## Configuration

### Authority Rules

Authority rules are defined in `AUTHORITY_RULES` array in `/shared/types/authority.ts`:

```typescript
{
  authority: Authority.TENANT_ADMIN,
  resource: "subscription",
  actions: ["read", "update", "cancel", "upgrade", "downgrade"],
  tenantScoped: true,
}
```

### Widget Visibility Matrix

Widget visibility is configured in `WIDGET_VISIBILITY_MATRIX`:

```typescript
'BillingOverview': [Authority.TENANT_ADMIN, Authority.PLATFORM_ADMIN],
'PaymentMethods': [Authority.TENANT_ADMIN],
'RevenueAnalytics': [Authority.PLATFORM_ADMIN, Authority.BILLING_VIEWER],
```

## Testing

The authority system includes comprehensive tests covering:

- Access control validation
- Data filtering and scoping
- Widget visibility rules
- Sensitive field filtering
- Component rendering based on authorities

Run tests with:

```bash
npm test -- security-guard.test.ts
```

## Integration with Existing Auth System

The authority system integrates with the existing authentication system by:

- Mapping existing roles to billing authorities in `useAuthorities()` hook
- Using existing user context and tenant information
- Leveraging existing JWT token validation
- Maintaining compatibility with current auth patterns

## Best Practices

1. **Always use guards**: Protect sensitive components with appropriate guards
2. **Check actions**: Use `useAuthorizedActions()` to determine available actions
3. **Filter data**: Use `useAuthorizedData()` for automatic data filtering
4. **Audit compliance**: All access attempts are automatically logged
5. **Fail secure**: Components are hidden by default if authority check fails
6. **Test thoroughly**: Write tests for authority-specific functionality

## Future Enhancements

- Dynamic authority assignment through admin interface
- Time-based authority restrictions
- IP-based access controls
- Multi-factor authentication for sensitive operations
- Advanced approval workflows for support agents
