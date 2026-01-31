import { useServiceHealth } from "./useServiceHealth";

/**
 * Hook to monitor Billing service health and availability.
 * Wrapper around the generic useServiceHealth hook with Billing-specific configuration.
 */
export function useBillingServiceHealth() {
  return useServiceHealth({
    serviceName: "billing",
    endpoints: {
      payments: "/v1/billing/payments/health",
      subscriptions: "/v1/billing/subscriptions/health",
      invoices: "/v1/billing/invoices/health",
      gateway: "/v1/billing/gateway/health",
    },
  });
}
