import { apiRequest } from "../base";
import * as Types from "./types";

export const billingApi = {
  /**
   * Create a payment intent
   */
  createPaymentIntent: (request: Types.CreatePaymentRequest) =>
    apiRequest<Types.PaymentResponse>({
      url: "/api/v1/billing/payments/intent",
      method: "POST",
      data: request,
    }),

  /**
   * Get payment details
   */
  getPayment: (id: string) =>
    apiRequest<Types.PaymentResponse>({
      url: `/api/v1/billing/payments/${id}`,
      method: "GET",
    }),

  /**
   * List payments with pagination
   */
  listPayments: (params?: Types.BillingHistoryParams) =>
    apiRequest<Types.PaginatedResponse<Types.PaymentResponse>>({
      url: "/api/v1/billing/payments",
      method: "GET",
      params,
    }),

  /**
   * Refund a payment
   */
  refundPayment: (id: string) =>
    apiRequest<void>({
      url: `/api/v1/billing/payments/${id}/refund`,
      method: "POST",
    }),

  // Feature Management APIs

  /**
   * Get user's complete feature information (deprecated - use userManagementApi.getUserFeatures)
   * @deprecated Use userManagementApi.getUserFeatures instead
   */
  getMyFeatures: () =>
    apiRequest<Types.UserFeaturesResponse>({
      url: "/api/v1/features/my-features",
      method: "GET",
    }),

  /**
   * Get only enabled features (deprecated - use userManagementApi.getUserFeatures)
   * @deprecated Use userManagementApi.getUserFeatures instead
   */
  getEnabledFeatures: () =>
    apiRequest<Types.FeatureDto[]>({
      url: "/api/v1/features/enabled",
      method: "GET",
    }),

  /**
   * Create a subscription
   */
  createSubscription: (request: Types.CreateSubscriptionRequest) =>
    apiRequest<Types.SubscriptionResponse>({
      url: "/api/v1/billing/subscriptions",
      method: "POST",
      data: request,
    }),

  /**
   * Get active subscription
   */
  getActiveSubscription: () =>
    apiRequest<Types.SubscriptionResponse>({
      url: "/api/v1/billing/subscriptions/active",
      method: "GET",
    }),

  /**
   * Get subscription by ID
   */
  getSubscription: (id: string) =>
    apiRequest<Types.SubscriptionResponse>({
      url: `/api/v1/billing/subscriptions/${id}`,
      method: "GET",
    }),

  /**
   * List subscriptions
   */
  listSubscriptions: (params?: Types.BillingHistoryParams) =>
    apiRequest<Types.PaginatedResponse<Types.SubscriptionResponse>>({
      url: "/api/v1/billing/subscriptions",
      method: "GET",
      params,
    }),

  /**
   * Update subscription
   */
  updateSubscription: (id: string, request: Types.UpdateSubscriptionRequest) =>
    apiRequest<Types.SubscriptionResponse>({
      url: `/api/v1/billing/subscriptions/${id}`,
      method: "PUT",
      data: request,
    }),

  /**
   * Cancel subscription at period end
   */
  cancelSubscription: (id: string) =>
    apiRequest<Types.SubscriptionResponse>({
      url: `/api/v1/billing/subscriptions/${id}/cancel`,
      method: "POST",
    }),

  /**
   * Cancel subscription immediately
   */
  cancelSubscriptionImmediately: (id: string) =>
    apiRequest<Types.SubscriptionResponse>({
      url: `/api/v1/billing/subscriptions/${id}/cancel-immediately`,
      method: "POST",
    }),

  /**
   * Pause subscription
   */
  pauseSubscription: (id: string) =>
    apiRequest<Types.SubscriptionResponse>({
      url: `/api/v1/billing/subscriptions/${id}/pause`,
      method: "POST",
    }),

  /**
   * Resume subscription
   */
  resumeSubscription: (id: string) =>
    apiRequest<Types.SubscriptionResponse>({
      url: `/api/v1/billing/subscriptions/${id}/resume`,
      method: "POST",
    }),

  // Subscription Plan APIs

  /**
   * Create subscription plan
   */
  createSubscriptionPlan: (request: Types.CreateSubscriptionPlanRequest) =>
    apiRequest<Types.SubscriptionPlanResponse>({
      url: "/api/v1/billing/subscription-plans",
      method: "POST",
      data: request,
    }),

  /**
   * Get subscription plan
   */
  getSubscriptionPlan: (id: string) =>
    apiRequest<Types.SubscriptionPlanResponse>({
      url: `/api/v1/billing/subscription-plans/${id}`,
      method: "GET",
    }),

  /**
   * List all subscription plans
   */
  listSubscriptionPlans: (params?: Types.BillingHistoryParams) =>
    apiRequest<Types.PaginatedResponse<Types.SubscriptionPlanResponse>>({
      url: "/api/v1/billing/subscription-plans",
      method: "GET",
      params,
    }),

  /**
   * List active subscription plans (public)
   */
  listActiveSubscriptionPlans: () =>
    apiRequest<Types.SubscriptionPlanResponse[]>({
      url: "/api/v1/billing/subscription-plans/active",
      method: "GET",
    }),

  /**
   * Update subscription plan
   */
  updateSubscriptionPlan: (
    id: string,
    request: Types.UpdateSubscriptionPlanRequest
  ) =>
    apiRequest<Types.SubscriptionPlanResponse>({
      url: `/api/v1/billing/subscription-plans/${id}`,
      method: "PUT",
      data: request,
    }),

  /**
   * Sync plan with Stripe
   */
  syncSubscriptionPlan: (id: string) =>
    apiRequest<void>({
      url: `/api/v1/billing/subscription-plans/${id}/sync`,
      method: "POST",
    }),

  // Invoice APIs

  /**
   * Get invoice by ID
   */
  getInvoice: (id: string) =>
    apiRequest<Types.InvoiceResponse>({
      url: `/api/v1/billing/invoices/${id}`,
      method: "GET",
    }),

  /**
   * List invoices
   */
  listInvoices: (params?: Types.BillingHistoryParams) =>
    apiRequest<Types.PaginatedResponse<Types.InvoiceResponse>>({
      url: "/api/v1/billing/invoices",
      method: "GET",
      params,
    }),

  /**
   * List invoices for subscription
   */
  listInvoicesBySubscription: (
    subscriptionId: string,
    params?: Types.BillingHistoryParams
  ) =>
    apiRequest<Types.PaginatedResponse<Types.InvoiceResponse>>({
      url: `/api/v1/billing/invoices/subscription/${subscriptionId}`,
      method: "GET",
      params,
    }),

  /**
   * List open invoices
   */
  listOpenInvoices: () =>
    apiRequest<Types.InvoiceResponse[]>({
      url: "/api/v1/billing/invoices/open",
      method: "GET",
    }),

  /**
   * Initiate merchant onboarding
   */
  initiateOnboarding: (request: Types.OnboardRequest) =>
    apiRequest<Types.OnboardResponse>({
      url: "/api/v1/admin/billing/merchants/onboard",
      method: "POST",
      data: request,
    }),

  /**
   * Get merchant onboarding status by organization
   */
  getMerchantStatus: (organizationId: number) =>
    apiRequest<Types.MerchantStatus>({
      url: `/api/v1/admin/billing/merchants/status/${organizationId}`,
      method: "GET",
    }),

  /**
   * List payouts with pagination
   */
  listPayouts: (params?: Types.BillingHistoryParams) =>
    apiRequest<Types.PaginatedResponse<Types.PayoutResponse>>({
      url: "/api/v1/billing/payouts",
      method: "GET",
      params,
    }),

  /**
   * Get payout details
   */
  getPayout: (id: string) =>
    apiRequest<Types.PayoutResponse>({
      url: `/api/v1/billing/payouts/${id}`,
      method: "GET",
    }),

  // Gateway Configuration APIs

  /**
   * Create gateway configuration
   */
  createGatewayConfig: (request: Types.CreateGatewayConfigRequest) =>
    apiRequest<Types.GatewayConfigResponse>({
      url: "/api/v1/admin/billing/gateway-config",
      method: "POST",
      data: request,
    }),

  /**
   * Update gateway configuration
   */
  updateGatewayConfig: (
    provider: Types.PaymentGatewayProvider,
    request: Types.UpdateGatewayConfigRequest
  ) =>
    apiRequest<Types.GatewayConfigResponse>({
      url: `/api/v1/admin/billing/gateway-config/${provider}`,
      method: "PUT",
      data: request,
    }),

  /**
   * Get gateway configuration
   */
  getGatewayConfig: (provider: Types.PaymentGatewayProvider) =>
    apiRequest<Types.GatewayConfigResponse>({
      url: `/api/v1/admin/billing/gateway-config/${provider}`,
      method: "GET",
    }),

  /**
   * List all gateway configurations
   */
  listGatewayConfigs: () =>
    apiRequest<Types.GatewayConfigSummary[]>({
      url: "/api/v1/admin/billing/gateway-config",
      method: "GET",
    }),

  /**
   * List active gateway configurations
   */
  listActiveGatewayConfigs: () =>
    apiRequest<Types.GatewayConfigSummary[]>({
      url: "/api/v1/admin/billing/gateway-config/active",
      method: "GET",
    }),

  /**
   * Get primary gateway configuration
   */
  getPrimaryGatewayConfig: () =>
    apiRequest<Types.GatewayConfigResponse>({
      url: "/api/v1/admin/billing/gateway-config/primary",
      method: "GET",
    }),

  /**
   * Activate gateway
   */
  activateGateway: (provider: Types.PaymentGatewayProvider) =>
    apiRequest<Types.GatewayStatusResponse>({
      url: `/api/v1/admin/billing/gateway-config/${provider}/activate`,
      method: "POST",
    }),

  /**
   * Deactivate gateway
   */
  deactivateGateway: (provider: Types.PaymentGatewayProvider) =>
    apiRequest<Types.GatewayStatusResponse>({
      url: `/api/v1/admin/billing/gateway-config/${provider}/deactivate`,
      method: "POST",
    }),

  /**
   * Set primary gateway
   */
  setPrimaryGateway: (provider: Types.PaymentGatewayProvider) =>
    apiRequest<Types.GatewayStatusResponse>({
      url: `/api/v1/admin/billing/gateway-config/${provider}/set-primary`,
      method: "POST",
    }),

  /**
   * Delete gateway configuration
   */
  deleteGatewayConfig: (provider: Types.PaymentGatewayProvider) =>
    apiRequest<void>({
      url: `/api/v1/admin/billing/gateway-config/${provider}`,
      method: "DELETE",
    }),
};
