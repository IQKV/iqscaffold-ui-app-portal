/**
 * Usage Analytics Hook
 * Business logic for usage monitoring and forecasting
 */

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { usageApi } from "@/entities/usage/api/usage-api";
import { useCurrentTenantId } from "@/processes/tenant";
import type {
  UsageMetric,
  UsageTrendData,
  QuotaUtilizationData,
  UsageAnalytics,
  UsageMetricType,
} from "@/entities/usage/types/usage-types";

interface DateRange {
  start: Date;
  end: Date;
}

interface BillingProjection {
  currentPeriodUsage: Record<UsageMetricType, number>;
  projectedUsage: Record<UsageMetricType, number>;
  currentCost: number;
  projectedCost: number;
  overageCost: number;
  potentialSavings: number;
  recommendedPlan?: string;
}

export const useUsageAnalytics = () => {
  const queryClient = useQueryClient();
  const currentTenantId = useCurrentTenantId();
  const [dateRange, setDateRange] = useState<DateRange>({
    start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
    end: new Date(),
  });
  const [selectedMetrics, setSelectedMetrics] = useState<UsageMetricType[]>([
    "api_calls" as UsageMetricType,
    "storage_gb" as UsageMetricType,
    "email_sends" as UsageMetricType,
    "active_users" as UsageMetricType,
  ]);

  // Fetch current usage metrics
  const {
    data: usageMetrics = [],
    isLoading: metricsLoading,
    error: metricsError,
  } = useQuery({
    queryKey: ["usageMetrics", currentTenantId],
    queryFn: () =>
      usageApi.getUsageMetrics(currentTenantId!, {
        startDate: dateRange.start,
        endDate: dateRange.end,
      }),
    enabled: !!currentTenantId,
  });

  // Fetch usage analytics
  const { data: usageAnalytics, isLoading: analyticsLoading } = useQuery({
    queryKey: ["usageAnalytics", currentTenantId, dateRange],
    queryFn: () =>
      usageApi.getUsageAnalytics(currentTenantId!, {
        startDate: dateRange.start,
        endDate: dateRange.end,
        aggregation: "day",
      }),
    enabled: !!currentTenantId,
  });

  // Mock usage trends data
  const usageTrends: UsageTrendData[] = usageAnalytics?.usageTrends || [
    {
      date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      metricType: "api_calls" as UsageMetricType,
      value: 1250,
      period: "day",
    },
    {
      date: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000),
      metricType: "api_calls",
      value: 1380,
      period: "day",
    },
    {
      date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      metricType: "api_calls",
      value: 1420,
      period: "day",
    },
    // Add more mock data for other metrics...
  ];

  // Mock quota utilization data
  const quotaUtilization: QuotaUtilizationData[] =
    usageAnalytics?.quotaUtilization || [
      {
        metricType: "api_calls" as UsageMetricType,
        utilization: 75,
        trend: "increasing",
        timestamp: new Date(),
      },
      {
        metricType: "storage_gb" as UsageMetricType,
        utilization: 45,
        trend: "stable",
        timestamp: new Date(),
      },
      {
        metricType: "email_sends" as UsageMetricType,
        utilization: 60,
        trend: "decreasing",
        timestamp: new Date(),
      },
      {
        metricType: "active_users" as UsageMetricType,
        utilization: 85,
        trend: "increasing",
        timestamp: new Date(),
      },
    ];

  // Mock billing projection
  const billingProjection: BillingProjection = usageAnalytics?.costAnalysis || {
    currentPeriodUsage: {
      api_calls: 45000,
      storage_gb: 12.5,
      email_sends: 2800,
      active_users: 85,
    },
    projectedUsage: {
      api_calls: 52000,
      storage_gb: 14.2,
      email_sends: 3200,
      active_users: 95,
    },
    currentCost: 29.99,
    projectedCost: 34.5,
    overageCost: 4.51,
    potentialSavings: 0,
    recommendedPlan: "Pro Plus",
  };

  const refreshData = () => {
    queryClient.invalidateQueries({ queryKey: ["usageMetrics"] });
    queryClient.invalidateQueries({ queryKey: ["usageAnalytics"] });
  };

  const isLoading = metricsLoading || analyticsLoading;
  const error = metricsError?.message;

  return {
    // Data
    usageMetrics,
    usageTrends,
    quotaUtilization,
    billingProjection,

    // Loading states
    isLoading,
    error,

    // Filters and settings
    dateRange,
    setDateRange,
    selectedMetrics,
    setSelectedMetrics,

    // Actions
    refreshData,
  };
};
