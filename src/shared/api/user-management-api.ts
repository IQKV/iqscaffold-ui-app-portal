import { apiRequest } from "./base";

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
      url: "/api/v1/admin/users",
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
      url: `/api/v1/admin/users/${id}`,
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
      url: "/api/v1/admin/users",
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
      url: `/api/v1/admin/users/${id}`,
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
      url: `/api/v1/admin/users/${id}`,
      method: "DELETE",
    });
  },

  // ===== UNIFIED FEATURE MANAGEMENT =====

  /**
   * Get all features for a user
   * Requires ADMIN or SUPER_ADMIN role
   */
  async getUserFeatures(userId: number): Promise<UserFeaturesResponse> {
    return apiRequest<UserFeaturesResponse>({
      url: `/api/v1/users/features/${userId}`,
      method: "GET",
    });
  },

  /**
   * Enable a feature for a user
   * Requires ADMIN or SUPER_ADMIN role
   */
  async enableUserFeature(
    userId: number,
    featureCode: string
  ): Promise<FeatureAccessResponse> {
    return apiRequest<FeatureAccessResponse>({
      url: `/api/v1/users/features/${userId}/${featureCode}/enable`,
      method: "POST",
    });
  },

  /**
   * Disable a feature for a user
   * Requires ADMIN or SUPER_ADMIN role
   */
  async disableUserFeature(
    userId: number,
    featureCode: string
  ): Promise<FeatureAccessResponse> {
    return apiRequest<FeatureAccessResponse>({
      url: `/api/v1/users/features/${userId}/${featureCode}/disable`,
      method: "DELETE",
    });
  },

  /**
   * Check if a user has access to a feature
   * Requires ADMIN or SUPER_ADMIN role
   */
  async checkUserFeatureAccess(
    userId: number,
    featureCode: string
  ): Promise<FeatureAccessResponse> {
    return apiRequest<FeatureAccessResponse>({
      url: `/api/v1/users/features/${userId}/${featureCode}/check`,
      method: "GET",
    });
  },

  /**
   * Update user features in bulk (enable/disable multiple features)
   * Requires ADMIN or SUPER_ADMIN role
   */
  async bulkUpdateUserFeatures(
    userId: number,
    request: BulkFeatureUpdateRequest
  ): Promise<BulkFeatureUpdateResponse> {
    return apiRequest<BulkFeatureUpdateResponse>({
      url: `/api/v1/users/features/${userId}`,
      method: "PUT",
      data: request,
    });
  },

  /**
   * Get all available features in the platform
   * Requires ADMIN or SUPER_ADMIN role
   */
  async getAvailableFeatures(): Promise<AvailableFeaturesResponse> {
    return apiRequest<AvailableFeaturesResponse>({
      url: "/api/v1/users/features/available",
      method: "GET",
    });
  },

  /**
   * Get microservice access information for a user
   * Requires ADMIN or SUPER_ADMIN role
   */
  async getUserMicroserviceAccess(
    userId: number
  ): Promise<MicroserviceAccessResponse> {
    return apiRequest<MicroserviceAccessResponse>({
      url: `/api/v1/users/features/${userId}/microservices`,
      method: "GET",
    });
  },

  /**
   * Get current user's features (for self-service access)
   */
  async getMyFeatures(): Promise<UserFeaturesResponse> {
    return apiRequest<UserFeaturesResponse>({
      url: "/api/v1/users/features/me",
      method: "GET",
    });
  },
};
