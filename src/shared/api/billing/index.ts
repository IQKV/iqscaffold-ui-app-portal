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
   * Initiate merchant onboarding
   */
  initiateOnboarding: (request: Types.OnboardRequest) =>
    apiRequest<Types.OnboardResponse>({
      url: "/api/v1/admin/billing/merchants/onboard",
      method: "POST",
      data: request,
    }),

  /**
   * Refund a payment
   */
  refundPayment: (id: string) =>
    apiRequest<void>({
      url: `/api/v1/billing/payments/${id}/refund`,
      method: "POST",
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
