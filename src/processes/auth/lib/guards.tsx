import { type PropsWithChildren, useEffect } from "react";
import { useAuthStore } from "../model/store";
import { useNavigate } from "@tanstack/react-router";

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

export function RoleGuard({
  roles,
  children,
}: PropsWithChildren<{ roles: string[] }>) {
  const user = useAuthStore((s) => s.user);
  const navigate = useNavigate();
  useEffect(() => {
    if (!user) {
      navigate({ to: "/auth-demo", replace: true });
      return;
    }
    const ok = roles.some((r) => (user.roles ?? []).includes(r));
    if (!ok) {
      navigate({ to: "/unauthorized", replace: true });
    }
  }, [user, roles, navigate]);
  if (!user) {
    return null;
  }
  const ok = roles.some((r) => (user.roles ?? []).includes(r));
  return ok ? (children as any) : null;
}

export function PermissionGuard({
  permissions,
  children,
}: PropsWithChildren<{ permissions: string[] }>) {
  const user = useAuthStore((s) => s.user);
  const navigate = useNavigate();
  useEffect(() => {
    if (!user) {
      navigate({ to: "/auth-demo", replace: true });
      return;
    }
    const ok = permissions.every((p) => (user.permissions ?? []).includes(p));
    if (!ok) {
      navigate({ to: "/unauthorized", replace: true });
    }
  }, [user, permissions, navigate]);
  if (!user) {
    return null;
  }
  const ok = permissions.every((p) => (user.permissions ?? []).includes(p));
  return ok ? (children as any) : null;
}

export function AdminGuard({ children }: PropsWithChildren) {
  return <RoleGuard roles={["ADMIN", "SUPER_ADMIN"]}>{children}</RoleGuard>;
}

export function SuperAdminGuard({ children }: PropsWithChildren) {
  return <RoleGuard roles={["SUPER_ADMIN"]}>{children}</RoleGuard>;
}

export function UserManagementGuard({ children }: PropsWithChildren) {
  return <RoleGuard roles={["ADMIN", "SUPER_ADMIN"]}>{children}</RoleGuard>;
}
