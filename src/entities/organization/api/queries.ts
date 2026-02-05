import { useQuery } from "@tanstack/react-query";
import {
    organizationApi,
    type PageParams,
} from "@/shared/api";

export const organizationKeys = {
    all: ["organizations"] as const,
    lists: () => [...organizationKeys.all, "list"] as const,
    list: (params?: PageParams) => [...organizationKeys.lists(), params] as const,
    details: () => [...organizationKeys.all, "detail"] as const,
    detail: (id: number) => [...organizationKeys.details(), id] as const,
};

/**
 * Hook to fetch paginated list of organizations
 * SUPER_ADMIN sees all, ADMIN sees only their organization
 */
export function useOrganizationsQuery(params?: PageParams) {
    return useQuery({
        queryKey: organizationKeys.list(params),
        queryFn: () => organizationApi.getAllOrganizations(params),
        staleTime: 1000 * 60 * 5, // 5 minutes
    });
}

/**
 * Hook to fetch a single organization by ID
 */
export function useOrganizationQuery(id: number | undefined) {
    return useQuery({
        queryKey: organizationKeys.detail(id!),
        queryFn: () => organizationApi.getOrganizationById(id!),
        enabled: !!id,
        staleTime: 1000 * 60 * 5, // 5 minutes
    });
}
