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
  roles: string[];
  permissions: string[];
  tenantId: string;
  emailVerified?: boolean;
  customClaims: Record<string, unknown>;
}

export interface UserContext {
  userId: number;
  username: string;
  email: string;
  roles: string[];
  permissions: string[];
  firstName: string;
  lastName: string;
  tenantId: string;
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
  createdAt: string;
  updatedAt?: string;
}
