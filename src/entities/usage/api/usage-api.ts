import { billingApi } from "@/shared/api/billing-api";
import type {
  UsageMetric,
  UsageMetricType,
  QuotaStatus,
  UsageFilters,
} from "../types/usage-types";

/**
 * Usage-specific API client
 * Wraps the shared billing API with usage-focused methods
 */
export class UsageApiClient {
  // Usage recording
  async recordUsage(
    tenantId: string,
    metricType: UsageMetricType,
    amount: number,
    metadata?: Record<string, any>
  ): Promise<UsageMetric> {
    return billingApi.recordUsage(tenantId, metricType, amount, metadata);
  }

  // Quota operations
  async checkQuota(
    tenantId: string,
    metricType: UsageMetricType,
    amount: number = 1
  ): Promise<{ allowed: boolean; remaining: number; exceeded: boolean }> {
    return billingApi.checkQuota(tenantId, metricType, amount);
  }

  async getQuotaStatus(tenantId: string): Promise<QuotaStatus[]> {
    return billingApi.getQuotaStatus(tenantId);
  }

  async getCurrentUsage(tenantId: string): Promise<QuotaStatus[]> {
    return this.getQuotaStatus(tenantId);
  }

  // Usage metrics
  async getUsageMetrics(
    tenantId: string,
    filters?: UsageFilters
  ): Promise<UsageMetric[]> {
    const params = {
      startDate: filters?.startDate?.toISOString(),
      endDate: filters?.endDate?.toISOString(),
      metricType: filters?.metricType,
    };

    return billingApi.getUsageMetrics(tenantId, params);
  }

  // Analytics
  async getUsageAnalytics(
    tenantId: string,
    filters?: UsageFilters
  ): Promise<any> {
    const params = {
      startDate: filters?.startDate?.toISOString(),
      endDate: filters?.endDate?.toISOString(),
      metricType: filters?.metricType,
      tenantId,
    };

    return billingApi.getUsageAnalytics(params);
  }

  // Bulk operations
  async recordBulkUsage(
    records: Array<{
      tenantId: string;
      metricType: UsageMetricType;
      amount: number;
      metadata?: Record<string, any>;
    }>
  ): Promise<UsageMetric[]> {
    // This would be a single API call for efficiency
    // For now, we'll make individual calls
    const promises = records.map((record) =>
      this.recordUsage(
        record.tenantId,
        record.metricType,
        record.amount,
        record.metadata
      )
    );

    return Promise.all(promises);
  }

  async checkMultipleQuotas(
    requests: Array<{
      tenantId: string;
      metricType: UsageMetricType;
      amount: number;
    }>
  ): Promise<
    Array<{ allowed: boolean; remaining: number; exceeded: boolean }>
  > {
    const promises = requests.map((request) =>
      this.checkQuota(request.tenantId, request.metricType, request.amount)
    );

    return Promise.all(promises);
  }

  // Real-time monitoring
  async subscribeToUsageUpdates(
    tenantId: string,
    callback: (usage: UsageMetric) => void
  ): Promise<() => void> {
    // This would set up a WebSocket connection for real-time updates
    // For now, return a no-op unsubscribe function
    return () => {};
  }

  async subscribeToQuotaAlerts(
    tenantId: string,
    callback: (alert: {
      metricType: UsageMetricType;
      percentage: number;
    }) => void
  ): Promise<() => void> {
    // This would set up WebSocket for quota alerts
    return () => {};
  }
}

// Export singleton instance
export const usageApi = new UsageApiClient();
