import { useServiceHealth } from "./useServiceHealth";

/**
 * Hook to monitor Billing service health and availability.
 * Wrapper around the generic useServiceHealth hook with Billing-specific configuration.
 */
export function useBillingServiceHealth() {
  return useServiceHealth({
    serviceName: "billing",
    endpoints: {
      payments: "/api/v1/billing/payments/health",
      subscriptions: "/api/v1/billing/subscriptions/health",
      invoices: "/api/v1/billing/invoices/health",
      gateway: "/api/v1/billing/gateway/health",
    },
  });
}