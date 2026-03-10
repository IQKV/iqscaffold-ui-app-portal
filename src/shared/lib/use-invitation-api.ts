/**
 * Custom hooks for invitation API operations
 * Provides React Query hooks for invitation management
 */

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { notifications } from "@mantine/notifications";
import { t } from "@lingui/core/macro";
import {
  invitationApi,
  type CreateInvitationRequest,
  type InvitationListParams,
  type InvitationPageResponse,
  type OrganizationInvitationDto,
  type InvitationLinkResponse,
} from "@/shared/api/invitation-api";

/**
 * Query key factory for invitations
 */
export const invitationKeys = {
  all: ["invitations"] as const,
  lists: () => [...invitationKeys.all, "list"] as const,
  list: (params?: InvitationListParams) => [...invitationKeys.lists(), params] as const,
  detail: (id: number) => [...invitationKeys.all, "detail", id] as const,
  link: (id: number) => [...invitationKeys.all, "link", id] as const,
};

/**
 * Hook for listing invitations with pagination
 */
export function useInvitations(params?: InvitationListParams) {
  return useQuery<InvitationPageResponse>({
    queryKey: invitationKeys.list(params),
    queryFn: () => invitationApi.listInvitations(params),
  });
}

/**
 * Hook for getting invitation link
 */
export function useInvitationLink(invitationId: number, enabled = true) {
  return useQuery<InvitationLinkResponse>({
    queryKey: invitationKeys.link(invitationId),
    queryFn: () => invitationApi.getInvitationLink(invitationId),
    enabled: enabled && !!invitationId,
  });
}

/**
 * Hook for creating an invitation
 */
export function useCreateInvitation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateInvitationRequest) => invitationApi.createInvitation(data),
    onSuccess: (data: OrganizationInvitationDto) => {
      // Invalidate invitation lists to refetch
      queryClient.invalidateQueries({ queryKey: invitationKeys.lists() });

      notifications.show({
        title: t`Invitation Created`,
        message: t`Invitation has been created successfully`,
        color: "green",
      });
    },
    onError: (error: any) => {
      notifications.show({
        title: t`Failed to Create Invitation`,
        message: error?.message || t`An error occurred while creating the invitation`,
        color: "red",
      });
    },
  });
}

/**
 * Hook for revoking an invitation
 */
export function useRevokeInvitation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (invitationId: number) => invitationApi.revokeInvitation(invitationId),
    onSuccess: () => {
      // Invalidate invitation lists to refetch
      queryClient.invalidateQueries({ queryKey: invitationKeys.lists() });

      notifications.show({
        title: t`Invitation Revoked`,
        message: t`Invitation has been revoked successfully`,
        color: "green",
      });
    },
    onError: (error: any) => {
      notifications.show({
        title: t`Failed to Revoke Invitation`,
        message: error?.message || t`An error occurred while revoking the invitation`,
        color: "red",
      });
    },
  });
}
