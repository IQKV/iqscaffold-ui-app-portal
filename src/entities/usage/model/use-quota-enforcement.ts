import { useCallback, useEffect, useState } from "react";
import { useUsageStore } from "./usage-store";
import { QuotaEnforcementService } from "../services/quota-enforcement-service";
import { UsageService } from "../services/usage-service";
import type {
  UsageMetricType,
  QuotaCheckResult,
  QuotaWarning,
  UsageAlert,
} from "../types/usage-types";

/**
 * React hook for quota enforcement operations
 */
export const useQuotaEnforcement = (tenantId: string) => {
  const {
    quotaStatus,
    quotaWarnings,
    quotaExceeded,
    loading,
    error,
    checkQuotaRealtime,
    recordUsageWithQuotaCheck,
    monitorUsageThresholds,
    checkMultipleQuotas,
    fetchQuotaStatus,
  } = useUsageStore();

  const [alerts, setAlerts] = useState<UsageAlert[]>([]);
  const [isMonitoring, setIsMonitoring] = useState(false);

  // Initialize quota monitoring
  useEffect(() => {
    if (tenantId && !isMonitoring) {
      setIsMonitoring(true);
      fetchQuotaStatus(tenantId);

      // Set up periodic monitoring
      const monitoringInterval = setInterval(() => {
        monitorUsageThresholds(tenantId).catch(console.error);
      }, 60000); // Monitor every minute

      return () => {
        clearInterval(monitoringInterval);
        setIsMonitoring(false);
      };
    }
  }, [tenantId, isMonitoring, fetchQuotaStatus, monitorUsageThresholds]);

  // Real-time quota checking
  const checkQuota = useCallback(
    async (
      metricType: UsageMetricType,
      amount: number = 1
    ): Promise<QuotaCheckResult> => {
      return checkQuotaRealtime(tenantId, metricType, amount);
    },
    [tenantId, checkQuotaRealtime]
  );

  // Safe usage recording with quota validation
  const recordUsage = useCallback(
    async (
      metricType: UsageMetricType,
      amount: number,
      metadata?: Record<string, any>
    ): Promise<{
      success: boolean;
      errorMessage?: string;
      upgradeInfo?: { suggestedPlan: string; upgradeUrl: string };
    }> => {
      return recordUsageWithQuotaCheck(tenantId, metricType, amount, metadata);
    },
    [tenantId, recordUsageWithQuotaCheck]
  );

  // Batch quota checking
  const checkMultipleQuotasCallback = useCallback(
    async (
      requests: Array<{ metricType: UsageMetricType; amount: number }>
    ) => {
      return checkMultipleQuotas(tenantId, requests);
    },
    [tenantId, checkMultipleQuotas]
  );

  // Get quota status for specific metric
  const getQuotaStatus = useCallback(
    (metricType: UsageMetricType) => {
      return quotaStatus.find((q) => q.metricType === metricType);
    },
    [quotaStatus]
  );

  // Check if metric is approaching limit (90%+)
  const isApproachingLimit = useCallback(
    (metricType: UsageMetricType): boolean => {
      const status = getQuotaStatus(metricType);
      return status ? status.percentage >= 90 : false;
    },
    [getQuotaStatus]
  );

  // Check if metric is exceeded
  const isQuotaExceeded = useCallback(
    (metricType: UsageMetricType): boolean => {
      return quotaExceeded.includes(metricType);
    },
    [quotaExceeded]
  );

  // Check if metric is within grace period
  const isWithinGracePeriod = useCallback(
    (metricType: UsageMetricType): boolean => {
      const status = getQuotaStatus(metricType);
      return status ? status.exceeded && status.withinGrace : false;
    },
    [getQuotaStatus]
  );

  // Get warnings for specific metric
  const getWarningsForMetric = useCallback(
    (metricType: UsageMetricType): QuotaWarning[] => {
      return quotaWarnings.filter((w) => w.metricType === metricType);
    },
    [quotaWarnings]
  );

  // Get critical warnings (exceeded quotas)
  const getCriticalWarnings = useCallback((): QuotaWarning[] => {
    return quotaWarnings.filter((w) => w.severity === "critical");
  }, [quotaWarnings]);

  // Calculate remaining quota
  const getRemainingQuota = useCallback(
    (metricType: UsageMetricType, includeGrace: boolean = true) => {
      const status = getQuotaStatus(metricType);
      if (!status) {
        return { baseRemaining: 0, graceRemaining: 0, totalRemaining: 0 };
      }

      return QuotaEnforcementService.calculateRemainingQuota(
        status.current,
        status.limit,
        includeGrace
      );
    },
    [getQuotaStatus]
  );

  // Get usage percentage
  const getUsagePercentage = useCallback(
    (metricType: UsageMetricType): number => {
      const status = getQuotaStatus(metricType);
      return status ? status.percentage : 0;
    },
    [getQuotaStatus]
  );

  // Validate if operation would exceed quota
  const validateOperation = useCallback(
    async (
      metricType: UsageMetricType,
      amount: number
    ): Promise<{
      allowed: boolean;
      reason?: string;
      upgradeInfo?: { suggestedPlan: string; upgradeUrl: string };
    }> => {
      try {
        const result = await checkQuota(metricType, amount);

        if (!result.allowed) {
          return {
            allowed: false,
            reason: `Operation would exceed ${metricType} quota`,
            upgradeInfo: {
              suggestedPlan: UsageService.getSuggestedPlan(
                metricType,
                result.quotaStatus.current + amount
              ),
              upgradeUrl: `/billing/subscription?upgrade=${metricType}`,
            },
          };
        }

        return { allowed: true };
      } catch (error) {
        return {
          allowed: false,
          reason:
            error instanceof Error ? error.message : "Quota validation failed",
        };
      }
    },
    [checkQuota]
  );

  // Get upgrade suggestions for exceeded quotas
  const getUpgradeSuggestions = useCallback(() => {
    const suggestions: Array<{
      metricType: UsageMetricType;
      suggestedPlan: string;
      upgradeUrl: string;
    }> = [];

    quotaExceeded.forEach((metricType) => {
      const status = getQuotaStatus(metricType);
      if (status) {
        suggestions.push({
          metricType,
          suggestedPlan: UsageService.getSuggestedPlan(
            metricType,
            status.current
          ),
          upgradeUrl: `/billing/subscription?upgrade=${metricType}`,
        });
      }
    });

    return suggestions;
  }, [quotaExceeded, getQuotaStatus]);

  return {
    // State
    quotaStatus,
    quotaWarnings,
    quotaExceeded,
    alerts,
    loading,
    error,
    isMonitoring,

    // Operations
    checkQuota,
    recordUsage,
    checkMultipleQuotas: checkMultipleQuotasCallback,
    validateOperation,

    // Getters
    getQuotaStatus,
    getWarningsForMetric,
    getCriticalWarnings,
    getRemainingQuota,
    getUsagePercentage,
    getUpgradeSuggestions,

    // Validators
    isApproachingLimit,
    isQuotaExceeded,
    isWithinGracePeriod,
  };
};
