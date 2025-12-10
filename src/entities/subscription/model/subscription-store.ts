import { create } from "zustand";
import { devtools, subscribeWithSelector } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";
import type {
  Subscription,
  SubscriptionState,
  CreateSubscriptionData,
  PlanChangeValidation,
  TrialInfo,
} from "../types/subscription-types";
import type { Plan, ProrationCalculation } from "@/shared/types/billing";
import { SubscriptionService } from "../services/subscription-service";

interface SubscriptionStore extends SubscriptionState {
  // Actions
  setSubscriptions: (subscriptions: Subscription[]) => void;
  setCurrentSubscription: (subscription: Subscription | null) => void;
  setAvailablePlans: (plans: Plan[]) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;

  // UI Actions
  setShowUpgradeModal: (show: boolean) => void;
  setShowCancelModal: (show: boolean) => void;
  setPlanChangeInProgress: (inProgress: boolean) => void;

  // Business Operations
  createSubscription: (data: CreateSubscriptionData) => Promise<Subscription>;
  updateSubscription: (
    id: string,
    updates: Partial<Subscription>
  ) => Promise<Subscription>;
  cancelSubscription: (
    id: string,
    cancelAtPeriodEnd?: boolean
  ) => Promise<Subscription>;
  changePlan: (
    subscriptionId: string,
    newPlanId: string
  ) => Promise<Subscription>;
  calculateProration: (
    subscriptionId: string,
    newPlanId: string
  ) => Promise<ProrationCalculation>;
  extendTrial: (
    subscriptionId: string,
    extensionDays: number,
    reason: string
  ) => Promise<Subscription>;

  // Selectors
  getSubscriptionById: (id: string) => Subscription | undefined;
  getSubscriptionsByTenant: (tenantId: string) => Subscription[];
  getActiveSubscription: (tenantId: string) => Subscription | null;
  validatePlanChange: (
    subscriptionId: string,
    newPlanId: string
  ) => PlanChangeValidation;
  getTrialInfo: (subscriptionId: string) => TrialInfo;

  // Utilities
  reset: () => void;
  refreshSubscription: (tenantId: string) => Promise<void>;
}

export const useSubscriptionStore = create<SubscriptionStore>()(
  devtools(
    subscribeWithSelector(
      immer((set, get) => ({
        // Initial state
        subscriptions: [],
        currentSubscription: null,
        availablePlans: [],
        loading: false,
        error: null,
        showUpgradeModal: false,
        showCancelModal: false,
        planChangeInProgress: false,

        // Basic setters
        setSubscriptions: (subscriptions: Subscription[]) =>
          set((state) => {
            state.subscriptions = subscriptions;
            state.error = null;
          }),

        setCurrentSubscription: (subscription: Subscription | null) =>
          set((state) => {
            state.currentSubscription = subscription;
          }),

        setAvailablePlans: (plans: Plan[]) =>
          set((state) => {
            state.availablePlans = plans;
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
        setShowUpgradeModal: (show: boolean) =>
          set((state) => {
            state.showUpgradeModal = show;
          }),

        setShowCancelModal: (show: boolean) =>
          set((state) => {
            state.showCancelModal = show;
          }),

        setPlanChangeInProgress: (inProgress: boolean) =>
          set((state) => {
            state.planChangeInProgress = inProgress;
          }),

        // Business Operations
        createSubscription: async (data: CreateSubscriptionData) => {
          set((state) => {
            state.loading = true;
            state.error = null;
          });

          try {
            const subscription = await SubscriptionService.create(data);

            set((state) => {
              state.subscriptions.push(subscription);
              state.currentSubscription = subscription;
              state.loading = false;
            });

            return subscription;
          } catch (error) {
            const errorMessage =
              error instanceof Error
                ? error.message
                : "Failed to create subscription";
            set((state) => {
              state.error = errorMessage;
              state.loading = false;
            });
            throw error;
          }
        },

        updateSubscription: async (
          id: string,
          updates: Partial<Subscription>
        ) => {
          set((state) => {
            state.loading = true;
            state.error = null;
          });

          try {
            const subscription = await SubscriptionService.update(id, updates);

            set((state) => {
              const index = state.subscriptions.findIndex((s) => s.id === id);
              if (index >= 0) {
                state.subscriptions[index] = subscription;
              }
              if (state.currentSubscription?.id === id) {
                state.currentSubscription = subscription;
              }
              state.loading = false;
            });

            return subscription;
          } catch (error) {
            const errorMessage =
              error instanceof Error
                ? error.message
                : "Failed to update subscription";
            set((state) => {
              state.error = errorMessage;
              state.loading = false;
            });
            throw error;
          }
        },

        cancelSubscription: async (
          id: string,
          cancelAtPeriodEnd: boolean = true
        ) => {
          set((state) => {
            state.loading = true;
            state.error = null;
          });

          try {
            const subscription = await SubscriptionService.cancel(
              id,
              cancelAtPeriodEnd
            );

            set((state) => {
              const index = state.subscriptions.findIndex((s) => s.id === id);
              if (index >= 0) {
                state.subscriptions[index] = subscription;
              }
              if (state.currentSubscription?.id === id) {
                state.currentSubscription = subscription;
              }
              state.loading = false;
              state.showCancelModal = false;
            });

            return subscription;
          } catch (error) {
            const errorMessage =
              error instanceof Error
                ? error.message
                : "Failed to cancel subscription";
            set((state) => {
              state.error = errorMessage;
              state.loading = false;
            });
            throw error;
          }
        },

        changePlan: async (subscriptionId: string, newPlanId: string) => {
          set((state) => {
            state.planChangeInProgress = true;
            state.error = null;
          });

          try {
            const subscription = await SubscriptionService.changePlan(
              subscriptionId,
              newPlanId
            );

            set((state) => {
              const index = state.subscriptions.findIndex(
                (s) => s.id === subscriptionId
              );
              if (index >= 0) {
                state.subscriptions[index] = subscription;
              }
              if (state.currentSubscription?.id === subscriptionId) {
                state.currentSubscription = subscription;
              }
              state.planChangeInProgress = false;
              state.showUpgradeModal = false;
            });

            return subscription;
          } catch (error) {
            const errorMessage =
              error instanceof Error ? error.message : "Failed to change plan";
            set((state) => {
              state.error = errorMessage;
              state.planChangeInProgress = false;
            });
            throw error;
          }
        },

        calculateProration: async (
          subscriptionId: string,
          newPlanId: string
        ) => {
          try {
            return await SubscriptionService.calculateProration(
              subscriptionId,
              newPlanId
            );
          } catch (error) {
            const errorMessage =
              error instanceof Error
                ? error.message
                : "Failed to calculate proration";
            set((state) => {
              state.error = errorMessage;
            });
            throw error;
          }
        },

        extendTrial: async (
          subscriptionId: string,
          extensionDays: number,
          reason: string
        ) => {
          set((state) => {
            state.loading = true;
            state.error = null;
          });

          try {
            const subscription = await SubscriptionService.extendTrial(
              subscriptionId,
              extensionDays,
              reason
            );

            set((state) => {
              const index = state.subscriptions.findIndex(
                (s) => s.id === subscriptionId
              );
              if (index >= 0) {
                state.subscriptions[index] = subscription;
              }
              if (state.currentSubscription?.id === subscriptionId) {
                state.currentSubscription = subscription;
              }
              state.loading = false;
            });

            return subscription;
          } catch (error) {
            const errorMessage =
              error instanceof Error ? error.message : "Failed to extend trial";
            set((state) => {
              state.error = errorMessage;
              state.loading = false;
            });
            throw error;
          }
        },

        // Selectors
        getSubscriptionById: (id: string) => {
          return get().subscriptions.find((s) => s.id === id);
        },

        getSubscriptionsByTenant: (tenantId: string) => {
          return get().subscriptions.filter((s) => s.tenantId === tenantId);
        },

        getActiveSubscription: (tenantId: string) => {
          const subscriptions = get().subscriptions.filter(
            (s) => s.tenantId === tenantId
          );
          return (
            subscriptions.find(
              (s) => s.status === "active" || s.status === "trialing"
            ) || null
          );
        },

        validatePlanChange: (
          subscriptionId: string,
          newPlanId: string
        ): PlanChangeValidation => {
          const subscription = get().getSubscriptionById(subscriptionId);
          const newPlan = get().availablePlans.find((p) => p.id === newPlanId);
          const currentPlan = get().availablePlans.find(
            (p) => p.id === subscription?.planId
          );

          if (!subscription || !newPlan || !currentPlan) {
            return {
              isValid: false,
              canUpgrade: false,
              canDowngrade: false,
              requiresPayment: false,
              prorationAmount: 0,
              errors: ["Invalid subscription or plan"],
            };
          }

          return SubscriptionService.validatePlanChange(
            subscription,
            currentPlan,
            newPlan
          );
        },

        getTrialInfo: (subscriptionId: string): TrialInfo => {
          const subscription = get().getSubscriptionById(subscriptionId);

          if (!subscription) {
            return {
              isInTrial: false,
              daysRemaining: 0,
              canExtend: false,
              maxExtensionDays: 0,
            };
          }

          return SubscriptionService.getTrialInfo(subscription);
        },

        // Utilities
        reset: () =>
          set((state) => {
            state.subscriptions = [];
            state.currentSubscription = null;
            state.availablePlans = [];
            state.loading = false;
            state.error = null;
            state.showUpgradeModal = false;
            state.showCancelModal = false;
            state.planChangeInProgress = false;
          }),

        refreshSubscription: async (tenantId: string) => {
          set((state) => {
            state.loading = true;
            state.error = null;
          });

          try {
            const subscription =
              await SubscriptionService.getByTenant(tenantId);

            set((state) => {
              state.currentSubscription = subscription;

              // Update in subscriptions array
              const index = state.subscriptions.findIndex(
                (s) => s.tenantId === tenantId
              );
              if (index >= 0 && subscription) {
                state.subscriptions[index] = subscription;
              } else if (subscription) {
                state.subscriptions.push(subscription);
              }

              state.loading = false;
            });
          } catch (error) {
            const errorMessage =
              error instanceof Error
                ? error.message
                : "Failed to refresh subscription";
            set((state) => {
              state.error = errorMessage;
              state.loading = false;
            });
            throw error;
          }
        },
      }))
    ),
    { name: "subscription-store" }
  )
);
