import { useMemo } from "react";
import { useAuthStore } from "@/processes/auth";
import * as billingPerms from "./billing-permissions";
import * as crmPerms from "./crm-permissions";
import {
  hasAnyAuthorityWithInheritance,
  hasAuthorityWithInheritance as hasAuthorityWithInheritanceHelper,
} from "@/shared/constants/authorities";

/**
 * Auth hook built on top of the centralized processes/auth store.
 * Updated to support new feature-specific authorities with inheritance.
 */
export function useAuth() {
  const user = useAuthStore((s) => s.user);
  const status = useAuthStore((s) => s.status);
  const logout = useAuthStore((s) => s.logout);
  const refresh = useAuthStore((s) => s.refresh);

  const helpers = useMemo(() => {
    const authorities = user?.authorities ?? [];
    const permissions = user?.permissions ?? [];

    // Legacy authority helpers (maintained for backward compatibility)
    const hasAuthority = (authority: string) => authorities.includes(authority);
    const hasAnyAuthority = (a: string[]) => a.some((x) => authorities.includes(x));
    const hasAllAuthorities = (a: string[]) => a.every((x) => authorities.includes(x));

    // New authority helpers with inheritance
    const hasAuthorityWithInheritance = (authority: string) =>
      hasAuthorityWithInheritanceHelper(authorities, authority);
    const hasAnyAuthorityWithInheritanceLocal = (a: string[]) =>
      hasAnyAuthorityWithInheritance(authorities, a);

    const hasPermission = (p: string) => permissions.includes(p);

    // Core authority helpers
    const isAdmin = () =>
      hasAuthority("ADMIN") || hasAuthority("TENANT_OWNER") || hasAuthority("SUPER_ADMIN");
    const isSuperAdmin = () => hasAuthority("SUPER_ADMIN");
    const isTenantOwner = () => hasAuthority("TENANT_OWNER");
    const canManageUsers = () => isAdmin();

    // Billing permissions (updated)
    const hasBillingAccess = () => billingPerms.hasBillingAccess(user);
    const canModifyBilling = () => billingPerms.canModifyBilling(user);
    const hasReadOnlyBillingAccess = () => billingPerms.hasReadOnlyBillingAccess(user);
    const canProcessRefunds = () => billingPerms.canProcessRefunds(user);
    const canManageMerchants = () => billingPerms.canManageMerchants(user);
    const canViewPayments = () => billingPerms.canViewPayments(user);
    const canViewPayouts = () => billingPerms.canViewPayouts(user);
    const isBillingAdmin = () => billingPerms.hasAdminAccess(user);
    const canManageGatewayConfig = () => billingPerms.canManageGatewayConfig(user);
    const canViewGatewayConfig = () => billingPerms.canViewGatewayConfig(user);
    const canManageSubscriptions = () => billingPerms.canManageSubscriptions(user);
    const canCreatePayments = () => billingPerms.canCreatePayments(user);
    const canManageSubscriptionPlans = () => billingPerms.canManageSubscriptionPlans(user);

    // CRM permissions (new)
    const hasCrmAccess = () => crmPerms.hasCrmAccess(user);
    const canManageLeads = () => crmPerms.canManageLeads(user);
    const canManageContacts = () => crmPerms.canManageContacts(user);
    const canManagePipeline = () => crmPerms.canManagePipeline(user);
    const isCrmAdmin = () => crmPerms.isCrmAdmin(user);
    const canDeleteLeads = () => crmPerms.canDeleteLeads(user);
    const canDeleteContacts = () => crmPerms.canDeleteContacts(user);
    const canManagePipelineStages = () => crmPerms.canManagePipelineStages(user);
    const canViewCrmDashboard = () => crmPerms.canViewCrmDashboard(user);
    const canConvertLeads = () => crmPerms.canConvertLeads(user);
    const canManageFollowUps = () => crmPerms.canManageFollowUps(user);
    const canDeleteFollowUps = () => crmPerms.canDeleteFollowUps(user);

    // Authority level helpers
    const getBillingAuthorityLevel = () => billingPerms.getBillingAuthorityLevel(user);
    const getCrmAuthorityLevel = () => crmPerms.getCrmAuthorityLevel(user);
    const getUserBillingAuthorities = () => billingPerms.getUserBillingAuthorities(user);
    const getUserCrmAuthorities = () => crmPerms.getUserCrmAuthorities(user);

    // Legacy compatibility (deprecated)
    const isFinanceViewer = () => {
      console.warn("isFinanceViewer is deprecated, use hasReadOnlyBillingAccess instead");
      return billingPerms.hasReadOnlyBillingAccess(user);
    };

    return {
      // Legacy authority helpers
      hasAuthority,
      hasAnyAuthority,
      hasAllAuthorities,
      hasPermission,

      // New authority helpers with inheritance
      hasAuthorityWithInheritance,
      hasAnyAuthorityWithInheritance: hasAnyAuthorityWithInheritanceLocal,

      // Core helpers
      isAdmin,
      isSuperAdmin,
      isTenantOwner,
      canManageUsers,

      // Billing permissions
      hasBillingAccess,
      canModifyBilling,
      hasReadOnlyBillingAccess,
      canProcessRefunds,
      canManageMerchants,
      canViewPayments,
      canViewPayouts,
      isBillingAdmin,
      canManageGatewayConfig,
      canViewGatewayConfig,
      canManageSubscriptions,
      canCreatePayments,
      canManageSubscriptionPlans,

      // CRM permissions
      hasCrmAccess,
      canManageLeads,
      canManageContacts,
      canManagePipeline,
      isCrmAdmin,
      canDeleteLeads,
      canDeleteContacts,
      canManagePipelineStages,
      canViewCrmDashboard,
      canConvertLeads,
      canManageFollowUps,
      canDeleteFollowUps,

      // Authority level helpers
      getBillingAuthorityLevel,
      getCrmAuthorityLevel,
      getUserBillingAuthorities,
      getUserCrmAuthorities,

      // Legacy compatibility (deprecated)
      isFinanceViewer,
    };
  }, [user]);

  return {
    user,
    status,
    logout,
    refresh,

    // Authentication state
    isAuthenticated: !!user,
    isLoading: status === "initializing",
    ...helpers,
  };
}
