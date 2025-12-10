/**
 * Authority Protected Route Component
 * Route-level protection based on user authorities
 */

import React, { useEffect, type ReactNode } from "react";
import { useAuth } from "@/processes/auth";
import { Authority } from "@/shared/types/authority";
import { useAuthorityGuard } from "@/shared/lib/use-authority";
import { LoadingOverlay } from "@/shared/ui/loading-overlay";
import { Alert, Text, Button, Stack } from "@mantine/core";
import { IconLock, IconHome } from "@tabler/icons-react";

interface AuthorityProtectedRouteProps {
  children: ReactNode;
  authorities: Authority[];
  requireAll?: boolean;
  fallback?: ReactNode;
  redirectTo?: string;
}

const UnauthorizedPage = ({
  authorities,
  requireAll = false,
  redirectTo,
}: {
  authorities: Authority[];
  requireAll?: boolean;
  redirectTo?: string;
}) => (
  <div className="flex items-center justify-center min-h-[400px]">
    <Stack align="center" gap="md">
      <Alert
        variant="light"
        color="red"
        title="Access Denied"
        icon={<IconLock size={24} />}
        style={{ maxWidth: 500 }}
      >
        <Text size="sm" mb="md">
          You need {requireAll ? "all of these" : "one of these"} authorities to
          access this page:
        </Text>
        <Text size="sm" fw={500} mb="md">
          {authorities.join(", ")}
        </Text>
        <Text size="sm" c="dimmed">
          Please contact your administrator if you believe you should have
          access to this page.
        </Text>
      </Alert>

      {redirectTo && (
        <Button
          leftSection={<IconHome size={16} />}
          variant="light"
          onClick={() => (window.location.href = redirectTo)}
        >
          Return to Dashboard
        </Button>
      )}
    </Stack>
  </div>
);

/**
 * Authority Protected Route
 * Protects routes based on user authorities
 */
export function AuthorityProtectedRoute({
  children,
  authorities: requiredAuthorities,
  requireAll = false,
  fallback,
  redirectTo = "/dashboard",
}: AuthorityProtectedRouteProps) {
  const { isAuthenticated, isLoading } = useAuth();
  const { hasAnyAuthority, hasAllAuthorities } = useAuthorityGuard();

  // First check authentication
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      // Redirect to auth if not authenticated
      const config = {
        domains: {
          auth: process.env.VITE_AUTH_DOMAIN || "http://localhost:3001",
        },
      };
      const currentUrl = window.location.href;
      window.location.href = `${config.domains.auth}/login?returnTo=${encodeURIComponent(currentUrl)}`;
    }
  }, [isAuthenticated, isLoading]);

  if (isLoading) {
    return <LoadingOverlay visible />;
  }

  if (!isAuthenticated) {
    return null;
  }

  // Check authorities
  const hasAccess = requireAll
    ? hasAllAuthorities(requiredAuthorities)
    : hasAnyAuthority(requiredAuthorities);

  if (!hasAccess) {
    return (
      fallback || (
        <UnauthorizedPage
          authorities={requiredAuthorities}
          requireAll={requireAll}
          redirectTo={redirectTo}
        />
      )
    );
  }

  return <>{children}</>;
}

/**
 * Tenant Admin Protected Route
 */
export function TenantAdminRoute({
  children,
  fallback,
  redirectTo,
}: {
  children: ReactNode;
  fallback?: ReactNode;
  redirectTo?: string;
}) {
  return (
    <AuthorityProtectedRoute
      authorities={[Authority.TENANT_ADMIN]}
      fallback={fallback}
      redirectTo={redirectTo}
    >
      {children}
    </AuthorityProtectedRoute>
  );
}

/**
 * Platform Admin Protected Route
 */
export function PlatformAdminRoute({
  children,
  fallback,
  redirectTo,
}: {
  children: ReactNode;
  fallback?: ReactNode;
  redirectTo?: string;
}) {
  return (
    <AuthorityProtectedRoute
      authorities={[Authority.PLATFORM_ADMIN]}
      fallback={fallback}
      redirectTo={redirectTo}
    >
      {children}
    </AuthorityProtectedRoute>
  );
}

/**
 * Support Agent Protected Route
 */
export function SupportAgentRoute({
  children,
  fallback,
  redirectTo,
}: {
  children: ReactNode;
  fallback?: ReactNode;
  redirectTo?: string;
}) {
  return (
    <AuthorityProtectedRoute
      authorities={[Authority.SUPPORT_AGENT, Authority.PLATFORM_ADMIN]}
      fallback={fallback}
      redirectTo={redirectTo}
    >
      {children}
    </AuthorityProtectedRoute>
  );
}

/**
 * Billing Viewer Protected Route
 */
export function BillingViewerRoute({
  children,
  fallback,
  redirectTo,
}: {
  children: ReactNode;
  fallback?: ReactNode;
  redirectTo?: string;
}) {
  return (
    <AuthorityProtectedRoute
      authorities={[
        Authority.BILLING_VIEWER,
        Authority.TENANT_ADMIN,
        Authority.PLATFORM_ADMIN,
      ]}
      fallback={fallback}
      redirectTo={redirectTo}
    >
      {children}
    </AuthorityProtectedRoute>
  );
}
