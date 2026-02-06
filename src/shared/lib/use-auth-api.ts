/**
 * Custom hooks for authentication API operations
 * Provides React Query hooks for authenticated user auth endpoints
 * 
 * Note: Unauthenticated flows (login, signup, forgot password, etc.) 
 * are handled by the auth portal at auth.iqscaffold.com
 */

import { useMutation, useQuery } from "@tanstack/react-query";
import { notifications } from "@mantine/notifications";
import { t } from "@lingui/core/macro";
import { authApi, type EmailStatusResponse } from "@/shared/api/auth-api";

/**
 * Hook for validating JWT tokens
 */
export function useValidateToken() {
  return useMutation({
    mutationFn: (token: string) => authApi.validateToken(token),
    onError: (error: any) => {
      notifications.show({
        title: t`Token Validation Failed`,
        message: error?.message || t`Failed to validate token`,
        color: "red",
      });
    },
  });
}

/**
 * Hook for changing password
 */
export function useChangePassword() {
  return useMutation({
    mutationFn: ({
      currentPassword,
      newPassword,
    }: {
      currentPassword: string;
      newPassword: string;
    }) => authApi.changePassword(currentPassword, newPassword),
    onSuccess: () => {
      notifications.show({
        title: t`Password Changed`,
        message: t`Your password has been successfully changed`,
        color: "green",
      });
    },
    onError: (error: any) => {
      notifications.show({
        title: t`Password Change Failed`,
        message:
          error?.message ||
          t`Failed to change password. Please check your current password.`,
        color: "red",
      });
    },
  });
}

/**
 * Hook for logging out from all devices
 */
export function useLogoutAll() {
  return useMutation({
    mutationFn: () => authApi.logoutAll(),
    onSuccess: () => {
      notifications.show({
        title: t`Logged Out from All Devices`,
        message: t`You have been logged out from all devices`,
        color: "green",
      });
    },
    onError: (error: any) => {
      notifications.show({
        title: t`Logout Failed`,
        message: error?.message || t`Failed to logout from all devices`,
        color: "red",
      });
    },
  });
}

/**
 * Hook for getting email verification status
 */
export function useEmailStatus(email: string, enabled = true) {
  return useQuery<EmailStatusResponse>({
    queryKey: ["email-status", email],
    queryFn: () => authApi.getEmailStatus(email),
    enabled: enabled && !!email,
    retry: false,
  });
}
