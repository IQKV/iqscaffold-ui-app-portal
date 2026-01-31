import { apiClient } from "@/shared/api";
import { getAuthConfig } from "@/app/config";

export interface User {
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

export interface CreateUserRequest {
  username: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  authorities?: string[];
  tenantId?: string;
}

export interface UpdateUserRequest {
  username?: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  enabled?: boolean;
  emailVerified?: boolean;
  authorities?: string[];
}

export interface UsersResponse {
  data: User[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export interface UserResponse {
  data: User;
}

/**
 * Get authorization headers with tenant ID and access token
 */
function getAuthHeaders() {
  const config = getAuthConfig();
  const accessToken = localStorage.getItem(config.tokenStorage.accessTokenKey);

  return {
    Authorization: accessToken ? `Bearer ${accessToken}` : "",
    "X-Tenant-ID": "default",
  };
}

/**
 * Fetch users with pagination and search
 */
export async function fetchUsers(
  params: {
    page?: number;
    limit?: number;
    search?: string;
  } = {}
): Promise<UsersResponse> {
  const response = await apiClient.get<UsersResponse>("/v1/admin/users", {
    params,
    headers: getAuthHeaders(),
  });
  return response.data;
}

/**
 * Fetch user by ID
 */
export async function fetchUser(id: number): Promise<UserResponse> {
  const response = await apiClient.get<UserResponse>(`/v1/admin/users/${id}`, {
    headers: getAuthHeaders(),
  });
  return response.data;
}

/**
 * Create a new user (Admin/Super Admin only)
 */
export async function createUser(
  userData: CreateUserRequest
): Promise<UserResponse> {
  const response = await apiClient.post<UserResponse>(
    "/v1/admin/users",
    userData,
    {
      headers: getAuthHeaders(),
    }
  );
  return response.data;
}

/**
 * Update user (Admin/Super Admin only)
 */
export async function updateUser(
  id: number,
  userData: UpdateUserRequest
): Promise<UserResponse> {
  const response = await apiClient.put<UserResponse>(
    `/v1/admin/users/${id}`,
    userData,
    {
      headers: getAuthHeaders(),
    }
  );
  return response.data;
}

/**
 * Delete user (Admin/Super Admin only)
 */
export async function deleteUser(id: number): Promise<{ message: string }> {
  const response = await apiClient.delete<{ message: string }>(
    `/v1/admin/users/${id}`,
    {
      headers: getAuthHeaders(),
    }
  );
  return response.data;
}
