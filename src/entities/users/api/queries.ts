import { useQuery } from "@tanstack/react-query";
import { usersApi } from "@/shared/api/users";
import type { UserListParams } from "@/shared/api/users/types";

export const usersKeys = {
  all: ["users"] as const,
  lists: () => [...usersKeys.all, "list"] as const,
  list: (params?: UserListParams) => [...usersKeys.lists(), params] as const,
  details: () => [...usersKeys.all, "detail"] as const,
  detail: (id: string) => [...usersKeys.details(), id] as const,
};

/**
 * Hook to fetch users list
 */
export const useUsersQuery = (params?: UserListParams) => {
  return useQuery({
    queryKey: usersKeys.list(params),
    queryFn: () => usersApi.getUsers(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

/**
 * Hook to fetch a single user
 */
export const useUserQuery = (id: string) => {
  return useQuery({
    queryKey: usersKeys.detail(id),
    queryFn: () => usersApi.getUser(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};
