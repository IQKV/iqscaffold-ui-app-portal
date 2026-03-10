import { apiRequest } from "./base";
import { PaymentGatewayProvider } from "./billing/types";

/**
 * Organization DTO matching backend OrganizationDto
 */
export interface OrganizationDto {
  id: number;
  name: string;
  description?: string;
  industry?: string;
  website?: string;
  phone?: string;
  address?: string;
  city?: string;
  country?: string;
  enabled: boolean;
  tenantId: string;
  ownerUserId?: number;
  billingEmail?: string;
  paymentGatewayAccountId?: string;
  paymentGatewayProvider?: PaymentGatewayProvider;
  chargesEnabled?: boolean;
  payoutsEnabled?: boolean;
  subscriptionStatus?: string;
  subscriptionPlan?: string;
  maxUsers?: number;
}

/**
 * Request for creating a new organization
 */
export interface CreateOrganizationRequest {
  name: string;
  tenantId: string;
  description?: string;
  industry?: string;
  website?: string;
  phone?: string;
  address?: string;
  city?: string;
  country?: string;
  ownerUserId?: number;
  billingEmail?: string;
  paymentGatewayAccountId?: string;
  paymentGatewayProvider?: PaymentGatewayProvider;
  subscriptionStatus?: string;
  subscriptionPlan?: string;
  maxUsers?: number;
}

/**
 * Request for updating an organization
 */
export interface UpdateOrganizationRequest {
  name?: string;
  description?: string;
  industry?: string;
  website?: string;
  phone?: string;
  address?: string;
  city?: string;
  country?: string;
  enabled?: boolean;
  billingEmail?: string;
  paymentGatewayAccountId?: string;
  paymentGatewayProvider?: PaymentGatewayProvider;
  chargesEnabled?: boolean;
  payoutsEnabled?: boolean;
  subscriptionStatus?: string;
  subscriptionPlan?: string;
  maxUsers?: number;
}

/**
 * Paginated response for organization list
 */
export interface OrganizationPageResponse {
  content: OrganizationDto[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
}

/**
 * Pagination parameters
 */
export interface PageParams {
  page?: number;
  size?: number;
  sort?: string[];
}

/**
 * Organization Management API
 * Requires ADMIN or SUPER_ADMIN role for all operations
 */
export const organizationApi = {
  /**
   * Get paginated list of organizations
   * SUPER_ADMIN sees all, ADMIN sees only their organization
   */
  async getAllOrganizations(params?: PageParams): Promise<OrganizationPageResponse> {
    return apiRequest<OrganizationPageResponse>({
      url: "/v1/admin/organizations",
      method: "GET",
      params,
    });
  },

  /**
   * Get organization by ID
   * Requires ADMIN or SUPER_ADMIN role
   * Tenant-scoped for ADMIN users
   */
  async getOrganizationById(id: number): Promise<OrganizationDto> {
    return apiRequest<OrganizationDto>({
      url: `/v1/admin/organizations/${id}`,
      method: "GET",
    });
  },

  /**
   * Create new organization
   * Requires SUPER_ADMIN role
   */
  async createOrganization(data: CreateOrganizationRequest): Promise<OrganizationDto> {
    return apiRequest<OrganizationDto>({
      url: "/v1/admin/organizations",
      method: "POST",
      data,
    });
  },

  /**
   * Update organization
   * Requires ADMIN or SUPER_ADMIN role
   * Tenant-scoped for ADMIN users
   */
  async updateOrganization(id: number, data: UpdateOrganizationRequest): Promise<OrganizationDto> {
    return apiRequest<OrganizationDto>({
      url: `/v1/admin/organizations/${id}`,
      method: "PUT",
      data,
    });
  },

  /**
   * Delete organization
   * Requires SUPER_ADMIN role
   */
  async deleteOrganization(id: number): Promise<void> {
    return apiRequest<void>({
      url: `/v1/admin/organizations/${id}`,
      method: "DELETE",
    });
  },

  /**
   * Get organization by tenant ID
   * Internal endpoint for service-to-service communication
   * Requires SUPER_ADMIN role
   */
  async getOrganizationByTenantId(tenantId: string): Promise<OrganizationDto> {
    return apiRequest<OrganizationDto>({
      url: `/v1/admin/organizations/tenant/${tenantId}`,
      method: "GET",
    });
  },
};
