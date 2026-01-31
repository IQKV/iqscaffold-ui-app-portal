import { useServiceHealth } from "./useServiceHealth";

/**
 * Hook to monitor CRM service health and availability.
 * Wrapper around the generic useServiceHealth hook with CRM-specific configuration.
 */
export function useCrmServiceHealth() {
  return useServiceHealth({
    serviceName: "crm",
    endpoints: {
      leads: "/v1/leads/health",
      contacts: "/v1/contacts/health",
      pipeline: "/v1/pipeline/health",
    },
  });
}
