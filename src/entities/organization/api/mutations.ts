import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
    organizationApi,
    type OrganizationDto,
    type CreateOrganizationRequest,
    type UpdateOrganizationRequest,
} from "@/shared/api";
import { notificationService } from "@/shared/lib/notifications";
import { organizationKeys } from "./queries";

/**
 * Hook to create a new organization
 * Requires SUPER_ADMIN role
 */
export function useCreateOrganizationMutation() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: CreateOrganizationRequest) =>
            organizationApi.createOrganization(data),
        onSuccess: (newOrganization: OrganizationDto) => {
            // Invalidate organization list queries
            queryClient.invalidateQueries({
                queryKey: organizationKeys.lists(),
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
export function useUpdateOrganizationMutation() {
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
            // Update specific organization in cache
            queryClient.setQueryData(
                organizationKeys.detail(updatedOrganization.id),
                updatedOrganization
            );

            // Invalidate organization list queries
            queryClient.invalidateQueries({
                queryKey: organizationKeys.lists(),
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
export function useDeleteOrganizationMutation() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: number) => organizationApi.deleteOrganization(id),
        onSuccess: (_data, id) => {
            // Remove specific organization from cache
            queryClient.removeQueries({
                queryKey: organizationKeys.detail(id),
            });

            // Invalidate organization list queries
            queryClient.invalidateQueries({
                queryKey: organizationKeys.lists(),
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
