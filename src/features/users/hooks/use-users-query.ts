import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  fetchUsers,
  fetchUser,
  createUser,
  updateUser,
  deleteUser,
  type CreateUserRequest,
  type UpdateUserRequest,
} from "../api/users-api";

// Query keys
export const usersKeys = {
  all: ["users"] as const,
  lists: () => [...usersKeys.all, "list"] as const,
  list: (params: Record<string, unknown>) =>
    [...usersKeys.lists(), params] as const,
  details: () => [...usersKeys.all, "detail"] as const,
  detail: (id: string) => [...usersKeys.details(), id] as const,
};

/**
 * Hook to fetch users with pagination and search
 */
export function useUsersQuery(
  params: {
    page?: number;
    limit?: number;
    search?: string;
  } = {}
) {
  return useQuery({
    queryKey: usersKeys.list(params),
    queryFn: () => fetchUsers(params),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

/**
 * Hook to fetch a single user by ID
 */
export function useUserQuery(id: string) {
  return useQuery({
    queryKey: usersKeys.detail(id),
    queryFn: () => fetchUser(id),
    enabled: !!id,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

/**
 * Hook to create a new user
 */
export function useCreateUserMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (userData: CreateUserRequest) => createUser(userData),
    onSuccess: () => {
      // Invalidate and refetch users list
      queryClient.invalidateQueries({ queryKey: usersKeys.lists() });
    },
  });
}

/**
 * Hook to update a user
 */
export function useUpdateUserMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      userData,
    }: {
      id: string;
      userData: UpdateUserRequest;
    }) => updateUser(id, userData),
    onSuccess: (data, { id }) => {
      // Update the user in the cache
      queryClient.setQueryData(usersKeys.detail(id), data);
      // Invalidate users list to reflect changes
      queryClient.invalidateQueries({ queryKey: usersKeys.lists() });
    },
  });
}

/**
 * Hook to delete a user
 */
export function useDeleteUserMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteUser(id),
    onSuccess: (_, id) => {
      // Remove user from cache
      queryClient.removeQueries({ queryKey: usersKeys.detail(id) });
      // Invalidate users list
      queryClient.invalidateQueries({ queryKey: usersKeys.lists() });
    },
  });
}
