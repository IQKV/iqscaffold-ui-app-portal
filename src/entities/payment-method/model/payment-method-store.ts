import { create } from "zustand";
import { devtools, subscribeWithSelector } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";
import type {
  PaymentMethod,
  PaymentMethodState,
  PaymentMethodData,
  PaymentMethodMetrics,
  PaymentProvider,
} from "../types/payment-method-types";
import { PaymentMethodService } from "../services/payment-method-service";
import { paymentMethodApi } from "../api/payment-method-api";

interface PaymentMethodStore extends PaymentMethodState {
  // Actions
  setPaymentMethods: (paymentMethods: PaymentMethod[]) => void;
  setDefaultPaymentMethod: (paymentMethod: PaymentMethod | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;

  // UI Actions
  setShowAddModal: (show: boolean) => void;
  setShowEditModal: (show: boolean, paymentMethodId?: string) => void;
  setValidatingPaymentMethod: (validating: boolean) => void;
  setDeletingPaymentMethod: (deleting: boolean) => void;

  // Business Operations
  fetchPaymentMethods: (tenantId: string) => Promise<void>;
  addPaymentMethod: (
    data: PaymentMethodData & { tenantId: string; provider: PaymentProvider }
  ) => Promise<PaymentMethod>;
  updatePaymentMethod: (
    id: string,
    updates: Partial<PaymentMethodData>
  ) => Promise<PaymentMethod>;
  deletePaymentMethod: (id: string) => Promise<void>;
  setAsDefault: (
    tenantId: string,
    paymentMethodId: string
  ) => Promise<PaymentMethod>;

  // Selectors
  getPaymentMethodById: (id: string) => PaymentMethod | undefined;
  getPaymentMethodsByTenant: (tenantId: string) => PaymentMethod[];
  getDefaultPaymentMethod: (tenantId: string) => PaymentMethod | null;
  getPaymentMethodMetrics: (tenantId: string) => PaymentMethodMetrics;

  // Utilities
  reset: () => void;
}

export const usePaymentMethodStore = create<PaymentMethodStore>()(
  devtools(
    subscribeWithSelector(
      immer((set, get) => ({
        // Initial state
        paymentMethods: [],
        defaultPaymentMethod: null,
        loading: false,
        error: null,
        showAddModal: false,
        showEditModal: false,
        selectedPaymentMethodId: null,
        validatingPaymentMethod: false,
        deletingPaymentMethod: false,

        // Basic setters
        setPaymentMethods: (paymentMethods: PaymentMethod[]) =>
          set((state) => {
            state.paymentMethods = paymentMethods;
            state.defaultPaymentMethod =
              paymentMethods.find((pm) => pm.isDefault) || null;
            state.error = null;
          }),

        setDefaultPaymentMethod: (paymentMethod: PaymentMethod | null) =>
          set((state) => {
            state.defaultPaymentMethod = paymentMethod;
          }),

        setLoading: (loading: boolean) =>
          set((state) => {
            state.loading = loading;
          }),

        setError: (error: string | null) =>
          set((state) => {
            state.error = error;
            state.loading = false;
          }),

        // UI Actions
        setShowAddModal: (show: boolean) =>
          set((state) => {
            state.showAddModal = show;
          }),

        setShowEditModal: (show: boolean, paymentMethodId?: string) =>
          set((state) => {
            state.showEditModal = show;
            state.selectedPaymentMethodId = paymentMethodId || null;
          }),

        setValidatingPaymentMethod: (validating: boolean) =>
          set((state) => {
            state.validatingPaymentMethod = validating;
          }),

        setDeletingPaymentMethod: (deleting: boolean) =>
          set((state) => {
            state.deletingPaymentMethod = deleting;
          }),

        // Business Operations
        fetchPaymentMethods: async (tenantId: string) => {
          set((state) => {
            state.loading = true;
            state.error = null;
          });

          try {
            const paymentMethods = await paymentMethodApi.getByTenant(tenantId);

            set((state) => {
              state.paymentMethods = paymentMethods;
              state.defaultPaymentMethod =
                paymentMethods.find((pm) => pm.isDefault) || null;
              state.loading = false;
            });
          } catch (error) {
            const errorMessage =
              error instanceof Error
                ? error.message
                : "Failed to fetch payment methods";
            set((state) => {
              state.error = errorMessage;
              state.loading = false;
            });
            throw error;
          }
        },

        addPaymentMethod: async (
          data: PaymentMethodData & { tenantId: string; provider: PaymentProvider }
        ) => {
          set((state) => {
            state.validatingPaymentMethod = true;
            state.error = null;
          });

          try {
            // Validate payment method data
            const validation =
              PaymentMethodService.validatePaymentMethodData(data);
            if (!validation.isValid) {
              throw new Error(validation.errors.join(", "));
            }

            const paymentMethod = await paymentMethodApi.add(data);

            set((state) => {
              state.paymentMethods.push(paymentMethod);

              if (paymentMethod.isDefault) {
                state.defaultPaymentMethod = paymentMethod;
              }

              state.validatingPaymentMethod = false;
              state.showAddModal = false;
            });

            return paymentMethod;
          } catch (error) {
            const errorMessage =
              error instanceof Error
                ? error.message
                : "Failed to add payment method";
            set((state) => {
              state.error = errorMessage;
              state.validatingPaymentMethod = false;
            });
            throw error;
          }
        },

        updatePaymentMethod: async (
          id: string,
          updates: Partial<PaymentMethodData>
        ) => {
          set((state) => {
            state.loading = true;
            state.error = null;
          });

          try {
            const paymentMethod = await paymentMethodApi.update(id, updates);

            set((state) => {
              const index = state.paymentMethods.findIndex(
                (pm) => pm.id === id
              );
              if (index >= 0) {
                state.paymentMethods[index] = paymentMethod;
              }

              if (paymentMethod.isDefault) {
                state.defaultPaymentMethod = paymentMethod;
              }

              state.loading = false;
              state.showEditModal = false;
            });

            return paymentMethod;
          } catch (error) {
            const errorMessage =
              error instanceof Error
                ? error.message
                : "Failed to update payment method";
            set((state) => {
              state.error = errorMessage;
              state.loading = false;
            });
            throw error;
          }
        },

        deletePaymentMethod: async (id: string) => {
          set((state) => {
            state.deletingPaymentMethod = true;
            state.error = null;
          });

          try {
            const paymentMethod = get().getPaymentMethodById(id);
            if (!paymentMethod) {
              throw new Error("Payment method not found");
            }

            // Check if deletion is allowed
            const canDelete = PaymentMethodService.canDelete(
              paymentMethod,
              get().paymentMethods
            );
            if (!canDelete) {
              throw new Error("Cannot delete the only payment method");
            }

            await paymentMethodApi.delete(id);

            set((state) => {
              state.paymentMethods = state.paymentMethods.filter(
                (pm) => pm.id !== id
              );

              if (state.defaultPaymentMethod?.id === id) {
                state.defaultPaymentMethod =
                  state.paymentMethods.find((pm) => pm.isDefault) || null;
              }

              state.deletingPaymentMethod = false;
            });
          } catch (error) {
            const errorMessage =
              error instanceof Error
                ? error.message
                : "Failed to delete payment method";
            set((state) => {
              state.error = errorMessage;
              state.deletingPaymentMethod = false;
            });
            throw error;
          }
        },

        setAsDefault: async (tenantId: string, paymentMethodId: string) => {
          set((state) => {
            state.loading = true;
            state.error = null;
          });

          try {
            const paymentMethod = await paymentMethodApi.setDefault(
              tenantId,
              paymentMethodId
            );

            set((state) => {
              // Update all payment methods to reflect new default
              state.paymentMethods = state.paymentMethods.map((pm) => ({
                ...pm,
                isDefault: pm.id === paymentMethodId,
              }));

              state.defaultPaymentMethod = paymentMethod;
              state.loading = false;
            });

            return paymentMethod;
          } catch (error) {
            const errorMessage =
              error instanceof Error
                ? error.message
                : "Failed to set default payment method";
            set((state) => {
              state.error = errorMessage;
              state.loading = false;
            });
            throw error;
          }
        },

        // Selectors
        getPaymentMethodById: (id: string) => {
          return get().paymentMethods.find((pm) => pm.id === id);
        },

        getPaymentMethodsByTenant: (tenantId: string) => {
          return get().paymentMethods.filter((pm) => pm.tenantId === tenantId);
        },

        getDefaultPaymentMethod: (tenantId: string) => {
          const methods = get().getPaymentMethodsByTenant(tenantId);
          return PaymentMethodService.getDefaultPaymentMethod(methods);
        },

        getPaymentMethodMetrics: (tenantId: string): PaymentMethodMetrics => {
          const methods = get().getPaymentMethodsByTenant(tenantId);
          return PaymentMethodService.calculateMetrics(methods);
        },

        // Utilities
        reset: () =>
          set((state) => {
            state.paymentMethods = [];
            state.defaultPaymentMethod = null;
            state.loading = false;
            state.error = null;
            state.showAddModal = false;
            state.showEditModal = false;
            state.selectedPaymentMethodId = null;
            state.validatingPaymentMethod = false;
            state.deletingPaymentMethod = false;
          }),
      }))
    ),
    { name: "payment-method-store" }
  )
);
