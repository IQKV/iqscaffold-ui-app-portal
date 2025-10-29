import axios, { AxiosError, AxiosRequestConfig, AxiosInstance } from "axios";
import { getConfig } from "@/app/config";
import { errorFromAxios, formatErrorForDisplay } from "@/shared/lib/http-error";
import { notificationService } from "@/shared/lib/notifications";

const BASE_URL = getConfig("VITE_API_URL_SERVER");

/**
 * Create base axios instance with common configuration
 * Updated with RFC 9457 Problem Details support
 */
export const apiClient: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json, application/problem+json",
  },
  withCredentials: true,
});

// Ensure cookies are sent globally
axios.defaults.withCredentials = true;

/**
 * Response interceptor for enhanced error handling with RFC 9457 compliance
 */
apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const original = error.config as
      | (AxiosRequestConfig & {
          _retry?: boolean;
          __suppressGlobalError?: boolean;
        })
      | undefined;

    // Convert to RFC 9457 compliant AppError
    const appError = errorFromAxios(error);

    // Show global error notification for server errors (unless suppressed)
    if (
      appError.errorType === "server" ||
      appError.errorType === "network" ||
      appError.errorType === "timeout"
    ) {
      const cfg = original as any;
      if (!cfg?.__suppressGlobalError) {
        const displayError = formatErrorForDisplay(appError);
        notificationService.error({
          title: displayError.title,
          message: displayError.referenceId
            ? `${displayError.message} (ref: ${displayError.referenceId})`
            : displayError.message,
        });
      }
    }

    return Promise.reject(appError);
  }
);

/**
 * Generic API request helper
 */
export async function apiRequest<T>(config: AxiosRequestConfig): Promise<T> {
  const response = await apiClient.request<T>(config);
  return response.data;
}
