import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  userManagementApi,
  type UserDto,
  type CreateUserRequest,
  type UpdateUserRequest,
} from "@/shared/api";
import { notificationService } from "@/shared/lib/notifications";

/**
 * Pagination parameters
 */
export interface PageParams {
  page?: number;
  size?: number;
  sort?: string[];
}

export const USER_MANAGEMENT_QUERY_KEY = "user-management";

/**
 * Hook to fetch paginated list of users within current tenant
 * Requires ADMIN or SUPER_ADMIN role
 */
export function useUsers(params?: PageParams) {
  return useQuery({
    queryKey: [USER_MANAGEMENT_QUERY_KEY, "list", params],
    queryFn: () => userManagementApi.getAllUsers(params),
  });
}

/**
 * Hook to fetch a single user by ID
 * Requires ADMIN or SUPER_ADMIN role
 */
export function useUser(id: number | undefined) {
  return useQuery({
    queryKey: [USER_MANAGEMENT_QUERY_KEY, id],
    queryFn: () => userManagementApi.getUserById(id!),
    enabled: !!id,
  });
}

/**
 * Hook to create a new user
 * Requires ADMIN or SUPER_ADMIN role
 * ADMIN cannot assign SUPER_ADMIN role
 */
export function useCreateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateUserRequest) => userManagementApi.createUser(data),
    onSuccess: (newUser: UserDto) => {
      // Invalidate user list queries
      queryClient.invalidateQueries({
        queryKey: [USER_MANAGEMENT_QUERY_KEY, "list"],
      });

      notificationService.success({
        title: "User Created",
        message: `User "${newUser.username}" has been created successfully.`,
      });
    },
    onError: (error: any) => {
      notificationService.error({
        title: "Failed to Create User",
        message: error.message || "An error occurred while creating the user.",
      });
    },
  });
}

/**
 * Hook to update a user
 * Requires ADMIN or SUPER_ADMIN role
 * ADMIN cannot modify SUPER_ADMIN users or assign SUPER_ADMIN role
 */
export function useUpdateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateUserRequest }) =>
      userManagementApi.updateUser(id, data),
    onSuccess: (updatedUser: UserDto) => {
      // Invalidate specific user query
      queryClient.invalidateQueries({
        queryKey: [USER_MANAGEMENT_QUERY_KEY, updatedUser.id],
      });

      // Invalidate user list queries
      queryClient.invalidateQueries({
        queryKey: [USER_MANAGEMENT_QUERY_KEY, "list"],
      });

      notificationService.success({
        title: "User Updated",
        message: `User "${updatedUser.username}" has been updated successfully.`,
      });
    },
    onError: (error: any) => {
      notificationService.error({
        title: "Failed to Update User",
        message: error.message || "An error occurred while updating the user.",
      });
    },
  });
}

/**
 * Hook to delete a user
 * Requires ADMIN or SUPER_ADMIN role
 * Cannot delete own account
 * ADMIN cannot delete SUPER_ADMIN users
 */
export function useDeleteUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => userManagementApi.deleteUser(id),
    onSuccess: (_data, id) => {
      // Invalidate specific user query
      queryClient.invalidateQueries({
        queryKey: [USER_MANAGEMENT_QUERY_KEY, id],
      });

      // Invalidate user list queries
      queryClient.invalidateQueries({
        queryKey: [USER_MANAGEMENT_QUERY_KEY, "list"],
      });

      notificationService.success({
        title: "User Deleted",
        message: "User has been deleted successfully.",
      });
    },
    onError: (error: any) => {
      notificationService.error({
        title: "Failed to Delete User",
        message: error.message || "An error occurred while deleting the user.",
      });
    },
  });
}
