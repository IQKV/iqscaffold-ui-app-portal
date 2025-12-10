/**
 * Authority Guard Components
 * React components for authority-based access control
 */

import React, { type ReactNode } from "react";
import { Alert, Text } from "@mantine/core";
import { IconLock } from "@tabler/icons-react";
import { Authority } from "@/shared/types/authority";
import { useAuthorityGuard } from "@/shared/lib/use-authority";

interface AuthorityGuardProps {
  children: ReactNode;
  authorities: Authority[];
  requireAll?: boolean;
  fallback?: ReactNode;
  hideOnUnauthorized?: boolean;
}

const DefaultUnauthorizedFallback = ({ message }: { message: string }) => (
  <Alert
    variant="light"
    color="red"
    title="Access Denied"
    icon={<IconLock size={16} />}
  >
    <Text size="sm">{message}</Text>
  </Alert>
);

/**
 * Authority Guard Component
 * Controls access based on user authorities
 */
export function AuthorityGuard({
  children,
  authorities: requiredAuthorities,
  requireAll = false,
  fallback,
  hideOnUnauthorized = false,
}: AuthorityGuardProps) {
  const { hasAnyAuthority, hasAllAuthorities } = useAuthorityGuard();

  const hasAccess = requireAll
    ? hasAllAuthorities(requiredAuthorities)
    : hasAnyAuthority(requiredAuthorities);

  if (!hasAccess) {
    if (hideOnUnauthorized) return null;

    return (
      fallback || (
        <DefaultUnauthorizedFallback
          message={`You need ${requireAll ? "all of these" : "one of these"} authorities: ${requiredAuthorities.join(", ")}`}
        />
      )
    );
  }

  return <>{children}</>;
}

/**
 * Resource Action Guard
 * Controls access to specific resource actions
 */
interface ResourceActionGuardProps {
  children: ReactNode;
  resource: string;
  action: string;
  fallback?: ReactNode;
  hideOnUnauthorized?: boolean;
}

export function ResourceActionGuard({
  children,
  resource,
  action,
  fallback,
  hideOnUnauthorized = false,
}: ResourceActionGuardProps) {
  const { canAccess } = useAuthorityGuard();

  const hasAccess = canAccess(resource, action);

  if (!hasAccess) {
    if (hideOnUnauthorized) return null;

    return (
      fallback || (
        <DefaultUnauthorizedFallback
          message={`You don't have permission to ${action} ${resource}`}
        />
      )
    );
  }

  return <>{children}</>;
}

/**
 * Tenant Admin Guard
 * Restricts access to tenant administrators only
 */
export function TenantAdminGuard({
  children,
  fallback,
  hideOnUnauthorized = false,
}: {
  children: ReactNode;
  fallback?: ReactNode;
  hideOnUnauthorized?: boolean;
}) {
  return (
    <AuthorityGuard
      authorities={[Authority.TENANT_ADMIN]}
      fallback={fallback}
      hideOnUnauthorized={hideOnUnauthorized}
    >
      {children}
    </AuthorityGuard>
  );
}

/**
 * Platform Admin Guard
 * Restricts access to platform administrators only
 */
export function PlatformAdminGuard({
  children,
  fallback,
  hideOnUnauthorized = false,
}: {
  children: ReactNode;
  fallback?: ReactNode;
  hideOnUnauthorized?: boolean;
}) {
  return (
    <AuthorityGuard
      authorities={[Authority.PLATFORM_ADMIN]}
      fallback={fallback}
      hideOnUnauthorized={hideOnUnauthorized}
    >
      {children}
    </AuthorityGuard>
  );
}

/**
 * Support Agent Guard
 * Restricts access to support agents and platform admins
 */
export function SupportAgentGuard({
  children,
  fallback,
  hideOnUnauthorized = false,
}: {
  children: ReactNode;
  fallback?: ReactNode;
  hideOnUnauthorized?: boolean;
}) {
  return (
    <AuthorityGuard
      authorities={[Authority.SUPPORT_AGENT, Authority.PLATFORM_ADMIN]}
      fallback={fallback}
      hideOnUnauthorized={hideOnUnauthorized}
    >
      {children}
    </AuthorityGuard>
  );
}

/**
 * Billing Viewer Guard
 * Restricts access to billing viewers and higher authorities
 */
export function BillingViewerGuard({
  children,
  fallback,
  hideOnUnauthorized = false,
}: {
  children: ReactNode;
  fallback?: ReactNode;
  hideOnUnauthorized?: boolean;
}) {
  return (
    <AuthorityGuard
      authorities={[
        Authority.BILLING_VIEWER,
        Authority.TENANT_ADMIN,
        Authority.PLATFORM_ADMIN,
      ]}
      fallback={fallback}
      hideOnUnauthorized={hideOnUnauthorized}
    >
      {children}
    </AuthorityGuard>
  );
}
