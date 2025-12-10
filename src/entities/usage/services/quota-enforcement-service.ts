import type {
  UsageMetricType,
  QuotaStatus,
  QuotaCheckResult,
  QuotaWarning,
  UsageAlert,
  QuotaEnforcement,
  QuotaAction,
  UsageThreshold,
} from "../types/usage-types";
import { UsageService } from "./usage-service";
import { usageApi } from "../api/usage-api";

/**
 * Quota Enforcement Service
 * Handles real-time quota checking, enforcement, and threshold monitoring
 */
export class QuotaEnforcementService {
  private static readonly GRACE_PERCENTAGE = 5;
  private static readonly WARNING_THRESHOLD = 90;
  private static readonly CRITICAL_THRESHOLD = 100;

  // Real-time quota checking
  static async checkQuotaRealtime(
    tenantId: string,
    metricType: UsageMetricType,
    requestedAmount: number = 1
  ): Promise<QuotaCheckResult> {
    try {
      // Get current quota status
      const quotaStatuses = await usageApi.getQuotaStatus(tenantId);
      const quotaStatus = quotaStatuses.find(
        (q) => q.metricType === metricType
      );

      if (!quotaStatus) {
        throw new Error(
          `No quota configuration found for metric: ${metricType}`
        );
      }

      // Perform quota enforcement check
      const enforcement = UsageService.enforceQuota(
        tenantId,
        metricType,
        requestedAmount,
        quotaStatus.current,
        quotaStatus.limit,
        this.GRACE_PERCENTAGE
      );

      return {
        allowed: enforcement.allowed,
        remaining: enforcement.remaining,
        exceeded: enforcement.exceeded,
        withinGrace: enforcement.withinGrace,
        quotaStatus,
      };
    } catch (error) {
      throw new Error(`Quota check failed: ${error}`);
    }
  }

  // Atomic usage recording with quota validation
  static async recordUsageAtomic(
    tenantId: string,
    metricType: UsageMetricType,
    amount: number,
    metadata?: Record<string, any>
  ): Promise<{
    success: boolean;
    quotaCheck: QuotaCheckResult;
    errorMessage?: string;
    upgradeInfo?: {
      suggestedPlan: string;
      upgradeUrl: string;
    };
  }> {
    try {
      // First, perform quota check
      const quotaCheck = await this.checkQuotaRealtime(
        tenantId,
        metricType,
        amount
      );

      if (!quotaCheck.allowed) {
        return {
          success: false,
          quotaCheck,
          errorMessage: `Quota exceeded for ${metricType}. Usage would exceed limit.`,
          upgradeInfo: {
            suggestedPlan: UsageService.getSuggestedPlan(
              metricType,
              quotaCheck.quotaStatus.current + amount
            ),
            upgradeUrl: `/billing/subscription?upgrade=${metricType}`,
          },
        };
      }

      // If allowed, record the usage
      await usageApi.recordUsage(tenantId, metricType, amount, metadata);

      return {
        success: true,
        quotaCheck,
      };
    } catch (error) {
      throw new Error(`Failed to record usage atomically: ${error}`);
    }
  }

  // Threshold monitoring and notifications
  static async monitorUsageThresholds(tenantId: string): Promise<{
    warnings: QuotaWarning[];
    alerts: UsageAlert[];
    notifications: Array<{
      type: "threshold_90" | "quota_exceeded" | "grace_period";
      metricType: UsageMetricType;
      message: string;
      shouldNotify: boolean;
    }>;
  }> {
    try {
      const quotaStatuses = await usageApi.getQuotaStatus(tenantId);
      const thresholdCheck = UsageService.checkUsageThresholds(quotaStatuses);

      // Generate alerts
      const alerts: UsageAlert[] = [];
      const notifications: Array<{
        type: "threshold_90" | "quota_exceeded" | "grace_period";
        metricType: UsageMetricType;
        message: string;
        shouldNotify: boolean;
      }> = [];

      quotaStatuses.forEach((quota) => {
        const percentage = quota.percentage;

        // 90% threshold notification
        if (percentage >= this.WARNING_THRESHOLD && percentage < 100) {
          alerts.push({
            id: `alert_${tenantId}_${quota.metricType}_${Date.now()}`,
            tenantId,
            metricType: quota.metricType,
            alertType: "threshold",
            message: `${quota.metricType} usage at ${percentage}% - approaching limit`,
            severity: "medium",
            timestamp: new Date(),
            acknowledged: false,
          });

          notifications.push({
            type: "threshold_90",
            metricType: quota.metricType,
            message: `${quota.metricType} usage at ${percentage}% - approaching limit`,
            shouldNotify: true,
          });
        }

        // Quota exceeded notifications
        if (quota.exceeded) {
          const alertType = quota.withinGrace
            ? "grace_period"
            : "quota_exceeded";
          const severity = quota.withinGrace ? "high" : "critical";

          alerts.push({
            id: `alert_${tenantId}_${quota.metricType}_${Date.now()}`,
            tenantId,
            metricType: quota.metricType,
            alertType,
            message: quota.withinGrace
              ? `${quota.metricType} quota exceeded but within grace period`
              : `${quota.metricType} quota exceeded - operations blocked`,
            severity,
            timestamp: new Date(),
            acknowledged: false,
          });

          notifications.push({
            type: alertType,
            metricType: quota.metricType,
            message: quota.withinGrace
              ? `${quota.metricType} quota exceeded but within grace period`
              : `${quota.metricType} quota exceeded - operations blocked`,
            shouldNotify: true,
          });
        }
      });

      return {
        warnings: thresholdCheck.warnings,
        alerts,
        notifications,
      };
    } catch (error) {
      throw new Error(`Failed to monitor usage thresholds: ${error}`);
    }
  }

  // Quota enforcement configuration
  static createQuotaEnforcement(
    metricType: UsageMetricType,
    limit: number,
    gracePercentage: number = this.GRACE_PERCENTAGE
  ): QuotaEnforcement {
    const actions: QuotaAction[] = [
      {
        threshold: 90,
        action: "warn",
        parameters: {
          message: `Approaching ${metricType} quota limit`,
          notificationChannels: ["email", "dashboard"],
        },
      },
      {
        threshold: 100,
        action: "notify",
        parameters: {
          message: `${metricType} quota exceeded`,
          notificationChannels: ["email", "dashboard", "webhook"],
        },
      },
      {
        threshold: 100 + gracePercentage,
        action: "block",
        parameters: {
          message: `${metricType} quota exceeded - operations blocked`,
          upgradeUrl: `/billing/subscription?upgrade=${metricType}`,
        },
      },
    ];

    return {
      metricType,
      limit,
      gracePercentage,
      enforcementLevel: "hard",
      actions,
    };
  }

  // Usage threshold configuration
  static createUsageThreshold(
    metricType: UsageMetricType,
    threshold: number,
    type: "percentage" | "absolute" = "percentage",
    action: "notify" | "alert" | "block" = "notify"
  ): UsageThreshold {
    return {
      metricType,
      threshold,
      type,
      action,
      enabled: true,
    };
  }

  // Batch quota checking for multiple metrics
  static async checkMultipleQuotas(
    tenantId: string,
    requests: Array<{
      metricType: UsageMetricType;
      amount: number;
    }>
  ): Promise<Array<QuotaCheckResult & { metricType: UsageMetricType }>> {
    try {
      const quotaStatuses = await usageApi.getQuotaStatus(tenantId);

      return requests.map((request) => {
        const quotaStatus = quotaStatuses.find(
          (q) => q.metricType === request.metricType
        );

        if (!quotaStatus) {
          throw new Error(
            `No quota configuration found for metric: ${request.metricType}`
          );
        }

        const enforcement = UsageService.enforceQuota(
          tenantId,
          request.metricType,
          request.amount,
          quotaStatus.current,
          quotaStatus.limit,
          this.GRACE_PERCENTAGE
        );

        return {
          metricType: request.metricType,
          allowed: enforcement.allowed,
          remaining: enforcement.remaining,
          exceeded: enforcement.exceeded,
          withinGrace: enforcement.withinGrace,
          quotaStatus,
        };
      });
    } catch (error) {
      throw new Error(`Batch quota check failed: ${error}`);
    }
  }

  // Error handling for quota exceeded scenarios
  static createQuotaExceededError(
    metricType: UsageMetricType,
    current: number,
    limit: number,
    requested: number
  ): {
    code: string;
    message: string;
    details: {
      metricType: UsageMetricType;
      current: number;
      limit: number;
      requested: number;
      exceeded: number;
      upgradeInfo: {
        suggestedPlan: string;
        upgradeUrl: string;
      };
    };
  } {
    const exceeded = current + requested - limit;

    return {
      code: "QUOTA_EXCEEDED",
      message: `Quota exceeded for ${metricType}. Current: ${current}, Limit: ${limit}, Requested: ${requested}`,
      details: {
        metricType,
        current,
        limit,
        requested,
        exceeded,
        upgradeInfo: {
          suggestedPlan: UsageService.getSuggestedPlan(
            metricType,
            current + requested
          ),
          upgradeUrl: `/billing/subscription?upgrade=${metricType}`,
        },
      },
    };
  }

  // Grace period validation
  static isWithinGracePeriod(
    current: number,
    limit: number,
    gracePercentage: number = this.GRACE_PERCENTAGE
  ): boolean {
    const graceLimit = limit * (1 + gracePercentage / 100);
    return current <= graceLimit;
  }

  // Calculate remaining quota including grace period
  static calculateRemainingQuota(
    current: number,
    limit: number,
    includeGrace: boolean = true,
    gracePercentage: number = this.GRACE_PERCENTAGE
  ): {
    baseRemaining: number;
    graceRemaining: number;
    totalRemaining: number;
  } {
    const baseRemaining = Math.max(0, limit - current);
    const graceLimit = limit * (1 + gracePercentage / 100);
    const graceRemaining = Math.max(0, graceLimit - current);
    const totalRemaining = includeGrace ? graceRemaining : baseRemaining;

    return {
      baseRemaining,
      graceRemaining,
      totalRemaining,
    };
  }
}
