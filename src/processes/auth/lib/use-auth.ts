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
    const authorities = user?.authorities ?? [];
    const permissions = user?.permissions ?? [];

    const hasAuthority = (authority: string) => authorities.includes(authority);
    const hasAnyAuthority = (a: string[]) =>
      a.some((x) => authorities.includes(x));
    const hasAllAuthorities = (a: string[]) =>
      a.every((x) => authorities.includes(x));
    const hasPermission = (p: string) => permissions.includes(p);
    const isAdmin = () =>
      hasAuthority("ADMIN") ||
      hasAuthority("TENANT_OWNER") ||
      hasAuthority("SUPER_ADMIN");
    const isSuperAdmin = () => hasAuthority("SUPER_ADMIN");
    const isTenantOwner = () => hasAuthority("TENANT_OWNER");
    const canManageUsers = () => isAdmin();

    // Billing permissions
    const hasBillingAccess = () => billingPerms.hasBillingAccess(user);
    const canModifyBilling = () => billingPerms.canModifyBilling(user);
    const hasReadOnlyBillingAccess = () =>
      billingPerms.hasReadOnlyBillingAccess(user);
    const canProcessRefunds = () => billingPerms.canProcessRefunds(user);
    const canManageMerchants = () => billingPerms.canManageMerchants(user);
    const canViewPayments = () => billingPerms.canViewPayments(user);
    const canViewPayouts = () => billingPerms.canViewPayouts(user);
    const isBillingAdmin = () => billingPerms.hasAdminAccess(user);
    const isFinanceViewer = () => billingPerms.hasAdminAccess(user);

    return {
      hasAuthority,
      hasAnyAuthority,
      hasAllAuthorities,
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
