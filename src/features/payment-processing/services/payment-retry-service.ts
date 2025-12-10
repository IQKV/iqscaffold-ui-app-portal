/**
 * Payment Retry Service
 * Handles automatic payment retry with exponential backoff
 */

import {
  PaymentRetryService as BaseRetryService,
  RetryConfig,
} from "@/entities/payment-method/services/payment-provider-interface";
import { billingApi } from "@/shared/api/billing-api";
import { notifications } from "@mantine/notifications";
import { PaymentStatus } from "@/shared/types/billing";
import type { PaymentAttempt, Invoice } from "@/shared/types/billing";

export interface PaymentRetryOptions {
  invoiceId: string;
  paymentMethodId: string;
  amount: number;
  currency: string;
  maxAttempts?: number;
  onRetryAttempt?: (attempt: number, error?: Error) => void;
  onSuccess?: (result: PaymentAttempt) => void;
  onFailure?: (error: Error, attempts: number) => void;
}

export interface RetrySchedule {
  attempt: number;
  scheduledAt: Date;
  status: "pending" | "processing" | "completed" | "failed";
  error?: string;
}

/**
 * Enhanced payment retry service with business logic
 */
export class PaymentRetryService {
  private static readonly DEFAULT_CONFIG: RetryConfig = {
    maxAttempts: 5,
    baseDelayMs: 1000, // Start with 1 second
    maxDelayMs: 300000, // Max 5 minutes
    backoffMultiplier: 2,
    jitterMs: 500,
  };

  /**
   * Retry a failed payment with exponential backoff
   */
  static async retryPayment(options: PaymentRetryOptions): Promise<Invoice> {
    const config = {
      ...this.DEFAULT_CONFIG,
      maxAttempts: options.maxAttempts || this.DEFAULT_CONFIG.maxAttempts,
    };

    return BaseRetryService.executeWithRetry(async () => {
      try {
        // Attempt payment through billing API
        const result = await billingApi.retryInvoicePayment(options.invoiceId);

        // Create a payment attempt record for the callback
        const paymentAttempt: PaymentAttempt = {
          id: `attempt_${Date.now()}`,
          amount: options.amount,
          status: PaymentStatus.SUCCEEDED,
          paymentMethodId: options.paymentMethodId,
          attemptedAt: new Date(),
        };

        // Notify success
        if (options.onSuccess) {
          options.onSuccess(paymentAttempt);
        }

        notifications.show({
          title: "Payment Successful",
          message: "Your payment has been processed successfully.",
          color: "green",
        });

        return result;
      } catch (error) {
        const err = error as Error;

        // Notify retry attempt
        if (options.onRetryAttempt) {
          options.onRetryAttempt(1, err);
        }

        throw err;
      }
    }, config);
  }

  /**
   * Schedule automatic retries for failed payments
   */
  static async scheduleAutomaticRetries(
    invoiceId: string,
    paymentMethodId: string,
    amount: number,
    currency: string
  ): Promise<RetrySchedule[]> {
    const schedule: RetrySchedule[] = [];
    const config = this.DEFAULT_CONFIG;
    let delay = config.baseDelayMs;

    for (let attempt = 1; attempt <= config.maxAttempts; attempt++) {
      const scheduledAt = new Date(Date.now() + delay);

      schedule.push({
        attempt,
        scheduledAt,
        status: "pending",
      });

      // Calculate next delay with exponential backoff
      delay = Math.min(delay * config.backoffMultiplier, config.maxDelayMs);
    }

    // Store schedule in backend
    try {
      await billingApi.schedulePaymentRetry(invoiceId);
    } catch (error) {
      console.warn("Failed to schedule automatic retries:", error);
    }

    return schedule;
  }

  /**
   * Process scheduled retry attempts
   */
  static async processScheduledRetry(
    invoiceId: string,
    attempt: number
  ): Promise<Invoice> {
    try {
      // Attempt the payment retry
      const result = await billingApi.retryInvoicePayment(invoiceId);

      return result;
    } catch (error) {
      // Record the failure
      await billingApi.recordPaymentFailure(invoiceId, {
        failureReason: (error as Error).message,
        attemptedAt: new Date(),
      });
      throw error;
    }
  }

  /**
   * Get retry history for an invoice
   */
  static async getRetryHistory(invoiceId: string): Promise<PaymentAttempt[]> {
    try {
      const invoice = await billingApi.getInvoice(invoiceId);
      return invoice.paymentAttempts || [];
    } catch (error) {
      console.error("Failed to get retry history:", error);
      return [];
    }
  }

  /**
   * Cancel scheduled retries
   */
  static async cancelScheduledRetries(invoiceId: string): Promise<void> {
    try {
      // Update invoice to prevent further retries
      await billingApi.updateInvoiceStatus(invoiceId, "uncollectible");

      notifications.show({
        title: "Retries Canceled",
        message: "Automatic payment retries have been canceled.",
        color: "blue",
      });
    } catch (error) {
      console.error("Failed to cancel scheduled retries:", error);

      notifications.show({
        title: "Failed to Cancel Retries",
        message: "Could not cancel automatic retries. Please contact support.",
        color: "red",
      });
    }
  }

  /**
   * Check if a payment failure is retryable
   */
  static isRetryableFailure(failureReason: string): boolean {
    const nonRetryableReasons = [
      "card_declined",
      "insufficient_funds",
      "card_not_supported",
      "currency_not_supported",
      "duplicate_transaction",
      "fraudulent",
      "generic_decline",
      "invalid_account",
      "lost_card",
      "merchant_blacklist",
      "pickup_card",
      "restricted_card",
      "revocation_of_all_authorizations",
      "revocation_of_authorization",
      "security_violation",
      "service_not_allowed",
      "stolen_card",
      "stop_payment_order",
      "testmode_decline",
      "transaction_not_allowed",
    ];

    return !nonRetryableReasons.some((reason) =>
      failureReason.toLowerCase().includes(reason)
    );
  }

  /**
   * Get recommended retry delay based on failure reason
   */
  static getRetryDelay(failureReason: string, attempt: number): number {
    const config = this.DEFAULT_CONFIG;

    // Longer delays for certain types of failures
    const longDelayReasons = [
      "rate_limit",
      "processing_error",
      "try_again_later",
    ];
    const multiplier = longDelayReasons.some((reason) =>
      failureReason.toLowerCase().includes(reason)
    )
      ? 3
      : 1;

    const baseDelay = config.baseDelayMs * multiplier;
    const exponentialDelay =
      baseDelay * config.backoffMultiplier ** (attempt - 1);
    const jitter = Math.random() * config.jitterMs;

    return Math.min(exponentialDelay + jitter, config.maxDelayMs);
  }

  /**
   * Notify customer about payment retry
   */
  static async notifyCustomerOfRetry(
    tenantId: string,
    invoiceId: string,
    attempt: number,
    nextRetryDate?: Date
  ): Promise<void> {
    try {
      await billingApi.sendPaymentRetryNotification(tenantId, {
        invoiceId,
        attempt,
        nextRetryDate,
        type: "retry_notification",
      });
    } catch (error) {
      console.error("Failed to send retry notification:", error);
    }
  }

  /**
   * Notify customer about final payment failure
   */
  static async notifyCustomerOfFinalFailure(
    tenantId: string,
    invoiceId: string,
    totalAttempts: number
  ): Promise<void> {
    try {
      await billingApi.sendPaymentRetryNotification(tenantId, {
        invoiceId,
        attempt: totalAttempts,
        type: "final_failure",
      });

      notifications.show({
        title: "Payment Failed",
        message:
          "All payment retry attempts have failed. Please update your payment method.",
        color: "red",
        autoClose: false,
      });
    } catch (error) {
      console.error("Failed to send final failure notification:", error);
    }
  }
}
