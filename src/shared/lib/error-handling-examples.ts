/**
 * RFC 9457 Error Handling Examples with Mantine UI Integration
 *
 * This file contains practical examples of using the enhanced error handling system
 * with RFC 9457 Problem Details compliance and Mantine UI best practices.
 */

import React from "react";
import { AxiosRequestConfig } from "axios";
import { useForm } from "@mantine/form";
import {
  errorFromAxios,
  formatErrorForDisplay,
  executeWithRetry,
  withRetry,
  CircuitBreaker,
  createProblemDetail,
  PROBLEM_TYPES,
  type AppError,
  type RetryOptions,
} from "@/shared/lib";
import { apiClient } from "@/shared/api";
import { notificationService } from "@/shared/lib/notifications";
import { useLoadingState } from "@/shared/ui";

/**
 * Example 1: Basic API call with enhanced error handling
 */
export async function fetchUserProfile(userId: string) {
  try {
    const response = await apiClient.get(`/users/${userId}`);
    return response.data;
  } catch (rawError) {
    const error = errorFromAxios(rawError);

    // Log structured error information
    console.error("Failed to fetch user profile:", {
      errorType: error.errorType,
      status: error.status,
      message: error.message,
      requestId: error.requestId,
      problemType: error.type,
    });

    // Handle specific error types
    switch (error.errorType) {
      case "auth":
        // Redirect to login or refresh token
        window.location.href = "/login";
        break;

      case "network":
      case "timeout": {
        // Show retry option to user
        const displayError = formatErrorForDisplay(error);
        notificationService.problemError({
          title: displayError.title,
          message: `${displayError.message}. Please check your connection and try again.`,
          referenceId: displayError.referenceId,
          errorType: error.errorType,
        });
        break;
      }

      case "server":
        // Show generic error with reference ID
        notificationService.fromAppError(error, {
          title: "Service Unavailable",
          message:
            "Our servers are experiencing issues. Please try again later.",
        });
        break;

      default:
        // Show the error as-is
        notificationService.fromAppError(error);
    }

    throw error;
  }
}

/**
 * Example 2: Form submission with validation error handling
 */
export async function submitUserRegistration(userData: any) {
  try {
    const response = await apiClient.post("/users/register", userData);

    notificationService.success({
      title: "Registration Successful",
      message: "Welcome! Please check your email to verify your account.",
    });

    return response.data;
  } catch (rawError) {
    const error = errorFromAxios(rawError);

    if (error.errorType === "validation" && error.fieldErrors) {
      // Handle field-specific validation errors
      const fieldMessages = Object.entries(error.fieldErrors)
        .map(([field, messages]) => `${field}: ${messages.join(", ")}`)
        .join("\n");

      notificationService.error({
        title: "Registration Failed",
        message: `Please correct the following errors:\n\n${fieldMessages}`,
      });

      // Return field errors for form handling
      return { fieldErrors: error.fieldErrors };
    }

    // Handle other error types
    const displayError = formatErrorForDisplay(error);
    notificationService.error({
      title: displayError.title,
      message: displayError.message,
    });

    throw error;
  }
}

/**
 * Example 3: API call with automatic retry
 */
export async function fetchCriticalData() {
  const retryOptions: RetryOptions = {
    retryConfig: {
      maxAttempts: 5,
      baseDelay: 1000,
      maxDelay: 10000,
      backoffMultiplier: 2,
      jitterFactor: 0.1,
      retryableStatusCodes: [500, 502, 503, 504, 429],
    },
    onRetry: (context, error) => {
      console.log(
        `Retrying request (attempt ${context.attempt}/${context.maxAttempts}) after error:`,
        error.message
      );

      // Show loading notification on retry
      if (context.attempt === 2) {
        notificationService.loading({
          title: "Retrying",
          message: "Having trouble connecting. Retrying...",
        });
      }
    },
    onMaxRetriesExceeded: (context, error) => {
      console.error(
        `Max retries (${context.maxAttempts}) exceeded for critical data fetch`
      );

      notificationService.error({
        title: "Connection Failed",
        message:
          "Unable to fetch data after multiple attempts. Please try again later.",
      });
    },
  };

  return executeWithRetry<any>(
    { method: "GET", url: "/critical-data" },
    retryOptions
  );
}

/**
 * Example 4: Wrapping existing functions with retry logic
 */
export const fetchUserSettingsWithRetry = withRetry(
  async () => {
    const response = await apiClient.get("/user/settings");
    return response.data;
  },
  {
    retryConfig: { maxAttempts: 3 },
    shouldRetry: (error, attempt) => {
      // Custom retry logic: only retry network/timeout errors
      return (
        (error.errorType === "network" || error.errorType === "timeout") &&
        attempt < 3
      );
    },
  }
);

/**
 * Example 5: Circuit breaker for external service calls
 */
class ExternalServiceClient {
  private circuitBreaker = new CircuitBreaker(5, 60000); // 5 failures, 1 minute recovery

  async fetchExternalData(endpoint: string) {
    try {
      return await this.circuitBreaker.execute(async () => {
        const response = await apiClient.get(`/external/${endpoint}`);
        return response.data;
      });
    } catch (error) {
      if (
        error instanceof Error &&
        error.message === "Circuit breaker is open"
      ) {
        notificationService.warning({
          title: "Service Temporarily Unavailable",
          message:
            "External service is experiencing issues. Please try again in a few minutes.",
        });
        throw new Error("External service unavailable");
      }

      const appError = errorFromAxios(error);
      notificationService.fromAppError(appError);
      throw appError;
    }
  }

  getCircuitBreakerStatus() {
    return this.circuitBreaker.getState();
  }

  resetCircuitBreaker() {
    this.circuitBreaker.reset();
  }
}

export const externalServiceClient = new ExternalServiceClient();

/**
 * Example 6: Creating custom Problem Details
 */
export function createBusinessRuleViolationError(
  rule: string,
  details: string,
  context?: Record<string, any>
): AppError {
  const problemDetail = createProblemDetail(
    "https://myapp.com/probs/business-rule-violation",
    "Business Rule Violation",
    400,
    `Business rule "${rule}" was violated: ${details}`,
    undefined,
    {
      rule,
      context,
      timestamp: new Date().toISOString(),
    }
  );

  return {
    errorType: "client",
    message: problemDetail.detail!,
    status: 400,
    retryable: false,
    ...problemDetail,
  };
}

/**
 * Example 7: Handling rate limiting with retry-after
 */
export async function handleRateLimitedRequest(
  requestConfig: AxiosRequestConfig
) {
  try {
    return await apiClient.request(requestConfig);
  } catch (rawError) {
    const error = errorFromAxios(rawError);

    if (error.errorType === "rate-limit") {
      // Extract retry-after from response headers or Problem Details
      const retryAfter =
        error.details?.retryAfter || error.details?.["retry-after"] || 60; // Default to 60 seconds

      notificationService.warning({
        title: "Rate Limit Exceeded",
        message: `Too many requests. Please wait ${retryAfter} seconds before trying again.`,
      });

      // Optionally implement automatic retry after the specified time
      return new Promise((resolve, reject) => {
        setTimeout(async () => {
          try {
            const response = await apiClient.request(requestConfig);
            resolve(response);
          } catch (retryError) {
            reject(errorFromAxios(retryError));
          }
        }, retryAfter * 1000);
      });
    }

    throw error;
  }
}

/**
 * Example 8: Comprehensive error boundary for React components
 */
export function handleComponentError(error: unknown, errorInfo?: any) {
  const appError = errorFromAxios(error);

  // Log error for monitoring
  console.error("Component error:", {
    error: appError,
    errorInfo,
    timestamp: new Date().toISOString(),
    userAgent: navigator.userAgent,
    url: window.location.href,
  });

  // Show user-friendly error message
  const displayError = formatErrorForDisplay(appError);

  notificationService.error({
    title: "Something went wrong",
    message: appError.requestId
      ? `${displayError.message} (Error ID: ${appError.requestId})`
      : displayError.message,
    autoClose: false, // Keep error visible
  });

  // Optionally report to error tracking service
  // errorTrackingService.captureException(appError, { extra: errorInfo });
}

/**
 * Example 9: Batch operations with individual error handling
 */
export async function batchUpdateUsers(
  updates: Array<{ id: string; data: any }>
) {
  const results = await Promise.allSettled(
    updates.map(async (update) => {
      try {
        const response = await apiClient.put(
          `/users/${update.id}`,
          update.data
        );
        return { success: true, id: update.id, data: response.data };
      } catch (rawError) {
        const error = errorFromAxios(rawError);
        return {
          success: false,
          id: update.id,
          error: formatErrorForDisplay(error),
        };
      }
    })
  );

  const successful = results.filter(
    (r) => r.status === "fulfilled" && r.value.success
  );
  const failed = results.filter(
    (r) => r.status === "fulfilled" && !r.value.success
  );

  if (failed.length > 0) {
    const failedIds = failed.map((f) => (f as any).value.id).join(", ");
    notificationService.warning({
      title: "Partial Success",
      message: `${successful.length} users updated successfully. Failed to update: ${failedIds}`,
    });
  } else {
    notificationService.success({
      title: "Batch Update Complete",
      message: `Successfully updated ${successful.length} users.`,
    });
  }

  return {
    successful: successful.map((s) => (s as any).value),
    failed: failed.map((f) => (f as any).value),
  };
}

/**
 * Example 10: Progressive enhancement with fallback strategies
 */
export async function fetchDataWithFallback(
  primaryEndpoint: string,
  fallbackEndpoint?: string
) {
  try {
    // Try primary endpoint first
    return await executeWithRetry(
      { method: "GET", url: primaryEndpoint },
      { retryConfig: { maxAttempts: 2 } }
    );
  } catch (primaryError) {
    const error = errorFromAxios(primaryError);

    if (
      fallbackEndpoint &&
      (error.errorType === "server" || error.errorType === "network")
    ) {
      console.warn(
        `Primary endpoint failed (${error.message}), trying fallback...`
      );

      try {
        const fallbackData = await apiClient.get(fallbackEndpoint);

        notificationService.info({
          title: "Using Cached Data",
          message: "Showing cached data due to connectivity issues.",
        });

        return fallbackData.data;
      } catch (fallbackError) {
        console.error("Fallback also failed:", errorFromAxios(fallbackError));
      }
    }

    // If no fallback or fallback failed, show original error
    notificationService.fromAppError(error);
    throw error;
  }
}
/**

 * Example 11: Mantine Form with Enhanced Error Handling
 */
export function useMantineFormWithErrorHandling() {
  const form = useForm({
    initialValues: {
      name: "",
      email: "",
      password: "",
    },
    validate: {
      name: (value) =>
        value.length < 2 ? "Name must be at least 2 characters" : null,
      email: (value) => (/^\S+@\S+$/.test(value) ? null : "Invalid email"),
      password: (value) =>
        value.length < 8 ? "Password must be at least 8 characters" : null,
    },
  });

  const {
    isLoading,
    error,
    startLoading,
    stopLoading,
    setLoadingError,
    retry,
  } = useLoadingState();

  const handleSubmit = async (values: typeof form.values) => {
    startLoading();

    try {
      const response = await executeWithRetry(
        {
          method: "POST",
          url: "/users/register",
          data: values,
        },
        {
          onRetry: (context, error) => {
            notificationService.info({
              title: "Retrying Registration",
              message: `Attempt ${context.attempt} of ${context.maxAttempts}...`,
            });
          },
        }
      );

      stopLoading();

      notificationService.success({
        title: "Registration Successful",
        message: "Welcome! Please check your email to verify your account.",
      });

      form.reset();
      return response;
    } catch (rawError) {
      const appError = errorFromAxios(rawError);
      setLoadingError(appError);

      // Handle validation errors specifically
      if (appError.errorType === "validation" && appError.fieldErrors) {
        const mantineErrors: Record<string, string> = {};
        Object.entries(appError.fieldErrors).forEach(([field, messages]) => {
          mantineErrors[field] = messages[0]; // Take first error message
        });
        form.setErrors(mantineErrors);

        notificationService.validationError({
          title: "Registration Failed",
          fieldErrors: appError.fieldErrors,
        });
      } else {
        // Show enhanced error notification with retry option
        notificationService.fromAppError(appError, {
          title: "Registration Failed",
          retryAction: appError.retryable
            ? () => handleSubmit(values)
            : undefined,
          showTechnicalDetails: process.env.NODE_ENV === "development",
        });
      }

      throw appError;
    }
  };

  return {
    form,
    handleSubmit,
    isLoading,
    error,
    retry: () => retry(),
  };
}

/**
 * Example 12: Data Loading with Mantine Components
 */
export function useDataLoadingWithMantine<T>(
  fetchFn: () => Promise<T>,
  options: {
    showLoadingNotification?: boolean;
    retryOnError?: boolean;
    cacheKey?: string;
  } = {}
) {
  const {
    isLoading,
    error,
    startLoading,
    stopLoading,
    setLoadingError,
    retry,
  } = useLoadingState();
  const [data, setData] = React.useState<T | null>(null);

  const loadData = React.useCallback(async () => {
    startLoading();

    let loadingNotificationId: string | null = null;

    if (options.showLoadingNotification) {
      loadingNotificationId = notificationService.showLoading({
        title: "Loading Data",
        message: "Please wait while we fetch your data...",
      });
    }

    try {
      const result = await withRetry(fetchFn, {
        retryConfig: { maxAttempts: 3 },
        onRetry: (context, error) => {
          if (loadingNotificationId) {
            notificationService.updateLoadingNotification(
              loadingNotificationId,
              {
                title: "Retrying",
                message: `Attempt ${context.attempt} of ${context.maxAttempts}...`,
                type: "success", // Keep it as loading state
              }
            );
          }
        },
      });

      setData(result);
      stopLoading();

      if (loadingNotificationId) {
        notificationService.updateLoadingNotification(loadingNotificationId, {
          title: "Data Loaded",
          message: "Your data has been loaded successfully.",
          type: "success",
        });
      }

      return result;
    } catch (rawError) {
      const appError = errorFromAxios(rawError);
      setLoadingError(appError);

      if (loadingNotificationId) {
        notificationService.updateLoadingNotification(loadingNotificationId, {
          title: "Loading Failed",
          message: appError.message,
          type: "error",
        });
      } else {
        notificationService.fromAppError(appError, {
          title: "Failed to Load Data",
          // Don't include retry action to avoid circular reference
        });
      }

      throw appError;
    }
  }, [
    fetchFn,
    options.showLoadingNotification,
    startLoading,
    stopLoading,
    setLoadingError,
  ]);

  React.useEffect(() => {
    loadData();
  }, [loadData]);

  return {
    data,
    isLoading,
    error,
    retry: loadData,
    refetch: loadData,
  };
}

/**
 * Example 13: Mantine Notification Patterns
 */
export const mantineNotificationExamples = {
  // Success with action
  successWithAction: () => {
    notificationService.success({
      title: "File Uploaded",
      message: "Your file has been uploaded successfully. Click to view.",
    });
  },

  // Error with retry
  errorWithRetry: (retryFn: () => void) => {
    const error: AppError = {
      errorType: "network",
      message: "Failed to connect to server",
      retryable: true,
      type: PROBLEM_TYPES.NETWORK_ERROR,
      title: "Network Error",
      detail:
        "Unable to establish connection with the server. Please check your internet connection.",
      requestId: "req-123",
    };

    notificationService.fromAppError(error, {
      retryAction: retryFn,
      showTechnicalDetails: false,
    });
  },

  // Validation error with field details
  validationError: () => {
    notificationService.validationError({
      title: "Form Validation Failed",
      fieldErrors: {
        email: ["Email is required", "Email format is invalid"],
        password: ["Password must be at least 8 characters"],
        confirmPassword: ["Passwords do not match"],
      },
    });
  },

  // Progress notification
  progressNotification: () => {
    const id = notificationService.showLoading({
      title: "Processing",
      message: "Uploading your files...",
    });

    // Simulate progress updates
    setTimeout(() => {
      notificationService.updateLoadingNotification(id, {
        title: "Upload Complete",
        message: "All files have been uploaded successfully.",
        type: "success",
      });
    }, 3000);
  },

  // Critical error
  criticalError: () => {
    const error: AppError = {
      errorType: "server",
      message: "Database connection failed",
      retryable: false,
      type: PROBLEM_TYPES.SERVER_ERROR,
      title: "Critical System Error",
      detail:
        "The application database is currently unavailable. Please contact support if this issue persists.",
      requestId: "req-456",
    };

    notificationService.fromAppError(error, {
      showTechnicalDetails: true,
    });
  },
};

/**
 * Example 14: Enhanced Form Mutation with Mantine Integration
 */
export function useEnhancedFormMutation() {
  const form = useForm({
    initialValues: {
      title: "",
      description: "",
      category: "",
      tags: [],
    },
  });

  const mutation = useFormMutation(
    form,
    async (values) => {
      return await apiClient.post("/posts", values);
    },
    {
      // Show loading notification during submission
      showLoadingNotification: {
        title: "Creating Post",
        message: "Please wait while we create your post...",
      },

      // Clear form on success
      clearOnSuccess: true,

      // Focus first error field
      focusErrorField: true,

      // Enhanced error handling
      notifyError: {
        title: "Failed to Create Post",
        showTechnicalDetails: process.env.NODE_ENV === "development",
        enableRetry: true,
      },

      // Success notification
      notifySuccess: {
        title: "Post Created",
        message: "Your post has been published successfully!",
      },

      // Field mapping for backend field names
      mapField: (errors) => ({
        ...errors,
        title: errors.post_title || errors.title,
        description: errors.post_content || errors.description,
      }),
    }
  );

  return {
    form,
    mutation,
    handleSubmit: form.onSubmit((values) => mutation.mutate(values)),
  };
}

/**
 * Example 15: Global Error Handler for Mantine App
 */
export function setupGlobalErrorHandler() {
  // Handle unhandled promise rejections
  window.addEventListener("unhandledrejection", (event) => {
    const error = errorFromAxios(event.reason);

    console.error("Unhandled promise rejection:", error);

    // Only show notification for critical errors
    if (error.errorType === "server" || error.errorType === "network") {
      notificationService.fromAppError(error, {
        title: "Unexpected Error",
        showTechnicalDetails: false,
      });
    }

    // Prevent the default browser error handling
    event.preventDefault();
  });

  // Handle global errors
  window.addEventListener("error", (event) => {
    const error = errorFromAxios(event.error);

    console.error("Global error:", error);

    notificationService.fromAppError(error, {
      title: "Application Error",
      showTechnicalDetails: process.env.NODE_ENV === "development",
    });
  });
}

/**
 * Example 16: Mantine Theme-Aware Error Colors
 */
export function getThemeAwareErrorConfig(theme: any) {
  return {
    colors: {
      network: theme.colors.orange[6],
      timeout: theme.colors.yellow[6],
      auth: theme.colors.grape[6],
      validation: theme.colors.yellow[6],
      "rate-limit": theme.colors.indigo[6],
      server: theme.colors.red[6],
      client: theme.colors.pink[6],
      canceled: theme.colors.gray[6],
    },

    notifications: {
      position: "top-right" as const,
      autoClose: 5000,
      withCloseButton: true,
    },

    errorBoundary: {
      showReportButton: process.env.NODE_ENV === "production",
      showTechnicalDetails: process.env.NODE_ENV === "development",
    },
  };
}
