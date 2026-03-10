import { useMutation, useQueryClient } from "@tanstack/react-query";
import { billingApi } from "@/shared/api/billing";
import { billingKeys } from "./queries";
import {
  CreateSubscriptionRequest,
  UpdateSubscriptionRequest,
  CreateSubscriptionPlanRequest,
  UpdateSubscriptionPlanRequest,
} from "@/shared/api/billing/types";

// Payment Mutations

export const useRefundPaymentMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => billingApi.refundPayment(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: billingKeys.payments() });
    },
  });
};

// Subscription Mutations

export const useCreateSubscriptionMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (request: CreateSubscriptionRequest) => billingApi.createSubscription(request),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: billingKeys.subscriptions() });
      queryClient.invalidateQueries({
        queryKey: billingKeys.activeSubscription(),
      });
    },
  });
};

export const useUpdateSubscriptionMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, request }: { id: string; request: UpdateSubscriptionRequest }) =>
      billingApi.updateSubscription(id, request),
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

export const useCancelSubscriptionMutation = () => {
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

export const useCancelSubscriptionImmediatelyMutation = () => {
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

export const usePauseSubscriptionMutation = () => {
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

export const useResumeSubscriptionMutation = () => {
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

// Subscription Plan Mutations

export const useCreateSubscriptionPlanMutation = () => {
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

export const useUpdateSubscriptionPlanMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, request }: { id: string; request: UpdateSubscriptionPlanRequest }) =>
      billingApi.updateSubscriptionPlan(id, request),
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

export const useSyncSubscriptionPlanMutation = () => {
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
