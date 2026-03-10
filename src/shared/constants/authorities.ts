/**
 * System-wide authority constants
 * These match the backend authority structure exactly
 *
 * Updated to include feature-specific authorities from the platform configuration
 */

// Core platform authorities
export const AUTHORITY_SUPER_ADMIN = "SUPER_ADMIN" as const;
export const AUTHORITY_TENANT_OWNER = "TENANT_OWNER" as const;
export const AUTHORITY_ADMIN = "ADMIN" as const;
export const AUTHORITY_USER = "USER" as const;

// Billing feature authorities
export const AUTHORITY_BILLING_ACCESS = "BILLING_ACCESS" as const;
export const AUTHORITY_BILLING_MANAGER = "BILLING_MANAGER" as const;
export const AUTHORITY_BILLING_ADMIN = "BILLING_ADMIN" as const;

// CRM feature authorities
export const AUTHORITY_CRM_ACCESS = "CRM_ACCESS" as const;
export const AUTHORITY_CRM_LEAD_MANAGER = "CRM_LEAD_MANAGER" as const;
export const AUTHORITY_CRM_CONTACT_MANAGER = "CRM_CONTACT_MANAGER" as const;
export const AUTHORITY_CRM_PIPELINE_MANAGER = "CRM_PIPELINE_MANAGER" as const;
export const AUTHORITY_CRM_ADMIN = "CRM_ADMIN" as const;

// API access authority
export const AUTHORITY_API_ACCESS = "API_ACCESS" as const;

// Legacy authorities for backward compatibility
export const AUTHORITY_FINANCE_VIEWER = "FINANCE_VIEWER" as const;

// Authority type (all authorities)
export type Authority =
  | typeof AUTHORITY_SUPER_ADMIN
  | typeof AUTHORITY_TENANT_OWNER
  | typeof AUTHORITY_ADMIN
  | typeof AUTHORITY_USER
  | typeof AUTHORITY_BILLING_ACCESS
  | typeof AUTHORITY_BILLING_MANAGER
  | typeof AUTHORITY_BILLING_ADMIN
  | typeof AUTHORITY_CRM_ACCESS
  | typeof AUTHORITY_CRM_LEAD_MANAGER
  | typeof AUTHORITY_CRM_CONTACT_MANAGER
  | typeof AUTHORITY_CRM_PIPELINE_MANAGER
  | typeof AUTHORITY_CRM_ADMIN
  | typeof AUTHORITY_API_ACCESS
  | typeof AUTHORITY_FINANCE_VIEWER;

// Authority groups for convenience
export const ADMIN_AUTHORITIES = [
  AUTHORITY_SUPER_ADMIN,
  AUTHORITY_TENANT_OWNER,
  AUTHORITY_ADMIN,
] as const;

export const BILLING_AUTHORITIES = [
  AUTHORITY_BILLING_ACCESS,
  AUTHORITY_BILLING_MANAGER,
  AUTHORITY_BILLING_ADMIN,
] as const;

export const CRM_AUTHORITIES = [
  AUTHORITY_CRM_ACCESS,
  AUTHORITY_CRM_LEAD_MANAGER,
  AUTHORITY_CRM_CONTACT_MANAGER,
  AUTHORITY_CRM_PIPELINE_MANAGER,
  AUTHORITY_CRM_ADMIN,
] as const;

/**
 * Authority hierarchy for UI rendering and access control
 * Higher number = higher privilege level
 */
export const AUTHORITY_HIERARCHY = {
  // Core authorities
  [AUTHORITY_USER]: 1,
  [AUTHORITY_API_ACCESS]: 5,

  // Billing authorities
  [AUTHORITY_BILLING_ACCESS]: 10,
  [AUTHORITY_BILLING_MANAGER]: 20,
  [AUTHORITY_BILLING_ADMIN]: 30,

  // CRM authorities
  [AUTHORITY_CRM_ACCESS]: 10,
  [AUTHORITY_CRM_LEAD_MANAGER]: 20,
  [AUTHORITY_CRM_CONTACT_MANAGER]: 20,
  [AUTHORITY_CRM_PIPELINE_MANAGER]: 25,
  [AUTHORITY_CRM_ADMIN]: 30,

  // Legacy authorities
  [AUTHORITY_FINANCE_VIEWER]: 15,

  // Admin authorities
  [AUTHORITY_ADMIN]: 90,
  [AUTHORITY_TENANT_OWNER]: 95,
  [AUTHORITY_SUPER_ADMIN]: 100,
} as const;

/**
 * Authority inheritance mapping
 * Higher authorities inherit permissions from lower authorities
 */
export const AUTHORITY_INHERITANCE = {
  // Admin authorities inherit everything
  [AUTHORITY_SUPER_ADMIN]: [
    ...ADMIN_AUTHORITIES,
    ...BILLING_AUTHORITIES,
    ...CRM_AUTHORITIES,
    AUTHORITY_API_ACCESS,
    AUTHORITY_FINANCE_VIEWER,
    AUTHORITY_USER,
  ],
  [AUTHORITY_TENANT_OWNER]: [
    AUTHORITY_ADMIN,
    ...BILLING_AUTHORITIES,
    ...CRM_AUTHORITIES,
    AUTHORITY_API_ACCESS,
    AUTHORITY_FINANCE_VIEWER,
    AUTHORITY_USER,
  ],
  [AUTHORITY_ADMIN]: [
    ...BILLING_AUTHORITIES,
    ...CRM_AUTHORITIES,
    AUTHORITY_API_ACCESS,
    AUTHORITY_FINANCE_VIEWER,
    AUTHORITY_USER,
  ],

  // Feature admin authorities inherit feature authorities
  [AUTHORITY_BILLING_ADMIN]: [
    AUTHORITY_BILLING_MANAGER,
    AUTHORITY_BILLING_ACCESS,
    AUTHORITY_FINANCE_VIEWER,
  ],
  [AUTHORITY_BILLING_MANAGER]: [AUTHORITY_BILLING_ACCESS],

  [AUTHORITY_CRM_ADMIN]: [
    AUTHORITY_CRM_LEAD_MANAGER,
    AUTHORITY_CRM_CONTACT_MANAGER,
    AUTHORITY_CRM_PIPELINE_MANAGER,
    AUTHORITY_CRM_ACCESS,
  ],
  [AUTHORITY_CRM_PIPELINE_MANAGER]: [AUTHORITY_CRM_ACCESS],
  [AUTHORITY_CRM_LEAD_MANAGER]: [AUTHORITY_CRM_ACCESS],
  [AUTHORITY_CRM_CONTACT_MANAGER]: [AUTHORITY_CRM_ACCESS],

  // Add missing authority mappings (no inheritance for basic authorities)
  [AUTHORITY_USER]: [],
  [AUTHORITY_API_ACCESS]: [],
  [AUTHORITY_FINANCE_VIEWER]: [],
  [AUTHORITY_BILLING_ACCESS]: [],
  [AUTHORITY_CRM_ACCESS]: [],
} as const;

/**
 * Check if an authority is an admin authority
 */
export function isAdminAuthority(authority: string): boolean {
  return ADMIN_AUTHORITIES.includes(authority as any);
}

/**
 * Check if an authority is a billing authority
 */
export function isBillingAuthority(authority: string): boolean {
  return BILLING_AUTHORITIES.includes(authority as any);
}

/**
 * Check if an authority is a CRM authority
 */
export function isCrmAuthority(authority: string): boolean {
  return CRM_AUTHORITIES.includes(authority as any);
}

/**
 * Get the hierarchy level of an authority
 */
export function getAuthorityLevel(authority: string): number {
  return AUTHORITY_HIERARCHY[authority as Authority] || 0;
}

/**
 * Get all authorities that the given authority inherits
 */
export function getInheritedAuthorities(authority: string): readonly string[] {
  return AUTHORITY_INHERITANCE[authority as Authority] || [];
}

/**
 * Check if user has authority (including inherited authorities)
 */
export function hasAuthorityWithInheritance(
  userAuthorities: string[],
  requiredAuthority: string,
): boolean {
  // Direct authority check
  if (userAuthorities.includes(requiredAuthority)) {
    return true;
  }

  // Check if any user authority inherits the required authority
  return userAuthorities.some((userAuth) => {
    const inherited = getInheritedAuthorities(userAuth);
    return inherited.includes(requiredAuthority);
  });
}

/**
 * Check if user has any of the required authorities (including inherited)
 */
export function hasAnyAuthorityWithInheritance(
  userAuthorities: string[],
  requiredAuthorities: string[],
): boolean {
  return requiredAuthorities.some((auth) => hasAuthorityWithInheritance(userAuthorities, auth));
}
