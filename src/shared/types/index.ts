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

// Billing types - interfaces
export type {
  Subscription,
  BillingCycle,
  Plan,
  PlanTier,
  PlanFeature,
  PlanQuota,
  UsageMetric,
  QuotaStatus,
  Invoice,
  InvoiceLineItem,
  PaymentAttempt,
  PaymentMethod,
  PaymentMethodMetadata,
  PaymentMethodData,
  BillingAddress,
  BillingDashboardData,
  PlanChangeRequest,
  PlanChangeResponse,
  BillingError,
  RevenueMetrics,
  UsageAnalytics,
  UsageTrendData,
  QuotaUtilizationData,
  WebhookEvent,
  ProrationCalculation,
} from "./billing";

// Billing types - enums (need regular export to be used as values)
export {
  SubscriptionStatus,
  UsageMetricType,
  InvoiceStatus,
  PaymentStatus,
  PaymentMethodType,
  PaymentProvider,
  WebhookEventType,
} from "./billing";

// Authority types - interfaces
export type {
  UserAuthority,
  AuthorityCheck,
  SecurityContext,
  ComponentVisibility,
  AuthorityRule,
  PageLayoutConfig,
} from "./authority";

// Authority types - enums (need regular export to be used as values)
export { Authority } from "./authority";
