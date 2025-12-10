import { create } from "zustand";
import { devtools, subscribeWithSelector } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";
import type {
  UsageMetric,
  UsageMetricType,
  QuotaStatus,
  UsageState,
  UsageFilters,
  QuotaWarning,
  QuotaCheckResult,
} from "../types/usage-types";
import { UsageService } from "../services/usage-service";
import { QuotaEnforcementService } from "../services/quota-enforcement-service";
import { usageApi } from "../api/usage-api";
import { quotaApi } from "../api/quota-api";

interface UsageStore extends UsageState {
  // Actions
  setUsageMetrics: (metrics: UsageMetric[]) => void;
  setQuotaStatus: (status: QuotaStatus[]) => void;
  setCurrentUsage: (usage: Record<UsageMetricType, number>) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setLastUpdated: (date: Date) => void;

  // Business Operations
  fetchUsageMetrics: (
    tenantId: string,
    filters?: UsageFilters
  ) => Promise<void>;
  fetchQuotaStatus: (tenantId: string) => Promise<void>;
  recordUsage: (
    tenantId: string,
    metricType: UsageMetricType,
    amount: number,
    metadata?: Record<string, any>
  ) => Promise<UsageMetric>;
  checkQuota: (
    tenantId: string,
    metricType: UsageMetricType,
    amount?: number
  ) => Promise<QuotaCheckResult>;

  // Quota Enforcement Operations
  checkQuotaRealtime: (
    tenantId: string,
    metricType: UsageMetricType,
    amount?: number
  ) => Promise<QuotaCheckResult>;
  recordUsageWithQuotaCheck: (
    tenantId: string,
    metricType: UsageMetricType,
    amount: number,
    metadata?: Record<string, any>
  ) => Promise<{
    success: boolean;
    errorMessage?: string;
    upgradeInfo?: { suggestedPlan: string; upgradeUrl: string };
  }>;
  monitorUsageThresholds: (tenantId: string) => Promise<void>;
  checkMultipleQuotas: (
    tenantId: string,
    requests: Array<{ metricType: UsageMetricType; amount: number }>
  ) => Promise<Array<QuotaCheckResult & { metricType: UsageMetricType }>>;

  // Real-time operations
  updateCurrentUsage: (metricType: UsageMetricType, amount: number) => void;
  addQuotaWarning: (warning: QuotaWarning) => void;
  removeQuotaWarning: (metricType: UsageMetricType) => void;
  markQuotaExceeded: (metricType: UsageMetricType) => void;
  clearQuotaExceeded: (metricType: UsageMetricType) => void;

  // Selectors
  getUsageByMetric: (metricType: UsageMetricType) => UsageMetric[];
  getCurrentUsage: (metricType: UsageMetricType) => number;
  getQuotaStatus: (metricType: UsageMetricType) => QuotaStatus | undefined;
  getQuotaWarnings: (
    severity?: "info" | "warning" | "critical"
  ) => QuotaWarning[];
  isQuotaExceeded: (metricType: UsageMetricType) => boolean;

  // Utilities
  reset: () => void;
  refreshAll: (tenantId: string) => Promise<void>;
}

export const useUsageStore = create<UsageStore>()(
  devtools(
    subscribeWithSelector(
      immer((set, get) => ({
        // Initial state
        usageMetrics: [],
        quotaStatus: [],
        currentUsage: {} as Record<UsageMetricType, number>,
        loading: false,
        error: null,
        quotaWarnings: [],
        quotaExceeded: [],
        lastUpdated: null,

        // Basic setters
        setUsageMetrics: (metrics: UsageMetric[]) =>
          set((state) => {
            state.usageMetrics = metrics;
            state.error = null;
            state.lastUpdated = new Date();
          }),

        setQuotaStatus: (status: QuotaStatus[]) =>
          set((state) => {
            state.quotaStatus = status;

            // Update current usage from quota status
            status.forEach((quota) => {
              state.currentUsage[quota.metricType] = quota.current;
            });

            // Generate warnings
            state.quotaWarnings = UsageService.generateQuotaWarnings(status);

            // Update exceeded list
            state.quotaExceeded = status
              .filter((quota) => quota.exceeded && !quota.withinGrace)
              .map((quota) => quota.metricType);

            state.lastUpdated = new Date();
          }),

        setCurrentUsage: (usage: Record<UsageMetricType, number>) =>
          set((state) => {
            state.currentUsage = usage;
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

        setLastUpdated: (date: Date) =>
          set((state) => {
            state.lastUpdated = date;
          }),

        // Business Operations
        fetchUsageMetrics: async (tenantId: string, filters?: UsageFilters) => {
          set((state) => {
            state.loading = true;
            state.error = null;
          });

          try {
            const metrics = await usageApi.getUsageMetrics(tenantId, filters);

            set((state) => {
              state.usageMetrics = metrics;
              state.loading = false;
              state.lastUpdated = new Date();
            });
          } catch (error) {
            const errorMessage =
              error instanceof Error
                ? error.message
                : "Failed to fetch usage metrics";
            set((state) => {
              state.error = errorMessage;
              state.loading = false;
            });
            throw error;
          }
        },

        fetchQuotaStatus: async (tenantId: string) => {
          set((state) => {
            state.loading = true;
            state.error = null;
          });

          try {
            const status = await usageApi.getQuotaStatus(tenantId);

            set((state) => {
              state.quotaStatus = status;

              // Update current usage
              status.forEach((quota) => {
                state.currentUsage[quota.metricType] = quota.current;
              });

              // Generate warnings
              state.quotaWarnings = UsageService.generateQuotaWarnings(status);

              // Update exceeded list
              state.quotaExceeded = status
                .filter((quota) => quota.exceeded && !quota.withinGrace)
                .map((quota) => quota.metricType);

              state.loading = false;
              state.lastUpdated = new Date();
            });
          } catch (error) {
            const errorMessage =
              error instanceof Error
                ? error.message
                : "Failed to fetch quota status";
            set((state) => {
              state.error = errorMessage;
              state.loading = false;
            });
            throw error;
          }
        },

        recordUsage: async (
          tenantId: string,
          metricType: UsageMetricType,
          amount: number,
          metadata?: Record<string, any>
        ) => {
          try {
            const metric = await usageApi.recordUsage(
              tenantId,
              metricType,
              amount,
              metadata
            );

            set((state) => {
              // Add to metrics array
              state.usageMetrics.unshift(metric);

              // Update current usage
              state.currentUsage[metricType] =
                (state.currentUsage[metricType] || 0) + amount;

              // Update quota status if it exists
              const quotaIndex = state.quotaStatus.findIndex(
                (q) => q.metricType === metricType
              );
              if (quotaIndex >= 0) {
                state.quotaStatus[quotaIndex].current += amount;
                state.quotaStatus[quotaIndex].percentage =
                  UsageService.calculateUsagePercentage(
                    state.quotaStatus[quotaIndex].current,
                    state.quotaStatus[quotaIndex].limit
                  );
              }

              state.lastUpdated = new Date();
            });

            return metric;
          } catch (error) {
            const errorMessage =
              error instanceof Error ? error.message : "Failed to record usage";
            set((state) => {
              state.error = errorMessage;
            });
            throw error;
          }
        },

        checkQuota: async (
          tenantId: string,
          metricType: UsageMetricType,
          amount: number = 1
        ) => {
          try {
            const result = await usageApi.checkQuota(
              tenantId,
              metricType,
              amount
            );

            // Convert API result to our QuotaCheckResult format
            const quotaStatus = get().getQuotaStatus(metricType);
            const quotaCheckResult: QuotaCheckResult = {
              allowed: result.allowed,
              remaining: result.remaining,
              exceeded: result.exceeded,
              withinGrace: !result.exceeded || result.allowed, // If exceeded but allowed, within grace
              quotaStatus: quotaStatus || {
                metricType,
                current: 0,
                limit: 0,
                percentage: 0,
                withinGrace: false,
                exceeded: result.exceeded,
              },
            };

            return quotaCheckResult;
          } catch (error) {
            const errorMessage =
              error instanceof Error ? error.message : "Failed to check quota";
            set((state) => {
              state.error = errorMessage;
            });
            throw error;
          }
        },

        // Real-time operations
        updateCurrentUsage: (metricType: UsageMetricType, amount: number) =>
          set((state) => {
            state.currentUsage[metricType] =
              (state.currentUsage[metricType] || 0) + amount;

            // Update quota status if it exists
            const quotaIndex = state.quotaStatus.findIndex(
              (q) => q.metricType === metricType
            );
            if (quotaIndex >= 0) {
              state.quotaStatus[quotaIndex].current += amount;
              state.quotaStatus[quotaIndex].percentage =
                UsageService.calculateUsagePercentage(
                  state.quotaStatus[quotaIndex].current,
                  state.quotaStatus[quotaIndex].limit
                );
            }
          }),

        addQuotaWarning: (warning: QuotaWarning) =>
          set((state) => {
            const existingIndex = state.quotaWarnings.findIndex(
              (w) => w.metricType === warning.metricType
            );
            if (existingIndex >= 0) {
              state.quotaWarnings[existingIndex] = warning;
            } else {
              state.quotaWarnings.push(warning);
            }
          }),

        removeQuotaWarning: (metricType: UsageMetricType) =>
          set((state) => {
            state.quotaWarnings = state.quotaWarnings.filter(
              (w) => w.metricType !== metricType
            );
          }),

        markQuotaExceeded: (metricType: UsageMetricType) =>
          set((state) => {
            if (!state.quotaExceeded.includes(metricType)) {
              state.quotaExceeded.push(metricType);
            }
          }),

        clearQuotaExceeded: (metricType: UsageMetricType) =>
          set((state) => {
            state.quotaExceeded = state.quotaExceeded.filter(
              (m) => m !== metricType
            );
          }),

        // Selectors
        getUsageByMetric: (metricType: UsageMetricType) => {
          return get().usageMetrics.filter((m) => m.metricType === metricType);
        },

        getCurrentUsage: (metricType: UsageMetricType) => {
          return get().currentUsage[metricType] || 0;
        },

        getQuotaStatus: (metricType: UsageMetricType) => {
          return get().quotaStatus.find((q) => q.metricType === metricType);
        },

        getQuotaWarnings: (severity?: "info" | "warning" | "critical") => {
          const warnings = get().quotaWarnings;
          return severity
            ? warnings.filter((w) => w.severity === severity)
            : warnings;
        },

        isQuotaExceeded: (metricType: UsageMetricType) => {
          return get().quotaExceeded.includes(metricType);
        },

        // Quota Enforcement Operations
        checkQuotaRealtime: async (
          tenantId: string,
          metricType: UsageMetricType,
          amount: number = 1
        ) => {
          try {
            const result = await QuotaEnforcementService.checkQuotaRealtime(
              tenantId,
              metricType,
              amount
            );

            // Update store with latest quota status
            const currentQuotaStatus = get().quotaStatus;
            const updatedStatus = currentQuotaStatus.map((status) =>
              status.metricType === metricType ? result.quotaStatus : status
            );

            set((state) => {
              state.quotaStatus = updatedStatus;
              state.lastUpdated = new Date();
            });

            return result;
          } catch (error) {
            const errorMessage =
              error instanceof Error
                ? error.message
                : "Failed to check quota in real-time";
            set((state) => {
              state.error = errorMessage;
            });
            throw error;
          }
        },

        recordUsageWithQuotaCheck: async (
          tenantId: string,
          metricType: UsageMetricType,
          amount: number,
          metadata?: Record<string, any>
        ) => {
          try {
            const result = await QuotaEnforcementService.recordUsageAtomic(
              tenantId,
              metricType,
              amount,
              metadata
            );

            if (result.success) {
              // Update store with successful usage recording
              set((state) => {
                // Update current usage
                state.currentUsage[metricType] =
                  (state.currentUsage[metricType] || 0) + amount;

                // Update quota status
                const quotaIndex = state.quotaStatus.findIndex(
                  (q) => q.metricType === metricType
                );
                if (quotaIndex >= 0) {
                  state.quotaStatus[quotaIndex].current += amount;
                  state.quotaStatus[quotaIndex].percentage =
                    UsageService.calculateUsagePercentage(
                      state.quotaStatus[quotaIndex].current,
                      state.quotaStatus[quotaIndex].limit
                    );
                }

                // Update warnings and exceeded status
                state.quotaWarnings = UsageService.generateQuotaWarnings(
                  state.quotaStatus
                );
                state.quotaExceeded = state.quotaStatus
                  .filter((quota) => quota.exceeded && !quota.withinGrace)
                  .map((quota) => quota.metricType);

                state.lastUpdated = new Date();
              });
            }

            return {
              success: result.success,
              errorMessage: result.errorMessage,
              upgradeInfo: result.upgradeInfo,
            };
          } catch (error) {
            const errorMessage =
              error instanceof Error
                ? error.message
                : "Failed to record usage with quota check";
            set((state) => {
              state.error = errorMessage;
            });
            throw error;
          }
        },

        monitorUsageThresholds: async (tenantId: string) => {
          try {
            const monitoring =
              await QuotaEnforcementService.monitorUsageThresholds(tenantId);

            set((state) => {
              // Update warnings
              state.quotaWarnings = monitoring.warnings;

              // Process notifications (in a real app, this would trigger actual notifications)
              monitoring.notifications.forEach((notification) => {
                if (notification.shouldNotify) {
                  console.log(
                    `Usage Notification [${notification.type}]: ${notification.message}`
                  );
                }
              });

              state.lastUpdated = new Date();
            });
          } catch (error) {
            const errorMessage =
              error instanceof Error
                ? error.message
                : "Failed to monitor usage thresholds";
            set((state) => {
              state.error = errorMessage;
            });
            throw error;
          }
        },

        checkMultipleQuotas: async (
          tenantId: string,
          requests: Array<{ metricType: UsageMetricType; amount: number }>
        ) => {
          try {
            const results = await QuotaEnforcementService.checkMultipleQuotas(
              tenantId,
              requests
            );

            // Update store with latest quota statuses
            set((state) => {
              results.forEach((result) => {
                const quotaIndex = state.quotaStatus.findIndex(
                  (q) => q.metricType === result.metricType
                );
                if (quotaIndex >= 0) {
                  state.quotaStatus[quotaIndex] = result.quotaStatus;
                }
              });

              state.lastUpdated = new Date();
            });

            return results;
          } catch (error) {
            const errorMessage =
              error instanceof Error
                ? error.message
                : "Failed to check multiple quotas";
            set((state) => {
              state.error = errorMessage;
            });
            throw error;
          }
        },

        // Utilities
        reset: () =>
          set((state) => {
            state.usageMetrics = [];
            state.quotaStatus = [];
            state.currentUsage = {} as Record<UsageMetricType, number>;
            state.loading = false;
            state.error = null;
            state.quotaWarnings = [];
            state.quotaExceeded = [];
            state.lastUpdated = null;
          }),

        refreshAll: async (tenantId: string) => {
          set((state) => {
            state.loading = true;
            state.error = null;
          });

          try {
            // Fetch both usage metrics and quota status
            const [metrics, status] = await Promise.all([
              usageApi.getUsageMetrics(tenantId),
              usageApi.getQuotaStatus(tenantId),
            ]);

            set((state) => {
              state.usageMetrics = metrics;
              state.quotaStatus = status;

              // Update current usage
              status.forEach((quota) => {
                state.currentUsage[quota.metricType] = quota.current;
              });

              // Generate warnings
              state.quotaWarnings = UsageService.generateQuotaWarnings(status);

              // Update exceeded list
              state.quotaExceeded = status
                .filter((quota) => quota.exceeded && !quota.withinGrace)
                .map((quota) => quota.metricType);

              state.loading = false;
              state.lastUpdated = new Date();
            });
          } catch (error) {
            const errorMessage =
              error instanceof Error
                ? error.message
                : "Failed to refresh usage data";
            set((state) => {
              state.error = errorMessage;
              state.loading = false;
            });
            throw error;
          }
        },
      }))
    ),
    { name: "usage-store" }
  )
);
