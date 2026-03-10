import type { AxiosInstance, InternalAxiosRequestConfig, AxiosResponse } from "axios";
import { performanceMonitor } from "./performanceMonitor";

/**
 * API Performance Interceptor
 *
 * Axios interceptor to automatically track API call performance.
 * Measures request duration, tracks errors, and monitors response times.
 *
 * Requirements: 13.7
 */

interface RequestMetadata {
  startTime: number;
  endpoint: string;
  method: string;
}

// Store request metadata using a WeakMap to avoid memory leaks
const requestMetadata = new WeakMap<InternalAxiosRequestConfig, RequestMetadata>();

/**
 * Setup API performance monitoring interceptors
 */
export function setupAPIPerformanceMonitoring(axiosInstance: AxiosInstance) {
  // Request interceptor - record start time
  axiosInstance.interceptors.request.use(
    (config) => {
      const metadata: RequestMetadata = {
        startTime: performance.now(),
        endpoint: config.url || "unknown",
        method: (config.method || "GET").toUpperCase(),
      };

      requestMetadata.set(config, metadata);

      return config;
    },
    (error) => {
      return Promise.reject(error);
    },
  );

  // Response interceptor - calculate duration and track
  axiosInstance.interceptors.response.use(
    (response: AxiosResponse) => {
      const metadata = requestMetadata.get(response.config);

      if (metadata) {
        const duration = performance.now() - metadata.startTime;

        performanceMonitor.trackAPICall(
          metadata.endpoint,
          metadata.method,
          duration,
          response.status,
          true,
        );

        // Clean up metadata
        requestMetadata.delete(response.config);
      }

      return response;
    },
    (error) => {
      const config = error.config;
      const metadata = config ? requestMetadata.get(config) : null;

      if (metadata) {
        const duration = performance.now() - metadata.startTime;
        const status = error.response?.status || 0;

        performanceMonitor.trackAPICall(
          metadata.endpoint,
          metadata.method,
          duration,
          status,
          false,
        );

        // Clean up metadata
        if (config) {
          requestMetadata.delete(config);
        }
      }

      return Promise.reject(error);
    },
  );
}

/**
 * Get API performance statistics
 */
export function getAPIPerformanceStats() {
  const stats = performanceMonitor.getStats();
  return stats?.api || null;
}
