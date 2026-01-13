import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { billingApi } from "@/shared/api/billing";
import {
  BillingHistoryParams,
  PaymentGatewayProvider,
  CreateGatewayConfigRequest,
  UpdateGatewayConfigRequest,
  CreateSubscriptionRequest,
  UpdateSubscriptionRequest,
  CreateSubscriptionPlanRequest,
  UpdateSubscriptionPlanRequest,
} from "@/shared/api/billing/types";

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
  gatewayConfigs: () => [...billingKeys.all, "gateway-configs"] as const,
  gatewayConfig: (provider: PaymentGatewayProvider) =>
    [...billingKeys.gatewayConfigs(), provider] as const,
  activeGatewayConfigs: () =>
    [...billingKeys.gatewayConfigs(), "active"] as const,
  primaryGatewayConfig: () =>
    [...billingKeys.gatewayConfigs(), "primary"] as const,
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

export const usePayments = (params?: BillingHistoryParams) => {
  return useQuery({
    queryKey: billingKeys.history(params || {}),
    queryFn: () => billingApi.listPayments(params),
  });
};

export const usePayment = (id: string) => {
  return useQuery({
    queryKey: billingKeys.payment(id),
    queryFn: () => billingApi.getPayment(id),
    enabled: !!id,
  });
};

export const useRefundPayment = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => billingApi.refundPayment(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: billingKeys.payments() });
    },
  });
};

// Subscription Hooks

export const useSubscriptions = (params?: BillingHistoryParams) => {
  return useQuery({
    queryKey: billingKeys.subscriptions(),
    queryFn: () => billingApi.listSubscriptions(params),
  });
};

export const useActiveSubscription = () => {
  return useQuery({
    queryKey: billingKeys.activeSubscription(),
    queryFn: () => billingApi.getActiveSubscription(),
  });
};

export const useSubscription = (id: string) => {
  return useQuery({
    queryKey: billingKeys.subscription(id),
    queryFn: () => billingApi.getSubscription(id),
    enabled: !!id,
  });
};

export const useCreateSubscription = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (request: CreateSubscriptionRequest) =>
      billingApi.createSubscription(request),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: billingKeys.subscriptions() });
      queryClient.invalidateQueries({
        queryKey: billingKeys.activeSubscription(),
      });
    },
  });
};

export const useUpdateSubscription = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      request,
    }: {
      id: string;
      request: UpdateSubscriptionRequest;
    }) => billingApi.updateSubscription(id, request),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: billingKeys.subscriptions() });
      queryClient.invalidateQueries({
        queryKey: billingKeys.subscription(variables.id),
      });
      queryClient.invalidateQueries({
        queryKey: billingKeys.activeSubscription(),
      });
    },
  });
};

export const useCancelSubscription = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => billingApi.cancelSubscription(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: billingKeys.subscriptions() });
      queryClient.invalidateQueries({ queryKey: billingKeys.subscription(id) });
      queryClient.invalidateQueries({
        queryKey: billingKeys.activeSubscription(),
      });
    },
  });
};

export const useCancelSubscriptionImmediately = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => billingApi.cancelSubscriptionImmediately(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: billingKeys.subscriptions() });
      queryClient.invalidateQueries({ queryKey: billingKeys.subscription(id) });
      queryClient.invalidateQueries({
        queryKey: billingKeys.activeSubscription(),
      });
    },
  });
};

export const usePauseSubscription = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => billingApi.pauseSubscription(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: billingKeys.subscriptions() });
      queryClient.invalidateQueries({ queryKey: billingKeys.subscription(id) });
      queryClient.invalidateQueries({
        queryKey: billingKeys.activeSubscription(),
      });
    },
  });
};

export const useResumeSubscription = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => billingApi.resumeSubscription(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: billingKeys.subscriptions() });
      queryClient.invalidateQueries({ queryKey: billingKeys.subscription(id) });
      queryClient.invalidateQueries({
        queryKey: billingKeys.activeSubscription(),
      });
    },
  });
};

// Subscription Plan Hooks

export const useSubscriptionPlans = (params?: BillingHistoryParams) => {
  return useQuery({
    queryKey: billingKeys.subscriptionPlans(),
    queryFn: () => billingApi.listSubscriptionPlans(params),
  });
};

export const useActiveSubscriptionPlans = () => {
  return useQuery({
    queryKey: billingKeys.activeSubscriptionPlans(),
    queryFn: () => billingApi.listActiveSubscriptionPlans(),
  });
};

export const useSubscriptionPlan = (id: string) => {
  return useQuery({
    queryKey: billingKeys.subscriptionPlan(id),
    queryFn: () => billingApi.getSubscriptionPlan(id),
    enabled: !!id,
  });
};

export const useCreateSubscriptionPlan = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (request: CreateSubscriptionPlanRequest) =>
      billingApi.createSubscriptionPlan(request),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: billingKeys.subscriptionPlans(),
      });
      queryClient.invalidateQueries({
        queryKey: billingKeys.activeSubscriptionPlans(),
      });
    },
  });
};

export const useUpdateSubscriptionPlan = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      request,
    }: {
      id: string;
      request: UpdateSubscriptionPlanRequest;
    }) => billingApi.updateSubscriptionPlan(id, request),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: billingKeys.subscriptionPlans(),
      });
      queryClient.invalidateQueries({
        queryKey: billingKeys.subscriptionPlan(variables.id),
      });
      queryClient.invalidateQueries({
        queryKey: billingKeys.activeSubscriptionPlans(),
      });
    },
  });
};

export const useSyncSubscriptionPlan = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => billingApi.syncSubscriptionPlan(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({
        queryKey: billingKeys.subscriptionPlans(),
      });
      queryClient.invalidateQueries({
        queryKey: billingKeys.subscriptionPlan(id),
      });
    },
  });
};

// Invoice Hooks

export const useInvoices = (params?: BillingHistoryParams) => {
  return useQuery({
    queryKey: billingKeys.invoices(),
    queryFn: () => billingApi.listInvoices(params),
  });
};

export const useInvoice = (id: string) => {
  return useQuery({
    queryKey: billingKeys.invoice(id),
    queryFn: () => billingApi.getInvoice(id),
    enabled: !!id,
  });
};

export const useInvoicesBySubscription = (
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

export const useOpenInvoices = () => {
  return useQuery({
    queryKey: billingKeys.openInvoices(),
    queryFn: () => billingApi.listOpenInvoices(),
  });
};

// Merchant Hooks

export const useMerchantStatus = (organizationId: number) => {
  return useQuery({
    queryKey: billingKeys.merchantStatus(organizationId),
    queryFn: () => billingApi.getMerchantStatus(organizationId),
    enabled: !!organizationId,
  });
};

// Payout Hooks

export const usePayouts = (params?: BillingHistoryParams) => {
  return useQuery({
    queryKey: billingKeys.payoutHistory(params || {}),
    queryFn: () => billingApi.listPayouts(params),
  });
};

export const usePayout = (id: string) => {
  return useQuery({
    queryKey: billingKeys.payout(id),
    queryFn: () => billingApi.getPayout(id),
    enabled: !!id,
  });
};

// Gateway Configuration Hooks

export const useGatewayConfigs = () => {
  return useQuery({
    queryKey: billingKeys.gatewayConfigs(),
    queryFn: () => billingApi.listGatewayConfigs(),
  });
};

export const useActiveGatewayConfigs = () => {
  return useQuery({
    queryKey: billingKeys.activeGatewayConfigs(),
    queryFn: () => billingApi.listActiveGatewayConfigs(),
  });
};

export const useGatewayConfig = (provider: PaymentGatewayProvider) => {
  return useQuery({
    queryKey: billingKeys.gatewayConfig(provider),
    queryFn: () => billingApi.getGatewayConfig(provider),
    enabled: !!provider,
  });
};

export const usePrimaryGatewayConfig = () => {
  return useQuery({
    queryKey: billingKeys.primaryGatewayConfig(),
    queryFn: () => billingApi.getPrimaryGatewayConfig(),
  });
};

export const useCreateGatewayConfig = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (request: CreateGatewayConfigRequest) =>
      billingApi.createGatewayConfig(request),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: billingKeys.gatewayConfigs() });
    },
  });
};

export const useUpdateGatewayConfig = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      provider,
      request,
    }: {
      provider: PaymentGatewayProvider;
      request: UpdateGatewayConfigRequest;
    }) => billingApi.updateGatewayConfig(provider, request),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: billingKeys.gatewayConfigs() });
      queryClient.invalidateQueries({
        queryKey: billingKeys.gatewayConfig(variables.provider),
      });
    },
  });
};

export const useDeleteGatewayConfig = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (provider: PaymentGatewayProvider) =>
      billingApi.deleteGatewayConfig(provider),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: billingKeys.gatewayConfigs() });
    },
  });
};

export const useActivateGateway = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (provider: PaymentGatewayProvider) =>
      billingApi.activateGateway(provider),
    onSuccess: (_, provider) => {
      queryClient.invalidateQueries({ queryKey: billingKeys.gatewayConfigs() });
      queryClient.invalidateQueries({
        queryKey: billingKeys.gatewayConfig(provider),
      });
    },
  });
};

export const useDeactivateGateway = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (provider: PaymentGatewayProvider) =>
      billingApi.deactivateGateway(provider),
    onSuccess: (_, provider) => {
      queryClient.invalidateQueries({ queryKey: billingKeys.gatewayConfigs() });
      queryClient.invalidateQueries({
        queryKey: billingKeys.gatewayConfig(provider),
      });
    },
  });
};

export const useSetPrimaryGateway = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (provider: PaymentGatewayProvider) =>
      billingApi.setPrimaryGateway(provider),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: billingKeys.gatewayConfigs() });
      queryClient.invalidateQueries({
        queryKey: billingKeys.primaryGatewayConfig(),
      });
    },
  });
};
