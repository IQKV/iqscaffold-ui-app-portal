import type { UserContext } from "@/entities/user";
import {
  hasAnyAuthorityWithInheritance,
  AUTHORITY_CRM_ACCESS,
  AUTHORITY_CRM_LEAD_MANAGER,
  AUTHORITY_CRM_CONTACT_MANAGER,
  AUTHORITY_CRM_PIPELINE_MANAGER,
  AUTHORITY_CRM_ADMIN,
  ADMIN_AUTHORITIES,
} from "@/shared/constants/authorities";

/**
 * CRM feature-based authorization helpers
 * Uses the new configuration-driven feature system with authority inheritance
 */

/**
 * Check if user has basic CRM access
 * Requires: CRM_ACCESS or any CRM management authority or admin access
 */
export function hasCrmAccess(user: UserContext | null): boolean {
  if (!user?.authorities) {
    return false;
  }

  return hasAnyAuthorityWithInheritance(user.authorities, [
    AUTHORITY_CRM_ACCESS,
    AUTHORITY_CRM_LEAD_MANAGER,
    AUTHORITY_CRM_CONTACT_MANAGER,
    AUTHORITY_CRM_PIPELINE_MANAGER,
    AUTHORITY_CRM_ADMIN,
    ...ADMIN_AUTHORITIES,
  ]);
}

/**
 * Check if user can manage leads
 * Requires: CRM_LEAD_MANAGER, CRM_ADMIN, or admin access
 */
export function canManageLeads(user: UserContext | null): boolean {
  if (!user?.authorities) {
    return false;
  }

  return hasAnyAuthorityWithInheritance(user.authorities, [
    AUTHORITY_CRM_LEAD_MANAGER,
    AUTHORITY_CRM_ADMIN,
    ...ADMIN_AUTHORITIES,
  ]);
}

/**
 * Check if user can manage contacts
 * Requires: CRM_CONTACT_MANAGER, CRM_ADMIN, or admin access
 */
export function canManageContacts(user: UserContext | null): boolean {
  if (!user?.authorities) {
    return false;
  }

  return hasAnyAuthorityWithInheritance(user.authorities, [
    AUTHORITY_CRM_CONTACT_MANAGER,
    AUTHORITY_CRM_ADMIN,
    ...ADMIN_AUTHORITIES,
  ]);
}

/**
 * Check if user can manage pipeline
 * Requires: CRM_PIPELINE_MANAGER, CRM_ADMIN, or admin access
 */
export function canManagePipeline(user: UserContext | null): boolean {
  if (!user?.authorities) {
    return false;
  }

  return hasAnyAuthorityWithInheritance(user.authorities, [
    AUTHORITY_CRM_PIPELINE_MANAGER,
    AUTHORITY_CRM_ADMIN,
    ...ADMIN_AUTHORITIES,
  ]);
}

/**
 * Check if user has CRM admin access
 * Requires: CRM_ADMIN or admin access
 */
export function isCrmAdmin(user: UserContext | null): boolean {
  if (!user?.authorities) {
    return false;
  }

  return hasAnyAuthorityWithInheritance(user.authorities, [
    AUTHORITY_CRM_ADMIN,
    ...ADMIN_AUTHORITIES,
  ]);
}

/**
 * Check if user can delete CRM entities (leads, contacts, etc.)
 * Requires: Specific manager authority, CRM_ADMIN, or admin access
 */
export function canDeleteLeads(user: UserContext | null): boolean {
  if (!user?.authorities) {
    return false;
  }

  return hasAnyAuthorityWithInheritance(user.authorities, [
    AUTHORITY_CRM_LEAD_MANAGER,
    AUTHORITY_CRM_ADMIN,
    ...ADMIN_AUTHORITIES,
  ]);
}

/**
 * Check if user can delete contacts
 * Requires: CRM_CONTACT_MANAGER, CRM_ADMIN, or admin access
 */
export function canDeleteContacts(user: UserContext | null): boolean {
  if (!user?.authorities) {
    return false;
  }

  return hasAnyAuthorityWithInheritance(user.authorities, [
    AUTHORITY_CRM_CONTACT_MANAGER,
    AUTHORITY_CRM_ADMIN,
    ...ADMIN_AUTHORITIES,
  ]);
}

/**
 * Check if user can manage pipeline stages
 * Requires: CRM_PIPELINE_MANAGER, CRM_ADMIN, or admin access
 */
export function canManagePipelineStages(user: UserContext | null): boolean {
  if (!user?.authorities) {
    return false;
  }

  return hasAnyAuthorityWithInheritance(user.authorities, [
    AUTHORITY_CRM_PIPELINE_MANAGER,
    AUTHORITY_CRM_ADMIN,
    ...ADMIN_AUTHORITIES,
  ]);
}

/**
 * Check if user can view CRM dashboard and statistics
 * Requires: Any CRM access
 */
export function canViewCrmDashboard(user: UserContext | null): boolean {
  return hasCrmAccess(user);
}

/**
 * Check if user can convert leads to contacts
 * Requires: Both lead and contact management access
 */
export function canConvertLeads(user: UserContext | null): boolean {
  if (!user?.authorities) {
    return false;
  }

  return hasAnyAuthorityWithInheritance(user.authorities, [
    AUTHORITY_CRM_LEAD_MANAGER,
    AUTHORITY_CRM_CONTACT_MANAGER,
    AUTHORITY_CRM_ADMIN,
    ...ADMIN_AUTHORITIES,
  ]);
}

/**
 * Check if user can manage follow-ups
 * Requires: CRM_PIPELINE_MANAGER, CRM_ADMIN, or admin access
 */
export function canManageFollowUps(user: UserContext | null): boolean {
  return canManagePipeline(user);
}

/**
 * Check if user can delete follow-ups
 * Requires: CRM_PIPELINE_MANAGER, CRM_ADMIN, or admin access
 */
export function canDeleteFollowUps(user: UserContext | null): boolean {
  if (!user?.authorities) {
    return false;
  }

  return hasAnyAuthorityWithInheritance(user.authorities, [
    AUTHORITY_CRM_PIPELINE_MANAGER,
    AUTHORITY_CRM_ADMIN,
    ...ADMIN_AUTHORITIES,
  ]);
}

/**
 * Get user's CRM authority level for UI display
 */
export function getCrmAuthorityLevel(
  user: UserContext | null
): "none" | "access" | "manager" | "admin" {
  if (!user?.authorities) {
    return "none";
  }

  if (isCrmAdmin(user)) {
    return "admin";
  }

  if (
    canManageLeads(user) ||
    canManageContacts(user) ||
    canManagePipeline(user)
  ) {
    return "manager";
  }

  if (hasCrmAccess(user)) {
    return "access";
  }

  return "none";
}

/**
 * Get user's specific CRM authorities for debugging/display
 */
export function getUserCrmAuthorities(user: UserContext | null): string[] {
  if (!user?.authorities) {
    return [];
  }

  const crmAuthorities = [
    AUTHORITY_CRM_ACCESS,
    AUTHORITY_CRM_LEAD_MANAGER,
    AUTHORITY_CRM_CONTACT_MANAGER,
    AUTHORITY_CRM_PIPELINE_MANAGER,
    AUTHORITY_CRM_ADMIN,
  ];

  return user.authorities.filter((auth) =>
    crmAuthorities.includes(auth as any)
  );
}
