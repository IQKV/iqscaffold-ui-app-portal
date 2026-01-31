import axios, {
  AxiosError,
  AxiosRequestConfig,
  InternalAxiosRequestConfig,
} from "axios";
import { getConfig } from "@/app/config";
import { normalizeAxiosError } from "./http-error";
import { notificationService } from "./notifications";
import { resolveTenantId } from "./tenant-utils";
import { ENV_KEYS, NOTIFICATION_MESSAGES } from "@/shared/constants";
import { i18n } from "@lingui/core";

const BASE_URL = getConfig(ENV_KEYS.API_SERVER_URL);

export const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

// Ensure cookies are sent globally as well (for any raw axios calls below)
axios.defaults.withCredentials = true;

// Add tenant header interceptor
api.interceptors.request.use(
  (config) => {
    // Add tenant ID header if available
    const tenantId = resolveTenantId();
    if (tenantId && !config.headers["X-Tenant-ID"]) {
      config.headers["X-Tenant-ID"] = tenantId;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const original = error.config as
      | (AxiosRequestConfig & { _retry?: boolean })
      | undefined;
    const status = error.response?.status;

    // If no response or different error, propagate
    if (!status || !original) {
      return Promise.reject(error);
    }

    const normalized = normalizeAxiosError(error);
    if (normalized.type === "server") {
      const cfg = original as any;
      if (!cfg?.__suppressGlobalError) {
        notificationService.error({
          title: i18n._(NOTIFICATION_MESSAGES.ERROR.SERVER),
          message: normalized.message,
        });
      }
    }
    return Promise.reject(normalized);
  }
);
