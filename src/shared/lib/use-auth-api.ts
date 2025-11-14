/**
 * Custom hooks for authentication API operations
 * Provides React Query hooks for all auth endpoints
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

/**
 * Hook for resending verification email
 */
export function useResendVerification() {
  return useMutation({
    mutationFn: (email: string) => authApi.resendVerification(email),
    onSuccess: () => {
      notifications.show({
        title: t`Verification Email Sent`,
        message: t`Please check your inbox for the verification link`,
        color: "green",
      });
    },
    onError: (error: any) => {
      notifications.show({
        title: t`Failed to Send Email`,
        message: error?.message || t`Failed to send verification email`,
        color: "red",
      });
    },
  });
}

/**
 * Hook for verifying email
 */
export function useVerifyEmail() {
  return useMutation({
    mutationFn: (token: string) => authApi.verifyEmail(token),
    onSuccess: () => {
      notifications.show({
        title: t`Email Verified`,
        message: t`Your email has been successfully verified`,
        color: "green",
      });
    },
    onError: (error: any) => {
      notifications.show({
        title: t`Verification Failed`,
        message:
          error?.message ||
          t`Failed to verify email. The link may be invalid or expired.`,
        color: "red",
      });
    },
  });
}

/**
 * Hook for forgot password
 */
export function useForgotPassword() {
  return useMutation({
    mutationFn: (email: string) => authApi.forgotPassword(email),
    onSuccess: () => {
      notifications.show({
        title: t`Reset Link Sent`,
        message: t`Please check your email for the password reset link`,
        color: "green",
      });
    },
    onError: (error: any) => {
      notifications.show({
        title: t`Failed to Send Reset Link`,
        message: error?.message || t`Failed to send password reset link`,
        color: "red",
      });
    },
  });
}

/**
 * Hook for resetting password
 */
export function useResetPassword() {
  return useMutation({
    mutationFn: ({
      token,
      newPassword,
    }: {
      token: string;
      newPassword: string;
    }) => authApi.resetPassword(token, newPassword),
    onSuccess: () => {
      notifications.show({
        title: t`Password Reset Successful`,
        message: t`Your password has been successfully reset`,
        color: "green",
      });
    },
    onError: (error: any) => {
      notifications.show({
        title: t`Password Reset Failed`,
        message:
          error?.message ||
          t`Failed to reset password. The link may be invalid or expired.`,
        color: "red",
      });
    },
  });
}
