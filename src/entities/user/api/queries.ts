import { useQuery } from "@tanstack/react-query";
import { userManagementApi, type PageParams } from "@/shared/api";

export const usersKeys = {
    all: ["users"] as const,
    lists: () => [...usersKeys.all, "list"] as const,
    list: (params: PageParams = {}) => [...usersKeys.lists(), params] as const,
    details: () => [...usersKeys.all, "detail"] as const,
    detail: (id: number) => [...usersKeys.details(), id] as const,
    features: (id: number) => [...usersKeys.detail(id), "features"] as const,
};

/**
 * Hook to fetch users with pagination and search
 */
export function useUsersQuery(params: PageParams = {}) {
    return useQuery({
        queryKey: usersKeys.list(params),
        queryFn: () => userManagementApi.getAllUsers(params),
        staleTime: 1000 * 60 * 5, // 5 minutes
    });
}

/**
 * Hook to fetch a single user by ID
 */
export function useUserQuery(id: number | undefined) {
    return useQuery({
        queryKey: usersKeys.detail(id!),
        queryFn: () => userManagementApi.getUserById(id!),
        enabled: !!id,
        staleTime: 1000 * 60 * 5, // 5 minutes
    });
}

/**
 * Hook to fetch user features
 */
export function useUserFeaturesQuery(id: number | undefined) {
    return useQuery({
        queryKey: usersKeys.features(id!),
        queryFn: () => userManagementApi.getUserFeatures(id!),
        enabled: !!id,
    });
}
