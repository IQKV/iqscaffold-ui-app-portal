/**
 * Payment Failure Handling Service
 * Handles payment failures with customer notifications and recovery workflows
 */

import { billingApi } from "@/shared/api/billing-api";
import { PaymentRetryService } from "./payment-retry-service";
import { notifications } from "@mantine/notifications";
import type {
  Invoice,
  PaymentAttempt,
  PaymentStatus,
} from "@/shared/types/billing";

export interface PaymentFailureContext {
  invoiceId: string;
  tenantId: string;
  paymentMethodId: string;
  amount: number;
  currency: string;
  failureReason: string;
  attemptNumber: number;
  lastAttemptAt: Date;
}

export interface PaymentFailureResolution {
  action:
    | "retry"
    | "update_payment_method"
    | "contact_support"
    | "suspend_service";
  message: string;
  canAutoRetry: boolean;
  nextRetryAt?: Date;
  supportActions?: string[];
}

export interface PaymentFailureNotification {
  type: "immediate" | "reminder" | "final_notice" | "service_suspension";
  title: string;
  message: string;
  actions: NotificationAction[];
  urgency: "low" | "medium" | "high" | "critical";
}

export interface NotificationAction {
  label: string;
  action: string;
  url?: string;
  primary?: boolean;
}

/**
 * Payment failure handling service with intelligent recovery workflows
 */
export class PaymentFailureService {
  private static readonly MAX_AUTO_RETRY_ATTEMPTS = 3;
  private static readonly SUSPENSION_GRACE_PERIOD_DAYS = 7;

  /**
   * Handle a payment failure
   */
  static async handlePaymentFailure(
    context: PaymentFailureContext
  ): Promise<PaymentFailureResolution> {
    try {
      // Record the payment failure
      await billingApi.recordPaymentFailure(context.invoiceId, {
        failureReason: context.failureReason,
        attemptedAt: context.lastAttemptAt,
      });

      // Determine resolution strategy
      const resolution = this.determineResolutionStrategy(context);

      // Send appropriate notification
      const notification = this.createFailureNotification(context, resolution);
      await this.sendFailureNotification(context.tenantId, notification);

      // Schedule retry if appropriate
      if (resolution.canAutoRetry && resolution.nextRetryAt) {
        await this.scheduleRetry(context, resolution.nextRetryAt);
      }

      // Update subscription status if needed
      await this.updateSubscriptionStatus(context);

      return resolution;
    } catch (error) {
      console.error("Failed to handle payment failure:", error);
      throw error;
    }
  }

  /**
   * Determine the best resolution strategy for a payment failure
   */
  private static determineResolutionStrategy(
    context: PaymentFailureContext
  ): PaymentFailureResolution {
    const { failureReason, attemptNumber } = context;

    // Check if failure is retryable
    const isRetryable = PaymentRetryService.isRetryableFailure(failureReason);

    // Determine if we should auto-retry
    const canAutoRetry =
      isRetryable && attemptNumber < this.MAX_AUTO_RETRY_ATTEMPTS;

    // Calculate next retry time
    let nextRetryAt: Date | undefined;
    if (canAutoRetry) {
      const retryDelay = PaymentRetryService.getRetryDelay(
        failureReason,
        attemptNumber
      );
      nextRetryAt = new Date(Date.now() + retryDelay);
    }

    // Determine primary action
    let action: PaymentFailureResolution["action"];
    let message: string;
    let supportActions: string[] = [];

    if (this.isCardDeclined(failureReason)) {
      action = "update_payment_method";
      message =
        "Your card was declined. Please update your payment method or contact your bank.";
      supportActions = [
        "Update payment method",
        "Contact bank",
        "Try different card",
      ];
    } else if (this.isInsufficientFunds(failureReason)) {
      action = "retry";
      message =
        "Insufficient funds. Please ensure your account has sufficient balance and we'll retry the payment.";
      supportActions = ["Add funds to account", "Use different payment method"];
    } else if (this.isTemporaryIssue(failureReason)) {
      action = "retry";
      message =
        "Temporary payment processing issue. We'll automatically retry your payment.";
      supportActions = ["Wait for automatic retry", "Try manual retry"];
    } else if (attemptNumber >= this.MAX_AUTO_RETRY_ATTEMPTS) {
      action = "contact_support";
      message =
        "Multiple payment attempts have failed. Please contact support for assistance.";
      supportActions = [
        "Contact support",
        "Update payment method",
        "Review account status",
      ];
    } else {
      action = "update_payment_method";
      message =
        "Payment failed. Please update your payment method or contact support.";
      supportActions = ["Update payment method", "Contact support"];
    }

    return {
      action,
      message,
      canAutoRetry,
      nextRetryAt,
      supportActions,
    };
  }

  /**
   * Create appropriate notification for payment failure
   */
  private static createFailureNotification(
    context: PaymentFailureContext,
    resolution: PaymentFailureResolution
  ): PaymentFailureNotification {
    const { attemptNumber, amount, currency } = context;
    const formattedAmount = this.formatCurrency(amount, currency);

    let type: PaymentFailureNotification["type"];
    let title: string;
    let message: string;
    let urgency: PaymentFailureNotification["urgency"];

    if (attemptNumber === 1) {
      type = "immediate";
      title = "Payment Failed";
      message = `Your payment of ${formattedAmount} failed. ${resolution.message}`;
      urgency = "medium";
    } else if (attemptNumber < this.MAX_AUTO_RETRY_ATTEMPTS) {
      type = "reminder";
      title = "Payment Still Failing";
      message = `We've tried ${attemptNumber} times to process your payment of ${formattedAmount}. ${resolution.message}`;
      urgency = "high";
    } else {
      type = "final_notice";
      title = "Urgent: Payment Required";
      message = `Multiple payment attempts have failed for ${formattedAmount}. Please take action immediately to avoid service interruption.`;
      urgency = "critical";
    }

    // Create actions based on resolution
    const actions = this.createNotificationActions(resolution);

    return {
      type,
      title,
      message,
      actions,
      urgency,
    };
  }

  /**
   * Create notification actions based on resolution
   */
  private static createNotificationActions(
    resolution: PaymentFailureResolution
  ): NotificationAction[] {
    const actions: NotificationAction[] = [];

    switch (resolution.action) {
      case "update_payment_method":
        actions.push({
          label: "Update Payment Method",
          action: "update_payment_method",
          url: "/billing/payment-methods",
          primary: true,
        });
        actions.push({
          label: "Retry Payment",
          action: "retry_payment",
        });
        break;

      case "retry":
        actions.push({
          label: "Retry Now",
          action: "retry_payment",
          primary: true,
        });
        actions.push({
          label: "Update Payment Method",
          action: "update_payment_method",
          url: "/billing/payment-methods",
        });
        break;

      case "contact_support":
        actions.push({
          label: "Contact Support",
          action: "contact_support",
          url: "/support",
          primary: true,
        });
        actions.push({
          label: "Update Payment Method",
          action: "update_payment_method",
          url: "/billing/payment-methods",
        });
        break;

      case "suspend_service":
        actions.push({
          label: "Update Payment Method",
          action: "update_payment_method",
          url: "/billing/payment-methods",
          primary: true,
        });
        actions.push({
          label: "Contact Support",
          action: "contact_support",
          url: "/support",
        });
        break;
    }

    return actions;
  }

  /**
   * Send failure notification to customer
   */
  private static async sendFailureNotification(
    tenantId: string,
    notification: PaymentFailureNotification
  ): Promise<void> {
    try {
      // Send in-app notification
      notifications.show({
        title: notification.title,
        message: notification.message,
        color: this.getNotificationColor(notification.urgency),
        autoClose: notification.urgency === "critical" ? false : 5000,
      });

      // Send email/SMS notification (would integrate with notification service)
      await this.sendExternalNotification(tenantId, notification);
    } catch (error) {
      console.error("Failed to send failure notification:", error);
    }
  }

  /**
   * Schedule automatic retry
   */
  private static async scheduleRetry(
    context: PaymentFailureContext,
    retryAt: Date
  ): Promise<void> {
    try {
      await billingApi.schedulePaymentRetry(context.invoiceId);

      // Notify customer about scheduled retry
      await PaymentRetryService.notifyCustomerOfRetry(
        context.tenantId,
        context.invoiceId,
        context.attemptNumber + 1,
        retryAt
      );
    } catch (error) {
      console.error("Failed to schedule retry:", error);
    }
  }

  /**
   * Update subscription status based on payment failure
   */
  private static async updateSubscriptionStatus(
    context: PaymentFailureContext
  ): Promise<void> {
    try {
      const invoice = await billingApi.getInvoice(context.invoiceId);

      if (invoice.subscriptionId) {
        // If this is the final attempt, mark subscription as past due
        if (context.attemptNumber >= this.MAX_AUTO_RETRY_ATTEMPTS) {
          await billingApi.updateSubscriptionStatus(
            invoice.subscriptionId,
            "past_due"
          );
        }
      }
    } catch (error) {
      console.error("Failed to update subscription status:", error);
    }
  }

  /**
   * Process payment failure recovery
   */
  static async processFailureRecovery(
    invoiceId: string,
    action: string,
    metadata?: Record<string, any>
  ): Promise<{ success: boolean; message: string }> {
    try {
      switch (action) {
        case "retry_payment": {
          const invoice = await billingApi.getInvoice(invoiceId);
          await billingApi.retryInvoicePayment(invoiceId);

          return {
            success: true,
            message: "Payment retry initiated successfully.",
          };
        }

        case "update_payment_method":
          return {
            success: true,
            message: "Please update your payment method and retry the payment.",
          };

        case "contact_support":
          // Create support ticket or redirect to support
          return {
            success: true,
            message:
              "Support has been notified. You will be contacted shortly.",
          };

        default:
          throw new Error("Unknown recovery action");
      }
    } catch (error) {
      const err = error as Error;
      return {
        success: false,
        message: err.message || "Failed to process recovery action.",
      };
    }
  }

  /**
   * Get payment failure statistics for a tenant
   */
  static async getFailureStatistics(
    tenantId: string,
    dateRange?: { start: Date; end: Date }
  ): Promise<{
    totalFailures: number;
    failuresByReason: Record<string, number>;
    recoveryRate: number;
    averageRecoveryTime: number;
  }> {
    try {
      // This would integrate with analytics service
      // For now, return mock data
      return {
        totalFailures: 0,
        failuresByReason: {},
        recoveryRate: 0,
        averageRecoveryTime: 0,
      };
    } catch (error) {
      console.error("Failed to get failure statistics:", error);
      throw error;
    }
  }

  // Helper methods for failure reason classification
  private static isCardDeclined(reason: string): boolean {
    const declineReasons = ["card_declined", "generic_decline", "fraudulent"];
    return declineReasons.some((r) => reason.toLowerCase().includes(r));
  }

  private static isInsufficientFunds(reason: string): boolean {
    return reason.toLowerCase().includes("insufficient_funds");
  }

  private static isTemporaryIssue(reason: string): boolean {
    const temporaryReasons = [
      "processing_error",
      "try_again_later",
      "rate_limit",
    ];
    return temporaryReasons.some((r) => reason.toLowerCase().includes(r));
  }

  private static getNotificationColor(
    urgency: PaymentFailureNotification["urgency"]
  ): string {
    switch (urgency) {
      case "low":
        return "blue";
      case "medium":
        return "yellow";
      case "high":
        return "orange";
      case "critical":
        return "red";
      default:
        return "gray";
    }
  }

  private static formatCurrency(amount: number, currency: string): string {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency.toUpperCase(),
    }).format(amount / 100); // Assuming amounts are in cents
  }

  private static async sendExternalNotification(
    tenantId: string,
    notification: PaymentFailureNotification
  ): Promise<void> {
    // This would integrate with your email/SMS notification service
    console.log(
      `Sending external notification to tenant ${tenantId}:`,
      notification
    );
  }
}
