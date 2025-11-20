/**
 * Tenant types for multi-tenant architecture
 */

export interface Tenant {
  id: number;
  tenantId: string;
  name: string;
  description?: string;
  enabled: boolean;
  domain?: string;
  subdomain?: string;
  maxUsers?: number;
  storageQuotaGb?: number;
  apiRateLimitPerMinute?: number;
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
}

export interface TenantSummary {
  tenantId: string;
  name: string;
  enabled: boolean;
  userCount: number;
  maxUsers?: number;
  createdAt: string;
}

export interface TenantResolutionResult {
  tenantId: string | null;
  resolutionMethod: "JWT" | "HEADER" | "SUBDOMAIN" | "NONE";
  resolvedValue: string | null;
  isValid: boolean;
}

export interface TenantContext {
  currentTenantId: string | null;
  tenant: Tenant | null;
  isLoading: boolean;
  error: string | null;
}
