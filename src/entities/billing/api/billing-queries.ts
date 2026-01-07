import { useQuery, useMutation } from "@tanstack/react-query";
import { billingApi } from "@/shared/api/billing";
import { BillingHistoryParams } from "@/shared/api/billing/types";

export const billingKeys = {
  all: ["billing"] as const,
  payments: () => [...billingKeys.all, "payments"] as const,
  payment: (id: string) => [...billingKeys.payments(), id] as const,
  history: (params: BillingHistoryParams) =>
    [...billingKeys.payments(), "history", params] as const,
  merchantStatus: () => [...billingKeys.all, "merchant-status"] as const,
  payouts: () => [...billingKeys.all, "payouts"] as const,
  payout: (id: string) => [...billingKeys.payouts(), id] as const,
  payoutHistory: (params: BillingHistoryParams) =>
    [...billingKeys.payouts(), "history", params] as const,
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

export const useMerchantStatus = () => {
  return useQuery({
    queryKey: billingKeys.merchantStatus(),
    queryFn: () => billingApi.getMerchantStatus(),
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
