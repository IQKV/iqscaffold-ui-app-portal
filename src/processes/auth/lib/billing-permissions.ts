import type { UserContext } from "@/entities/user";
import {
  hasAnyAuthorityWithInheritance,
  AUTHORITY_BILLING_ACCESS,
  AUTHORITY_BILLING_MANAGER,
  AUTHORITY_BILLING_ADMIN,
  AUTHORITY_FINANCE_VIEWER,
  ADMIN_AUTHORITIES,
} from "@/shared/constants/authorities";

/**
 * Billing feature-based authorization helpers
 * Uses the new configuration-driven feature system with authority inheritance
 */

/**
 * Check if user has basic billing access
 * Requires: BILLING_ACCESS, BILLING_MANAGER, BILLING_ADMIN, or admin access
 */
export function hasBillingAccess(user: UserContext | null): boolean {
  if (!user?.authorities) {
    return false;
  }

  return hasAnyAuthorityWithInheritance(user.authorities, [
    AUTHORITY_BILLING_ACCESS,
    AUTHORITY_BILLING_MANAGER,
    AUTHORITY_BILLING_ADMIN,
    ...ADMIN_AUTHORITIES,
  ]);
}

/**
 * Check if user can modify billing (create/update operations)
 * Requires: BILLING_MANAGER, BILLING_ADMIN, or admin access
 */
export function canModifyBilling(user: UserContext | null): boolean {
  if (!user?.authorities) {
    return false;
  }

  return hasAnyAuthorityWithInheritance(user.authorities, [
    AUTHORITY_BILLING_MANAGER,
    AUTHORITY_BILLING_ADMIN,
    ...ADMIN_AUTHORITIES,
  ]);
}

/**
 * Check if user has read-only billing access
 * Requires: BILLING_ACCESS, FINANCE_VIEWER, or any billing authority
 */
export function hasReadOnlyBillingAccess(user: UserContext | null): boolean {
  if (!user?.authorities) {
    return false;
  }

  return hasAnyAuthorityWithInheritance(user.authorities, [
    AUTHORITY_BILLING_ACCESS,
    AUTHORITY_FINANCE_VIEWER,
    AUTHORITY_BILLING_MANAGER,
    AUTHORITY_BILLING_ADMIN,
    ...ADMIN_AUTHORITIES,
  ]);
}

/**
 * Check if user can process refunds
 * Requires: BILLING_MANAGER, BILLING_ADMIN, or admin access
 */
export function canProcessRefunds(user: UserContext | null): boolean {
  return canModifyBilling(user);
}

/**
 * Check if user can manage merchants
 * Requires: BILLING_ADMIN or admin access
 */
export function canManageMerchants(user: UserContext | null): boolean {
  if (!user?.authorities) {
    return false;
  }

  return hasAnyAuthorityWithInheritance(user.authorities, [
    AUTHORITY_BILLING_ADMIN,
    ...ADMIN_AUTHORITIES,
  ]);
}

/**
 * Check if user can view payments
 * Requires: Any billing access or finance viewer
 */
export function canViewPayments(user: UserContext | null): boolean {
  return hasReadOnlyBillingAccess(user);
}

/**
 * Check if user can view payouts
 * Requires: BILLING_MANAGER, BILLING_ADMIN, FINANCE_VIEWER, or admin access
 */
export function canViewPayouts(user: UserContext | null): boolean {
  if (!user?.authorities) {
    return false;
  }

  return hasAnyAuthorityWithInheritance(user.authorities, [
    AUTHORITY_BILLING_MANAGER,
    AUTHORITY_BILLING_ADMIN,
    AUTHORITY_FINANCE_VIEWER,
    ...ADMIN_AUTHORITIES,
  ]);
}

/**
 * Check if user has billing admin access
 * Requires: BILLING_ADMIN or admin access
 */
export function hasAdminAccess(user: UserContext | null): boolean {
  if (!user?.authorities) {
    return false;
  }

  return hasAnyAuthorityWithInheritance(user.authorities, [
    AUTHORITY_BILLING_ADMIN,
    ...ADMIN_AUTHORITIES,
  ]);
}

/**
 * Check if user can manage gateway configuration
 * Requires: BILLING_ADMIN or admin access
 */
export function canManageGatewayConfig(user: UserContext | null): boolean {
  return hasAdminAccess(user);
}

/**
 * Check if user can view gateway configuration
 * Requires: BILLING_MANAGER, BILLING_ADMIN, FINANCE_VIEWER, or admin access
 */
export function canViewGatewayConfig(user: UserContext | null): boolean {
  if (!user?.authorities) {
    return false;
  }

  return hasAnyAuthorityWithInheritance(user.authorities, [
    AUTHORITY_BILLING_MANAGER,
    AUTHORITY_BILLING_ADMIN,
    AUTHORITY_FINANCE_VIEWER,
    ...ADMIN_AUTHORITIES,
  ]);
}

/**
 * Check if user can manage subscriptions
 * Requires: BILLING_MANAGER, BILLING_ADMIN, or admin access
 */
export function canManageSubscriptions(user: UserContext | null): boolean {
  return canModifyBilling(user);
}

/**
 * Check if user can create payment intents
 * Requires: Any billing access
 */
export function canCreatePayments(user: UserContext | null): boolean {
  return hasBillingAccess(user);
}

/**
 * Check if user can manage subscription plans
 * Requires: BILLING_ADMIN or admin access
 */
export function canManageSubscriptionPlans(user: UserContext | null): boolean {
  return hasAdminAccess(user);
}

/**
 * Get user's billing authority level for UI display
 */
export function getBillingAuthorityLevel(
  user: UserContext | null,
): "none" | "access" | "manager" | "admin" {
  if (!user?.authorities) {
    return "none";
  }

  if (hasAdminAccess(user)) {
    return "admin";
  }

  if (canModifyBilling(user)) {
    return "manager";
  }

  if (hasBillingAccess(user)) {
    return "access";
  }

  return "none";
}

/**
 * Get user's specific billing authorities for debugging/display
 */
export function getUserBillingAuthorities(user: UserContext | null): string[] {
  if (!user?.authorities) {
    return [];
  }

  const billingAuthorities = [
    AUTHORITY_BILLING_ACCESS,
    AUTHORITY_BILLING_MANAGER,
    AUTHORITY_BILLING_ADMIN,
    AUTHORITY_FINANCE_VIEWER,
  ];

  return user.authorities.filter((auth) => billingAuthorities.includes(auth as any));
}

// Legacy function compatibility (deprecated)
/**
 * @deprecated Use hasAdminAccess instead
 */
export function isBillingAdmin(user: UserContext | null): boolean {
  console.warn("isBillingAdmin is deprecated, use hasAdminAccess instead");
  return hasAdminAccess(user);
}

/**
 * @deprecated Use hasReadOnlyBillingAccess instead
 */
export function isFinanceViewer(user: UserContext | null): boolean {
  console.warn("isFinanceViewer is deprecated, use hasReadOnlyBillingAccess instead");
  return hasReadOnlyBillingAccess(user);
}
