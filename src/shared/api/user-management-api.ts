import { apiRequest } from "./base";
import type { UserFeaturesResponse as BillingUserFeaturesResponse } from "./billing/types";

/**
 * User DTO matching backend UserDto
 */
export interface UserDto {
  id: number;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  enabled: boolean;
  emailVerified: boolean;
  authorities: string[];
  tenantId: string;
  createdAt: string;
  updatedAt?: string;
}

/**
 * Feature access response from unified feature management
 */
export interface FeatureAccessResponse {
  userId: number;
  username: string;
  featureCode: string;
  hasAccess: boolean;
  message: string;
}

/**
 * User features response
 */
export interface UserFeaturesResponse {
  userId: number;
  username: string;
  featureCount: number;
  features: FeatureSummary[];
}

/**
 * Feature summary
 */
export interface FeatureSummary {
  code: string;
  displayName: string;
  description: string;
  enabled: boolean;
}

/**
 * Available features response
 */
export interface AvailableFeaturesResponse {
  totalCount: number;
  features: FeatureDetail[];
}

/**
 * Feature detail
 */
export interface FeatureDetail {
  code: string;
  displayName: string;
  description: string;
  composable: boolean;
  requiredAuthorities: string[];
  dependencies: string[];
}

/**
 * Bulk feature update request
 */
export interface BulkFeatureUpdateRequest {
  enableFeatures: string[];
  disableFeatures: string[];
}

/**
 * Bulk feature update response
 */
export interface BulkFeatureUpdateResponse {
  userId: number;
  username: string;
  featuresEnabled: number;
  featuresDisabled: number;
  message: string;
}

/**
 * Microservice access response
 */
export interface MicroserviceAccessResponse {
  userId: number;
  username: string;
  featureCount: number;
  microserviceCount: number;
  routeCount: number;
  features: FeatureMicroserviceSummary[];
  accessibleMicroservices: string[];
  accessibleRoutes: string[];
}

/**
 * Feature microservice summary
 */
export interface FeatureMicroserviceSummary {
  featureCode: string;
  featureName: string;
  microservices: string[];
  routePatterns: string[];
}

/**
 * Request for creating a new user
 */
export interface CreateUserRequest {
  username: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  enabled?: boolean;
  emailVerified?: boolean;
  authorities: string[];
}

/**
 * Request for updating a user
 */
export interface UpdateUserRequest {
  username?: string;
  email?: string;
  password?: string;
  firstName?: string;
  lastName?: string;
  enabled?: boolean;
  emailVerified?: boolean;
  authorities?: string[];
}

/**
 * Paginated response for user list
 */
export interface UserPageResponse {
  content: UserDto[];
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
  search?: string;
}

/**
 * User Management API
 * Requires ADMIN or SUPER_ADMIN role for all operations
 * All operations are tenant-scoped
 */
export const userManagementApi = {
  /**
   * Get paginated list of users within current tenant
   * Requires ADMIN or SUPER_ADMIN role
   */
  async getAllUsers(params?: PageParams): Promise<UserPageResponse> {
    return apiRequest<UserPageResponse>({
      url: "/v1/admin/users",
      method: "GET",
      params,
    });
  },

  /**
   * Get user by ID within current tenant
   * Requires ADMIN or SUPER_ADMIN role
   */
  async getUserById(id: number): Promise<UserDto> {
    return apiRequest<UserDto>({
      url: `/v1/admin/users/${id}`,
      method: "GET",
    });
  },

  /**
   * Create new user within current tenant
   * Requires ADMIN or SUPER_ADMIN role
   * ADMIN cannot assign SUPER_ADMIN role
   */
  async createUser(data: CreateUserRequest): Promise<UserDto> {
    return apiRequest<UserDto>({
      url: "/v1/admin/users",
      method: "POST",
      data,
    });
  },

  /**
   * Update user within current tenant
   * Requires ADMIN or SUPER_ADMIN role
   * ADMIN cannot modify SUPER_ADMIN users or assign SUPER_ADMIN role
   */
  async updateUser(id: number, data: UpdateUserRequest): Promise<UserDto> {
    return apiRequest<UserDto>({
      url: `/v1/admin/users/${id}`,
      method: "PUT",
      data,
    });
  },

  /**
   * Delete user from current tenant
   * Requires ADMIN or SUPER_ADMIN role
   * Cannot delete own account
   * ADMIN cannot delete SUPER_ADMIN users
   */
  async deleteUser(id: number): Promise<void> {
    return apiRequest<void>({
      url: `/v1/admin/users/${id}`,
      method: "DELETE",
    });
  },

  /**
   * Get current user's features from billing service
   * Returns feature information based on subscription plan
   */
  async getMyFeatures(): Promise<BillingUserFeaturesResponse> {
    return apiRequest<BillingUserFeaturesResponse>({
      url: "/v1/features/my-features",
      method: "GET",
    });
  },
};
