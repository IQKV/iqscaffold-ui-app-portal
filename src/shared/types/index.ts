// Shared types
export type ConfigKeys = "VITE_API_URL_SERVER";

export interface GenericDataResponse<T> {
  data: T;
  errors?: Record<string, string>;
}

export interface GenericPaginatedResponse<T> {
  data: T[];
  meta: import("../lib/pagination").PaginationData;
}

export interface SortableItem {
  id: string | number;
  order: number;
}

// Tenant types
export type {
  Tenant,
  TenantSummary,
  TenantResolutionResult,
  TenantContext,
} from "./tenant";

// Billing types
export type {
  Subscription,
  SubscriptionStatus,
  BillingCycle,
  Plan,
  PlanTier,
  PlanFeature,
  PlanQuota,
  UsageMetric,
  UsageMetricType,
  QuotaStatus,
  Invoice,
  InvoiceStatus,
  InvoiceLineItem,
  PaymentAttempt,
  PaymentStatus,
  PaymentMethod,
  PaymentMethodType,
  PaymentProvider,
  PaymentMethodMetadata,
  PaymentMethodData,
  BillingAddress,
  UserAuthority,
  Authority,
  AuthorityCheck,
  BillingDashboardData,
  PlanChangeRequest,
  PlanChangeResponse,
  BillingError,
  RevenueMetrics,
  UsageAnalytics,
  UsageTrendData,
  QuotaUtilizationData,
  WebhookEvent,
  WebhookEventType,
  ProrationCalculation,
  SecurityContext,
  ComponentVisibility,
} from "./billing";

// Authority types
export type {
  Authority,
  UserAuthority,
  AuthorityCheck,
  SecurityContext,
  ComponentVisibility,
  AuthorityRule,
  PageLayoutConfig,
} from "./authority";
