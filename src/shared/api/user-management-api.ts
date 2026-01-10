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
};
