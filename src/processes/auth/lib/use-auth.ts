import { useMemo } from "react";
import { useAuthStore } from "@/processes/auth";

/**
 * Auth hook built on top of the centralized processes/auth store.
 * Mirrors the previous API shape for convenient consumption.
 */
export function useAuth() {
  const user = useAuthStore((s) => s.user);
  const status = useAuthStore((s) => s.status);
  const login = useAuthStore((s) => s.login);
  const logout = useAuthStore((s) => s.logout);
  const refresh = useAuthStore((s) => s.refresh);

  const helpers = useMemo(() => {
    const roles = user?.roles ?? [];
    const permissions = user?.permissions ?? [];

    const hasRole = (role: string) => roles.includes(role);
    const hasAnyRole = (r: string[]) => r.some((x) => roles.includes(x));
    const hasAllRoles = (r: string[]) => r.every((x) => roles.includes(x));
    const hasPermission = (p: string) => permissions.includes(p);
    const isAdmin = () => hasRole("ADMIN") || hasRole("SUPER_ADMIN");
    const isSuperAdmin = () => hasRole("SUPER_ADMIN");
    const canManageUsers = () => isAdmin();

    return {
      hasRole,
      hasAnyRole,
      hasAllRoles,
      hasPermission,
      isAdmin,
      isSuperAdmin,
      canManageUsers,
    };
  }, [user]);

  return {
    user,
    isAuthenticated: status === "authenticated",
    isLoading: status === "initializing",
    ...helpers,
    login: (tokensOrCreds: any) => {
      const s = useAuthStore.getState();
      if (
        tokensOrCreds?.accessToken &&
        tokensOrCreds?.refreshToken &&
        s.loginWithTokens
      ) {
        s.loginWithTokens(tokensOrCreds);
        return Promise.resolve();
      }
      return login(tokensOrCreds);
    },
    logout,
    refreshUser: () => refresh(),
  };
}
