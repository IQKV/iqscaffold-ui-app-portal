import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  organizationApi,
  type OrganizationDto,
  type CreateOrganizationRequest,
  type UpdateOrganizationRequest,
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

export const ORGANIZATION_QUERY_KEY = "organizations";

/**
 * Hook to fetch paginated list of organizations
 * SUPER_ADMIN sees all, ADMIN sees only their organization
 */
export function useOrganizations(params?: PageParams) {
  return useQuery({
    queryKey: [ORGANIZATION_QUERY_KEY, "list", params],
    queryFn: () => organizationApi.getAllOrganizations(params),
  });
}

/**
 * Hook to fetch a single organization by ID
 */
export function useOrganization(id: number | undefined) {
  return useQuery({
    queryKey: [ORGANIZATION_QUERY_KEY, id],
    queryFn: () => organizationApi.getOrganizationById(id!),
    enabled: !!id,
  });
}

/**
 * Hook to create a new organization
 * Requires SUPER_ADMIN role
 */
export function useCreateOrganization() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateOrganizationRequest) =>
      organizationApi.createOrganization(data),
    onSuccess: (newOrganization: OrganizationDto) => {
      // Invalidate organization list queries
      queryClient.invalidateQueries({
        queryKey: [ORGANIZATION_QUERY_KEY, "list"],
      });

      notificationService.success({
        title: "Organization Created",
        message: `Organization "${newOrganization.name}" has been created successfully.`,
      });
    },
    onError: (error: any) => {
      notificationService.error({
        title: "Failed to Create Organization",
        message:
          error.message || "An error occurred while creating the organization.",
      });
    },
  });
}

/**
 * Hook to update an organization
 * Requires ADMIN or SUPER_ADMIN role
 */
export function useUpdateOrganization() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: number;
      data: UpdateOrganizationRequest;
    }) => organizationApi.updateOrganization(id, data),
    onSuccess: (updatedOrganization: OrganizationDto) => {
      // Invalidate specific organization query
      queryClient.invalidateQueries({
        queryKey: [ORGANIZATION_QUERY_KEY, updatedOrganization.id],
      });

      // Invalidate organization list queries
      queryClient.invalidateQueries({
        queryKey: [ORGANIZATION_QUERY_KEY, "list"],
      });

      notificationService.success({
        title: "Organization Updated",
        message: `Organization "${updatedOrganization.name}" has been updated successfully.`,
      });
    },
    onError: (error: any) => {
      notificationService.error({
        title: "Failed to Update Organization",
        message:
          error.message || "An error occurred while updating the organization.",
      });
    },
  });
}

/**
 * Hook to delete an organization
 * Requires SUPER_ADMIN role
 */
export function useDeleteOrganization() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => organizationApi.deleteOrganization(id),
    onSuccess: (_data, id) => {
      // Invalidate specific organization query
      queryClient.invalidateQueries({
        queryKey: [ORGANIZATION_QUERY_KEY, id],
      });

      // Invalidate organization list queries
      queryClient.invalidateQueries({
        queryKey: [ORGANIZATION_QUERY_KEY, "list"],
      });

      notificationService.success({
        title: "Organization Deleted",
        message: "Organization has been deleted successfully.",
      });
    },
    onError: (error: any) => {
      notificationService.error({
        title: "Failed to Delete Organization",
        message:
          error.message || "An error occurred while deleting the organization.",
      });
    },
  });
}
