/**
 * Webhook Processing Service
 * Handles payment provider webhook events with signature verification and idempotency
 */

import { PaymentProviderFactory } from "@/entities/payment-method/services/payment-provider-interface";
import { billingApi } from "@/shared/api/billing-api";
import { notifications } from "@mantine/notifications";
import {
  WebhookEventType,
  PaymentProvider,
  SubscriptionStatus,
} from "@/shared/types/billing";
import type { WebhookEvent } from "@/shared/types/billing";

export interface WebhookProcessingResult {
  eventId: string;
  processed: boolean;
  error?: string;
  actions: string[];
}

export interface WebhookConfig {
  provider: PaymentProvider;
  endpoint: string;
  secret: string;
  enabledEvents: WebhookEventType[];
  retryConfig: {
    maxAttempts: number;
    backoffMultiplier: number;
    baseDelayMs: number;
  };
}

/**
 * Webhook processing service with provider integration and idempotency
 */
export class WebhookService {
  private static processedEvents = new Set<string>();
  private static readonly IDEMPOTENCY_WINDOW_MS = 24 * 60 * 60 * 1000; // 24 hours

  /**
   * Process incoming webhook from payment provider
   */
  static async processWebhook(
    provider: PaymentProvider,
    payload: string,
    signature: string,
    secret: string
  ): Promise<WebhookProcessingResult> {
    try {
      // Verify webhook signature
      const providerInstance = PaymentProviderFactory.getProvider(provider);
      const providerWebhookEvent = await providerInstance.handleWebhook(
        payload,
        signature,
        secret
      );

      // Convert provider webhook event to our format
      const webhookEvent: WebhookEvent = {
        id: providerWebhookEvent.id,
        type: this.mapProviderEventType(providerWebhookEvent.type),
        data: providerWebhookEvent.data,
        timestamp: providerWebhookEvent.timestamp,
      };

      // Check for duplicate processing (idempotency)
      if (this.isEventProcessed(webhookEvent.id)) {
        return {
          eventId: webhookEvent.id,
          processed: false,
          error: "Event already processed",
          actions: [],
        };
      }

      // Mark event as being processed
      this.markEventProcessed(webhookEvent.id);

      // Process the webhook event
      const actions = await this.handleWebhookEvent(webhookEvent);

      // Store webhook event for audit trail
      await this.storeWebhookEvent(webhookEvent, provider);

      return {
        eventId: webhookEvent.id,
        processed: true,
        actions,
      };
    } catch (error) {
      const err = error as Error;

      console.error(`Webhook processing failed for ${provider}:`, err);

      return {
        eventId: "unknown",
        processed: false,
        error: err.message,
        actions: [],
      };
    }
  }

  /**
   * Handle specific webhook event types
   */
  private static async handleWebhookEvent(
    event: WebhookEvent
  ): Promise<string[]> {
    const actions: string[] = [];

    switch (event.type) {
      case WebhookEventType.PAYMENT_INTENT_SUCCEEDED:
      case WebhookEventType.INVOICE_PAID:
        actions.push(...(await this.handlePaymentSucceeded(event)));
        break;

      case WebhookEventType.PAYMENT_INTENT_FAILED:
      case WebhookEventType.INVOICE_FAILED:
        actions.push(...(await this.handlePaymentFailed(event)));
        break;

      case WebhookEventType.CUSTOMER_SUBSCRIPTION_CREATED:
        actions.push(...(await this.handleSubscriptionCreated(event)));
        break;

      case WebhookEventType.CUSTOMER_SUBSCRIPTION_UPDATED:
        actions.push(...(await this.handleSubscriptionUpdated(event)));
        break;

      case WebhookEventType.CUSTOMER_SUBSCRIPTION_DELETED:
        actions.push(...(await this.handleSubscriptionCanceled(event)));
        break;

      case WebhookEventType.PAYMENT_METHOD_ATTACHED:
        actions.push(...(await this.handlePaymentMethodAdded(event)));
        break;

      case WebhookEventType.PAYMENT_METHOD_DETACHED:
        actions.push(...(await this.handlePaymentMethodRemoved(event)));
        break;

      case WebhookEventType.INVOICE_CREATED:
        actions.push(...(await this.handleInvoiceCreated(event)));
        break;

      case WebhookEventType.INVOICE_FINALIZED:
        actions.push(...(await this.handleInvoiceFinalized(event)));
        break;

      default:
        console.log(`Unhandled webhook event type: ${event.type}`);
        actions.push(`ignored_event_${event.type}`);
    }

    return actions;
  }

  /**
   * Handle successful payment webhook
   */
  private static async handlePaymentSucceeded(
    event: WebhookEvent
  ): Promise<string[]> {
    const actions: string[] = [];

    try {
      const paymentData = event.data;
      const invoiceId = paymentData.invoice || paymentData.metadata?.invoiceId;

      if (invoiceId) {
        // Update invoice status to paid
        await billingApi.updateInvoiceStatus(invoiceId, "paid", {
          paidAt: new Date(event.timestamp),
          paymentIntentId: paymentData.id,
        });
        actions.push("invoice_marked_paid");

        // Update subscription if needed
        const invoice = await billingApi.getInvoice(invoiceId);
        if (invoice.subscriptionId) {
          await this.updateSubscriptionAfterPayment(invoice.subscriptionId);
          actions.push("subscription_activated");
        }

        // Send payment confirmation notification
        await this.sendPaymentConfirmation(invoice.tenantId, invoiceId);
        actions.push("payment_confirmation_sent");
      }
    } catch (error) {
      console.error("Failed to handle payment succeeded:", error);
      actions.push("error_handling_payment_success");
    }

    return actions;
  }

  /**
   * Handle failed payment webhook
   */
  private static async handlePaymentFailed(
    event: WebhookEvent
  ): Promise<string[]> {
    const actions: string[] = [];

    try {
      const paymentData = event.data;
      const invoiceId = paymentData.invoice || paymentData.metadata?.invoiceId;
      const failureReason =
        paymentData.last_payment_error?.message || "Payment failed";

      if (invoiceId) {
        // Record payment failure
        await billingApi.recordPaymentFailure(invoiceId, {
          failureReason,
          attemptedAt: new Date(event.timestamp),
          paymentIntentId: paymentData.id,
        });
        actions.push("payment_failure_recorded");

        // Schedule retry if appropriate
        if (this.isRetryableFailure(failureReason)) {
          await billingApi.schedulePaymentRetry(invoiceId);
          actions.push("payment_retry_scheduled");
        }

        // Update subscription status if needed
        const invoice = await billingApi.getInvoice(invoiceId);
        if (invoice.subscriptionId) {
          await this.handleSubscriptionPaymentFailure(invoice.subscriptionId);
          actions.push("subscription_status_updated");
        }

        // Send payment failure notification
        await this.sendPaymentFailureNotification(
          invoice.tenantId,
          invoiceId,
          failureReason
        );
        actions.push("payment_failure_notification_sent");
      }
    } catch (error) {
      console.error("Failed to handle payment failure:", error);
      actions.push("error_handling_payment_failure");
    }

    return actions;
  }

  /**
   * Handle subscription created webhook
   */
  private static async handleSubscriptionCreated(
    event: WebhookEvent
  ): Promise<string[]> {
    const actions: string[] = [];

    try {
      const subscriptionData = event.data;

      // Sync subscription data with our system
      await billingApi.syncSubscriptionFromProvider(subscriptionData);
      actions.push("subscription_synced");

      // Send welcome notification
      if (subscriptionData.customer?.metadata?.tenantId) {
        await this.sendSubscriptionWelcome(
          subscriptionData.customer.metadata.tenantId
        );
        actions.push("welcome_notification_sent");
      }
    } catch (error) {
      console.error("Failed to handle subscription created:", error);
      actions.push("error_handling_subscription_created");
    }

    return actions;
  }

  /**
   * Handle subscription updated webhook
   */
  private static async handleSubscriptionUpdated(
    event: WebhookEvent
  ): Promise<string[]> {
    const actions: string[] = [];

    try {
      const subscriptionData = event.data;

      // Sync subscription changes
      await billingApi.syncSubscriptionFromProvider(subscriptionData);
      actions.push("subscription_updated");

      // Handle plan changes
      if (subscriptionData.previous_attributes?.items) {
        await this.handlePlanChangeFromWebhook(subscriptionData);
        actions.push("plan_change_processed");
      }
    } catch (error) {
      console.error("Failed to handle subscription updated:", error);
      actions.push("error_handling_subscription_updated");
    }

    return actions;
  }

  /**
   * Handle subscription canceled webhook
   */
  private static async handleSubscriptionCanceled(
    event: WebhookEvent
  ): Promise<string[]> {
    const actions: string[] = [];

    try {
      const subscriptionData = event.data;

      // Update subscription status
      await billingApi.updateSubscriptionStatus(
        subscriptionData.id,
        "canceled"
      );
      actions.push("subscription_canceled");

      // Send cancellation confirmation
      if (subscriptionData.customer?.metadata?.tenantId) {
        await this.sendCancellationConfirmation(
          subscriptionData.customer.metadata.tenantId
        );
        actions.push("cancellation_confirmation_sent");
      }
    } catch (error) {
      console.error("Failed to handle subscription canceled:", error);
      actions.push("error_handling_subscription_canceled");
    }

    return actions;
  }

  /**
   * Handle payment method added webhook
   */
  private static async handlePaymentMethodAdded(
    event: WebhookEvent
  ): Promise<string[]> {
    const actions: string[] = [];

    try {
      const paymentMethodData = event.data;

      // Sync payment method with our system
      await billingApi.syncPaymentMethodFromProvider(paymentMethodData);
      actions.push("payment_method_synced");
    } catch (error) {
      console.error("Failed to handle payment method added:", error);
      actions.push("error_handling_payment_method_added");
    }

    return actions;
  }

  /**
   * Handle payment method removed webhook
   */
  private static async handlePaymentMethodRemoved(
    event: WebhookEvent
  ): Promise<string[]> {
    const actions: string[] = [];

    try {
      const paymentMethodData = event.data;

      // Remove payment method from our system
      await billingApi.removePaymentMethodByProviderId(paymentMethodData.id);
      actions.push("payment_method_removed");
    } catch (error) {
      console.error("Failed to handle payment method removed:", error);
      actions.push("error_handling_payment_method_removed");
    }

    return actions;
  }

  /**
   * Handle invoice created webhook
   */
  private static async handleInvoiceCreated(
    event: WebhookEvent
  ): Promise<string[]> {
    const actions: string[] = [];

    try {
      const invoiceData = event.data;

      // Sync invoice with our system
      await billingApi.syncInvoiceFromProvider(invoiceData);
      actions.push("invoice_synced");
    } catch (error) {
      console.error("Failed to handle invoice created:", error);
      actions.push("error_handling_invoice_created");
    }

    return actions;
  }

  /**
   * Handle invoice finalized webhook
   */
  private static async handleInvoiceFinalized(
    event: WebhookEvent
  ): Promise<string[]> {
    const actions: string[] = [];

    try {
      const invoiceData = event.data;

      // Update invoice status
      await billingApi.updateInvoiceStatus(invoiceData.id, "open");
      actions.push("invoice_finalized");

      // Send invoice notification
      if (invoiceData.customer?.metadata?.tenantId) {
        await this.sendInvoiceNotification(
          invoiceData.customer.metadata.tenantId,
          invoiceData.id
        );
        actions.push("invoice_notification_sent");
      }
    } catch (error) {
      console.error("Failed to handle invoice finalized:", error);
      actions.push("error_handling_invoice_finalized");
    }

    return actions;
  }

  /**
   * Check if event has already been processed (idempotency)
   */
  private static isEventProcessed(eventId: string): boolean {
    return this.processedEvents.has(eventId);
  }

  /**
   * Mark event as processed
   */
  private static markEventProcessed(eventId: string): void {
    this.processedEvents.add(eventId);

    // Clean up old events after idempotency window
    setTimeout(() => {
      this.processedEvents.delete(eventId);
    }, this.IDEMPOTENCY_WINDOW_MS);
  }

  /**
   * Store webhook event for audit trail
   */
  private static async storeWebhookEvent(
    event: WebhookEvent,
    provider: PaymentProvider
  ): Promise<void> {
    try {
      await billingApi.storeWebhookEvent({
        ...event,
        provider,
        processedAt: new Date(),
      });
    } catch (error) {
      console.error("Failed to store webhook event:", error);
    }
  }

  /**
   * Check if payment failure is retryable
   */
  private static isRetryableFailure(failureReason: string): boolean {
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
      "stolen_card",
    ];

    return !nonRetryableReasons.some((reason) =>
      failureReason.toLowerCase().includes(reason)
    );
  }

  /**
   * Update subscription after successful payment
   */
  private static async updateSubscriptionAfterPayment(
    subscriptionId: string
  ): Promise<void> {
    try {
      await billingApi.updateSubscription(subscriptionId, {
        status: SubscriptionStatus.ACTIVE,
        updatedAt: new Date(),
      });
    } catch (error) {
      console.error("Failed to update subscription after payment:", error);
    }
  }

  /**
   * Handle subscription payment failure
   */
  private static async handleSubscriptionPaymentFailure(
    subscriptionId: string
  ): Promise<void> {
    try {
      await billingApi.updateSubscription(subscriptionId, {
        status: SubscriptionStatus.PAST_DUE,
        updatedAt: new Date(),
      });
    } catch (error) {
      console.error("Failed to handle subscription payment failure:", error);
    }
  }

  /**
   * Handle plan change from webhook
   */
  private static async handlePlanChangeFromWebhook(
    subscriptionData: any
  ): Promise<void> {
    try {
      // This would implement plan change logic based on webhook data
      await billingApi.syncSubscriptionFromProvider(subscriptionData);
    } catch (error) {
      console.error("Failed to handle plan change from webhook:", error);
    }
  }

  // Notification methods (these would integrate with your notification system)
  private static async sendPaymentConfirmation(
    tenantId: string,
    invoiceId: string
  ): Promise<void> {
    // Implementation would depend on your notification system
    console.log(
      `Sending payment confirmation for tenant ${tenantId}, invoice ${invoiceId}`
    );
  }

  private static async sendPaymentFailureNotification(
    tenantId: string,
    invoiceId: string,
    reason: string
  ): Promise<void> {
    console.log(
      `Sending payment failure notification for tenant ${tenantId}, invoice ${invoiceId}: ${reason}`
    );
  }

  private static async sendSubscriptionWelcome(
    tenantId: string
  ): Promise<void> {
    console.log(`Sending subscription welcome for tenant ${tenantId}`);
  }

  private static async sendCancellationConfirmation(
    tenantId: string
  ): Promise<void> {
    console.log(`Sending cancellation confirmation for tenant ${tenantId}`);
  }

  private static async sendInvoiceNotification(
    tenantId: string,
    invoiceId: string
  ): Promise<void> {
    console.log(
      `Sending invoice notification for tenant ${tenantId}, invoice ${invoiceId}`
    );
  }

  /**
   * Map provider-specific event types to our standard event types
   */
  private static mapProviderEventType(
    providerEventType: string
  ): WebhookEventType {
    const eventTypeMap: Record<string, WebhookEventType> = {
      "payment_intent.succeeded": WebhookEventType.PAYMENT_INTENT_SUCCEEDED,
      "invoice.payment_succeeded": WebhookEventType.INVOICE_PAID,
      "payment_intent.payment_failed": WebhookEventType.PAYMENT_INTENT_FAILED,
      "invoice.payment_failed": WebhookEventType.INVOICE_FAILED,
      "customer.subscription.created":
        WebhookEventType.CUSTOMER_SUBSCRIPTION_CREATED,
      "customer.subscription.updated":
        WebhookEventType.CUSTOMER_SUBSCRIPTION_UPDATED,
      "customer.subscription.deleted":
        WebhookEventType.CUSTOMER_SUBSCRIPTION_DELETED,
      "payment_method.attached": WebhookEventType.PAYMENT_METHOD_ATTACHED,
      "payment_method.detached": WebhookEventType.PAYMENT_METHOD_DETACHED,
      "invoice.created": WebhookEventType.INVOICE_CREATED,
      "invoice.finalized": WebhookEventType.INVOICE_FINALIZED,
    };

    return eventTypeMap[providerEventType] || WebhookEventType.INVOICE_CREATED;
  }
}
