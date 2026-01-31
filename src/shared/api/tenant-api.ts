import { apiClient } from "./base";
import type { Tenant, TenantSummary } from "@/shared/types/tenant";

/**
 * Tenant API responses
 */
export interface TenantResponse {
  id: number;
  tenantId: string;
  name: string;
  description?: string;
  enabled: boolean;
  domain?: string;
  maxUsers?: number;
  storageQuotaGb?: number;
  apiRateLimitPerMinute?: number;
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
}

export interface CreateTenantRequest {
  tenantId: string;
  name: string;
  description?: string;
  domain?: string;
  maxUsers?: number;
  storageQuotaGb?: number;
  apiRateLimitPerMinute?: number;
}

export interface UpdateTenantRequest {
  name?: string;
  description?: string;
  domain?: string;
  maxUsers?: number;
  storageQuotaGb?: number;
  apiRateLimitPerMinute?: number;
  enabled?: boolean;
}

export interface TenantStatistics {
  tenantId: string;
  name: string;
  enabled: boolean;
  userCount: number;
  maxUsers?: number;
  utilizationPercentage: number;
  createdAt: string;
}

/**
 * Tenant Management API
 * Note: Most endpoints require SUPER_ADMIN role
 */
export const tenantApi = {
  /**
   * Get tenant by ID (SUPER_ADMIN only)
   */
  async getTenant(tenantId: string): Promise<TenantResponse> {
    const response = await apiClient.get<TenantResponse>(
      `/v1/admin/tenants/${tenantId}`
    );
    return response.data;
  },

  /**
   * Get all tenants (SUPER_ADMIN only)
   */
  async getAllTenants(enabledOnly: boolean = false): Promise<TenantSummary[]> {
    const response = await apiClient.get<TenantSummary[]>("/v1/admin/tenants", {
      params: { enabledOnly },
    });
    return response.data;
  },

  /**
   * Create new tenant (SUPER_ADMIN only)
   */
  async createTenant(data: CreateTenantRequest): Promise<TenantResponse> {
    const response = await apiClient.post<TenantResponse>(
      "/v1/admin/tenants",
      data
    );
    return response.data;
  },

  /**
   * Update tenant (SUPER_ADMIN only)
   */
  async updateTenant(
    tenantId: string,
    data: UpdateTenantRequest
  ): Promise<TenantResponse> {
    const response = await apiClient.put<TenantResponse>(
      `/v1/admin/tenants/${tenantId}`,
      data
    );
    return response.data;
  },

  /**
   * Enable or disable tenant (SUPER_ADMIN only)
   */
  async setTenantEnabled(
    tenantId: string,
    enabled: boolean
  ): Promise<TenantResponse> {
    const response = await apiClient.patch<TenantResponse>(
      `/v1/admin/tenants/${tenantId}/enabled`,
      null,
      {
        params: { enabled },
      }
    );
    return response.data;
  },

  /**
   * Delete tenant (SUPER_ADMIN only)
   */
  async deleteTenant(tenantId: string): Promise<void> {
    await apiClient.delete(`/v1/admin/tenants/${tenantId}`);
  },

  /**
   * Get tenant statistics (SUPER_ADMIN only)
   */
  async getTenantStatistics(): Promise<TenantStatistics[]> {
    const response = await apiClient.get<TenantStatistics[]>(
      "/v1/admin/tenants/statistics"
    );
    return response.data;
  },
};
