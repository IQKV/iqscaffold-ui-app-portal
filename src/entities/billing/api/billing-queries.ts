import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { billingApi } from "@/shared/api/billing";
import {
  BillingHistoryParams,
  PaymentGatewayProvider,
  CreateGatewayConfigRequest,
  UpdateGatewayConfigRequest,
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
};

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

export const useMerchantStatus = (organizationId: number) => {
  return useQuery({
    queryKey: billingKeys.merchantStatus(organizationId),
    queryFn: () => billingApi.getMerchantStatus(organizationId),
    enabled: !!organizationId,
  });
};

export const useRefundPayment = () => {
  return useMutation({
    mutationFn: (id: string) => billingApi.refundPayment(id),
  });
};

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
