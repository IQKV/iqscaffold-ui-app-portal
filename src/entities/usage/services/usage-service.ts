import {
  UsageMetricType,
  type UsageMetric,
  type QuotaStatus,
  type QuotaCheckResult,
  type QuotaValidation,
  type UsageAnalytics,
  type QuotaWarning,
  type UsageProjection,
  type UsageCostAnalysis,
} from "../types/usage-types";
import { UsageUtils } from "@/shared/lib/billing-utils";

/**
 * Usage business logic service
 * Contains all usage-related business rules and quota enforcement
 */
export class UsageService {
  // Quota enforcement constants
  private static readonly DEFAULT_GRACE_PERCENTAGE = 5;
  private static readonly WARNING_THRESHOLD = 90;
  private static readonly CRITICAL_THRESHOLD = 100;
  // Real-time quota enforcement methods
  static enforceQuota(
    tenantId: string,
    metricType: UsageMetricType,
    requestedAmount: number,
    currentUsage: number,
    limit: number,
    gracePercentage: number = UsageService.DEFAULT_GRACE_PERCENTAGE
  ): {
    allowed: boolean;
    remaining: number;
    exceeded: boolean;
    withinGrace: boolean;
    errorMessage?: string;
    upgradeInfo?: {
      suggestedPlan: string;
      upgradeUrl: string;
    };
  } {
    const graceLimit = limit * (1 + gracePercentage / 100);
    const newUsage = currentUsage + requestedAmount;
    const remaining = Math.max(0, limit - currentUsage);
    const exceeded = newUsage > limit;
    const withinGrace = newUsage <= graceLimit;

    // Allow operation if within grace period
    if (withinGrace) {
      return {
        allowed: true,
        remaining,
        exceeded,
        withinGrace,
      };
    }

    // Block operation if exceeds grace period
    return {
      allowed: false,
      remaining: 0,
      exceeded: true,
      withinGrace: false,
      errorMessage: `Quota exceeded for ${metricType}. Current usage: ${currentUsage}, Limit: ${limit}, Requested: ${requestedAmount}`,
      upgradeInfo: {
        suggestedPlan: UsageService.getSuggestedPlan(metricType, newUsage),
        upgradeUrl: `/billing/subscription?upgrade=${metricType}`,
      },
    };
  }

  static getSuggestedPlan(
    metricType: UsageMetricType,
    projectedUsage: number
  ): string {
    // Business logic to suggest appropriate plan based on usage
    // This would typically query available plans and find the best fit
    switch (metricType) {
      case "api_calls":
        if (projectedUsage > 1000000) {
          return "enterprise";
        }
        if (projectedUsage > 100000) {
          return "pro";
        }
        return "starter";
      case "storage_gb":
        if (projectedUsage > 1000) {
          return "enterprise";
        }
        if (projectedUsage > 100) {
          return "pro";
        }
        return "starter";
      default:
        return "pro";
    }
  }

  // Atomic usage recording with quota validation
  static async recordUsageWithQuotaCheck(
    tenantId: string,
    metricType: UsageMetricType,
    amount: number,
    currentQuotaStatus: QuotaStatus,
    metadata?: Record<string, any>
  ): Promise<{
    success: boolean;
    usageMetric?: UsageMetric;
    quotaEnforcement: ReturnType<typeof UsageService.enforceQuota>;
  }> {
    // First, check if the operation would exceed quota
    const quotaCheck = UsageService.enforceQuota(
      tenantId,
      metricType,
      amount,
      currentQuotaStatus.current,
      currentQuotaStatus.limit
    );

    if (!quotaCheck.allowed) {
      return {
        success: false,
        quotaEnforcement: quotaCheck,
      };
    }

    // If allowed, record the usage (this would be atomic in the backend)
    try {
      const usageMetric: UsageMetric = {
        id: `usage_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        tenantId,
        metricType,
        value: amount,
        period: new Date().toISOString().substring(0, 7), // YYYY-MM format
        timestamp: new Date(),
      };

      return {
        success: true,
        usageMetric,
        quotaEnforcement: quotaCheck,
      };
    } catch (error) {
      throw new Error(`Failed to record usage: ${error}`);
    }
  }

  // Threshold monitoring for notifications
  static checkUsageThresholds(quotaStatus: QuotaStatus[]): {
    warnings: QuotaWarning[];
    criticalAlerts: QuotaWarning[];
    thresholdNotifications: Array<{
      metricType: UsageMetricType;
      threshold: number;
      message: string;
      shouldNotify: boolean;
    }>;
  } {
    const warnings: QuotaWarning[] = [];
    const criticalAlerts: QuotaWarning[] = [];
    const thresholdNotifications: Array<{
      metricType: UsageMetricType;
      threshold: number;
      message: string;
      shouldNotify: boolean;
    }> = [];

    quotaStatus.forEach((quota) => {
      const percentage = quota.percentage;

      // 90% threshold notification
      if (percentage >= UsageService.WARNING_THRESHOLD && percentage < 100) {
        const warning: QuotaWarning = {
          metricType: quota.metricType,
          currentUsage: quota.current,
          limit: quota.limit,
          percentage,
          severity: "warning",
          message: `${UsageService.getMetricDisplayName(quota.metricType)} usage at ${percentage}% - approaching limit`,
          timestamp: new Date(),
        };
        warnings.push(warning);

        thresholdNotifications.push({
          metricType: quota.metricType,
          threshold: 90,
          message: warning.message,
          shouldNotify: true,
        });
      }

      // Critical alerts for exceeded quotas
      if (quota.exceeded) {
        const alert: QuotaWarning = {
          metricType: quota.metricType,
          currentUsage: quota.current,
          limit: quota.limit,
          percentage,
          severity: quota.withinGrace ? "warning" : "critical",
          message: quota.withinGrace
            ? `${UsageService.getMetricDisplayName(quota.metricType)} quota exceeded but within grace period (${percentage}% used)`
            : `${UsageService.getMetricDisplayName(quota.metricType)} quota exceeded - operations blocked (${percentage}% used)`,
          timestamp: new Date(),
        };
        criticalAlerts.push(alert);

        thresholdNotifications.push({
          metricType: quota.metricType,
          threshold: 100,
          message: alert.message,
          shouldNotify: true,
        });
      }
    });

    return {
      warnings,
      criticalAlerts,
      thresholdNotifications,
    };
  }

  // Quota validation methods
  static validateQuota(
    current: number,
    limit: number,
    amount: number = 1,
    gracePercentage: number = 5
  ): QuotaValidation {
    const errors: string[] = [];
    const warnings: string[] = [];

    const newUsage = current + amount;
    const graceLimit = limit * (1 + gracePercentage / 100);
    const remainingQuota = Math.max(0, limit - current);
    const graceRemaining = Math.max(0, graceLimit - current);

    const withinGrace = newUsage <= graceLimit;
    const withinLimit = newUsage <= limit;

    if (!withinLimit && !withinGrace) {
      errors.push(`Usage would exceed quota limit by ${newUsage - graceLimit}`);
    } else if (!withinLimit && withinGrace) {
      warnings.push(`Usage would exceed base quota but is within grace period`);
    }

    // Warning at 90% of base quota
    if (newUsage >= limit * 0.9 && newUsage < limit) {
      warnings.push("Approaching quota limit (90% used)");
    }

    return {
      isValid: withinGrace,
      canProceed: withinGrace,
      withinGrace,
      remainingQuota,
      graceRemaining,
      errors,
      warnings,
    };
  }

  static checkQuotaStatus(
    current: number,
    limit: number,
    gracePercentage: number = 5
  ): QuotaStatus {
    const percentage = UsageUtils.calculateUsagePercentage(current, limit);
    const withinGrace = UsageUtils.isWithinGracePeriod(
      current,
      limit,
      gracePercentage
    );
    const exceeded = current > limit;

    return {
      metricType: "api_calls" as UsageMetricType, // This would be passed in
      current,
      limit,
      percentage,
      withinGrace,
      exceeded,
    };
  }

  // Usage calculation methods
  static calculateUsagePercentage(current: number, limit: number): number {
    return UsageUtils.calculateUsagePercentage(current, limit);
  }

  static getUsageStatus(
    current: number,
    limit: number,
    gracePercentage: number = 5
  ): "normal" | "warning" | "exceeded" | "grace" {
    return UsageUtils.getUsageStatus(current, limit, gracePercentage);
  }

  // Analytics and projections
  static calculateUsageProjection(
    usageHistory: UsageMetric[],
    daysToProject: number = 30
  ): UsageProjection[] {
    const projections: UsageProjection[] = [];

    // Group by metric type
    const metricGroups = usageHistory.reduce(
      (groups, metric) => {
        if (!groups[metric.metricType]) {
          groups[metric.metricType] = [];
        }
        groups[metric.metricType].push(metric);
        return groups;
      },
      {} as Record<UsageMetricType, UsageMetric[]>
    );

    Object.entries(metricGroups).forEach(([metricType, metrics]) => {
      const sortedMetrics = metrics.sort(
        (a, b) =>
          new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
      );

      if (sortedMetrics.length < 2) {
        // Not enough data for projection
        return;
      }

      // Simple linear regression for trend
      const dailyUsage = this.calculateDailyUsage(sortedMetrics);
      const averageDailyUsage =
        dailyUsage.reduce((sum, usage) => sum + usage, 0) / dailyUsage.length;

      // Calculate trend
      const trend = this.calculateTrend(dailyUsage);
      const projectedDailyUsage = Math.max(
        0,
        averageDailyUsage + trend * daysToProject
      );

      const projectedDate = new Date();
      projectedDate.setDate(projectedDate.getDate() + daysToProject);

      // Confidence based on data consistency
      const confidence = this.calculateConfidence(dailyUsage);

      projections.push({
        metricType: metricType as UsageMetricType,
        projectedUsage: projectedDailyUsage * daysToProject,
        projectedDate,
        confidence,
        basedOnDays: dailyUsage.length,
      });
    });

    return projections;
  }

  private static calculateDailyUsage(metrics: UsageMetric[]): number[] {
    const dailyUsage: Record<string, number> = {};

    metrics.forEach((metric) => {
      const date = new Date(metric.timestamp).toDateString();
      dailyUsage[date] = (dailyUsage[date] || 0) + metric.value;
    });

    return Object.values(dailyUsage);
  }

  private static calculateTrend(values: number[]): number {
    if (values.length < 2) {
      return 0;
    }

    const n = values.length;
    const sumX = (n * (n - 1)) / 2; // Sum of indices
    const sumY = values.reduce((sum, val) => sum + val, 0);
    const sumXY = values.reduce((sum, val, index) => sum + index * val, 0);
    const sumXX = (n * (n - 1) * (2 * n - 1)) / 6; // Sum of squared indices

    const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
    return slope;
  }

  private static calculateConfidence(values: number[]): number {
    if (values.length < 3) {
      return 0.5;
    }

    const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
    const variance =
      values.reduce((sum, val) => sum + (val - mean) ** 2, 0) / values.length;
    const standardDeviation = Math.sqrt(variance);

    // Lower coefficient of variation = higher confidence
    const coefficientOfVariation = mean > 0 ? standardDeviation / mean : 1;
    return Math.max(0.1, Math.min(1, 1 - coefficientOfVariation));
  }

  // Warning and alert generation
  static generateQuotaWarnings(quotaStatuses: QuotaStatus[]): QuotaWarning[] {
    const warnings: QuotaWarning[] = [];
    const now = new Date();

    quotaStatuses.forEach((quota) => {
      let severity: "info" | "warning" | "critical" = "info";
      let message = "";

      if (quota.exceeded && !quota.withinGrace) {
        severity = "critical";
        message = `${quota.metricType} quota exceeded (${quota.percentage}% used)`;
      } else if (quota.exceeded && quota.withinGrace) {
        severity = "critical";
        message = `${quota.metricType} quota exceeded but within grace period (${quota.percentage}% used)`;
      } else if (quota.percentage >= 90) {
        severity = "warning";
        message = `${quota.metricType} quota at ${quota.percentage}% - approaching limit`;
      } else if (quota.percentage >= 75) {
        severity = "info";
        message = `${quota.metricType} quota at ${quota.percentage}%`;
      }

      if (message) {
        warnings.push({
          metricType: quota.metricType,
          currentUsage: quota.current,
          limit: quota.limit,
          percentage: quota.percentage,
          severity,
          message,
          timestamp: now,
        });
      }
    });

    return warnings;
  }

  // Cost analysis
  static calculateUsageCost(
    usageMetrics: UsageMetric[],
    quotaStatuses: QuotaStatus[],
    overageRates: Record<UsageMetricType, number>
  ): UsageCostAnalysis {
    const currentPeriodCost = 0;
    let overageCost = 0;

    quotaStatuses.forEach((quota) => {
      if (quota.exceeded) {
        const overage = quota.current - quota.limit;
        const rate = overageRates[quota.metricType] || 0;
        overageCost += overage * rate;
      }
    });

    // Project costs based on current usage trends
    const projections = this.calculateUsageProjection(usageMetrics, 30);
    let projectedPeriodCost = currentPeriodCost;

    projections.forEach((projection) => {
      const quota = quotaStatuses.find(
        (q) => q.metricType === projection.metricType
      );
      if (quota && projection.projectedUsage > quota.limit) {
        const projectedOverage = projection.projectedUsage - quota.limit;
        const rate = overageRates[projection.metricType] || 0;
        projectedPeriodCost += projectedOverage * rate;
      }
    });

    return {
      currentPeriodCost,
      projectedPeriodCost,
      overageCost,
      potentialSavings: Math.max(0, projectedPeriodCost - currentPeriodCost),
      recommendedPlan: undefined, // Would be calculated based on usage patterns
    };
  }

  // Utility methods
  static formatUsageAmount(
    amount: number,
    metricType: UsageMetricType
  ): string {
    switch (metricType) {
      case UsageMetricType.API_CALLS:
        return `${amount.toLocaleString()} calls`;
      case UsageMetricType.STORAGE_GB:
        return `${amount.toFixed(2)} GB`;
      case UsageMetricType.EMAIL_SENDS:
        return `${amount.toLocaleString()} emails`;
      case UsageMetricType.ACTIVE_USERS:
        return `${amount.toLocaleString()} users`;
      default:
        return amount.toString();
    }
  }

  static getMetricDisplayName(metricType: UsageMetricType): string {
    switch (metricType) {
      case UsageMetricType.API_CALLS:
        return "API Calls";
      case UsageMetricType.STORAGE_GB:
        return "Storage";
      case UsageMetricType.EMAIL_SENDS:
        return "Email Sends";
      case UsageMetricType.ACTIVE_USERS:
        return "Active Users";
      default:
        return metricType;
    }
  }

  static getMetricUnit(metricType: UsageMetricType): string {
    switch (metricType) {
      case UsageMetricType.API_CALLS:
        return "calls";
      case UsageMetricType.STORAGE_GB:
        return "GB";
      case UsageMetricType.EMAIL_SENDS:
        return "emails";
      case UsageMetricType.ACTIVE_USERS:
        return "users";
      default:
        return "units";
    }
  }

  // Validation helpers
  static validateUsageRecord(
    metricType: UsageMetricType,
    amount: number,
    tenantId: string
  ): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!tenantId) {
      errors.push("Tenant ID is required");
    }

    if (amount < 0) {
      errors.push("Usage amount cannot be negative");
    }

    if (amount > 1000000) {
      errors.push("Usage amount is unreasonably large");
    }

    // Metric-specific validations
    switch (metricType) {
      case UsageMetricType.STORAGE_GB:
        if (amount > 10000) {
          errors.push("Storage usage exceeds reasonable limits");
        }
        break;
      case UsageMetricType.ACTIVE_USERS:
        if (amount % 1 !== 0) {
          errors.push("Active users must be a whole number");
        }
        break;
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }
}
