import { api } from "@/shared/lib";

export interface User {
  id: string;
  username: string;
  name: string;
  email: string;
  firstName: string;
  lastName: string;
  avatar?: string;
  role: string;
  roles: string[];
  emailVerified: boolean;
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
  role?: string;
  tenantId?: string;
}

export interface UpdateUserRequest {
  username?: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  role?: string;
  emailVerified?: boolean;
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
 * Fetch users with pagination and search
 */
export async function fetchUsers(
  params: {
    page?: number;
    limit?: number;
    search?: string;
  } = {}
): Promise<UsersResponse> {
  const { data } = await api.get<UsersResponse>("/api/v1/users", {
    params,
    headers: {
      "X-Tenant-ID": "default",
    },
  });
  return data;
}

/**
 * Fetch user by ID
 */
export async function fetchUser(id: string): Promise<UserResponse> {
  const { data } = await api.get<UserResponse>(`/api/v1/users/${id}`, {
    headers: {
      "X-Tenant-ID": "default",
    },
  });
  return data;
}

/**
 * Create a new user
 */
export async function createUser(
  userData: CreateUserRequest
): Promise<UserResponse> {
  const { data } = await api.post<UserResponse>(
    "/api/v1/auth/signup",
    userData,
    {
      headers: {
        "X-Tenant-ID": "default",
      },
    }
  );
  return data;
}

/**
 * Update user
 */
export async function updateUser(
  id: string,
  userData: UpdateUserRequest
): Promise<UserResponse> {
  const { data } = await api.put<UserResponse>(
    `/api/v1/users/${id}`,
    userData,
    {
      headers: {
        "X-Tenant-ID": "default",
      },
    }
  );
  return data;
}

/**
 * Delete user
 */
export async function deleteUser(id: string): Promise<{ message: string }> {
  const { data } = await api.delete<{ message: string }>(
    `/api/v1/users/${id}`,
    {
      headers: {
        "X-Tenant-ID": "default",
      },
    }
  );
  return data;
}
