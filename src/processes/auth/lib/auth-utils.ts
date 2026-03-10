import type { UserContext } from "@/entities/user";

/**
 * Utility functions for authentication and authorization checks
 */

/**
 * Check if user has a specific authority
 */
export function hasAuthority(user: UserContext | null, authority: string): boolean {
  return user?.authorities?.includes(authority) ?? false;
}

/**
 * Check if user has any of the specified authorities
 */
export function hasAnyAuthority(user: UserContext | null, authorities: string[]): boolean {
  return authorities.some((authority) => hasAuthority(user, authority));
}

/**
 * Check if user has all of the specified authorities
 */
export function hasAllAuthorities(user: UserContext | null, authorities: string[]): boolean {
  return authorities.every((authority) => hasAuthority(user, authority));
}

// Backward compatibility aliases
export const hasRole = hasAuthority;
export const hasAnyRole = hasAnyAuthority;
export const hasAllRoles = hasAllAuthorities;

/**
 * Check if user has a specific permission
 */
export function hasPermission(user: UserContext | null, permission: string): boolean {
  return user?.permissions?.includes(permission) ?? false;
}

/**
 * Check if user has any of the specified permissions
 */
export function hasAnyPermission(user: UserContext | null, permissions: string[]): boolean {
  return permissions.some((permission) => hasPermission(user, permission));
}

/**
 * Check if user has all of the specified permissions
 */
export function hasAllPermissions(user: UserContext | null, permissions: string[]): boolean {
  return permissions.every((permission) => hasPermission(user, permission));
}

/**
 * Check if user is an admin (has ADMIN, TENANT_OWNER, or SUPER_ADMIN authority)
 * Note: ADMIN authority does NOT have billing access - use billing-permissions for that
 */
export function isAdmin(user: UserContext | null): boolean {
  return (
    hasAuthority(user, "ADMIN") ||
    hasAuthority(user, "TENANT_OWNER") ||
    hasAuthority(user, "SUPER_ADMIN")
  );
}

/**
 * Check if user is a super admin
 */
export function isSuperAdmin(user: UserContext | null): boolean {
  return hasAuthority(user, "SUPER_ADMIN");
}

/**
 * Check if user is a tenant owner
 */
export function isTenantOwner(user: UserContext | null): boolean {
  return hasAuthority(user, "TENANT_OWNER");
}

// Permission helpers are defined in ./permissions and exported via processes/auth public API

/**
 * Get user's display name
 */
export function getUserDisplayName(user: UserContext | null): string {
  if (!user) {
    return "Anonymous";
  }

  const fullName = `${user.firstName || ""} ${user.lastName || ""}`.trim();
  return fullName || user.username || user.email || "Unknown User";
}

/**
 * Get user's initials for avatar
 */
export function getUserInitials(user: UserContext | null): string {
  if (!user) {
    return "A";
  }

  const firstName = user.firstName?.charAt(0)?.toUpperCase() || "";
  const lastName = user.lastName?.charAt(0)?.toUpperCase() || "";

  if (firstName && lastName) {
    return firstName + lastName;
  }

  if (firstName) {
    return firstName;
  }

  if (user.username) {
    return user.username.charAt(0).toUpperCase();
  }

  if (user.email) {
    return user.email.charAt(0).toUpperCase();
  }

  return "U";
}

/**
 * Check if user belongs to a specific tenant
 */
export function belongsToTenant(user: UserContext | null, tenantId: string): boolean {
  return user?.tenantId === tenantId;
}

/**
 * Get user's authorities as a formatted string
 */
export function formatUserAuthorities(user: UserContext | null): string {
  if (!user?.authorities || user.authorities.length === 0) {
    return "No authorities";
  }

  return user.authorities.join(", ");
}

// Backward compatibility alias
export const formatUserRoles = formatUserAuthorities;

/**
 * Check if user account is active (has basic USER authority at minimum)
 */
export function isActiveUser(user: UserContext | null): boolean {
  return hasAuthority(user, "USER") || isAdmin(user);
}

/**
 * Authority hierarchy check - useful for authority-based UI rendering
 */
export const AUTHORITY_HIERARCHY = {
  USER: 1,
  FINANCE_VIEWER: 2,
  BILLING_ADMIN: 3,
  ADMIN: 4,
  TENANT_OWNER: 5,
  SUPER_ADMIN: 6,
} as const;

// Backward compatibility alias
export const ROLE_HIERARCHY = AUTHORITY_HIERARCHY;

/**
 * Get user's highest authority level
 */
export function getUserAuthorityLevel(user: UserContext | null): number {
  if (!user?.authorities) {
    return 0;
  }

  let maxLevel = 0;
  for (const authority of user.authorities) {
    const level = AUTHORITY_HIERARCHY[authority as keyof typeof AUTHORITY_HIERARCHY];
    if (level && level > maxLevel) {
      maxLevel = level;
    }
  }

  return maxLevel;
}

/**
 * Check if user has authority level equal or higher than specified
 */
export function hasAuthorityLevel(user: UserContext | null, minLevel: number): boolean {
  return getUserAuthorityLevel(user) >= minLevel;
}

// Backward compatibility aliases
export const getUserRoleLevel = getUserAuthorityLevel;
export const hasRoleLevel = hasAuthorityLevel;
