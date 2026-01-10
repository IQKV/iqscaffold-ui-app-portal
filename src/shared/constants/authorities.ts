/**
 * System-wide authority constants
 * These match the backend authority structure exactly
 */

// Platform authorities
export const AUTHORITY_SUPER_ADMIN = "SUPER_ADMIN" as const;
export const AUTHORITY_TENANT_OWNER = "TENANT_OWNER" as const;
export const AUTHORITY_ADMIN = "ADMIN" as const;
export const AUTHORITY_USER = "USER" as const;

// Billing authorities
export const AUTHORITY_BILLING_ADMIN = "BILLING_ADMIN" as const;
export const AUTHORITY_FINANCE_VIEWER = "FINANCE_VIEWER" as const;

// Authority type
export type Authority =
  | typeof AUTHORITY_SUPER_ADMIN
  | typeof AUTHORITY_TENANT_OWNER
  | typeof AUTHORITY_ADMIN
  | typeof AUTHORITY_USER
  | typeof AUTHORITY_BILLING_ADMIN
  | typeof AUTHORITY_FINANCE_VIEWER;

// Authority groups for convenience
export const BILLING_WRITE_AUTHORITIES = [
  AUTHORITY_SUPER_ADMIN,
  AUTHORITY_TENANT_OWNER,
  AUTHORITY_BILLING_ADMIN,
] as const;

export const BILLING_READ_AUTHORITIES = [
  AUTHORITY_SUPER_ADMIN,
  AUTHORITY_TENANT_OWNER,
  AUTHORITY_BILLING_ADMIN,
  AUTHORITY_FINANCE_VIEWER,
] as const;

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
  [AUTHORITY_FINANCE_VIEWER]: 2,
  [AUTHORITY_BILLING_ADMIN]: 3,
  [AUTHORITY_ADMIN]: 4,
  [AUTHORITY_TENANT_OWNER]: 5,
  [AUTHORITY_SUPER_ADMIN]: 6,
} as const;
