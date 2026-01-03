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
};
