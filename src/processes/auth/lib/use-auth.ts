import { useMemo } from "react";
import { useAuthStore } from "@/processes/auth";
import * as billingPerms from "./billing-permissions";

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
    const isTenantOwner = () => billingPerms.isTenantOwner(user);
    const canManageUsers = () => isAdmin();

    // Billing permissions
    const hasBillingAccess = () => billingPerms.hasBillingAccess(user);
    const canModifyBilling = () => billingPerms.canModifyBilling(user);
    const hasReadOnlyBillingAccess = () => billingPerms.hasReadOnlyBillingAccess(user);
    const canProcessRefunds = () => billingPerms.canProcessRefunds(user);
    const canManageMerchants = () => billingPerms.canManageMerchants(user);
    const canViewPayments = () => billingPerms.canViewPayments(user);
    const canViewPayouts = () => billingPerms.canViewPayouts(user);
    const isBillingAdmin = () => billingPerms.isBillingAdmin(user);
    const isFinanceViewer = () => billingPerms.isFinanceViewer(user);

    return {
      hasRole,
      hasAnyRole,
      hasAllRoles,
      hasPermission,
      isAdmin,
      isSuperAdmin,
      isTenantOwner,
      canManageUsers,
      hasBillingAccess,
      canModifyBilling,
      hasReadOnlyBillingAccess,
      canProcessRefunds,
      canManageMerchants,
      canViewPayments,
      canViewPayouts,
      isBillingAdmin,
      isFinanceViewer,
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
