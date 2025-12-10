/**
 * Refund Processing Service
 * Handles refund operations with provider integration
 */

import { PaymentProviderFactory } from "@/entities/payment-method/services/payment-provider-interface";
import { billingApi } from "@/shared/api/billing-api";
import { notifications } from "@mantine/notifications";
import type { PaymentProvider, PaymentAttempt } from "@/shared/types/billing";

export interface RefundRequest {
  paymentId: string;
  amount?: number; // Partial refund if specified
  reason: RefundReason;
  metadata?: Record<string, any>;
  notifyCustomer?: boolean;
}

export interface RefundResult {
  id: string;
  paymentId: string;
  amount: number;
  currency: string;
  status: RefundStatus;
  reason: RefundReason;
  processedAt: Date;
  providerRefundId?: string;
  failureReason?: string;
  metadata?: Record<string, any>;
}

export enum RefundReason {
  REQUESTED_BY_CUSTOMER = "requested_by_customer",
  DUPLICATE = "duplicate",
  FRAUDULENT = "fraudulent",
  SUBSCRIPTION_CANCELED = "subscription_canceled",
  UNSATISFACTORY_SERVICE = "unsatisfactory_service",
  BILLING_ERROR = "billing_error",
  GOODWILL = "goodwill",
  OTHER = "other",
}

export enum RefundStatus {
  PENDING = "pending",
  SUCCEEDED = "succeeded",
  FAILED = "failed",
  CANCELED = "canceled",
  REQUIRES_ACTION = "requires_action",
}

/**
 * Refund processing service with provider integration
 */
export class RefundService {
  /**
   * Process a refund request
   */
  static async processRefund(request: RefundRequest): Promise<RefundResult> {
    try {
      // Get payment details
      const payment = await billingApi.getPaymentDetails(request.paymentId);
      if (!payment) {
        throw new Error("Payment not found");
      }

      // Validate refund request
      this.validateRefundRequest(request, payment);

      // Get payment provider
      const provider = PaymentProviderFactory.getProvider(payment.provider);

      // Process refund with provider
      const providerResult = await provider.processRefund(
        payment.providerPaymentId,
        request.amount || payment.amount,
        request.reason,
        request.metadata
      );

      // Create refund record
      const refundResult: RefundResult = {
        id: this.generateRefundId(),
        paymentId: request.paymentId,
        amount: request.amount || payment.amount,
        currency: payment.currency,
        status: this.mapProviderStatus(providerResult.status),
        reason: request.reason,
        processedAt: new Date(),
        providerRefundId: providerResult.id,
        metadata: {
          ...request.metadata,
          originalPaymentAmount: payment.amount,
          refundType: request.amount ? "partial" : "full",
        },
      };

      // Save refund record
      await billingApi.createRefund(refundResult);

      // Update invoice if applicable
      if (payment.invoiceId) {
        await this.updateInvoiceForRefund(payment.invoiceId, refundResult);
      }

      // Notify customer if requested
      if (request.notifyCustomer) {
        await this.notifyCustomerOfRefund(payment.tenantId, refundResult);
      }

      // Show success notification
      notifications.show({
        title: "Refund Processed",
        message: `Refund of ${this.formatCurrency(refundResult.amount, refundResult.currency)} has been processed.`,
        color: "green",
      });

      return refundResult;
    } catch (error) {
      const err = error as Error;

      notifications.show({
        title: "Refund Failed",
        message: err.message || "Failed to process refund. Please try again.",
        color: "red",
      });

      throw err;
    }
  }

  /**
   * Get refund history for a payment or tenant
   */
  static async getRefundHistory(filters: {
    paymentId?: string;
    tenantId?: string;
    invoiceId?: string;
    dateRange?: { start: Date; end: Date };
    status?: RefundStatus;
  }): Promise<RefundResult[]> {
    try {
      return await billingApi.getRefunds(filters);
    } catch (error) {
      console.error("Failed to get refund history:", error);
      return [];
    }
  }

  /**
   * Cancel a pending refund
   */
  static async cancelRefund(refundId: string): Promise<void> {
    try {
      const refund = await billingApi.getRefund(refundId);
      if (!refund) {
        throw new Error("Refund not found");
      }

      if (refund.status !== RefundStatus.PENDING) {
        throw new Error("Only pending refunds can be canceled");
      }

      // Cancel with provider if applicable
      if (refund.providerRefundId) {
        const payment = await billingApi.getPaymentDetails(refund.paymentId);
        const provider = PaymentProviderFactory.getProvider(payment.provider);
        await provider.cancelRefund(refund.providerRefundId);
      }

      // Update refund status
      await billingApi.updateRefund(refundId, {
        status: RefundStatus.CANCELED,
        metadata: {
          ...refund.metadata,
          canceledAt: new Date().toISOString(),
        },
      });

      notifications.show({
        title: "Refund Canceled",
        message: "The refund has been canceled successfully.",
        color: "blue",
      });
    } catch (error) {
      const err = error as Error;

      notifications.show({
        title: "Failed to Cancel Refund",
        message: err.message || "Failed to cancel refund.",
        color: "red",
      });

      throw err;
    }
  }

  /**
   * Calculate refund amount based on subscription cancellation
   */
  static calculateProRatedRefund(
    subscriptionId: string,
    cancelDate: Date
  ): Promise<{ amount: number; currency: string; calculation: any }> {
    // This would integrate with subscription service to calculate pro-rated refunds
    return billingApi.calculateProRatedRefund(subscriptionId, cancelDate);
  }

  /**
   * Process bulk refunds (for admin operations)
   */
  static async processBulkRefunds(requests: RefundRequest[]): Promise<{
    successful: RefundResult[];
    failed: { request: RefundRequest; error: string }[];
  }> {
    const successful: RefundResult[] = [];
    const failed: { request: RefundRequest; error: string }[] = [];

    for (const request of requests) {
      try {
        const result = await this.processRefund(request);
        successful.push(result);
      } catch (error) {
        failed.push({
          request,
          error: error instanceof Error ? error.message : "Unknown error",
        });
      }
    }

    // Show summary notification
    notifications.show({
      title: "Bulk Refund Complete",
      message: `Processed ${successful.length} refunds successfully, ${failed.length} failed.`,
      color: successful.length > 0 ? "green" : "red",
    });

    return { successful, failed };
  }

  /**
   * Validate refund request
   */
  private static validateRefundRequest(
    request: RefundRequest,
    payment: PaymentAttempt
  ): void {
    // Check if payment is refundable
    if (payment.status !== "succeeded") {
      throw new Error("Only successful payments can be refunded");
    }

    // Check refund amount
    if (request.amount && request.amount > payment.amount) {
      throw new Error("Refund amount cannot exceed payment amount");
    }

    if (request.amount && request.amount <= 0) {
      throw new Error("Refund amount must be positive");
    }

    // Check if payment is too old (provider-specific limits)
    const daysSincePayment = Math.floor(
      (Date.now() - payment.attemptedAt.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (daysSincePayment > 180) {
      // 6 months limit for most providers
      throw new Error("Payment is too old to refund");
    }

    // Check for existing refunds
    // This would be implemented to prevent over-refunding
  }

  /**
   * Update invoice status after refund
   */
  private static async updateInvoiceForRefund(
    invoiceId: string,
    refund: RefundResult
  ): Promise<void> {
    try {
      await billingApi.recordInvoiceRefund(invoiceId, {
        refundId: refund.id,
        amount: refund.amount,
        reason: refund.reason,
        processedAt: refund.processedAt,
      });
    } catch (error) {
      console.error("Failed to update invoice for refund:", error);
    }
  }

  /**
   * Notify customer of refund
   */
  private static async notifyCustomerOfRefund(
    tenantId: string,
    refund: RefundResult
  ): Promise<void> {
    try {
      await billingApi.sendRefundNotification(tenantId, {
        refundId: refund.id,
        amount: refund.amount,
        currency: refund.currency,
        reason: refund.reason,
        processedAt: refund.processedAt,
      });
    } catch (error) {
      console.error("Failed to send refund notification:", error);
    }
  }

  /**
   * Map provider status to our status
   */
  private static mapProviderStatus(providerStatus: string): RefundStatus {
    switch (providerStatus.toLowerCase()) {
      case "succeeded":
      case "completed":
        return RefundStatus.SUCCEEDED;
      case "pending":
      case "processing":
        return RefundStatus.PENDING;
      case "failed":
        return RefundStatus.FAILED;
      case "canceled":
      case "cancelled":
        return RefundStatus.CANCELED;
      case "requires_action":
        return RefundStatus.REQUIRES_ACTION;
      default:
        return RefundStatus.PENDING;
    }
  }

  /**
   * Generate unique refund ID
   */
  private static generateRefundId(): string {
    return `ref_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Format currency for display
   */
  private static formatCurrency(amount: number, currency: string): string {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency.toUpperCase(),
    }).format(amount / 100); // Assuming amounts are in cents
  }
}
