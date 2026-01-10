import type { UserContext } from "@/entities/user";
import { hasAnyRole } from "./auth-utils";
import {
  BILLING_WRITE_AUTHORITIES,
  BILLING_READ_AUTHORITIES,
  AUTHORITY_SUPER_ADMIN,
  AUTHORITY_TENANT_OWNER,
  AUTHORITY_BILLING_ADMIN,
  AUTHORITY_FINANCE_VIEWER,
} from "@/shared/constants/authorities";

/**
 * Billing authorization helpers
 * Matches backend authorization logic exactly
 */

/**
 * Check if user has any billing access (read or write)
 * Includes: SUPER_ADMIN, TENANT_OWNER, BILLING_ADMIN, FINANCE_VIEWER
 */
export function hasBillingAccess(user: UserContext | null): boolean {
  if (!user) return false;
  return hasAnyRole(user, [...BILLING_READ_AUTHORITIES]);
}

/**
 * Check if user can modify billing data (write operations)
 * Includes: SUPER_ADMIN, TENANT_OWNER, BILLING_ADMIN
 * Excludes: FINANCE_VIEWER (read-only), ADMIN (no billing access)
 */
export function canModifyBilling(user: UserContext | null): boolean {
  if (!user) return false;
  return hasAnyRole(user, [...BILLING_WRITE_AUTHORITIES]);
}

/**
 * Check if user has read-only billing access
 * True only if user is FINANCE_VIEWER without write authorities
 */
export function hasReadOnlyBillingAccess(user: UserContext | null): boolean {
  if (!user) return false;
  return (
    user.roles.includes(AUTHORITY_FINANCE_VIEWER) && !canModifyBilling(user)
  );
}

/**
 * Check if user can process refunds
 * Requires: SUPER_ADMIN, TENANT_OWNER, or BILLING_ADMIN
 */
export function canProcessRefunds(user: UserContext | null): boolean {
  return canModifyBilling(user);
}

/**
 * Check if user can initiate merchant onboarding
 * Requires: SUPER_ADMIN, TENANT_OWNER, or BILLING_ADMIN
 */
export function canManageMerchants(user: UserContext | null): boolean {
  return canModifyBilling(user);
}

/**
 * Check if user can view payment history
 * Requires: Any billing access
 */
export function canViewPayments(user: UserContext | null): boolean {
  return hasBillingAccess(user);
}

/**
 * Check if user can view payouts
 * Requires: Any billing access
 */
export function canViewPayouts(user: UserContext | null): boolean {
  return hasBillingAccess(user);
}

/**
 * Check if user is a tenant owner
 */
export function isTenantOwner(user: UserContext | null): boolean {
  if (!user) return false;
  return user.roles.includes(AUTHORITY_TENANT_OWNER);
}

/**
 * Check if user is a billing admin
 */
export function isBillingAdmin(user: UserContext | null): boolean {
  if (!user) return false;
  return user.roles.includes(AUTHORITY_BILLING_ADMIN);
}

/**
 * Check if user is a finance viewer
 */
export function isFinanceViewer(user: UserContext | null): boolean {
  if (!user) return false;
  return user.roles.includes(AUTHORITY_FINANCE_VIEWER);
}

/**
 * Get user's billing role description for UI display
 */
export function getBillingRoleDescription(user: UserContext | null): string {
  if (!user) return "No access";

  if (user.roles.includes(AUTHORITY_SUPER_ADMIN)) {
    return "Platform Administrator";
  }
  if (user.roles.includes(AUTHORITY_TENANT_OWNER)) {
    return "Organization Owner";
  }
  if (user.roles.includes(AUTHORITY_BILLING_ADMIN)) {
    return "Billing Administrator";
  }
  if (user.roles.includes(AUTHORITY_FINANCE_VIEWER)) {
    return "Finance Viewer (Read-only)";
  }

  return "No billing access";
}
