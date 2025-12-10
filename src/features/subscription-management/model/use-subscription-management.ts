/**
 * Subscription Management Hook
 * Business logic for subscription lifecycle operations
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { notifications } from "@mantine/notifications";
import { subscriptionApi } from "@/entities/subscription/api/subscription-api";
import { planApi } from "@/shared/api/plan-api";
import { useCurrentTenant } from "@/processes/tenant";
import type {
  Subscription,
  Plan,
  TrialInfo,
  PlanChangeValidation,
} from "@/entities/subscription/types/subscription-types";

export const useSubscriptionManagement = () => {
  const queryClient = useQueryClient();
  const { currentTenant } = useCurrentTenant();
  const [selectedPlanId, setSelectedPlanId] = useState<string>("");

  // Fetch current subscription
  const {
    data: subscription,
    isLoading: subscriptionLoading,
    error: subscriptionError,
  } = useQuery({
    queryKey: ["subscription", currentTenant?.id],
    queryFn: () => subscriptionApi.getActiveSubscription(currentTenant!.id),
    enabled: !!currentTenant?.id,
  });

  // Fetch current plan details
  const { data: currentPlan, isLoading: planLoading } = useQuery({
    queryKey: ["plan", subscription?.planId],
    queryFn: () => planApi.getPlanById(subscription!.planId),
    enabled: !!subscription?.planId,
  });

  // Fetch available plans for upgrade
  const { data: availablePlans = [], isLoading: plansLoading } = useQuery({
    queryKey: ["plans", "available", subscription?.planId],
    queryFn: () => planApi.getUpgradeOptions(subscription!.planId),
    enabled: !!subscription?.planId,
  });

  // Calculate trial information
  const trialInfo: TrialInfo | null = subscription
    ? {
        isInTrial: subscription.status === "trialing",
        daysRemaining: subscription.trialEnd
          ? Math.max(
              0,
              Math.ceil(
                (new Date(subscription.trialEnd).getTime() - Date.now()) /
                  (1000 * 60 * 60 * 24)
              )
            )
          : 0,
        canExtend: subscription.status === "trialing",
        maxExtensionDays: 30,
      }
    : null;

  // Plan upgrade mutation
  const upgradeMutation = useMutation({
    mutationFn: (planId: string) =>
      subscriptionApi.changePlan(subscription!.id, planId),
    onSuccess: (updatedSubscription) => {
      queryClient.invalidateQueries({ queryKey: ["subscription"] });
      queryClient.invalidateQueries({ queryKey: ["plan"] });
      notifications.show({
        title: "Plan Updated",
        message: "Your subscription plan has been successfully updated.",
        color: "green",
      });
    },
    onError: (error: any) => {
      notifications.show({
        title: "Upgrade Failed",
        message: error.message || "Failed to upgrade subscription plan.",
        color: "red",
      });
    },
  });

  // Subscription cancellation mutation
  const cancelMutation = useMutation({
    mutationFn: (cancelAtPeriodEnd: boolean = true) =>
      subscriptionApi.cancel(subscription!.id, cancelAtPeriodEnd),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["subscription"] });
      notifications.show({
        title: "Subscription Canceled",
        message: "Your subscription has been scheduled for cancellation.",
        color: "orange",
      });
    },
    onError: (error: any) => {
      notifications.show({
        title: "Cancellation Failed",
        message: error.message || "Failed to cancel subscription.",
        color: "red",
      });
    },
  });

  // Trial extension mutation
  const extendTrialMutation = useMutation({
    mutationFn: (extensionDays: number) =>
      subscriptionApi.extendTrial(
        subscription!.id,
        extensionDays,
        "Customer request"
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["subscription"] });
      notifications.show({
        title: "Trial Extended",
        message: "Your trial period has been successfully extended.",
        color: "green",
      });
    },
    onError: (error: any) => {
      notifications.show({
        title: "Extension Failed",
        message: error.message || "Failed to extend trial period.",
        color: "red",
      });
    },
  });

  // Plan change validation
  const validatePlanChange = async (
    newPlanId: string
  ): Promise<PlanChangeValidation> => {
    if (!subscription || !currentPlan) {
      return {
        isValid: false,
        canUpgrade: false,
        canDowngrade: false,
        requiresPayment: false,
        prorationAmount: 0,
        errors: ["Subscription or plan information not available"],
      };
    }

    try {
      const proration = await subscriptionApi.calculateProration(
        subscription.id,
        newPlanId
      );

      const newPlan = availablePlans.find((p) => p.id === newPlanId);
      if (!newPlan) {
        return {
          isValid: false,
          canUpgrade: false,
          canDowngrade: false,
          requiresPayment: false,
          prorationAmount: 0,
          errors: ["Selected plan not found"],
        };
      }

      const isUpgrade = newPlan.price > currentPlan.price;
      const isDowngrade = newPlan.price < currentPlan.price;

      return {
        isValid: true,
        canUpgrade: isUpgrade,
        canDowngrade: isDowngrade,
        requiresPayment: proration.chargeAmount > 0,
        prorationAmount: proration.prorationAmount,
        errors: [],
      };
    } catch (error: any) {
      return {
        isValid: false,
        canUpgrade: false,
        canDowngrade: false,
        requiresPayment: false,
        prorationAmount: 0,
        errors: [error.message || "Failed to validate plan change"],
      };
    }
  };

  const refreshData = () => {
    queryClient.invalidateQueries({ queryKey: ["subscription"] });
    queryClient.invalidateQueries({ queryKey: ["plan"] });
    queryClient.invalidateQueries({ queryKey: ["plans"] });
  };

  const isLoading = subscriptionLoading || planLoading || plansLoading;
  const error = subscriptionError?.message;

  return {
    // Data
    subscription,
    currentPlan,
    availablePlans,
    trialInfo,

    // Loading states
    isLoading,
    error,
    isUpgrading: upgradeMutation.isPending,
    isCanceling: cancelMutation.isPending,
    isExtendingTrial: extendTrialMutation.isPending,

    // Actions
    upgradeSubscription: upgradeMutation.mutate,
    cancelSubscription: cancelMutation.mutate,
    extendTrial: extendTrialMutation.mutate,
    validatePlanChange,
    refreshData,

    // UI state
    selectedPlanId,
    setSelectedPlanId,
  };
};
