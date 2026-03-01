import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  userManagementApi,
  type CreateUserRequest,
  type UpdateUserRequest,
} from "@/shared/api";
import { notificationService } from "@/shared/lib/notifications";
import { usersKeys } from "./queries";

/**
 * Hook to create a new user
 */
export function useCreateUserMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (userData: CreateUserRequest) =>
      userManagementApi.createUser(userData),
    onSuccess: (newUser) => {
      queryClient.invalidateQueries({ queryKey: usersKeys.lists() });
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
 */
export function useUpdateUserMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      userData,
    }: {
      id: number;
      userData: UpdateUserRequest;
    }) => userManagementApi.updateUser(id, userData),
    onSuccess: (updatedUser) => {
      queryClient.setQueryData(usersKeys.detail(updatedUser.id), updatedUser);
      queryClient.invalidateQueries({ queryKey: usersKeys.lists() });
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
 */
export function useDeleteUserMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => userManagementApi.deleteUser(id),
    onSuccess: (_, id) => {
      queryClient.removeQueries({ queryKey: usersKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: usersKeys.lists() });
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


