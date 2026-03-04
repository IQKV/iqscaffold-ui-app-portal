import axios, { AxiosError, AxiosRequestConfig, AxiosInstance } from "axios";
import { getConfig, getAuthConfig } from "@/app/config";
import { errorFromAxios, formatErrorForDisplay } from "@/shared/lib/http-error";
import { notificationService } from "@/shared/lib/notifications";
import {
  getAccessToken,
  getRefreshToken,
  setTokens,
  clearTokens,
} from "@/shared/lib/auth-tokens";
import { useTenantStore } from "@/processes/tenant";
import { i18n } from "@lingui/core";
import { getUserLocalePreference } from "@/shared/lib/locale-preference";
import { getClientLocale } from "@/shared/locales";
import { ENV_KEYS } from "@/shared/constants";

const BASE_URL = getConfig(ENV_KEYS.API_SERVER_URL);

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

// Attach Authorization header from token storage, tenant header, and locale headers
apiClient.interceptors.request.use((config) => {
  const token = getAccessToken();
  if (token) {
    config.headers = config.headers ?? {};
    (config.headers as any).Authorization = `Bearer ${token}`;

    // Extract user ID from JWT token and add X-User-ID header
    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      const userId = payload.userId || payload.sub;
      if (userId) {
        (config.headers as any)["X-User-ID"] = userId.toString();
      }
    } catch (error) {
      console.warn("Failed to extract user ID from JWT token:", error);
    }
  }

  // Add tenant ID header if available from tenant store
  // Tenant ID comes from JWT token after authentication
  const tenantId = useTenantStore.getState().currentTenantId;
  if (tenantId && !config.headers?.["X-Tenant-ID"]) {
    config.headers = config.headers ?? {};
    (config.headers as any)["X-Tenant-ID"] = tenantId;
  }

  // Add locale headers for unified backend i18n support
  // Backend LocaleResolver priority: X-User-Locale > Accept-Language > Default
  config.headers = config.headers ?? {};

  // Always send Accept-Language header (RFC 7231 standard)
  // Used by backend as fallback when X-User-Locale is not present
  const currentLocale = i18n.locale || getClientLocale();
  (config.headers as any)["Accept-Language"] = currentLocale;

  // Send X-User-Locale header if user has explicit preference
  // Backend prioritizes this over Accept-Language for:
  // - API response messages
  // - Validation error messages
  // - Email notifications
  // - Any localized content
  const userPreference = getUserLocalePreference();
  if (userPreference) {
    (config.headers as any)["X-User-Locale"] = userPreference;
  }

  return config;
});

// Refresh flow control
let isRefreshing = false;
let pendingQueue: Array<{
  resolve: (token: string | null) => void;
  reject: (err: any) => void;
}> = [];

function enqueueRequest(): Promise<string | null> {
  return new Promise((resolve, reject) =>
    pendingQueue.push({ resolve, reject })
  );
}

function resolveQueue(token: string | null) {
  pendingQueue.forEach((p) => p.resolve(token));
  pendingQueue = [];
}

function rejectQueue(err: any) {
  pendingQueue.forEach((p) => p.reject(err));
  pendingQueue = [];
}

// Dedicated client for token refresh to avoid interceptor recursion
const refreshClient = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
});

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

    // If Unauthorized, try refresh flow
    if (error.response?.status === 401 && original && !original._retry) {
      original._retry = true;

      if (isRefreshing) {
        // Wait for ongoing refresh
        const newToken = await enqueueRequest();
        if (newToken) {
          original.headers = original.headers ?? {};
          (original.headers as any).Authorization = `Bearer ${newToken}`;
          return apiClient.request(original);
        }
        // No token after refresh -> propagate
        return Promise.reject(error);
      }

      isRefreshing = true;
      try {
        const cfg = getAuthConfig();
        const refreshToken = getRefreshToken();
        if (!refreshToken) {
          clearTokens();
          resolveQueue(null);
          return Promise.reject(error);
        }
        const res = await refreshClient.post<{
          accessToken: string;
          refreshToken: string;
        }>(cfg.endpoints.refresh, { refreshToken });
        const accessToken = res.data.accessToken;
        const newRefreshToken = res.data.refreshToken;
        // We don't decode here; store raw and let auth store sync
        setTokens({
          accessToken,
          refreshToken: newRefreshToken,
          expiresAt: null,
        });
        resolveQueue(accessToken);

        // Retry original with new token
        original.headers = original.headers ?? {};
        (original.headers as any).Authorization = `Bearer ${accessToken}`;
        return apiClient.request(original);
      } catch (refreshErr) {
        clearTokens();
        rejectQueue(refreshErr);
        return Promise.reject(refreshErr);
      } finally {
        isRefreshing = false;
      }
    }

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
