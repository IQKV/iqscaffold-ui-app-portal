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

export type PayoutStatus =
  | "paid"
  | "pending"
  | "in_transit"
  | "canceled"
  | "failed";

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
