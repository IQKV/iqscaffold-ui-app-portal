import { useQuery } from "@tanstack/react-query";
import { billingApi } from "@/shared/api/billing";
import { useBillingServiceHealth } from "@/shared/lib/hooks/useBillingServiceHealth";
import { BillingHistoryParams } from "@/shared/api/billing/types";

export const billingKeys = {
  all: ["billing"] as const,
  payments: () => [...billingKeys.all, "payments"] as const,
  payment: (id: string) => [...billingKeys.payments(), id] as const,
  history: (params: BillingHistoryParams) =>
    [...billingKeys.payments(), "history", params] as const,
  merchantStatus: (organizationId?: number) =>
    [...billingKeys.all, "merchant-status", organizationId] as const,
  payouts: () => [...billingKeys.all, "payouts"] as const,
  payout: (id: string) => [...billingKeys.payouts(), id] as const,
  payoutHistory: (params: BillingHistoryParams) =>
    [...billingKeys.payouts(), "history", params] as const,
  subscriptions: () => [...billingKeys.all, "subscriptions"] as const,
  subscription: (id: string) => [...billingKeys.subscriptions(), id] as const,
  activeSubscription: () => [...billingKeys.subscriptions(), "active"] as const,
  subscriptionPlans: () => [...billingKeys.all, "subscription-plans"] as const,
  subscriptionPlan: (id: string) =>
    [...billingKeys.subscriptionPlans(), id] as const,
  activeSubscriptionPlans: () =>
    [...billingKeys.subscriptionPlans(), "active"] as const,
  invoices: () => [...billingKeys.all, "invoices"] as const,
  invoice: (id: string) => [...billingKeys.invoices(), id] as const,
  invoicesBySubscription: (
    subscriptionId: string,
    params: BillingHistoryParams
  ) =>
    [
      ...billingKeys.invoices(),
      "subscription",
      subscriptionId,
      params,
    ] as const,
  openInvoices: () => [...billingKeys.invoices(), "open"] as const,
};

// Payment Hooks

export const usePaymentsQuery = (params?: BillingHistoryParams) => {
  const { isFeatureAvailable } = useBillingServiceHealth();

  return useQuery({
    queryKey: billingKeys.history(params || {}),
    queryFn: () => billingApi.listPayments(params),
    enabled: isFeatureAvailable("payments"),
    retry: (failureCount, error: any) => {
      if (error?.response?.status === 503) {
        return false;
      }
      return failureCount < 3;
    },
  });
};

export const usePaymentQuery = (id: string) => {
  const { isFeatureAvailable } = useBillingServiceHealth();

  return useQuery({
    queryKey: billingKeys.payment(id),
    queryFn: () => billingApi.getPayment(id),
    enabled: !!id && isFeatureAvailable("payments"),
    retry: (failureCount, error: any) => {
      if (error?.response?.status === 503) {
        return false;
      }
      return failureCount < 3;
    },
  });
};

// Subscription Hooks

export const useSubscriptionsQuery = (params?: BillingHistoryParams) => {
  const { isFeatureAvailable } = useBillingServiceHealth();

  return useQuery({
    queryKey: billingKeys.subscriptions(),
    queryFn: () => billingApi.listSubscriptions(params),
    enabled: isFeatureAvailable("subscriptions"),
    retry: (failureCount, error: any) => {
      if (error?.response?.status === 503) {
        return false;
      }
      return failureCount < 3;
    },
  });
};

export const useActiveSubscriptionQuery = () => {
  const { isFeatureAvailable } = useBillingServiceHealth();

  return useQuery({
    queryKey: billingKeys.activeSubscription(),
    queryFn: () => billingApi.getActiveSubscription(),
    enabled: isFeatureAvailable("subscriptions"),
    retry: (failureCount, error: any) => {
      if (error?.response?.status === 503) {
        return false;
      }
      return failureCount < 3;
    },
  });
};

export const useSubscriptionQuery = (id: string) => {
  return useQuery({
    queryKey: billingKeys.subscription(id),
    queryFn: () => billingApi.getSubscription(id),
    enabled: !!id,
  });
};

// Subscription Plan Hooks

export const useSubscriptionPlansQuery = (params?: BillingHistoryParams) => {
  return useQuery({
    queryKey: billingKeys.subscriptionPlans(),
    queryFn: () => billingApi.listSubscriptionPlans(params),
  });
};

export const useActiveSubscriptionPlansQuery = () => {
  return useQuery({
    queryKey: billingKeys.activeSubscriptionPlans(),
    queryFn: () => billingApi.listActiveSubscriptionPlans(),
  });
};

export const useSubscriptionPlanQuery = (id: string) => {
  return useQuery({
    queryKey: billingKeys.subscriptionPlan(id),
    queryFn: () => billingApi.getSubscriptionPlan(id),
    enabled: !!id,
  });
};

// Invoice Hooks

export const useInvoicesQuery = (params?: BillingHistoryParams) => {
  return useQuery({
    queryKey: billingKeys.invoices(),
    queryFn: () => billingApi.listInvoices(params),
  });
};

export const useInvoiceQuery = (id: string) => {
  return useQuery({
    queryKey: billingKeys.invoice(id),
    queryFn: () => billingApi.getInvoice(id),
    enabled: !!id,
  });
};

export const useInvoicesBySubscriptionQuery = (
  subscriptionId: string,
  params?: BillingHistoryParams
) => {
  return useQuery({
    queryKey: billingKeys.invoicesBySubscription(subscriptionId, params || {}),
    queryFn: () =>
      billingApi.listInvoicesBySubscription(subscriptionId, params),
    enabled: !!subscriptionId,
  });
};

export const useOpenInvoicesQuery = () => {
  return useQuery({
    queryKey: billingKeys.openInvoices(),
    queryFn: () => billingApi.listOpenInvoices(),
  });
};

// Merchant Hooks

export const useMerchantStatusQuery = (organizationId: number) => {
  return useQuery({
    queryKey: billingKeys.merchantStatus(organizationId),
    queryFn: () => billingApi.getMerchantStatus(organizationId),
    enabled: !!organizationId,
  });
};

// Payout Hooks

export const usePayoutsQuery = (params?: BillingHistoryParams) => {
  return useQuery({
    queryKey: billingKeys.payoutHistory(params || {}),
    queryFn: () => billingApi.listPayouts(params),
  });
};

export const usePayoutQuery = (id: string) => {
  return useQuery({
    queryKey: billingKeys.payout(id),
    queryFn: () => billingApi.getPayout(id),
    enabled: !!id,
  });
};
