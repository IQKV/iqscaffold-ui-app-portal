// Core billing types based on the design document

export interface Subscription {
  id: string;
  tenantId: string;
  planId: string;
  status: SubscriptionStatus;
  billingCycle: BillingCycle;
  currentPeriodStart: Date;
  currentPeriodEnd: Date;
  trialEnd?: Date;
  cancelAtPeriodEnd: boolean;
  metadata: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

export enum SubscriptionStatus {
  ACTIVE = "active",
  TRIALING = "trialing",
  PAST_DUE = "past_due",
  CANCELED = "canceled",
  UNPAID = "unpaid",
}

export enum BillingCycle {
  MONTHLY = "monthly",
  YEARLY = "yearly",
}

export interface Plan {
  id: string;
  name: string;
  tier: PlanTier;
  price: number;
  currency: string;
  billingCycle: BillingCycle;
  features: PlanFeature[];
  quotas: PlanQuota[];
  trialDays?: number;
  active: boolean;
}

export enum PlanTier {
  FREE = "free",
  PRO = "pro",
  ENTERPRISE = "enterprise",
}

export interface PlanFeature {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
}

export interface PlanQuota {
  metricType: UsageMetricType;
  limit: number;
  gracePercentage: number;
}

export interface UsageMetric {
  id: string;
  tenantId: string;
  metricType: UsageMetricType;
  value: number;
  period: string;
  timestamp: Date;
}

export enum UsageMetricType {
  API_CALLS = "api_calls",
  STORAGE_GB = "storage_gb",
  EMAIL_SENDS = "email_sends",
  ACTIVE_USERS = "active_users",
}

export interface QuotaStatus {
  metricType: UsageMetricType;
  current: number;
  limit: number;
  percentage: number;
  withinGrace: boolean;
  exceeded: boolean;
}

export interface Invoice {
  id: string;
  tenantId: string;
  subscriptionId: string;
  number: string;
  status: InvoiceStatus;
  amount: number;
  currency: string;
  dueDate: Date;
  paidAt?: Date;
  lineItems: InvoiceLineItem[];
  paymentAttempts: PaymentAttempt[];
  createdAt: Date;
}

export enum InvoiceStatus {
  DRAFT = "draft",
  OPEN = "open",
  PAID = "paid",
  VOID = "void",
  UNCOLLECTIBLE = "uncollectible",
}

export interface InvoiceLineItem {
  description: string;
  amount: number;
  quantity: number;
  unitPrice: number;
  period?: {
    start: Date;
    end: Date;
  };
}

export interface PaymentAttempt {
  id: string;
  amount: number;
  status: PaymentStatus;
  paymentMethodId: string;
  failureReason?: string;
  attemptedAt: Date;
}

export enum PaymentStatus {
  PENDING = "pending",
  SUCCEEDED = "succeeded",
  FAILED = "failed",
  CANCELED = "canceled",
}

export interface PaymentMethod {
  id: string;
  tenantId: string;
  type: PaymentMethodType;
  provider: PaymentProvider;
  providerPaymentMethodId: string;
  isDefault: boolean;
  metadata: PaymentMethodMetadata;
  createdAt: Date;
}

export enum PaymentMethodType {
  CARD = "card",
  BANK_ACCOUNT = "bank_account",
}

export enum PaymentProvider {
  STRIPE = "stripe",
  PAYPAL = "paypal",
}

export interface PaymentMethodMetadata {
  last4?: string;
  brand?: string;
  expiryMonth?: number;
  expiryYear?: number;
  country?: string;
}

export interface UserAuthority {
  userId: string;
  tenantId?: string;
  authorities: Authority[];
  createdAt: Date;
  updatedAt: Date;
}

export enum Authority {
  TENANT_ADMIN = "tenant_admin",
  PLATFORM_ADMIN = "platform_admin",
  SUPPORT_AGENT = "support_agent",
  BILLING_VIEWER = "billing_viewer",
}

export interface AuthorityCheck {
  authority: Authority;
  resource: string;
  action: string;
  tenantId?: string;
}

// Form-related types
export interface PaymentMethodData {
  type: PaymentMethodType;
  provider?: PaymentProvider;
  cardNumber?: string;
  expiryMonth?: string;
  expiryYear?: string;
  cvv?: string;
  billingAddress: BillingAddress;
  providerPaymentMethodId?: string;
  metadata?: PaymentMethodMetadata;
  tenantId?: string;
}

export interface BillingAddress {
  line1?: string;
  line2?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
}

// API response types
export interface BillingDashboardData {
  subscription: Subscription;
  plan: Plan;
  usage: QuotaStatus[];
  recentInvoices: Invoice[];
  paymentMethods: PaymentMethod[];
}

export interface PlanChangeRequest {
  subscriptionId: string;
  newPlanId: string;
  prorationDate?: Date;
}

export interface PlanChangeResponse {
  subscription: Subscription;
  prorationAmount: number;
  effectiveDate: Date;
}

// Error types
export interface BillingError {
  code: string;
  message: string;
  details?: Record<string, any>;
}

// Analytics types
export interface RevenueMetrics {
  mrr: number;
  arr: number;
  churnRate: number;
  ltv: number;
  conversionRate: number;
}

export interface UsageAnalytics {
  totalUsage: Record<UsageMetricType, number>;
  usageTrends: UsageTrendData[];
  quotaUtilization: QuotaUtilizationData[];
}

export interface UsageTrendData {
  date: Date;
  metricType: UsageMetricType;
  value: number;
}

export interface QuotaUtilizationData {
  tenantId: string;
  metricType: UsageMetricType;
  utilization: number;
  timestamp: Date;
}

// Webhook types
export interface WebhookEvent {
  id: string;
  type: WebhookEventType;
  data: Record<string, any>;
  timestamp: Date;
}

export enum WebhookEventType {
  SUBSCRIPTION_CREATED = "subscription.created",
  SUBSCRIPTION_UPDATED = "subscription.updated",
  SUBSCRIPTION_CANCELED = "subscription.canceled",
  INVOICE_CREATED = "invoice.created",
  INVOICE_PAID = "invoice.paid",
  INVOICE_FAILED = "invoice.payment_failed",
  PAYMENT_METHOD_ADDED = "payment_method.added",
  PAYMENT_METHOD_REMOVED = "payment_method.removed",
}

// Proration types
export interface ProrationCalculation {
  oldPlan: Plan;
  newPlan: Plan;
  prorationAmount: number;
  creditAmount: number;
  chargeAmount: number;
  effectiveDate: Date;
}

// Security context types
export interface SecurityContext {
  tenantId?: string;
  userId: string;
  sessionId: string;
  ipAddress?: string;
  userAgent?: string;
}

// Component visibility types
export interface ComponentVisibility {
  pages: string[];
  widgets: string[];
  actions: string[];
  fields: string[];
}
