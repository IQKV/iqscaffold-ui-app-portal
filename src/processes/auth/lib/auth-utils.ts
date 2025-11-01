import type { UserContext } from "@/entities/user";

/**
 * Utility functions for authentication and authorization checks
 */

/**
 * Check if user has a specific role
 */
export function hasRole(user: UserContext | null, role: string): boolean {
  return user?.roles?.includes(role) ?? false;
}

/**
 * Check if user has any of the specified roles
 */
export function hasAnyRole(user: UserContext | null, roles: string[]): boolean {
  return roles.some((role) => hasRole(user, role));
}

/**
 * Check if user has all of the specified roles
 */
export function hasAllRoles(
  user: UserContext | null,
  roles: string[]
): boolean {
  return roles.every((role) => hasRole(user, role));
}

/**
 * Check if user has a specific permission
 */
export function hasPermission(
  user: UserContext | null,
  permission: string
): boolean {
  return user?.permissions?.includes(permission) ?? false;
}

/**
 * Check if user has any of the specified permissions
 */
export function hasAnyPermission(
  user: UserContext | null,
  permissions: string[]
): boolean {
  return permissions.some((permission) => hasPermission(user, permission));
}

/**
 * Check if user has all of the specified permissions
 */
export function hasAllPermissions(
  user: UserContext | null,
  permissions: string[]
): boolean {
  return permissions.every((permission) => hasPermission(user, permission));
}

/**
 * Check if user is an admin (has ADMIN or SUPER_ADMIN role)
 */
export function isAdmin(user: UserContext | null): boolean {
  return hasRole(user, "ADMIN") || hasRole(user, "SUPER_ADMIN");
}

/**
 * Check if user is a super admin
 */
export function isSuperAdmin(user: UserContext | null): boolean {
  return hasRole(user, "SUPER_ADMIN");
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
export function belongsToTenant(
  user: UserContext | null,
  tenantId: string
): boolean {
  return user?.tenantId === tenantId;
}

/**
 * Get user's roles as a formatted string
 */
export function formatUserRoles(user: UserContext | null): string {
  if (!user?.roles || user.roles.length === 0) {
    return "No roles";
  }

  return user.roles.join(", ");
}

/**
 * Check if user account is active (has basic USER role at minimum)
 */
export function isActiveUser(user: UserContext | null): boolean {
  return hasRole(user, "USER") || isAdmin(user);
}

/**
 * Role hierarchy check - useful for role-based UI rendering
 */
export const ROLE_HIERARCHY = {
  USER: 1,
  ADMIN: 2,
  SUPER_ADMIN: 3,
} as const;

/**
 * Get user's highest role level
 */
export function getUserRoleLevel(user: UserContext | null): number {
  if (!user?.roles) {
    return 0;
  }

  let maxLevel = 0;
  for (const role of user.roles) {
    const level = ROLE_HIERARCHY[role as keyof typeof ROLE_HIERARCHY];
    if (level && level > maxLevel) {
      maxLevel = level;
    }
  }

  return maxLevel;
}

/**
 * Check if user has role level equal or higher than specified
 */
export function hasRoleLevel(
  user: UserContext | null,
  minLevel: number
): boolean {
  return getUserRoleLevel(user) >= minLevel;
}
