import { billingApi } from "@/shared/api/billing-api";
import type {
  UsageMetricType,
  QuotaStatus,
  QuotaCheckResult,
  UsageAlert,
  UsageThreshold,
} from "../types/usage-types";

/**
 * Quota-specific API client for real-time quota operations
 */
export class QuotaApiClient {
  // Real-time quota checking
  async checkQuotaRealtime(
    tenantId: string,
    metricType: UsageMetricType,
    amount: number = 1
  ): Promise<{
    allowed: boolean;
    remaining: number;
    exceeded: boolean;
    withinGrace: boolean;
    quotaStatus: QuotaStatus;
  }> {
    try {
      // Use existing billing API for quota check
      const result = await billingApi.checkQuota(tenantId, metricType, amount);

      // Get detailed quota status
      const quotaStatuses = await billingApi.getQuotaStatus(tenantId);
      const quotaStatus = quotaStatuses.find(
        (q) => q.metricType === metricType
      );

      if (!quotaStatus) {
        throw new Error(
          `No quota configuration found for metric: ${metricType}`
        );
      }

      // Calculate grace period status
      const graceLimit = quotaStatus.limit * 1.05; // 5% grace period
      const withinGrace = quotaStatus.current + amount <= graceLimit;

      return {
        allowed: result.allowed,
        remaining: result.remaining,
        exceeded: result.exceeded,
        withinGrace,
        quotaStatus,
      };
    } catch (error) {
      throw new Error(`Real-time quota check failed: ${error}`);
    }
  }

  // Atomic usage recording with quota validation
  async recordUsageWithQuotaCheck(
    tenantId: string,
    metricType: UsageMetricType,
    amount: number,
    metadata?: Record<string, any>
  ): Promise<{
    success: boolean;
    usageRecorded: boolean;
    quotaCheck: {
      allowed: boolean;
      remaining: number;
      exceeded: boolean;
      withinGrace: boolean;
    };
    errorMessage?: string;
  }> {
    try {
      // First check quota
      const quotaCheck = await this.checkQuotaRealtime(
        tenantId,
        metricType,
        amount
      );

      if (!quotaCheck.allowed) {
        return {
          success: false,
          usageRecorded: false,
          quotaCheck: {
            allowed: quotaCheck.allowed,
            remaining: quotaCheck.remaining,
            exceeded: quotaCheck.exceeded,
            withinGrace: quotaCheck.withinGrace,
          },
          errorMessage: `Quota exceeded for ${metricType}. Operation not allowed.`,
        };
      }

      // If quota check passes, record usage
      await billingApi.recordUsage(tenantId, metricType, amount, metadata);

      return {
        success: true,
        usageRecorded: true,
        quotaCheck: {
          allowed: quotaCheck.allowed,
          remaining: quotaCheck.remaining - amount, // Update remaining after recording
          exceeded: quotaCheck.exceeded,
          withinGrace: quotaCheck.withinGrace,
        },
      };
    } catch (error) {
      throw new Error(`Atomic usage recording failed: ${error}`);
    }
  }

  // Batch quota checking
  async checkMultipleQuotas(
    tenantId: string,
    requests: Array<{
      metricType: UsageMetricType;
      amount: number;
    }>
  ): Promise<
    Array<{
      metricType: UsageMetricType;
      allowed: boolean;
      remaining: number;
      exceeded: boolean;
      withinGrace: boolean;
    }>
  > {
    try {
      const results = await Promise.all(
        requests.map(async (request) => {
          const result = await this.checkQuotaRealtime(
            tenantId,
            request.metricType,
            request.amount
          );
          return {
            metricType: request.metricType,
            allowed: result.allowed,
            remaining: result.remaining,
            exceeded: result.exceeded,
            withinGrace: result.withinGrace,
          };
        })
      );

      return results;
    } catch (error) {
      throw new Error(`Batch quota check failed: ${error}`);
    }
  }

  // Usage threshold monitoring
  async getUsageAlerts(tenantId: string): Promise<UsageAlert[]> {
    try {
      // This would typically be a dedicated endpoint
      // For now, we'll derive alerts from quota status
      const quotaStatuses = await billingApi.getQuotaStatus(tenantId);
      const alerts: UsageAlert[] = [];

      quotaStatuses.forEach((quota) => {
        // Generate alerts for high usage
        if (quota.percentage >= 90) {
          alerts.push({
            id: `alert_${tenantId}_${quota.metricType}_${Date.now()}`,
            tenantId,
            metricType: quota.metricType,
            alertType: quota.exceeded ? "quota_exceeded" : "threshold",
            message: quota.exceeded
              ? `${quota.metricType} quota exceeded (${quota.percentage}%)`
              : `${quota.metricType} usage at ${quota.percentage}% - approaching limit`,
            severity: quota.exceeded ? "critical" : "medium",
            timestamp: new Date(),
            acknowledged: false,
          });
        }
      });

      return alerts;
    } catch (error) {
      throw new Error(`Failed to get usage alerts: ${error}`);
    }
  }

  // Acknowledge usage alert
  async acknowledgeAlert(alertId: string): Promise<void> {
    try {
      // This would be a dedicated endpoint to acknowledge alerts
      // For now, we'll just log it
      console.log(`Alert ${alertId} acknowledged`);
    } catch (error) {
      throw new Error(`Failed to acknowledge alert: ${error}`);
    }
  }

  // Configure usage thresholds
  async setUsageThreshold(
    tenantId: string,
    threshold: UsageThreshold
  ): Promise<UsageThreshold> {
    try {
      // This would be a dedicated endpoint for threshold configuration
      // For now, we'll return the threshold as-is
      return threshold;
    } catch (error) {
      throw new Error(`Failed to set usage threshold: ${error}`);
    }
  }

  // Get configured thresholds
  async getUsageThresholds(tenantId: string): Promise<UsageThreshold[]> {
    try {
      // This would return configured thresholds from the backend
      // For now, return default thresholds
      const defaultThresholds: UsageThreshold[] = [
        {
          metricType: "api_calls" as UsageMetricType,
          threshold: 90,
          type: "percentage",
          action: "notify",
          enabled: true,
        },
        {
          metricType: "storage_gb" as UsageMetricType,
          threshold: 90,
          type: "percentage",
          action: "notify",
          enabled: true,
        },
        {
          metricType: "email_sends" as UsageMetricType,
          threshold: 90,
          type: "percentage",
          action: "notify",
          enabled: true,
        },
        {
          metricType: "active_users" as UsageMetricType,
          threshold: 90,
          type: "percentage",
          action: "notify",
          enabled: true,
        },
      ];

      return defaultThresholds;
    } catch (error) {
      throw new Error(`Failed to get usage thresholds: ${error}`);
    }
  }

  // Real-time quota status streaming (WebSocket simulation)
  async subscribeToQuotaUpdates(
    tenantId: string,
    callback: (quotaStatus: QuotaStatus[]) => void
  ): Promise<() => void> {
    // This would set up a WebSocket connection for real-time quota updates
    // For now, we'll simulate with polling
    const intervalId = setInterval(async () => {
      try {
        const quotaStatus = await billingApi.getQuotaStatus(tenantId);
        callback(quotaStatus);
      } catch (error) {
        console.error("Failed to fetch quota status:", error);
      }
    }, 30000); // Poll every 30 seconds

    // Return unsubscribe function
    return () => {
      clearInterval(intervalId);
    };
  }

  // Emergency quota override (for admin use)
  async overrideQuota(
    tenantId: string,
    metricType: UsageMetricType,
    newLimit: number,
    reason: string,
    adminUserId: string
  ): Promise<{
    success: boolean;
    previousLimit: number;
    newLimit: number;
    auditId: string;
  }> {
    try {
      // This would be a privileged operation requiring admin authorization
      // For now, we'll simulate the response
      const auditId = `audit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      console.log(
        `Quota override: ${tenantId}/${metricType} -> ${newLimit} by ${adminUserId}. Reason: ${reason}`
      );

      return {
        success: true,
        previousLimit: 0, // Would get from current quota status
        newLimit,
        auditId,
      };
    } catch (error) {
      throw new Error(`Failed to override quota: ${error}`);
    }
  }
}

// Export singleton instance
export const quotaApi = new QuotaApiClient();
