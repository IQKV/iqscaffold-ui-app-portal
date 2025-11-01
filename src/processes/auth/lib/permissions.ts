import type { UserContext } from "@/entities/user";
import { isAdmin } from "./auth-utils";

/**
 * Authorization helpers for common user management operations
 */
export function canManageUsers(user: UserContext | null): boolean {
  return isAdmin(user);
}

export function canCreateUsers(user: UserContext | null): boolean {
  return canManageUsers(user);
}

export function canUpdateUsers(user: UserContext | null): boolean {
  return canManageUsers(user);
}

export function canDeleteUsers(user: UserContext | null): boolean {
  return canManageUsers(user);
}

export function canReadUsers(user: UserContext | null): boolean {
  return !!user; // All authenticated users can read user records
}
