export interface CreatePaymentRequest {
  amount: number;
  currency: string;
  description: string;
  customerEmail?: string;
  customerName?: string;
  metadata?: Record<string, string>;
}

export interface PaymentResponse {
  id: string;
  clientSecret: string;
  amount: number;
  currency: string;
  status: PaymentStatus;
  createdAt: string;
}

export type PaymentStatus =
  | "PENDING"
  | "SUCCEEDED"
  | "FAILED"
  | "REFUNDED"
  | "PROCESSING"
  | "REQUIRES_PAYMENT_METHOD"
  | "REQUIRES_CONFIRMATION"
  | "REQUIRES_ACTION"
  | "CANCELED";

// Subscription Management Types

export interface CreateSubscriptionRequest {
  planId: string;
  paymentMethodId?: string;
  trialDays?: number;
  metadata?: Record<string, string>;
}

export interface UpdateSubscriptionRequest {
  planId?: string;
  paymentMethodId?: string;
  metadata?: Record<string, string>;
}

export interface SubscriptionResponse {
  id: string;
  tenantId: string;
  planId: string;
  planName: string;
  status: SubscriptionStatus;
  stripeSubscriptionId?: string;
  stripeCustomerId?: string;
  currentPeriodStart: string;
  currentPeriodEnd: string;
  trialStart?: string;
  trialEnd?: string;
  cancelAtPeriodEnd: boolean;
  canceledAt?: string;
  createdAt: string;
  updatedAt: string;
}

export type SubscriptionStatus =
  | "active"
  | "trialing"
  | "past_due"
  | "canceled"
  | "unpaid"
  | "paused";

// Subscription Plan Types

export interface CreateSubscriptionPlanRequest {
  name: string;
  description?: string;
  priceAmount: number;
  currency: string;
  interval: "month" | "year";
  intervalCount: number;
  trialDays?: number;
  isActive: boolean;
  features?: Record<string, any>;
}

export interface UpdateSubscriptionPlanRequest {
  name?: string;
  description?: string;
  priceAmount?: number;
  currency?: string;
  interval?: "month" | "year";
  intervalCount?: number;
  trialDays?: number;
  isActive?: boolean;
  features?: Record<string, any>;
}

// Feature Management Types

export interface FeatureDto {
  code: string;
  name: string;
  description: string;
  category: string;
  enabled: boolean;
  usageLimit?: number;
  currentUsage?: number;
}

export interface UserFeaturesResponse {
  enabledFeatures: FeatureDto[];
  allFeatures: FeatureDto[];
  planName: string;
  subscriptionStatus: string;
  subscriptionExpiresAt?: string;
  isTrialPeriod: boolean;
  trialExpiresAt?: string;
  tenantId: string;
}

export interface FeatureUsageInfo {
  current: number;
  limit: number;
  percentage: number;
  remaining: number;
}

export interface SubscriptionPlanResponse {
  id: string;
  name: string;
  description?: string;
  priceAmount: number;
  currency: string;
  interval: string;
  intervalCount: number;
  trialDays?: number;
  isActive: boolean;
  features?: Record<string, any>;
  stripePriceId?: string;
  stripeProductId?: string;
  createdAt: string;
  updatedAt: string;
}

// Invoice Types

export interface InvoiceResponse {
  id: string;
  subscriptionId: string;
  stripeInvoiceId?: string;
  status: InvoiceStatus;
  amountDue: number;
  amountPaid: number;
  currency: string;
  dueDate?: string;
  paidAt?: string;
  hostedInvoiceUrl?: string;
  invoicePdf?: string;
  periodStart: string;
  periodEnd: string;
  createdAt: string;
  updatedAt: string;
}

export type InvoiceStatus = "draft" | "open" | "paid" | "uncollectible" | "void";

export interface OnboardRequest {
  organizationId: number;
  gatewayProvider: PaymentGatewayProvider;
  refreshUrl: string;
  returnUrl: string;
}

export interface OnboardResponse {
  accountLink: string;
}

export interface BillingHistoryParams {
  page?: number;
  size?: number;
  sort?: string[];
}

export enum PaymentGatewayProvider {
  STRIPE = "STRIPE",
  PAYPAL = "PAYPAL",
  SQUARE = "SQUARE",
  BRAINTREE = "BRAINTREE",
}

export interface MerchantStatus {
  stripeAccountId: string;
  organizationId: number;
  tenantId: string;
  chargesEnabled: boolean;
  payoutsEnabled: boolean;
  applicationFeePercent?: number;
}

export interface PaginatedResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}

export interface PayoutResponse {
  id: string;
  amount: number;
  currency: string;
  status: PayoutStatus;
  arrivalDate: string;
  merchantAccountId: string;
}

export type PayoutStatus = "paid" | "pending" | "in_transit" | "canceled" | "failed";

// Gateway Configuration Types

export interface StripeGatewayConfigData {
  provider: "STRIPE";
  apiKey: string;
  webhookSecret: string;
  clientId?: string;
  publicKey?: string;
}

export interface PayPalGatewayConfigData {
  provider: "PAYPAL";
  clientId: string;
  clientSecret: string;
  webhookId?: string;
  mode: "sandbox" | "live";
}

export interface SquareGatewayConfigData {
  provider: "SQUARE";
  accessToken: string;
  locationId: string;
  webhookSignatureKey?: string;
  applicationId?: string;
}

export interface BraintreeGatewayConfigData {
  provider: "BRAINTREE";
  merchantId: string;
  publicKey: string;
  privateKey: string;
  environment: "sandbox" | "production";
}

export type GatewayConfigData =
  | StripeGatewayConfigData
  | PayPalGatewayConfigData
  | SquareGatewayConfigData
  | BraintreeGatewayConfigData;

export interface CreateGatewayConfigRequest {
  gatewayProvider: PaymentGatewayProvider;
  configData: GatewayConfigData;
  mode: "test" | "live";
  isActive: boolean;
  isPrimary: boolean;
  displayName?: string;
  description?: string;
}

export interface UpdateGatewayConfigRequest {
  configData?: GatewayConfigData;
  mode?: "test" | "live";
  isActive?: boolean;
  isPrimary?: boolean;
  displayName?: string;
  description?: string;
}

export interface MaskedConfigData {
  provider: PaymentGatewayProvider;
  isConfigured: boolean;
  lastFourChars?: string;
}

export interface GatewayConfigResponse {
  id: string;
  tenantId: string;
  gatewayProvider: PaymentGatewayProvider;
  isActive: boolean;
  isPrimary: boolean;
  mode: string;
  displayName?: string;
  description?: string;
  maskedConfigData: MaskedConfigData;
  createdAt: string;
  updatedAt: string;
}

export interface GatewayConfigSummary {
  id: string;
  gatewayProvider: PaymentGatewayProvider;
  isActive: boolean;
  isPrimary: boolean;
  mode: string;
  displayName?: string;
  updatedAt: string;
}

export interface GatewayStatusResponse {
  id: string;
  gatewayProvider: PaymentGatewayProvider;
  isActive: boolean;
  isPrimary: boolean;
  message?: string;
}
