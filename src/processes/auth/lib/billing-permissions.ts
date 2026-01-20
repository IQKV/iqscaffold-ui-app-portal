import type { UserContext } from "@/entities/user";
import { hasAnyAuthority } from "./auth-utils";
import {
  ADMIN_AUTHORITIES,
  isAdminAuthority,
} from "@/shared/constants/authorities";

/**
 * Feature-based authorization helpers
 * Uses the new configuration-driven feature system instead of hardcoded authorities
 */

/**
 * Check if user has admin access (universal access to all features)
 * Includes: SUPER_ADMIN, TENANT_OWNER, ADMIN
 */
export function hasAdminAccess(user: UserContext | null): boolean {
  if (!user) {
    return false;
  }
  return hasAnyAuthority(user, [...ADMIN_AUTHORITIES]);
}

/**
 * Check if user has any admin authority
 */
export function isAdmin(user: UserContext | null): boolean {
  if (!user || !user.authorities) {
    return false;
  }
  return user.authorities.some((auth) => isAdminAuthority(auth));
}

/**
 * Check if user can manage other users
 * Requires: SUPER_ADMIN, TENANT_OWNER, or ADMIN
 */
export function canManageUsers(user: UserContext | null): boolean {
  return hasAdminAccess(user);
}

/**
 * Check if user can manage platform configuration
 * Requires: SUPER_ADMIN or TENANT_OWNER
 */
export function canManagePlatform(user: UserContext | null): boolean {
  if (!user) {
    return false;
  }
  return hasAnyAuthority(user, ["SUPER_ADMIN", "TENANT_OWNER"]);
}

/**
 * @deprecated Use FeatureGate component with feature="billing" instead
 * This function is kept for backward compatibility during migration
 */
export function hasBillingAccess(user: UserContext | null): boolean {
  console.warn(
    "hasBillingAccess is deprecated. Use FeatureGate with feature='billing' instead."
  );
  return hasAdminAccess(user);
}

/**
 * @deprecated Use FeatureGate component with feature="billing" instead
 * This function is kept for backward compatibility during migration
 */
export function canModifyBilling(user: UserContext | null): boolean {
  console.warn(
    "canModifyBilling is deprecated. Use FeatureGate with feature='billing' instead."
  );
  return hasAdminAccess(user);
}

/**
 * @deprecated Use FeatureGate component with feature="billing" instead
 */
export function hasReadOnlyBillingAccess(user: UserContext | null): boolean {
  console.warn(
    "hasReadOnlyBillingAccess is deprecated. Use FeatureGate with feature='billing' instead."
  );
  return false;
}

/**
 * @deprecated Use FeatureGate component with feature="billing" instead
 */
export function canProcessRefunds(user: UserContext | null): boolean {
  console.warn(
    "canProcessRefunds is deprecated. Use FeatureGate with feature='billing' instead."
  );
  return hasAdminAccess(user);
}

/**
 * @deprecated Use FeatureGate component with feature="billing" instead
 */
export function canManageMerchants(user: UserContext | null): boolean {
  console.warn(
    "canManageMerchants is deprecated. Use FeatureGate with feature='billing' instead."
  );
  return hasAdminAccess(user);
}

/**
 * @deprecated Use FeatureGate component with feature="billing" instead
 */
export function canViewPayments(user: UserContext | null): boolean {
  console.warn(
    "canViewPayments is deprecated. Use FeatureGate with feature='billing' instead."
  );
  return hasAdminAccess(user);
}

/**
 * @deprecated Use FeatureGate component with feature="billing" instead
 */
export function canViewPayouts(user: UserContext | null): boolean {
  console.warn(
    "canViewPayouts is deprecated. Use FeatureGate with feature='billing' instead."
  );
  return hasAdminAccess(user);
}

/**
 * @deprecated Use FeatureGate component with feature="billing" instead
 */
export function canManageGatewayConfigs(user: UserContext | null): boolean {
  console.warn(
    "canManageGatewayConfigs is deprecated. Use FeatureGate with feature='billing' instead."
  );
  return hasAdminAccess(user);
}

/**
 * @deprecated Use FeatureGate component with feature="billing" instead
 */
export function canViewGatewayConfigs(user: UserContext | null): boolean {
  console.warn(
    "canViewGatewayConfigs is deprecated. Use FeatureGate with feature='billing' instead."
  );
  return hasAdminAccess(user);
}
