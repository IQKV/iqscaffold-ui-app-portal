/**
 * Payment Methods Management Hook
 * Business logic for payment method operations
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { notifications } from "@mantine/notifications";
import { paymentMethodApi } from "@/entities/payment-method/api/payment-method-api";
import { useCurrentTenant } from "@/processes/tenant";
import type {
  PaymentMethod,
  PaymentMethodData,
} from "@/entities/payment-method/types/payment-method-types";
import { PaymentProvider } from "@/shared/types";

interface PaymentTransaction {
  id: string;
  amount: number;
  status: "succeeded" | "failed" | "pending";
  paymentMethodId: string;
  description: string;
  createdAt: Date;
  failureReason?: string;
}

interface FailedPayment {
  id: string;
  invoiceId: string;
  amount: number;
  paymentMethodId: string;
  failureReason: string;
  canRetry: boolean;
  nextRetryDate?: Date;
  attemptsRemaining: number;
}

export const usePaymentMethodsManagement = () => {
  const queryClient = useQueryClient();
  const currentTenant = useCurrentTenant();

  // Fetch payment methods
  const {
    data: paymentMethods = [],
    isLoading: paymentMethodsLoading,
    error: paymentMethodsError,
  } = useQuery({
    queryKey: ["paymentMethods", currentTenant?.tenantId],
    queryFn: () => paymentMethodApi.getByTenant(currentTenant!.tenantId),
    enabled: !!currentTenant?.tenantId,
  });

  // Fetch payment history
  const { data: paymentHistory = [], isLoading: historyLoading } = useQuery({
    queryKey: ["paymentHistory", currentTenant?.tenantId],
    queryFn: async (): Promise<PaymentTransaction[]> => {
      // Mock payment history - in real app this would come from API
      return [
        {
          id: "1",
          amount: 29.99,
          status: "succeeded",
          paymentMethodId: paymentMethods[0]?.id || "",
          description: "Monthly subscription - Pro Plan",
          createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        },
        {
          id: "2",
          amount: 29.99,
          status: "failed",
          paymentMethodId: paymentMethods[0]?.id || "",
          description: "Monthly subscription - Pro Plan",
          createdAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000),
          failureReason: "Insufficient funds",
        },
      ];
    },
    enabled: !!currentTenant?.tenantId && paymentMethods.length > 0,
  });

  // Fetch failed payments
  const { data: failedPayments = [], isLoading: failedPaymentsLoading } =
    useQuery({
      queryKey: ["failedPayments", currentTenant?.tenantId],
      queryFn: async (): Promise<FailedPayment[]> => {
        // Mock failed payments - in real app this would come from API
        return [
          {
            id: "1",
            invoiceId: "inv_123",
            amount: 29.99,
            paymentMethodId: paymentMethods[0]?.id || "",
            failureReason: "Card expired",
            canRetry: true,
            attemptsRemaining: 2,
          },
        ];
      },
      enabled: !!currentTenant?.tenantId && paymentMethods.length > 0,
    });

  // Add payment method mutation
  const addPaymentMethodMutation = useMutation({
    mutationFn: (data: PaymentMethodData) =>
      paymentMethodApi.add({
        ...data,
        tenantId: currentTenant!.tenantId,
        provider: data.provider || PaymentProvider.STRIPE,
      } as any),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["paymentMethods"] });
      notifications.show({
        title: "Payment Method Added",
        message: "Your payment method has been successfully added.",
        color: "green",
      });
    },
    onError: (error: any) => {
      notifications.show({
        title: "Failed to Add Payment Method",
        message: error.message || "Failed to add payment method.",
        color: "red",
      });
    },
  });

  // Update payment method mutation
  const updatePaymentMethodMutation = useMutation({
    mutationFn: ({
      id,
      updates,
    }: {
      id: string;
      updates: Partial<PaymentMethodData>;
    }) => paymentMethodApi.update(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["paymentMethods"] });
      notifications.show({
        title: "Payment Method Updated",
        message: "Your payment method has been successfully updated.",
        color: "green",
      });
    },
    onError: (error: any) => {
      notifications.show({
        title: "Failed to Update Payment Method",
        message: error.message || "Failed to update payment method.",
        color: "red",
      });
    },
  });

  // Delete payment method mutation
  const deletePaymentMethodMutation = useMutation({
    mutationFn: (id: string) => paymentMethodApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["paymentMethods"] });
      notifications.show({
        title: "Payment Method Removed",
        message: "Your payment method has been successfully removed.",
        color: "green",
      });
    },
    onError: (error: any) => {
      notifications.show({
        title: "Failed to Remove Payment Method",
        message: error.message || "Failed to remove payment method.",
        color: "red",
      });
    },
  });

  // Set default payment method mutation
  const setDefaultMutation = useMutation({
    mutationFn: (paymentMethodId: string) =>
      paymentMethodApi.setDefault(currentTenant!.tenantId, paymentMethodId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["paymentMethods"] });
      notifications.show({
        title: "Default Payment Method Updated",
        message: "Your default payment method has been updated.",
        color: "green",
      });
    },
    onError: (error: any) => {
      notifications.show({
        title: "Failed to Update Default",
        message: error.message || "Failed to update default payment method.",
        color: "red",
      });
    },
  });

  // Retry failed payment mutation
  const retryPaymentMutation = useMutation({
    mutationFn: async (failedPaymentId: string) => {
      // Mock retry payment - in real app this would call the API
      console.log("Retrying payment:", failedPaymentId);
      return { success: true };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["failedPayments"] });
      queryClient.invalidateQueries({ queryKey: ["paymentHistory"] });
      notifications.show({
        title: "Payment Retry Initiated",
        message: "We're attempting to process your payment again.",
        color: "blue",
      });
    },
    onError: (error: any) => {
      notifications.show({
        title: "Failed to Retry Payment",
        message: error.message || "Failed to retry payment.",
        color: "red",
      });
    },
  });

  const refreshData = () => {
    queryClient.invalidateQueries({ queryKey: ["paymentMethods"] });
    queryClient.invalidateQueries({ queryKey: ["paymentHistory"] });
    queryClient.invalidateQueries({ queryKey: ["failedPayments"] });
  };

  const isLoading =
    paymentMethodsLoading || historyLoading || failedPaymentsLoading;
  const error = paymentMethodsError?.message;

  return {
    // Data
    paymentMethods,
    paymentHistory,
    failedPayments,

    // Loading states
    isLoading,
    error,
    isAddingPaymentMethod: addPaymentMethodMutation.isPending,
    isDeletingPaymentMethod: deletePaymentMethodMutation.isPending,
    isRetryingPayment: retryPaymentMutation.isPending,

    // Actions
    addPaymentMethod: addPaymentMethodMutation.mutate,
    updatePaymentMethod: (id: string, updates: Partial<PaymentMethodData>) =>
      updatePaymentMethodMutation.mutate({ id, updates }),
    deletePaymentMethod: deletePaymentMethodMutation.mutate,
    setDefaultPaymentMethod: setDefaultMutation.mutate,
    retryFailedPayment: retryPaymentMutation.mutate,
    refreshData,
  };
};
