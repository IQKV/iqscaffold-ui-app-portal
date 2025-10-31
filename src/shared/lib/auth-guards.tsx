import React, { ReactNode } from "react";
import { useAuth } from "./use-auth-hook";
import { Alert, Text } from "@mantine/core";
import { IconLock } from "@tabler/icons-react";

interface AuthGuardProps {
  children: ReactNode;
  fallback?: ReactNode;
}

interface RoleGuardProps extends AuthGuardProps {
  roles: string | string[];
  requireAll?: boolean;
}

interface PermissionGuardProps extends AuthGuardProps {
  permissions: string | string[];
  requireAll?: boolean;
}

/**
 * Default fallback component for unauthorized access
 */
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
 * Guard component that checks if user has required roles
 */
export function RoleGuard({
  children,
  roles,
  requireAll = false,
  fallback,
}: RoleGuardProps) {
  const { hasRole, hasAnyRole, hasAllRoles } = useAuth();

  const roleArray = Array.isArray(roles) ? roles : [roles];
  const hasAccess = requireAll ? hasAllRoles(roleArray) : hasAnyRole(roleArray);

  if (!hasAccess) {
    return (
      fallback || (
        <DefaultUnauthorizedFallback
          message={`You need ${requireAll ? "all of these" : "one of these"} roles: ${roleArray.join(", ")}`}
        />
      )
    );
  }

  return <>{children}</>;
}

/**
 * Guard component that checks if user has required permissions
 */
export function PermissionGuard({
  children,
  permissions,
  requireAll = false,
  fallback,
}: PermissionGuardProps) {
  const { hasPermission } = useAuth();

  const permissionArray = Array.isArray(permissions)
    ? permissions
    : [permissions];
  const hasAccess = requireAll
    ? permissionArray.every((permission) => hasPermission(permission))
    : permissionArray.some((permission) => hasPermission(permission));

  if (!hasAccess) {
    return (
      fallback || (
        <DefaultUnauthorizedFallback
          message={`You need ${requireAll ? "all of these" : "one of these"} permissions: ${permissionArray.join(", ")}`}
        />
      )
    );
  }

  return <>{children}</>;
}

/**
 * Guard component for admin-only content
 */
export function AdminGuard({ children, fallback }: AuthGuardProps) {
  const { isAdmin } = useAuth();

  if (!isAdmin()) {
    return (
      fallback || (
        <DefaultUnauthorizedFallback message="You need administrator privileges to access this content." />
      )
    );
  }

  return <>{children}</>;
}

/**
 * Guard component for super admin-only content
 */
export function SuperAdminGuard({ children, fallback }: AuthGuardProps) {
  const { isSuperAdmin } = useAuth();

  if (!isSuperAdmin()) {
    return (
      fallback || (
        <DefaultUnauthorizedFallback message="You need super administrator privileges to access this content." />
      )
    );
  }

  return <>{children}</>;
}

/**
 * Guard component for user management features
 */
export function UserManagementGuard({ children, fallback }: AuthGuardProps) {
  const { canManageUsers } = useAuth();

  if (!canManageUsers()) {
    return (
      fallback || (
        <DefaultUnauthorizedFallback message="You need user management privileges to access this content." />
      )
    );
  }

  return <>{children}</>;
}
