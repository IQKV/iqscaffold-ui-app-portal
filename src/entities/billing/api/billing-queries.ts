import { useQuery } from "@tanstack/react-query";
import { billingApi } from "@/shared/api/billing";
import { BillingHistoryParams } from "@/shared/api/billing/types";

export const billingKeys = {
  all: ["billing"] as const,
  payments: () => [...billingKeys.all, "payments"] as const,
  payment: (id: string) => [...billingKeys.payments(), id] as const,
  history: (params: BillingHistoryParams) =>
    [...billingKeys.payments(), "history", params] as const,
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
