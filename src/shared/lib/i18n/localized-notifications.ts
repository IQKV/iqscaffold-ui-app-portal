import { notifications } from "@mantine/notifications";
import { msg } from "@lingui/macro";
import { i18n, MessageDescriptor } from "@lingui/core";
import {
  IconCheck,
  IconX,
  IconAlertTriangle,
  IconInfoCircle,
} from "@tabler/icons-react";

/**
 * Notification types with consistent styling
 */
export type NotificationType = "success" | "error" | "warning" | "info";

/**
 * Notification configuration
 */
interface NotificationConfig {
  title?: MessageDescriptor | string;
  message: MessageDescriptor | string;
  type?: NotificationType;
  autoClose?: boolean | number;
  withCloseButton?: boolean;
  loading?: boolean;
  id?: string;
}

/**
 * Localized notification service
 */
export class LocalizedNotifications {
  /**
   * Show a success notification
   */
  static success(config: Omit<NotificationConfig, "type">) {
    this.show({ ...config, type: "success" });
  }

  /**
   * Show an error notification
   */
  static error(config: Omit<NotificationConfig, "type">) {
    this.show({ ...config, type: "error" });
  }

  /**
   * Show a warning notification
   */
  static warning(config: Omit<NotificationConfig, "type">) {
    this.show({ ...config, type: "warning" });
  }

  /**
   * Show an info notification
   */
  static info(config: Omit<NotificationConfig, "type">) {
    this.show({ ...config, type: "info" });
  }

  /**
   * Show a loading notification
   */
  static loading(config: Omit<NotificationConfig, "type" | "loading">) {
    this.show({ ...config, type: "info", loading: true });
  }

  /**
   * Update an existing notification
   */
  static update(id: string, config: Omit<NotificationConfig, "id">) {
    const resolvedConfig = this.resolveConfig({ ...config, id });
    notifications.update(resolvedConfig);
  }

  /**
   * Hide a notification
   */
  static hide(id: string) {
    notifications.hide(id);
  }

  /**
   * Hide all notifications
   */
  static clean() {
    notifications.clean();
  }

  /**
   * Show a notification with full configuration
   */
  private static show(config: NotificationConfig) {
    const resolvedConfig = this.resolveConfig(config);
    notifications.show(resolvedConfig);
  }

  /**
   * Resolve configuration with localization and styling
   */
  private static resolveConfig(config: NotificationConfig) {
    const { title, message, type = "info", ...rest } = config;

    // Resolve localized messages
    const resolvedTitle = this.resolveMessage(title);
    const resolvedMessage = this.resolveMessage(message);

    // Get type-specific styling
    const typeConfig = this.getTypeConfig(type);

    return {
      title: resolvedTitle,
      message: resolvedMessage,
      ...typeConfig,
      ...rest,
    };
  }

  /**
   * Resolve message descriptor to string
   */
  private static resolveMessage(
    message?: MessageDescriptor | string
  ): string | undefined {
    if (!message) {
      return undefined;
    }

    if (typeof message === "string") {
      return message;
    }

    return i18n._(message);
  }

  /**
   * Get type-specific configuration
   */
  private static getTypeConfig(type: NotificationType) {
    const configs = {
      success: {
        color: "green",
        autoClose: 4000,
      },
      error: {
        color: "red",
        autoClose: 6000,
      },
      warning: {
        color: "yellow",
        autoClose: 5000,
      },
      info: {
        color: "blue",
        autoClose: 4000,
      },
    };

    return configs[type];
  }
}

/**
 * Billing-specific notification messages
 */
export class BillingNotifications extends LocalizedNotifications {
  // Subscription notifications
  static subscriptionUpgraded(planName: string) {
    this.success({
      title: msg`Subscription Updated`,
      message: msg`Successfully upgraded to ${planName}`,
    });
  }

  static subscriptionDowngraded(planName: string) {
    this.success({
      title: msg`Subscription Updated`,
      message: msg`Successfully downgraded to ${planName}`,
    });
  }

  static subscriptionCanceled() {
    this.success({
      title: msg`Subscription Canceled`,
      message: msg`Your subscription has been canceled successfully`,
    });
  }

  static subscriptionReactivated() {
    this.success({
      title: msg`Subscription Reactivated`,
      message: msg`Your subscription has been reactivated`,
    });
  }

  static subscriptionError(error?: string) {
    this.error({
      title: msg`Subscription Error`,
      message: error || msg`Failed to update subscription. Please try again.`,
    });
  }

  // Payment notifications
  static paymentSuccess(amount: string) {
    this.success({
      title: msg`Payment Successful`,
      message: msg`Payment of ${amount} processed successfully`,
    });
  }

  static paymentFailed(reason?: string) {
    this.error({
      title: msg`Payment Failed`,
      message:
        reason ||
        msg`Payment could not be processed. Please check your payment method.`,
    });
  }

  static paymentMethodAdded() {
    this.success({
      title: msg`Payment Method Added`,
      message: msg`Payment method added successfully`,
    });
  }

  static paymentMethodUpdated() {
    this.success({
      title: msg`Payment Method Updated`,
      message: msg`Payment method updated successfully`,
    });
  }

  static paymentMethodDeleted() {
    this.success({
      title: msg`Payment Method Deleted`,
      message: msg`Payment method removed successfully`,
    });
  }

  static paymentMethodError(error?: string) {
    this.error({
      title: msg`Payment Method Error`,
      message: error || msg`Failed to update payment method. Please try again.`,
    });
  }

  // Invoice notifications
  static invoiceDownloaded() {
    this.success({
      title: msg`Invoice Downloaded`,
      message: msg`Invoice downloaded successfully`,
    });
  }

  static invoicePaid(invoiceNumber: string) {
    this.success({
      title: msg`Invoice Paid`,
      message: msg`Invoice ${invoiceNumber} has been paid`,
    });
  }

  static invoiceError(error?: string) {
    this.error({
      title: msg`Invoice Error`,
      message: error || msg`Failed to process invoice. Please try again.`,
    });
  }

  // Usage notifications
  static usageWarning(percentage: number, metricName: string) {
    this.warning({
      title: msg`Usage Warning`,
      message: msg`You have used ${percentage}% of your ${metricName} quota`,
    });
  }

  static usageExceeded(metricName: string) {
    this.error({
      title: msg`Usage Limit Exceeded`,
      message: msg`You have exceeded your ${metricName} quota. Consider upgrading your plan.`,
    });
  }

  static usageGracePeriod(metricName: string) {
    this.warning({
      title: msg`Grace Period Active`,
      message: msg`You are in the grace period for ${metricName}. Please upgrade soon.`,
    });
  }

  // Trial notifications
  static trialExpiring(daysLeft: number) {
    this.warning({
      title: msg`Trial Expiring`,
      message: msg`Your trial expires in ${daysLeft} days. Upgrade to continue service.`,
    });
  }

  static trialExpired() {
    this.error({
      title: msg`Trial Expired`,
      message: msg`Your trial has expired. Please upgrade to continue using the service.`,
    });
  }

  static trialExtended(newEndDate: string) {
    this.success({
      title: msg`Trial Extended`,
      message: msg`Your trial has been extended until ${newEndDate}`,
    });
  }

  // General billing notifications
  static billingUpdateSuccess() {
    this.success({
      title: msg`Billing Updated`,
      message: msg`Billing information updated successfully`,
    });
  }

  static billingUpdateError(error?: string) {
    this.error({
      title: msg`Billing Update Failed`,
      message:
        error || msg`Failed to update billing information. Please try again.`,
    });
  }

  // Loading states
  static processingPayment() {
    return this.loading({
      id: "processing-payment",
      title: msg`Processing Payment`,
      message: msg`Please wait while we process your payment...`,
      autoClose: false,
    });
  }

  static updatingSubscription() {
    return this.loading({
      id: "updating-subscription",
      title: msg`Updating Subscription`,
      message: msg`Please wait while we update your subscription...`,
      autoClose: false,
    });
  }

  static loadingBillingData() {
    return this.loading({
      id: "loading-billing",
      title: msg`Loading`,
      message: msg`Loading billing information...`,
      autoClose: false,
    });
  }
}

/**
 * Hook for using localized notifications
 */
export const useLocalizedNotifications = () => {
  return {
    success: LocalizedNotifications.success.bind(LocalizedNotifications),
    error: LocalizedNotifications.error.bind(LocalizedNotifications),
    warning: LocalizedNotifications.warning.bind(LocalizedNotifications),
    info: LocalizedNotifications.info.bind(LocalizedNotifications),
    loading: LocalizedNotifications.loading.bind(LocalizedNotifications),
    update: LocalizedNotifications.update.bind(LocalizedNotifications),
    hide: LocalizedNotifications.hide.bind(LocalizedNotifications),
    clean: LocalizedNotifications.clean.bind(LocalizedNotifications),
  };
};

/**
 * Hook for billing-specific notifications
 */
export const useBillingNotifications = () => {
  return {
    // Subscription
    subscriptionUpgraded:
      BillingNotifications.subscriptionUpgraded.bind(BillingNotifications),
    subscriptionDowngraded:
      BillingNotifications.subscriptionDowngraded.bind(BillingNotifications),
    subscriptionCanceled:
      BillingNotifications.subscriptionCanceled.bind(BillingNotifications),
    subscriptionReactivated:
      BillingNotifications.subscriptionReactivated.bind(BillingNotifications),
    subscriptionError:
      BillingNotifications.subscriptionError.bind(BillingNotifications),

    // Payment
    paymentSuccess:
      BillingNotifications.paymentSuccess.bind(BillingNotifications),
    paymentFailed:
      BillingNotifications.paymentFailed.bind(BillingNotifications),
    paymentMethodAdded:
      BillingNotifications.paymentMethodAdded.bind(BillingNotifications),
    paymentMethodUpdated:
      BillingNotifications.paymentMethodUpdated.bind(BillingNotifications),
    paymentMethodDeleted:
      BillingNotifications.paymentMethodDeleted.bind(BillingNotifications),
    paymentMethodError:
      BillingNotifications.paymentMethodError.bind(BillingNotifications),

    // Invoice
    invoiceDownloaded:
      BillingNotifications.invoiceDownloaded.bind(BillingNotifications),
    invoicePaid: BillingNotifications.invoicePaid.bind(BillingNotifications),
    invoiceError: BillingNotifications.invoiceError.bind(BillingNotifications),

    // Usage
    usageWarning: BillingNotifications.usageWarning.bind(BillingNotifications),
    usageExceeded:
      BillingNotifications.usageExceeded.bind(BillingNotifications),
    usageGracePeriod:
      BillingNotifications.usageGracePeriod.bind(BillingNotifications),

    // Trial
    trialExpiring:
      BillingNotifications.trialExpiring.bind(BillingNotifications),
    trialExpired: BillingNotifications.trialExpired.bind(BillingNotifications),
    trialExtended:
      BillingNotifications.trialExtended.bind(BillingNotifications),

    // General
    billingUpdateSuccess:
      BillingNotifications.billingUpdateSuccess.bind(BillingNotifications),
    billingUpdateError:
      BillingNotifications.billingUpdateError.bind(BillingNotifications),

    // Loading states
    processingPayment:
      BillingNotifications.processingPayment.bind(BillingNotifications),
    updatingSubscription:
      BillingNotifications.updatingSubscription.bind(BillingNotifications),
    loadingBillingData:
      BillingNotifications.loadingBillingData.bind(BillingNotifications),
  };
};
