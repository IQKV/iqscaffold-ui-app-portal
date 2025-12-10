import { apiClient, apiRequest } from "./base";
import type {
  Subscription,
  Plan,
  Invoice,
  PaymentMethod,
  UsageMetric,
  QuotaStatus,
  BillingDashboardData,
  PlanChangeRequest,
  PlanChangeResponse,
  PaymentMethodData,
  RevenueMetrics,
  UsageAnalytics,
  ProrationCalculation,
} from "@/shared/types/billing";
import type { GenericPaginatedResponse } from "@/shared/types";

/**
 * Billing API client with comprehensive error handling and authentication
 */
export class BillingApiClient {
  private readonly baseUrl = "/api/billing";

  // Subscription endpoints
  async getSubscription(tenantId: string): Promise<Subscription> {
    return apiRequest<Subscription>({
      method: "GET",
      url: `${this.baseUrl}/subscriptions/${tenantId}`,
    });
  }

  async createSubscription(data: {
    tenantId: string;
    planId: string;
    paymentMethodId: string;
    trialDays?: number;
  }): Promise<Subscription> {
    return apiRequest<Subscription>({
      method: "POST",
      url: `${this.baseUrl}/subscriptions`,
      data,
    });
  }

  async updateSubscription(
    subscriptionId: string,
    data: Partial<Subscription>
  ): Promise<Subscription> {
    return apiRequest<Subscription>({
      method: "PATCH",
      url: `${this.baseUrl}/subscriptions/${subscriptionId}`,
      data,
    });
  }

  async cancelSubscription(
    subscriptionId: string,
    cancelAtPeriodEnd: boolean = true
  ): Promise<Subscription> {
    return apiRequest<Subscription>({
      method: "POST",
      url: `${this.baseUrl}/subscriptions/${subscriptionId}/cancel`,
      data: { cancelAtPeriodEnd },
    });
  }

  async changePlan(request: PlanChangeRequest): Promise<PlanChangeResponse> {
    return apiRequest<PlanChangeResponse>({
      method: "POST",
      url: `${this.baseUrl}/subscriptions/${request.subscriptionId}/change-plan`,
      data: request,
    });
  }

  async calculateProration(
    subscriptionId: string,
    newPlanId: string
  ): Promise<ProrationCalculation> {
    return apiRequest<ProrationCalculation>({
      method: "POST",
      url: `${this.baseUrl}/subscriptions/${subscriptionId}/calculate-proration`,
      data: { newPlanId },
    });
  }

  // Plan endpoints
  async getPlans(): Promise<Plan[]> {
    return apiRequest<Plan[]>({
      method: "GET",
      url: `${this.baseUrl}/plans`,
    });
  }

  async getPlan(planId: string): Promise<Plan> {
    return apiRequest<Plan>({
      method: "GET",
      url: `${this.baseUrl}/plans/${planId}`,
    });
  }

  async getUpgradeOptions(currentPlanId: string): Promise<Plan[]> {
    return apiRequest<Plan[]>({
      method: "GET",
      url: `${this.baseUrl}/plans/${currentPlanId}/upgrade-options`,
    });
  }

  // Invoice endpoints
  async getInvoices(
    tenantId: string,
    params?: {
      page?: number;
      limit?: number;
      status?: string;
      startDate?: string;
      endDate?: string;
    }
  ): Promise<GenericPaginatedResponse<Invoice>> {
    return apiRequest<GenericPaginatedResponse<Invoice>>({
      method: "GET",
      url: `${this.baseUrl}/invoices`,
      params: { tenantId, ...params },
    });
  }

  async getInvoice(invoiceId: string): Promise<Invoice> {
    return apiRequest<Invoice>({
      method: "GET",
      url: `${this.baseUrl}/invoices/${invoiceId}`,
    });
  }

  async downloadInvoicePDF(invoiceId: string): Promise<Blob> {
    const response = await apiClient.request({
      method: "GET",
      url: `${this.baseUrl}/invoices/${invoiceId}/pdf`,
      responseType: "blob",
    });
    return response.data;
  }

  async retryInvoicePayment(invoiceId: string): Promise<Invoice> {
    return apiRequest<Invoice>({
      method: "POST",
      url: `${this.baseUrl}/invoices/${invoiceId}/retry-payment`,
    });
  }

  async voidInvoice(invoiceId: string): Promise<Invoice> {
    return apiRequest<Invoice>({
      method: "POST",
      url: `${this.baseUrl}/invoices/${invoiceId}/void`,
    });
  }

  async generateInvoice(
    subscriptionId: string,
    periodEnd: Date
  ): Promise<Invoice> {
    return apiRequest<Invoice>({
      method: "POST",
      url: `${this.baseUrl}/invoices/generate`,
      data: { subscriptionId, periodEnd: periodEnd.toISOString() },
    });
  }

  // Payment Method endpoints
  async getPaymentMethods(tenantId: string): Promise<PaymentMethod[]> {
    return apiRequest<PaymentMethod[]>({
      method: "GET",
      url: `${this.baseUrl}/payment-methods`,
      params: { tenantId },
    });
  }

  async addPaymentMethod(
    data: PaymentMethodData & { tenantId: string }
  ): Promise<PaymentMethod> {
    return apiRequest<PaymentMethod>({
      method: "POST",
      url: `${this.baseUrl}/payment-methods`,
      data,
    });
  }

  async updatePaymentMethod(
    paymentMethodId: string,
    data: Partial<PaymentMethodData>
  ): Promise<PaymentMethod> {
    return apiRequest<PaymentMethod>({
      method: "PATCH",
      url: `${this.baseUrl}/payment-methods/${paymentMethodId}`,
      data,
    });
  }

  async deletePaymentMethod(paymentMethodId: string): Promise<void> {
    return apiRequest<void>({
      method: "DELETE",
      url: `${this.baseUrl}/payment-methods/${paymentMethodId}`,
    });
  }

  async setDefaultPaymentMethod(
    tenantId: string,
    paymentMethodId: string
  ): Promise<PaymentMethod> {
    return apiRequest<PaymentMethod>({
      method: "POST",
      url: `${this.baseUrl}/payment-methods/${paymentMethodId}/set-default`,
      data: { tenantId },
    });
  }

  // Usage and Quota endpoints
  async getUsageMetrics(
    tenantId: string,
    params?: {
      startDate?: string;
      endDate?: string;
      metricType?: string;
    }
  ): Promise<UsageMetric[]> {
    return apiRequest<UsageMetric[]>({
      method: "GET",
      url: `${this.baseUrl}/usage`,
      params: { tenantId, ...params },
    });
  }

  async getQuotaStatus(tenantId: string): Promise<QuotaStatus[]> {
    return apiRequest<QuotaStatus[]>({
      method: "GET",
      url: `${this.baseUrl}/quota/status`,
      params: { tenantId },
    });
  }

  async checkQuota(
    tenantId: string,
    metricType: string,
    amount: number = 1
  ): Promise<{ allowed: boolean; remaining: number; exceeded: boolean }> {
    return apiRequest<{
      allowed: boolean;
      remaining: number;
      exceeded: boolean;
    }>({
      method: "POST",
      url: `${this.baseUrl}/quota/check`,
      data: { tenantId, metricType, amount },
    });
  }

  async recordUsage(
    tenantId: string,
    metricType: string,
    amount: number,
    metadata?: Record<string, any>
  ): Promise<UsageMetric> {
    return apiRequest<UsageMetric>({
      method: "POST",
      url: `${this.baseUrl}/usage/record`,
      data: { tenantId, metricType, amount, metadata },
    });
  }

  // Dashboard endpoints
  async getBillingDashboard(tenantId: string): Promise<BillingDashboardData> {
    return apiRequest<BillingDashboardData>({
      method: "GET",
      url: `${this.baseUrl}/dashboard`,
      params: { tenantId },
    });
  }

  // Analytics endpoints (for admin users)
  async getRevenueMetrics(params?: {
    startDate?: string;
    endDate?: string;
    tenantId?: string;
  }): Promise<RevenueMetrics> {
    return apiRequest<RevenueMetrics>({
      method: "GET",
      url: `${this.baseUrl}/analytics/revenue`,
      params,
    });
  }

  async getUsageAnalytics(params?: {
    startDate?: string;
    endDate?: string;
    tenantId?: string;
    metricType?: string;
  }): Promise<UsageAnalytics> {
    return apiRequest<UsageAnalytics>({
      method: "GET",
      url: `${this.baseUrl}/analytics/usage`,
      params,
    });
  }

  // Support endpoints
  async extendTrial(
    subscriptionId: string,
    extensionDays: number,
    reason: string
  ): Promise<Subscription> {
    return apiRequest<Subscription>({
      method: "POST",
      url: `${this.baseUrl}/support/extend-trial`,
      data: { subscriptionId, extensionDays, reason },
    });
  }

  async processRefund(
    invoiceId: string,
    amount?: number,
    reason?: string
  ): Promise<{ refundId: string; amount: number; status: string }> {
    return apiRequest<{ refundId: string; amount: number; status: string }>({
      method: "POST",
      url: `${this.baseUrl}/support/refund`,
      data: { invoiceId, amount, reason },
    });
  }

  async suspendSubscription(
    subscriptionId: string,
    reason: string
  ): Promise<Subscription> {
    return apiRequest<Subscription>({
      method: "POST",
      url: `${this.baseUrl}/support/suspend`,
      data: { subscriptionId, reason },
    });
  }

  async reactivateSubscription(subscriptionId: string): Promise<Subscription> {
    return apiRequest<Subscription>({
      method: "POST",
      url: `${this.baseUrl}/support/reactivate`,
      data: { subscriptionId },
    });
  }

  // Webhook endpoints
  async getWebhookEvents(params?: {
    page?: number;
    limit?: number;
    eventType?: string;
    startDate?: string;
    endDate?: string;
  }): Promise<GenericPaginatedResponse<any>> {
    return apiRequest<GenericPaginatedResponse<any>>({
      method: "GET",
      url: `${this.baseUrl}/webhooks/events`,
      params,
    });
  }

  async retryWebhook(
    eventId: string
  ): Promise<{ success: boolean; attempts: number }> {
    return apiRequest<{ success: boolean; attempts: number }>({
      method: "POST",
      url: `${this.baseUrl}/webhooks/events/${eventId}/retry`,
    });
  }

  // Payment retry and failure handling endpoints
  async recordPaymentFailure(
    invoiceId: string,
    failure: {
      failureReason: string;
      attemptedAt: Date;
      paymentIntentId?: string;
    }
  ): Promise<void> {
    return apiRequest<void>({
      method: "POST",
      url: `${this.baseUrl}/invoices/${invoiceId}/payment-failures`,
      data: failure,
    });
  }

  async schedulePaymentRetry(invoiceId: string): Promise<void> {
    return apiRequest<void>({
      method: "POST",
      url: `${this.baseUrl}/invoices/${invoiceId}/schedule-retry`,
    });
  }

  async updateInvoiceStatus(
    invoiceId: string,
    status: string,
    metadata?: Record<string, any>
  ): Promise<Invoice> {
    return apiRequest<Invoice>({
      method: "PATCH",
      url: `${this.baseUrl}/invoices/${invoiceId}/status`,
      data: { status, metadata },
    });
  }

  async updateSubscriptionStatus(
    subscriptionId: string,
    status: string
  ): Promise<Subscription> {
    return apiRequest<Subscription>({
      method: "PATCH",
      url: `${this.baseUrl}/subscriptions/${subscriptionId}/status`,
      data: { status },
    });
  }

  // Webhook synchronization endpoints
  async syncSubscriptionFromProvider(
    subscriptionData: any
  ): Promise<Subscription> {
    return apiRequest<Subscription>({
      method: "POST",
      url: `${this.baseUrl}/sync/subscription`,
      data: subscriptionData,
    });
  }

  async syncPaymentMethodFromProvider(
    paymentMethodData: any
  ): Promise<PaymentMethod> {
    return apiRequest<PaymentMethod>({
      method: "POST",
      url: `${this.baseUrl}/sync/payment-method`,
      data: paymentMethodData,
    });
  }

  async syncInvoiceFromProvider(invoiceData: any): Promise<Invoice> {
    return apiRequest<Invoice>({
      method: "POST",
      url: `${this.baseUrl}/sync/invoice`,
      data: invoiceData,
    });
  }

  async removePaymentMethodByProviderId(
    providerPaymentMethodId: string
  ): Promise<void> {
    return apiRequest<void>({
      method: "DELETE",
      url: `${this.baseUrl}/payment-methods/provider/${providerPaymentMethodId}`,
    });
  }

  async storeWebhookEvent(event: {
    id: string;
    type: string;
    data: Record<string, any>;
    timestamp: Date;
    provider: string;
    processedAt: Date;
  }): Promise<void> {
    return apiRequest<void>({
      method: "POST",
      url: `${this.baseUrl}/webhooks/events`,
      data: event,
    });
  }

  // Refund-related endpoints
  async getPaymentDetails(paymentId: string): Promise<any> {
    return apiRequest<any>({
      method: "GET",
      url: `${this.baseUrl}/payments/${paymentId}`,
    });
  }

  async createRefund(refund: any): Promise<void> {
    return apiRequest<void>({
      method: "POST",
      url: `${this.baseUrl}/refunds`,
      data: refund,
    });
  }

  async getRefund(refundId: string): Promise<any> {
    return apiRequest<any>({
      method: "GET",
      url: `${this.baseUrl}/refunds/${refundId}`,
    });
  }

  async updateRefund(refundId: string, updates: any): Promise<void> {
    return apiRequest<void>({
      method: "PATCH",
      url: `${this.baseUrl}/refunds/${refundId}`,
      data: updates,
    });
  }

  async getRefunds(filters: any): Promise<any[]> {
    return apiRequest<any[]>({
      method: "GET",
      url: `${this.baseUrl}/refunds`,
      params: filters,
    });
  }

  async recordInvoiceRefund(invoiceId: string, refundData: any): Promise<void> {
    return apiRequest<void>({
      method: "POST",
      url: `${this.baseUrl}/invoices/${invoiceId}/refunds`,
      data: refundData,
    });
  }

  async sendRefundNotification(
    tenantId: string,
    refundData: any
  ): Promise<void> {
    return apiRequest<void>({
      method: "POST",
      url: `${this.baseUrl}/notifications/refund`,
      data: { tenantId, ...refundData },
    });
  }

  async calculateProRatedRefund(
    subscriptionId: string,
    cancelDate: Date
  ): Promise<{ amount: number; currency: string; calculation: any }> {
    return apiRequest<{ amount: number; currency: string; calculation: any }>({
      method: "POST",
      url: `${this.baseUrl}/subscriptions/${subscriptionId}/calculate-refund`,
      data: { cancelDate: cancelDate.toISOString() },
    });
  }

  // Payment retry notification endpoints
  async sendPaymentRetryNotification(
    tenantId: string,
    notificationData: {
      invoiceId: string;
      attempt: number;
      nextRetryDate?: Date;
      type: "retry_notification" | "final_failure";
    }
  ): Promise<void> {
    return apiRequest<void>({
      method: "POST",
      url: `${this.baseUrl}/notifications/payment-retry`,
      data: { tenantId, ...notificationData },
    });
  }
}

// Export singleton instance
export const billingApi = new BillingApiClient();

// Export individual methods for easier importing
export const {
  getSubscription,
  createSubscription,
  updateSubscription,
  cancelSubscription,
  changePlan,
  calculateProration,
  getPlans,
  getPlan,
  getUpgradeOptions,
  getInvoices,
  getInvoice,
  downloadInvoicePDF,
  retryInvoicePayment,
  voidInvoice,
  generateInvoice,
  getPaymentMethods,
  addPaymentMethod,
  updatePaymentMethod,
  deletePaymentMethod,
  setDefaultPaymentMethod,
  getUsageMetrics,
  getQuotaStatus,
  checkQuota,
  recordUsage,
  getBillingDashboard,
  getRevenueMetrics,
  getUsageAnalytics,
  extendTrial,
  processRefund,
  suspendSubscription,
  reactivateSubscription,
  getWebhookEvents,
  retryWebhook,
  recordPaymentFailure,
  schedulePaymentRetry,
  updateInvoiceStatus,
  updateSubscriptionStatus,
  syncSubscriptionFromProvider,
  syncPaymentMethodFromProvider,
  syncInvoiceFromProvider,
  removePaymentMethodByProviderId,
  storeWebhookEvent,
  getPaymentDetails,
  createRefund,
  getRefund,
  updateRefund,
  getRefunds,
  recordInvoiceRefund,
  sendRefundNotification,
  calculateProRatedRefund,
  sendPaymentRetryNotification,
} = billingApi;
