import { create } from "zustand";
import { devtools, subscribeWithSelector } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";
import type {
  Subscription,
  Plan,
  Invoice,
  PaymentMethod,
  QuotaStatus,
  BillingDashboardData,
  UsageMetric,
} from "@/shared/types/billing";

/**
 * Generic entity store creator for billing entities
 */
export interface EntityStore<T> {
  items: T[];
  loading: boolean;
  error: string | null;

  // CRUD operations
  setItems: (items: T[]) => void;
  addItem: (item: T) => void;
  updateItem: (id: string, updates: Partial<T>) => void;
  removeItem: (id: string) => void;

  // State management
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  reset: () => void;

  // Selectors
  getById: (id: string) => T | undefined;
  getByTenantId: (tenantId: string) => T[];
}

export const createEntityStore = <T extends { id: string; tenantId?: string }>(
  name: string
) => {
  return create<EntityStore<T>>()(
    devtools(
      subscribeWithSelector(
        immer((set, get) => ({
          items: [],
          loading: false,
          error: null,

          setItems: (items: T[]) =>
            set((state) => {
              state.items = items;
              state.error = null;
            }),

          addItem: (item: T) =>
            set((state) => {
              const existingIndex = state.items.findIndex(
                (i) => i.id === item.id
              );
              if (existingIndex >= 0) {
                state.items[existingIndex] = item;
              } else {
                state.items.push(item);
              }
              state.error = null;
            }),

          updateItem: (id: string, updates: Partial<T>) =>
            set((state) => {
              const index = state.items.findIndex((item) => item.id === id);
              if (index >= 0) {
                Object.assign(state.items[index], updates);
              }
            }),

          removeItem: (id: string) =>
            set((state) => {
              state.items = state.items.filter((item) => item.id !== id);
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

          reset: () =>
            set((state) => {
              state.items = [];
              state.loading = false;
              state.error = null;
            }),

          getById: (id: string) => {
            return get().items.find((item) => item.id === id);
          },

          getByTenantId: (tenantId: string) => {
            return get().items.filter((item) => item.tenantId === tenantId);
          },
        }))
      ),
      { name: `billing-${name}-store` }
    )
  );
};

/**
 * Subscription store
 */
export const useSubscriptionStore =
  createEntityStore<Subscription>("subscription");

/**
 * Plan store
 */
export const usePlanStore = createEntityStore<Plan>("plan");

/**
 * Invoice store
 */
export const useInvoiceStore = createEntityStore<Invoice>("invoice");

/**
 * Payment method store
 */
export const usePaymentMethodStore =
  createEntityStore<PaymentMethod>("payment-method");

/**
 * Usage metrics store
 */
export const useUsageMetricStore =
  createEntityStore<UsageMetric>("usage-metric");

/**
 * Billing dashboard store for aggregated data
 */
interface BillingDashboardStore {
  dashboardData: BillingDashboardData | null;
  quotaStatus: QuotaStatus[];
  loading: boolean;
  error: string | null;
  lastUpdated: Date | null;

  // Actions
  setDashboardData: (data: BillingDashboardData) => void;
  setQuotaStatus: (status: QuotaStatus[]) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  reset: () => void;

  // Selectors
  getQuotaByMetric: (metricType: string) => QuotaStatus | undefined;
  getActiveSubscription: () => Subscription | null;
  getDefaultPaymentMethod: () => PaymentMethod | null;
  getOverdueInvoices: () => Invoice[];
}

export const useBillingDashboardStore = create<BillingDashboardStore>()(
  devtools(
    subscribeWithSelector(
      immer((set, get) => ({
        dashboardData: null,
        quotaStatus: [],
        loading: false,
        error: null,
        lastUpdated: null,

        setDashboardData: (data: BillingDashboardData) =>
          set((state) => {
            state.dashboardData = data;
            state.lastUpdated = new Date();
            state.error = null;
          }),

        setQuotaStatus: (status: QuotaStatus[]) =>
          set((state) => {
            state.quotaStatus = status;
            state.lastUpdated = new Date();
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

        reset: () =>
          set((state) => {
            state.dashboardData = null;
            state.quotaStatus = [];
            state.loading = false;
            state.error = null;
            state.lastUpdated = null;
          }),

        getQuotaByMetric: (metricType: string) => {
          return get().quotaStatus.find(
            (quota) => quota.metricType === metricType
          );
        },

        getActiveSubscription: () => {
          const data = get().dashboardData;
          return data?.subscription || null;
        },

        getDefaultPaymentMethod: () => {
          const data = get().dashboardData;
          return data?.paymentMethods?.find((pm) => pm.isDefault) || null;
        },

        getOverdueInvoices: () => {
          const data = get().dashboardData;
          return (
            data?.recentInvoices?.filter(
              (invoice) =>
                invoice.status === "open" &&
                new Date(invoice.dueDate) < new Date()
            ) || []
          );
        },
      }))
    ),
    { name: "billing-dashboard-store" }
  )
);

/**
 * Billing UI state store for form states, modals, etc.
 */
interface BillingUIStore {
  // Modal states
  showPlanUpgradeModal: boolean;
  showPaymentMethodModal: boolean;
  showInvoiceDetailModal: boolean;
  selectedInvoiceId: string | null;

  // Form states
  planChangeInProgress: boolean;
  paymentMethodFormData: any;

  // Loading states
  processingPayment: boolean;
  downloadingInvoice: boolean;

  // Actions
  setShowPlanUpgradeModal: (show: boolean) => void;
  setShowPaymentMethodModal: (show: boolean) => void;
  setShowInvoiceDetailModal: (show: boolean, invoiceId?: string) => void;
  setPlanChangeInProgress: (inProgress: boolean) => void;
  setPaymentMethodFormData: (data: any) => void;
  setProcessingPayment: (processing: boolean) => void;
  setDownloadingInvoice: (downloading: boolean) => void;
  reset: () => void;
}

export const useBillingUIStore = create<BillingUIStore>()(
  devtools(
    immer((set) => ({
      // Modal states
      showPlanUpgradeModal: false,
      showPaymentMethodModal: false,
      showInvoiceDetailModal: false,
      selectedInvoiceId: null,

      // Form states
      planChangeInProgress: false,
      paymentMethodFormData: null,

      // Loading states
      processingPayment: false,
      downloadingInvoice: false,

      setShowPlanUpgradeModal: (show: boolean) =>
        set((state) => {
          state.showPlanUpgradeModal = show;
        }),

      setShowPaymentMethodModal: (show: boolean) =>
        set((state) => {
          state.showPaymentMethodModal = show;
        }),

      setShowInvoiceDetailModal: (show: boolean, invoiceId?: string) =>
        set((state) => {
          state.showInvoiceDetailModal = show;
          state.selectedInvoiceId = invoiceId || null;
        }),

      setPlanChangeInProgress: (inProgress: boolean) =>
        set((state) => {
          state.planChangeInProgress = inProgress;
        }),

      setPaymentMethodFormData: (data: any) =>
        set((state) => {
          state.paymentMethodFormData = data;
        }),

      setProcessingPayment: (processing: boolean) =>
        set((state) => {
          state.processingPayment = processing;
        }),

      setDownloadingInvoice: (downloading: boolean) =>
        set((state) => {
          state.downloadingInvoice = downloading;
        }),

      reset: () =>
        set((state) => {
          state.showPlanUpgradeModal = false;
          state.showPaymentMethodModal = false;
          state.showInvoiceDetailModal = false;
          state.selectedInvoiceId = null;
          state.planChangeInProgress = false;
          state.paymentMethodFormData = null;
          state.processingPayment = false;
          state.downloadingInvoice = false;
        }),
    })),
    { name: "billing-ui-store" }
  )
);

/**
 * Billing cache store for optimistic updates and offline support
 */
interface BillingCacheStore {
  cache: Map<string, { data: any; timestamp: Date; ttl: number }>;

  // Actions
  set: (key: string, data: any, ttl?: number) => void;
  get: (key: string) => any | null;
  invalidate: (key: string) => void;
  clear: () => void;

  // Helpers
  isExpired: (key: string) => boolean;
  generateKey: (endpoint: string, params?: Record<string, any>) => string;
}

export const useBillingCacheStore = create<BillingCacheStore>()(
  devtools(
    immer((set, get) => ({
      cache: new Map(),

      set: (
        key: string,
        data: any,
        ttl: number = 300000 // 5 minutes default
      ) =>
        set((state) => {
          state.cache.set(key, {
            data,
            timestamp: new Date(),
            ttl,
          });
        }),

      get: (key: string) => {
        const cached = get().cache.get(key);
        if (!cached) {
          return null;
        }

        const now = new Date().getTime();
        const cacheTime = cached.timestamp.getTime();

        if (now - cacheTime > cached.ttl) {
          get().invalidate(key);
          return null;
        }

        return cached.data;
      },

      invalidate: (key: string) =>
        set((state) => {
          state.cache.delete(key);
        }),

      clear: () =>
        set((state) => {
          state.cache.clear();
        }),

      isExpired: (key: string) => {
        const cached = get().cache.get(key);
        if (!cached) {
          return true;
        }

        const now = new Date().getTime();
        const cacheTime = cached.timestamp.getTime();

        return now - cacheTime > cached.ttl;
      },

      generateKey: (endpoint: string, params?: Record<string, any>) => {
        const paramString = params ? JSON.stringify(params) : "";
        return `${endpoint}:${paramString}`;
      },
    })),
    { name: "billing-cache-store" }
  )
);

// Export store selectors for easier use
export const billingStoreSelectors = {
  // Subscription selectors
  getActiveSubscription: (tenantId: string) => {
    const subscriptions = useSubscriptionStore
      .getState()
      .getByTenantId(tenantId);
    return subscriptions.find(
      (sub) => sub.status === "active" || sub.status === "trialing"
    );
  },

  // Invoice selectors
  getOverdueInvoices: (tenantId: string) => {
    const invoices = useInvoiceStore.getState().getByTenantId(tenantId);
    return invoices.filter(
      (invoice) =>
        invoice.status === "open" && new Date(invoice.dueDate) < new Date()
    );
  },

  // Payment method selectors
  getDefaultPaymentMethod: (tenantId: string) => {
    const paymentMethods = usePaymentMethodStore
      .getState()
      .getByTenantId(tenantId);
    return paymentMethods.find((pm) => pm.isDefault);
  },

  // Usage selectors
  getCurrentUsage: (tenantId: string, metricType: string) => {
    const metrics = useUsageMetricStore.getState().getByTenantId(tenantId);
    return metrics
      .filter((metric) => metric.metricType === metricType)
      .sort(
        (a, b) =>
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      )[0];
  },
};
