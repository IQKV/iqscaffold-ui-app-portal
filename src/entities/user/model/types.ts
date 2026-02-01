/**
 * User entity types
 * Core user data structures used across the application
 */

export interface User {
  userId: number;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  authorities: string[];
  permissions: string[];
  tenantId: string | null;
  organizationId: number | null;
  emailVerified?: boolean;
  avatarUrl?: string;
  avatarUpdatedAt?: string;
  customClaims: Record<string, unknown>;
}

export interface UserContext {
  userId: number;
  username: string;
  email: string;
  authorities: string[];
  permissions: string[];
  firstName: string;
  lastName: string;
  tenantId: string | null;
  organizationId: number | null;
  avatarUrl?: string;
  avatarUpdatedAt?: string;
  customClaims: Record<string, unknown>;
}

export interface UserRegistration {
  username: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  tenantId?: string;
}

export interface UserProfile {
  userId: number;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  emailVerified: boolean;
  avatarUrl?: string;
  avatarUpdatedAt?: string;
  createdAt: string;
  updatedAt?: string;
}
