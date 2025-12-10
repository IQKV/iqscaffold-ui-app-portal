import React, { useState, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { useSubscriptionStore } from "@/entities/subscription";
import { subscriptionApi } from "@/entities/subscription/api/subscription-api";
import { invoiceApi } from "@/entities/invoice/api/invoice-api";
import { paymentMethodApi } from "@/entities/payment-method/api/payment-method-api";
import { usageApi } from "@/entities/usage/api/usage-api";
import type {
  Subscription,
  Plan,
  QuotaStatus,
  Invoice,
  PaymentMethod,
} from "@/shared/types/billing";

/**
 * Custom hook for managing billing overview data
 * Fetches and manages all data needed for the billing dashboard
 */
export const useBillingOverview = () => {
  const [error, setError] = useState<string | null>(null);
  const {
    currentSubscription,
    setCurrentSubscription,
    setError: setStoreError,
  } = useSubscriptionStore();

  // Get current tenant ID (in real app, this would come from auth context)
  const tenantId = "current-tenant"; // TODO: Get from auth context

  // Fetch subscription data
  const {
    data: subscription,
    isLoading: subscriptionLoading,
    error: subscriptionError,
    refetch: refetchSubscription,
  } = useQuery({
    queryKey: ["subscription", tenantId],
    queryFn: () => subscriptionApi.getByTenant(tenantId),
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
  });

  // Handle subscription data updates
  React.useEffect(() => {
    if (subscription) {
      setCurrentSubscription(subscription);
      setError(null);
    }
    if (subscriptionError) {
      const errorMessage =
        subscriptionError instanceof Error
          ? subscriptionError.message
          : "Failed to load subscription";
      setError(errorMessage);
      setStoreError(errorMessage);
    }
  }, [subscription, subscriptionError, setCurrentSubscription, setStoreError]);

  // Fetch plan data
  const {
    data: plan,
    isLoading: planLoading,
    refetch: refetchPlan,
  } = useQuery({
    queryKey: ["plan", subscription?.planId],
    queryFn: () => subscriptionApi.getPlan(subscription!.planId),
    enabled: !!subscription?.planId,
    staleTime: 10 * 60 * 1000, // 10 minutes
    retry: 2,
  });

  // Fetch usage data
  const {
    data: usage,
    isLoading: usageLoading,
    refetch: refetchUsage,
  } = useQuery({
    queryKey: ["usage", tenantId],
    queryFn: () => usageApi.getCurrentUsage(tenantId),
    staleTime: 2 * 60 * 1000, // 2 minutes
    retry: 2,
  });

  // Fetch recent invoices
  const {
    data: recentInvoices,
    isLoading: invoicesLoading,
    refetch: refetchInvoices,
  } = useQuery({
    queryKey: ["invoices", tenantId, "recent"],
    queryFn: () => invoiceApi.getRecentInvoices(tenantId, 5),
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
  });

  // Fetch payment methods
  const {
    data: paymentMethods,
    isLoading: paymentMethodsLoading,
    refetch: refetchPaymentMethods,
  } = useQuery({
    queryKey: ["paymentMethods", tenantId],
    queryFn: () => paymentMethodApi.getByTenant(tenantId),
    staleTime: 10 * 60 * 1000, // 10 minutes
    retry: 2,
  });

  // Combined loading state
  const isLoading =
    subscriptionLoading ||
    planLoading ||
    usageLoading ||
    invoicesLoading ||
    paymentMethodsLoading;

  // Refresh all data
  const refreshData = useCallback(async () => {
    setError(null);
    try {
      await Promise.all([
        refetchSubscription(),
        refetchPlan(),
        refetchUsage(),
        refetchInvoices(),
        refetchPaymentMethods(),
      ]);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to refresh data";
      setError(errorMessage);
    }
  }, [
    refetchSubscription,
    refetchPlan,
    refetchUsage,
    refetchInvoices,
    refetchPaymentMethods,
  ]);

  // Handle errors from any query
  const combinedError =
    error ||
    (subscriptionError instanceof Error ? subscriptionError.message : null);

  return {
    // Data
    subscription: subscription || currentSubscription,
    plan,
    usage: usage || [],
    recentInvoices: recentInvoices || [],
    paymentMethods: paymentMethods || [],

    // State
    isLoading,
    error: combinedError,

    // Actions
    refreshData,

    // Individual refetch functions for granular control
    refetchSubscription,
    refetchPlan,
    refetchUsage,
    refetchInvoices,
    refetchPaymentMethods,
  };
};
