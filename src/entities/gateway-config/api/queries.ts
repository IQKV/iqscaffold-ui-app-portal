import { useQuery } from "@tanstack/react-query";
import { billingApi } from "@/shared/api/billing";
import { PaymentGatewayProvider } from "@/shared/api/billing/types";

export const gatewayConfigKeys = {
  all: ["gateway-configs"] as const,
  list: () => [...gatewayConfigKeys.all, "list"] as const,
  active: () => [...gatewayConfigKeys.all, "active"] as const,
  primary: () => [...gatewayConfigKeys.all, "primary"] as const,
  detail: (provider: PaymentGatewayProvider) => [...gatewayConfigKeys.all, provider] as const,
};

export const useGatewayConfigsQuery = () => {
  return useQuery({
    queryKey: gatewayConfigKeys.list(),
    queryFn: () => billingApi.listGatewayConfigs(),
  });
};

export const useActiveGatewayConfigsQuery = () => {
  return useQuery({
    queryKey: gatewayConfigKeys.active(),
    queryFn: () => billingApi.listActiveGatewayConfigs(),
  });
};

export const useGatewayConfigQuery = (provider: PaymentGatewayProvider) => {
  return useQuery({
    queryKey: gatewayConfigKeys.detail(provider),
    queryFn: () => billingApi.getGatewayConfig(provider),
    enabled: !!provider,
  });
};

export const usePrimaryGatewayConfigQuery = () => {
  return useQuery({
    queryKey: gatewayConfigKeys.primary(),
    queryFn: () => billingApi.getPrimaryGatewayConfig(),
  });
};
