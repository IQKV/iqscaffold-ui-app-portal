import { useState, useCallback } from "react";
import { notifications } from "@mantine/notifications";
import { t } from "@lingui/core/macro";
import {
  isDuplicateEmailError,
  getDuplicateEmailMessage,
} from "./validation-schemas";

/**
 * Form submission state management hook
 *
 * Provides consistent handling of form submission states including:
 * - Loading states during submission (Requirement 11.5)
 * - Success notifications and form closure (Requirement 11.6)
 * - Error message display and form persistence (Requirement 11.7)
 *
 * Requirements: 11.5, 11.6, 11.7
 */

export interface FormSubmissionOptions<TData, TResult> {
  onSubmit: (data: TData) => Promise<TResult>;
  onSuccess?: (result: TResult) => void;
  onError?: (error: any) => void;
  successMessage?: string;
  errorMessage?: string;
  closeOnSuccess?: boolean;
}

export interface FormSubmissionState {
  isSubmitting: boolean;
  isSuccess: boolean;
  isError: boolean;
  error: Error | null;
}

/**
 * Hook for managing form submission states
 *
 * Usage:
 * ```tsx
 * const { submit, isSubmitting, isSuccess, isError } = useFormSubmission({
 *   onSubmit: async (data) => await createLead(data),
 *   successMessage: t`Lead created successfully`,
 *   closeOnSuccess: true,
 * });
 * ```
 */
export function useFormSubmission<TData = any, TResult = any>({
  onSubmit,
  onSuccess,
  onError,
  successMessage,
  errorMessage,
  closeOnSuccess = true,
}: FormSubmissionOptions<TData, TResult>) {
  const [state, setState] = useState<FormSubmissionState>({
    isSubmitting: false,
    isSuccess: false,
    isError: false,
    error: null,
  });

  const submit = useCallback(
    async (data: TData) => {
      // Set loading state (Requirement 11.5)
      setState({
        isSubmitting: true,
        isSuccess: false,
        isError: false,
        error: null,
      });

      try {
        const result = await onSubmit(data);

        // Set success state (Requirement 11.6)
        setState({
          isSubmitting: false,
          isSuccess: true,
          isError: false,
          error: null,
        });

        // Show success notification (Requirement 11.6)
        if (successMessage) {
          notifications.show({
            title: t`Success`,
            message: successMessage,
            color: "green",
          });
        }

        // Call success callback
        onSuccess?.(result);

        return { success: true, result };
      } catch (error: any) {
        // Set error state - form stays open (Requirement 11.7)
        setState({
          isSubmitting: false,
          isSuccess: false,
          isError: true,
          error,
        });

        // Determine error message
        let displayMessage = errorMessage || t`An error occurred`;

        // Check for duplicate email error (Requirement 11.3)
        if (isDuplicateEmailError(error)) {
          displayMessage = getDuplicateEmailMessage();
        } else if (error?.response?.data?.message) {
          displayMessage = error.response.data.message;
        } else if (error?.message) {
          displayMessage = error.message;
        }

        // Show error notification (Requirement 11.7)
        notifications.show({
          title: t`Error`,
          message: displayMessage,
          color: "red",
        });

        // Call error callback
        onError?.(error);

        return { success: false, error };
      }
    },
    [onSubmit, onSuccess, onError, successMessage, errorMessage]
  );

  const reset = useCallback(() => {
    setState({
      isSubmitting: false,
      isSuccess: false,
      isError: false,
      error: null,
    });
  }, []);

  return {
    submit,
    reset,
    ...state,
  };
}

/**
 * Utility to handle form errors with proper display
 * Requirements: 11.7
 */
export function handleFormError(error: any, context?: string): string {
  // Check for duplicate email
  if (isDuplicateEmailError(error)) {
    return getDuplicateEmailMessage();
  }

  // Extract error message from various error formats
  const errorMessage =
    error?.response?.data?.message ||
    error?.response?.data?.error ||
    error?.message ||
    t`An unexpected error occurred`;

  // Add context if provided
  if (context) {
    return `${context}: ${errorMessage}`;
  }

  return errorMessage;
}

/**
 * Utility to show success notification
 * Requirements: 11.6
 */
export function showSuccessNotification(message: string, title?: string) {
  notifications.show({
    title: title || t`Success`,
    message,
    color: "green",
    autoClose: 3000,
  });
}

/**
 * Utility to show error notification
 * Requirements: 11.7
 */
export function showErrorNotification(error: any, context?: string) {
  const message = handleFormError(error, context);

  notifications.show({
    title: t`Error`,
    message,
    color: "red",
    autoClose: 5000,
  });
}
