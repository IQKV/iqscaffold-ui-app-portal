import { type PropsWithChildren, type ReactNode, useEffect } from "react";
import { useAuthStore } from "../model/store";
import { useNavigate } from "@tanstack/react-router";
import { Alert, Text } from "@mantine/core";
import { IconLock } from "@tabler/icons-react";
import { useAuth } from "./use-auth";

export function AuthGuard({ children }: PropsWithChildren) {
  const status = useAuthStore((s) => s.status);
  const navigate = useNavigate();
  useEffect(() => {
    if (status !== "initializing" && status !== "authenticated") {
      navigate({ to: "/auth-demo", replace: true });
    }
  }, [status, navigate]);
  if (status === "initializing") {
    return null;
  }
  if (status !== "authenticated") {
    return null;
  }
  return children as any;
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

export function RoleGuard({
  children,
  roles,
  requireAll = false,
  fallback,
}: {
  children: ReactNode;
  roles: string | string[];
  requireAll?: boolean;
  fallback?: ReactNode;
}) {
  const { hasAnyRole, hasAllRoles } = useAuth();
  const roleArray = Array.isArray(roles) ? roles : [roles];
  const hasAccess = requireAll ? hasAllRoles(roleArray) : hasAnyRole(roleArray);
  if (!hasAccess) {
    return (
      (fallback as any) || (
        <DefaultUnauthorizedFallback
          message={`You need ${requireAll ? "all of these" : "one of these"} roles: ${roleArray.join(", ")}`}
        />
      )
    );
  }
  return <>{children}</>;
}

export function PermissionGuard({
  children,
  permissions,
  requireAll = false,
  fallback,
}: {
  children: ReactNode;
  permissions: string | string[];
  requireAll?: boolean;
  fallback?: ReactNode;
}) {
  const { hasPermission } = useAuth();
  const permissionArray = Array.isArray(permissions)
    ? permissions
    : [permissions];
  const hasAccess = requireAll
    ? permissionArray.every((p) => hasPermission(p))
    : permissionArray.some((p) => hasPermission(p));
  if (!hasAccess) {
    return (
      (fallback as any) || (
        <DefaultUnauthorizedFallback
          message={`You need ${requireAll ? "all of these" : "one of these"} permissions: ${permissionArray.join(", ")}`}
        />
      )
    );
  }
  return <>{children}</>;
}

export function AdminGuard({
  children,
  fallback,
}: {
  children: ReactNode;
  fallback?: ReactNode;
}) {
  const { isAdmin } = useAuth();
  if (!isAdmin()) {
    return (
      (fallback as any) || (
        <DefaultUnauthorizedFallback message="You need administrator privileges to access this content." />
      )
    );
  }
  return <>{children}</>;
}

export function SuperAdminGuard({
  children,
  fallback,
}: PropsWithChildren<{ fallback?: ReactNode }>) {
  const { isSuperAdmin } = useAuth();
  if (!isSuperAdmin()) {
    return (
      (fallback as any) || (
        <DefaultUnauthorizedFallback message="You need super administrator privileges to access this content." />
      )
    );
  }
  return <>{children}</>;
}

export function UserManagementGuard({
  children,
  fallback,
}: PropsWithChildren<{ fallback?: ReactNode }>) {
  const { canManageUsers } = useAuth();
  if (!canManageUsers()) {
    return (
      (fallback as any) || (
        <DefaultUnauthorizedFallback message="You need user management privileges to access this content." />
      )
    );
  }
  return <>{children}</>;
}
