import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { avatarApi, type AvatarUploadResponse } from "@/shared/api/avatar-api";
import { notificationService } from "@/shared/lib/notifications";
import { useAuthStore } from "@/processes/auth/model/store";
import { t } from "@lingui/macro";

/**
 * Query keys for avatar operations
 */
export const avatarKeys = {
  avatar: () => ["avatar"] as const,
  avatarUrl: () => ["avatar", "url"] as const,
} as const;

/**
 * Hook for fetching user avatar URL
 */
export function useAvatarUrl() {
  return useQuery({
    queryKey: avatarKeys.avatarUrl(),
    queryFn: () => avatarApi.getAvatarUrl(),
    retry: false, // Don't retry on 404 (no avatar)
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
}

/**
 * Hook for uploading user avatar
 */
export function useAvatarUpload() {
  const queryClient = useQueryClient();
  const updateUser = useAuthStore((s) => s.updateUser);

  return useMutation({
    mutationFn: (file: File) => {
      // Validate file before upload
      const validation = avatarApi.validateAvatarFile(file);
      if (!validation.valid) {
        throw new Error(validation.error);
      }
      return avatarApi.uploadAvatar(file);
    },
    onSuccess: (data: AvatarUploadResponse) => {
      // Update avatar URL in cache
      queryClient.setQueryData(avatarKeys.avatarUrl(), {
        avatarUrl: data.avatarUrl,
      });

      // Update user context with new avatar URL and timestamp
      updateUser({
        avatarUrl: data.avatarUrl,
        avatarUpdatedAt: data.uploadedAt,
      });

      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: avatarKeys.avatar() });

      notificationService.success({
        title: t`Avatar Updated`,
        message: t`Your avatar has been successfully updated.`,
      });
    },
    onError: (error: Error) => {
      notificationService.error({
        title: t`Avatar Upload Failed`,
        message: error.message || t`Failed to upload avatar. Please try again.`,
      });
    },
  });
}

/**
 * Hook for deleting user avatar
 */
export function useAvatarDelete() {
  const queryClient = useQueryClient();
  const updateUser = useAuthStore((s) => s.updateUser);

  return useMutation({
    mutationFn: () => avatarApi.deleteAvatar(),
    onSuccess: () => {
      // Clear avatar URL from cache
      queryClient.removeQueries({ queryKey: avatarKeys.avatarUrl() });

      // Update user context to remove avatar
      updateUser({
        avatarUrl: undefined,
        avatarUpdatedAt: undefined,
      });

      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: avatarKeys.avatar() });

      notificationService.success({
        title: t`Avatar Deleted`,
        message: t`Your avatar has been successfully removed.`,
      });
    },
    onError: (error: Error) => {
      notificationService.error({
        title: t`Avatar Deletion Failed`,
        message: error.message || t`Failed to delete avatar. Please try again.`,
      });
    },
  });
}

/**
 * Utility function to get avatar URL with cache busting
 */
export function getAvatarUrlWithCacheBusting(
  avatarUrl?: string,
  avatarUpdatedAt?: string
): string | undefined {
  if (!avatarUrl) {
    return undefined;
  }

  if (avatarUpdatedAt) {
    const separator = avatarUrl.includes("?") ? "&" : "?";
    return `${avatarUrl}${separator}t=${new Date(avatarUpdatedAt).getTime()}`;
  }

  return avatarUrl;
}
