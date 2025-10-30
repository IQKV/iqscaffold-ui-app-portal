import { api } from "@/shared/lib";

export interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
  role: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateUserRequest {
  name: string;
  email: string;
  role?: string;
}

export interface UpdateUserRequest {
  name?: string;
  email?: string;
  role?: string;
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
  const { data } = await api.get<UsersResponse>("/v1/users", {
    params,
  });
  return data;
}

/**
 * Fetch user by ID
 */
export async function fetchUser(id: string): Promise<UserResponse> {
  const { data } = await api.get<UserResponse>(`/v1/users/${id}`);
  return data;
}

/**
 * Create a new user
 */
export async function createUser(
  userData: CreateUserRequest
): Promise<UserResponse> {
  const { data } = await api.post<UserResponse>("/v1/users", userData);
  return data;
}

/**
 * Update user
 */
export async function updateUser(
  id: string,
  userData: UpdateUserRequest
): Promise<UserResponse> {
  const { data } = await api.put<UserResponse>(`/v1/users/${id}`, userData);
  return data;
}

/**
 * Delete user
 */
export async function deleteUser(id: string): Promise<{ message: string }> {
  const { data } = await api.delete<{ message: string }>(`/v1/users/${id}`);
  return data;
}
