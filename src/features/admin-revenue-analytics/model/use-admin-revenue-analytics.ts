/**
 * Admin Revenue Analytics Hook
 * Business logic for platform-wide revenue analytics
 */

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";

interface RevenueMetrics {
  mrr: number; // Monthly Recurring Revenue
  arr: number; // Annual Recurring Revenue
  growthRate: number; // Month-over-month growth
  churnRate: number; // Customer churn rate
  ltv: number; // Customer Lifetime Value
  totalRevenue: number;
  activeSubscriptions: number;
  newSubscriptions: number;
  canceledSubscriptions: number;
}

interface ChurnAnalysisData {
  date: Date;
  customerChurn: number;
  revenueChurn: number;
  newCustomers: number;
  expandedRevenue: number;
}

interface TenantRankingData {
  tenantId: string;
  tenantName: string;
  monthlyRevenue: number;
  totalRevenue: number;
  subscriptionTier: string;
  growthRate: number;
  churnRisk: "low" | "medium" | "high";
}

interface ConversionFunnelData {
  stage: string;
  count: number;
  conversionRate: number;
  dropoffRate: number;
}

interface DateRange {
  start: Date;
  end: Date;
}

type Period = "7d" | "30d" | "90d" | "1y";

export const useAdminRevenueAnalytics = () => {
  const queryClient = useQueryClient();
  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const [dateRange, setDateRange] = useState<DateRange>({
    start: thirtyDaysAgo, // 30 days ago
    end: now,
  });
  const [selectedPeriod, setSelectedPeriod] = useState<Period>("30d");

  // Fetch revenue metrics
  const {
    data: revenueMetrics,
    isLoading: metricsLoading,
    error: metricsError,
  } = useQuery({
    queryKey: ["adminRevenueMetrics", selectedPeriod],
    queryFn: async (): Promise<RevenueMetrics> => {
      // Mock data - in real app this would come from API
      return {
        mrr: 125000,
        arr: 1500000,
        growthRate: 12.5,
        churnRate: 3.2,
        ltv: 4800,
        totalRevenue: 2850000,
        activeSubscriptions: 1250,
        newSubscriptions: 85,
        canceledSubscriptions: 12,
      };
    },
  });

  // Fetch churn analysis
  const { data: churnAnalysis = [], isLoading: churnLoading } = useQuery({
    queryKey: ["adminChurnAnalysis", dateRange],
    queryFn: async (): Promise<ChurnAnalysisData[]> => {
      // Mock data - in real app this would come from API
      return [
        {
          date: new Date("2024-01-01"),
          customerChurn: 2.5,
          revenueChurn: 3.1,
          newCustomers: 45,
          expandedRevenue: 12000,
        },
        {
          date: new Date("2024-01-02"),
          customerChurn: 2.8,
          revenueChurn: 3.4,
          newCustomers: 52,
          expandedRevenue: 15000,
        },
        {
          date: new Date("2024-01-03"),
          customerChurn: 2.2,
          revenueChurn: 2.9,
          newCustomers: 48,
          expandedRevenue: 18000,
        },
        // Add more mock data...
      ];
    },
  });

  // Fetch tenant ranking
  const { data: tenantRanking = [], isLoading: rankingLoading } = useQuery({
    queryKey: ["adminTenantRanking", selectedPeriod],
    queryFn: async (): Promise<TenantRankingData[]> => {
      // Mock data - in real app this would come from API
      return [
        {
          tenantId: "tenant_1",
          tenantName: "Acme Corp",
          monthlyRevenue: 15000,
          totalRevenue: 180000,
          subscriptionTier: "Enterprise",
          growthRate: 25.5,
          churnRisk: "low",
        },
        {
          tenantId: "tenant_2",
          tenantName: "TechStart Inc",
          monthlyRevenue: 8500,
          totalRevenue: 95000,
          subscriptionTier: "Pro",
          growthRate: 18.2,
          churnRisk: "low",
        },
        {
          tenantId: "tenant_3",
          tenantName: "Global Solutions",
          monthlyRevenue: 12000,
          totalRevenue: 144000,
          subscriptionTier: "Enterprise",
          growthRate: -5.2,
          churnRisk: "high",
        },
        {
          tenantId: "tenant_4",
          tenantName: "StartupXYZ",
          monthlyRevenue: 2500,
          totalRevenue: 15000,
          subscriptionTier: "Pro",
          growthRate: 45.8,
          churnRisk: "low",
        },
        {
          tenantId: "tenant_5",
          tenantName: "Enterprise Ltd",
          monthlyRevenue: 6800,
          totalRevenue: 68000,
          subscriptionTier: "Pro",
          growthRate: 8.5,
          churnRisk: "medium",
        },
      ];
    },
  });

  // Fetch conversion funnel
  const { data: conversionFunnel = [], isLoading: funnelLoading } = useQuery({
    queryKey: ["adminConversionFunnel", selectedPeriod],
    queryFn: async (): Promise<ConversionFunnelData[]> => {
      // Mock data - in real app this would come from API
      return [
        {
          stage: "Visitors",
          count: 10000,
          conversionRate: 100,
          dropoffRate: 0,
        },
        {
          stage: "Sign-ups",
          count: 1200,
          conversionRate: 12,
          dropoffRate: 88,
        },
        {
          stage: "Trial Started",
          count: 850,
          conversionRate: 8.5,
          dropoffRate: 29.2,
        },
        {
          stage: "Trial Active",
          count: 680,
          conversionRate: 6.8,
          dropoffRate: 20,
        },
        {
          stage: "Converted to Paid",
          count: 340,
          conversionRate: 3.4,
          dropoffRate: 50,
        },
        {
          stage: "Active Subscribers",
          count: 320,
          conversionRate: 3.2,
          dropoffRate: 5.9,
        },
      ];
    },
  });

  const refreshData = () => {
    queryClient.invalidateQueries({ queryKey: ["adminRevenueMetrics"] });
    queryClient.invalidateQueries({ queryKey: ["adminChurnAnalysis"] });
    queryClient.invalidateQueries({ queryKey: ["adminTenantRanking"] });
    queryClient.invalidateQueries({ queryKey: ["adminConversionFunnel"] });
  };

  const isLoading =
    metricsLoading || churnLoading || rankingLoading || funnelLoading;
  const error = metricsError?.message;

  return {
    // Data
    revenueMetrics,
    churnAnalysis,
    tenantRanking,
    conversionFunnel,

    // Loading states
    isLoading,
    error,

    // Filters and settings
    dateRange,
    setDateRange,
    selectedPeriod,
    setSelectedPeriod,

    // Actions
    refreshData,
  };
};
