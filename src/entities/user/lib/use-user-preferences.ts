/**
 * React Query hooks for user preferences
 */

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { userPreferenceApi } from "@/shared/api";
import type { UserPreference, UpdateUserPreferenceRequest } from "./user-preference-types";
import { notificationService } from "@/shared/lib/notifications";

export const USER_PREFERENCES_QUERY_KEY = ["user", "preferences"] as const;

/**
 * Hook to fetch current user's preferences
 * Auto-creates default preferences if they don't exist
 */
export function useUserPreferences() {
  return useQuery({
    queryKey: USER_PREFERENCES_QUERY_KEY,
    queryFn: userPreferenceApi.getMyPreferences,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Hook to update current user's preferences
 */
export function useUpdateUserPreferences() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateUserPreferenceRequest) => userPreferenceApi.updateMyPreferences(data),
    onSuccess: (updatedPreferences: UserPreference) => {
      // Update cache with new data
      queryClient.setQueryData(USER_PREFERENCES_QUERY_KEY, updatedPreferences);

      notificationService.success({
        title: "Preferences Updated",
        message: "Your preferences have been saved successfully.",
      });
    },
    onError: () => {
      notificationService.error({
        title: "Update Failed",
        message: "Failed to update preferences. Please try again.",
      });
    },
  });
}

/**
 * Hook to delete current user's preferences
 */
export function useDeleteUserPreferences() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: userPreferenceApi.deleteMyPreferences,
    onSuccess: () => {
      // Invalidate to trigger refetch (will create new defaults)
      queryClient.invalidateQueries({ queryKey: USER_PREFERENCES_QUERY_KEY });

      notificationService.success({
        title: "Preferences Reset",
        message: "Your preferences have been reset to defaults.",
      });
    },
    onError: () => {
      notificationService.error({
        title: "Reset Failed",
        message: "Failed to reset preferences. Please try again.",
      });
    },
  });
}
