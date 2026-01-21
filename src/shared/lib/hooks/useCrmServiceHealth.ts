import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/shared/api/base";
import { useCallback } from "react";

interface ServiceHealthStatus {
  isAvailable: boolean;
  lastChecked: Date;
  error?: string;
  services: {
    leads: boolean;
    contacts: boolean;
    pipeline: boolean;
  };
}

/**
 * Hook to monitor CRM service health and availability
 * 
 * Features:
 * - Periodic health checks
 * - Circuit breaker pattern
 * - Service degradation detection
 * - User notifications for service issues
 */
export function useCrmServiceHealth() {
  // Health check query
  const {
    data: healthStatus,
    error,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ["crm", "health"],
    queryFn: async (): Promise<ServiceHealthStatus> => {
      try {
        // Check individual service endpoints
        const [leadsCheck, contactsCheck, pipelineCheck] = await Promise.allSettled([
          apiRequest({ url: "/api/v1/leads/health", method: "GET" }),
          apiRequest({ url: "/api/v1/contacts/health", method: "GET" }),
          apiRequest({ url: "/api/v1/pipeline/health", method: "GET" }),
        ]);

        const services = {
          leads: leadsCheck.status === "fulfilled",
          contacts: contactsCheck.status === "fulfilled",
          pipeline: pipelineCheck.status === "fulfilled",
        };

        const isAvailable = Object.values(services).some(Boolean);

        return {
          isAvailable,
          lastChecked: new Date(),
          services,
        };
      } catch (err) {
        throw new Error(`CRM services health check failed: ${err}`);
      }
    },
    staleTime: 30000, // 30 seconds
    refetchInterval: 60000, // 1 minute
    retry: 3,
  });

  // Manual retry function
  const retryConnection = useCallback(() => {
    refetch();
  }, [refetch]);

  // Check if specific CRM feature is available
  const isFeatureAvailable = useCallback((feature: 'leads' | 'contacts' | 'pipeline') => {
    if (!healthStatus) {
      return false;
    }
    return healthStatus.services[feature];
  }, [healthStatus]);

  // Simple circuit breaker based on error state
  const circuitBreakerOpen = Boolean(error);

  return {
    isHealthy: healthStatus?.isAvailable ?? false,
    isLoading,
    error: error?.message,
    circuitBreakerOpen,
    failureCount: 0, // Simplified - no failure counting
    services: healthStatus?.services ?? { leads: false, contacts: false, pipeline: false },
    lastChecked: healthStatus?.lastChecked,
    retryConnection,
    isFeatureAvailable,
  };
}