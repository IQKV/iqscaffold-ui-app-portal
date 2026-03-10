import React from "react";
import { UseFormReturnType } from "@mantine/form";
import {
  useMutation,
  type UseMutationOptions,
  type UseMutationResult,
} from "@tanstack/react-query";
import { errorFromAxios, toMantineErrors, formatErrorForDisplay } from "./http-error";
import { notificationService } from "./notifications";

export type NotifyConfig = {
  title?: string;
  message?: string;
  fallback?: string;
};

export type FormMutationOptions<TData, TVariables, TContext> = UseMutationOptions<
  TData,
  unknown,
  TVariables,
  TContext
> & {
  notifySuccess?: NotifyConfig | false;
  notifyError?:
    | (NotifyConfig & {
        includeFieldErrorsInMessage?: boolean;
        showTechnicalDetails?: boolean;
        enableRetry?: boolean;
      })
    | false;
  mapField?: (errors: Record<string, string>) => Record<string, string>;
  /** Focus first field with error after validation failure */
  focusErrorField?: boolean;
  /** Clear form on successful submission */
  clearOnSuccess?: boolean;
  /** Show loading notification during submission */
  showLoadingNotification?: boolean | { title?: string; message: string };
};

export function useFormMutation<TData, TVariables, TContext = unknown>(
  form: UseFormReturnType<any>,
  mutationFn: (variables: TVariables) => Promise<TData>,
  options?: FormMutationOptions<TData, TVariables, TContext>,
): UseMutationResult<TData, unknown, TVariables, TContext> {
  const {
    notifySuccess,
    notifyError = { title: "Request failed", fallback: "Something went wrong" },
    mapField,
    focusErrorField = true,
    clearOnSuccess = false,
    showLoadingNotification = false,
    onError,
    onSuccess,
    onMutate,
    ...rest
  } = options ?? ({} as any);

  const loadingNotificationIdRef = React.useRef<string | null>(null);

  return useMutation<TData, unknown, TVariables, TContext>({
    mutationFn,
    onMutate: (variables) => {
      // Clear previous field errors
      form.setErrors({});

      // Show loading notification if enabled
      if (showLoadingNotification) {
        const loadingConfig =
          typeof showLoadingNotification === "object"
            ? showLoadingNotification
            : { message: "Processing your request..." };

        loadingNotificationIdRef.current = notificationService.showLoading({
          title: loadingConfig.title,
          message: loadingConfig.message,
        });
      }

      return onMutate?.(variables);
    },
    onSuccess: (data, variables, context) => {
      // Update loading notification to success
      if (loadingNotificationIdRef.current) {
        notificationService.updateLoadingNotification(loadingNotificationIdRef.current, {
          title: notifySuccess?.title ?? "Success",
          message: notifySuccess?.message ?? "Operation completed successfully",
          type: "success",
        });
        loadingNotificationIdRef.current = null;
      } else if (notifySuccess && (notifySuccess.message || typeof notifySuccess === "object")) {
        notificationService.success({
          title: notifySuccess.title ?? "Success",
          message: (notifySuccess.message as string) ?? "Operation completed successfully",
        });
      }

      // Clear form if requested
      if (clearOnSuccess) {
        form.reset();
      }

      onSuccess?.(data, variables, context);
    },
    onError: (error, variables, context) => {
      const appError = errorFromAxios(error);

      // Update loading notification to error
      if (loadingNotificationIdRef.current) {
        const displayError = formatErrorForDisplay(appError);
        notificationService.updateLoadingNotification(loadingNotificationIdRef.current, {
          title: notifyError !== false ? (notifyError.title ?? displayError.title) : "Error",
          message: displayError.message,
          type: "error",
        });
        loadingNotificationIdRef.current = null;
      }

      // Map field-level errors to form
      const fieldErrors = toMantineErrors(appError);
      const mapped = mapField ? mapField(fieldErrors) : fieldErrors;
      const hasFieldErrors = Object.keys(mapped).length > 0;

      if (hasFieldErrors) {
        form.setErrors(mapped);

        // Focus first field with error if enabled
        if (focusErrorField && typeof document !== "undefined") {
          const firstErrorField = Object.keys(mapped)[0];
          // Use setTimeout to ensure the error is rendered first
          setTimeout(() => {
            if (typeof document !== "undefined") {
              const element = document.querySelector(`[name="${firstErrorField}"]`) as HTMLElement;
              element?.focus();
            }
          }, 100);
        }
      }

      // Show appropriate notification based on error type
      if (notifyError !== false && !loadingNotificationIdRef.current) {
        if (appError.errorType === "validation" && hasFieldErrors) {
          // Show validation-specific notification
          notificationService.validationError({
            title: notifyError.title ?? "Validation Error",
            message: notifyError.includeFieldErrorsInMessage ? undefined : appError.message,
            fieldErrors: appError.fieldErrors || {},
          });
        } else {
          // Show enhanced error notification
          const retryAction =
            notifyError.enableRetry && appError.retryable ? () => mutationFn(variables) : undefined;

          notificationService.fromAppError(appError, {
            title: notifyError.title,
            showTechnicalDetails: notifyError.showTechnicalDetails,
            retryAction,
          });
        }
      }

      onError?.(appError as any, variables, context);
    },
    ...rest,
  });
}
