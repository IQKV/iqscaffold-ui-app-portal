import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/shared/api/base";
import { useCallback } from "react";

interface ServiceHealthStatus {
  isAvailable: boolean;
  lastChecked: Date;
  error?: string;
  services: Record<string, boolean>;
}

interface ServiceHealthConfig {
  /** Service name for query key */
  serviceName: string;
  /** Health check endpoints for each service */
  endpoints: Record<string, string>;
  /** Stale time in milliseconds */
  staleTime?: number;
  /** Refetch interval in milliseconds */
  refetchInterval?: number;
}

/**
 * Generic hook to monitor service health and availability
 *
 * Features:
 * - Periodic health checks
 * - Service degradation detection
 * - Reusable for any service (CRM, billing, etc.)
 */
export function useServiceHealth(config: ServiceHealthConfig) {
  const {
    serviceName,
    endpoints,
    staleTime = 30000, // 30 seconds
    refetchInterval = 60000, // 1 minute
  } = config;

  // Health check query
  const {
    data: healthStatus,
    error,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: [serviceName, "health"],
    queryFn: async (): Promise<ServiceHealthStatus> => {
      try {
        // Check individual service endpoints
        const checks = await Promise.allSettled(
          Object.entries(endpoints).map(([serviceName, endpoint]) =>
            apiRequest({ url: endpoint, method: "GET" }).then(() => ({
              serviceName,
              success: true,
            })),
          ),
        );

        const services: Record<string, boolean> = {};
        checks.forEach((check, index) => {
          const serviceName = Object.keys(endpoints)[index];
          services[serviceName] = check.status === "fulfilled";
        });

        const isAvailable = Object.values(services).some(Boolean);

        return {
          isAvailable,
          lastChecked: new Date(),
          services,
        };
      } catch (err) {
        throw new Error(`${serviceName} services health check failed: ${err}`);
      }
    },
    staleTime,
    refetchInterval,
    retry: 3,
  });

  // Manual retry function
  const retryConnection = useCallback(() => {
    refetch();
  }, [refetch]);

  // Check if specific feature is available
  const isFeatureAvailable = useCallback(
    (feature: string) => {
      if (!healthStatus) {
        return false;
      }
      return healthStatus.services[feature] ?? false;
    },
    [healthStatus],
  );

  // Simple circuit breaker based on error state
  const circuitBreakerOpen = Boolean(error);

  return {
    isHealthy: healthStatus?.isAvailable ?? false,
    isLoading,
    error: error?.message,
    circuitBreakerOpen,
    failureCount: 0, // Simplified - no failure counting
    services: healthStatus?.services ?? {},
    lastChecked: healthStatus?.lastChecked,
    retryConnection,
    isFeatureAvailable,
  };
}
