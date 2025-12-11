import type {
  UsageMetric as BaseUsageMetric,
  QuotaStatus as BaseQuotaStatus,
} from "@/shared/types/billing";
import { UsageMetricType } from "@/shared/types/billing";

export { UsageMetricType };

// Re-export base types
export type UsageMetric = BaseUsageMetric;
export type QuotaStatus = BaseQuotaStatus;

// Usage-specific business operations
export interface UsageOperations {
  // Recording operations
  recordUsage: (
    tenantId: string,
    metricType: UsageMetricType,
    amount: number,
    metadata?: Record<string, any>
  ) => Promise<UsageMetric>;

  // Quota operations
  checkQuota: (
    tenantId: string,
    metricType: UsageMetricType,
    amount?: number
  ) => Promise<QuotaCheckResult>;
  getQuotaStatus: (tenantId: string) => Promise<QuotaStatus[]>;

  // Metrics operations
  getUsageMetrics: (
    tenantId: string,
    filters?: UsageFilters
  ) => Promise<UsageMetric[]>;
  getUsageAnalytics: (
    tenantId: string,
    filters?: UsageFilters
  ) => Promise<UsageAnalytics>;
}

export interface UsageState {
  usageMetrics: UsageMetric[];
  quotaStatus: QuotaStatus[];
  currentUsage: Record<UsageMetricType, number>;
  loading: boolean;
  error: string | null;

  // Real-time state
  quotaWarnings: QuotaWarning[];
  quotaExceeded: UsageMetricType[];
  lastUpdated: Date | null;
}

export interface UsageFilters {
  metricType?: UsageMetricType;
  startDate?: Date;
  endDate?: Date;
  period?: string;
  aggregation?: "hour" | "day" | "week" | "month";
}

// Business logic interfaces
export interface QuotaCheckResult {
  allowed: boolean;
  remaining: number;
  exceeded: boolean;
  withinGrace: boolean;
  quotaStatus: QuotaStatus;
}

export interface QuotaValidation {
  isValid: boolean;
  canProceed: boolean;
  withinGrace: boolean;
  remainingQuota: number;
  graceRemaining: number;
  errors: string[];
  warnings: string[];
}

export interface QuotaWarning {
  metricType: UsageMetricType;
  currentUsage: number;
  limit: number;
  percentage: number;
  severity: "info" | "warning" | "critical";
  message: string;
  timestamp: Date;
}

export interface UsageAnalytics {
  totalUsage: Record<UsageMetricType, number>;
  usageTrends: UsageTrendData[];
  quotaUtilization: QuotaUtilizationData[];
  projectedUsage: UsageProjection[];
  costAnalysis: UsageCostAnalysis;
}

export interface UsageTrendData {
  date: Date;
  metricType: UsageMetricType;
  value: number;
  period: string;
}

export interface QuotaUtilizationData {
  metricType: UsageMetricType;
  utilization: number;
  trend: "increasing" | "decreasing" | "stable";
  timestamp: Date;
}

export interface UsageProjection {
  metricType: UsageMetricType;
  projectedUsage: number;
  projectedDate: Date;
  confidence: number;
  basedOnDays: number;
}

export interface UsageCostAnalysis {
  currentPeriodCost: number;
  projectedPeriodCost: number;
  overageCost: number;
  potentialSavings: number;
  recommendedPlan?: string;
}

// Quota enforcement interfaces
export interface QuotaEnforcement {
  metricType: UsageMetricType;
  limit: number;
  gracePercentage: number;
  enforcementLevel: "soft" | "hard";
  actions: QuotaAction[];
}

export interface QuotaAction {
  threshold: number; // Percentage of quota
  action: "warn" | "throttle" | "block" | "notify";
  parameters?: Record<string, any>;
}

// Real-time monitoring interfaces
export interface UsageThreshold {
  metricType: UsageMetricType;
  threshold: number;
  type: "percentage" | "absolute";
  action: "notify" | "alert" | "block";
  enabled: boolean;
}

export interface UsageAlert {
  id: string;
  tenantId: string;
  metricType: UsageMetricType;
  alertType: "threshold" | "quota_exceeded" | "grace_period";
  message: string;
  severity: "low" | "medium" | "high" | "critical";
  timestamp: Date;
  acknowledged: boolean;
}

// Aggregation and reporting interfaces
export interface UsageAggregation {
  period: "hour" | "day" | "week" | "month" | "year";
  metricType: UsageMetricType;
  totalUsage: number;
  averageUsage: number;
  peakUsage: number;
  periodStart: Date;
  periodEnd: Date;
}

export interface UsageReport {
  tenantId: string;
  reportType: "summary" | "detailed" | "trend" | "quota";
  period: {
    start: Date;
    end: Date;
  };
  metrics: UsageMetricType[];
  data: UsageAggregation[];
  generatedAt: Date;
}

// Billing integration interfaces
export interface UsageBilling {
  metricType: UsageMetricType;
  baseAllowance: number;
  overageRate: number;
  billingUnit: string;
  minimumCharge: number;
  maximumCharge?: number;
}

export interface OverageCalculation {
  metricType: UsageMetricType;
  baseUsage: number;
  overageUsage: number;
  overageRate: number;
  overageAmount: number;
  billingPeriod: {
    start: Date;
    end: Date;
  };
}
