/**
 * System-wide authority constants
 * These match the backend authority structure exactly
 *
 * Note: Feature-specific authorities are now managed dynamically
 * through the configuration-driven feature system.
 */

// Core platform authorities
export const AUTHORITY_SUPER_ADMIN = "SUPER_ADMIN" as const;
export const AUTHORITY_TENANT_OWNER = "TENANT_OWNER" as const;
export const AUTHORITY_ADMIN = "ADMIN" as const;
export const AUTHORITY_USER = "USER" as const;

// Authority type (core authorities only)
export type Authority =
  | typeof AUTHORITY_SUPER_ADMIN
  | typeof AUTHORITY_TENANT_OWNER
  | typeof AUTHORITY_ADMIN
  | typeof AUTHORITY_USER;

// Core authority groups for convenience
export const ADMIN_AUTHORITIES = [
  AUTHORITY_SUPER_ADMIN,
  AUTHORITY_TENANT_OWNER,
  AUTHORITY_ADMIN,
] as const;

/**
 * Role hierarchy for UI rendering and access control
 * Higher number = higher privilege level
 */
export const ROLE_HIERARCHY = {
  [AUTHORITY_USER]: 1,
  [AUTHORITY_ADMIN]: 2,
  [AUTHORITY_TENANT_OWNER]: 3,
  [AUTHORITY_SUPER_ADMIN]: 4,
} as const;

/**
 * Check if an authority is an admin authority
 */
export function isAdminAuthority(authority: string): boolean {
  return ADMIN_AUTHORITIES.includes(authority as any);
}

/**
 * Get the hierarchy level of an authority
 */
export function getAuthorityLevel(authority: string): number {
  return ROLE_HIERARCHY[authority as keyof typeof ROLE_HIERARCHY] || 0;
}
