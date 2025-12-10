import { msg } from "@lingui/macro";
import { MessageDescriptor } from "@lingui/core";

/**
 * Billing-specific translation keys organized by domain
 * This provides type-safe access to all billing-related translations
 */
export const billingTranslations = {
  // Subscription Management
  subscription: {
    status: {
      active: msg`Active`,
      trialing: msg`Trial`,
      pastDue: msg`Past Due`,
      canceled: msg`Canceled`,
      unpaid: msg`Unpaid`,
    },
    actions: {
      upgrade: msg`Upgrade Plan`,
      downgrade: msg`Downgrade Plan`,
      cancel: msg`Cancel Subscription`,
      reactivate: msg`Reactivate Subscription`,
      changePlan: msg`Change Plan`,
    },
    labels: {
      currentPlan: msg`Current Plan`,
      billingCycle: msg`Billing Cycle`,
      nextPayment: msg`Next Payment`,
      trialEnds: msg`Trial Ends`,
      renewsOn: msg`Renews On`,
    },
    messages: {
      upgradeSuccess: msg`Plan upgraded successfully`,
      downgradeSuccess: msg`Plan downgraded successfully`,
      cancelSuccess: msg`Subscription canceled successfully`,
      upgradeError: msg`Failed to upgrade plan`,
      downgradeError: msg`Failed to downgrade plan`,
      cancelError: msg`Failed to cancel subscription`,
    },
  },

  // Payment Management
  payment: {
    methods: {
      card: msg`Credit Card`,
      bankAccount: msg`Bank Account`,
      paypal: msg`PayPal`,
    },
    actions: {
      addPaymentMethod: msg`Add Payment Method`,
      updatePaymentMethod: msg`Update Payment Method`,
      deletePaymentMethod: msg`Delete Payment Method`,
      setDefault: msg`Set as Default`,
      retryPayment: msg`Retry Payment`,
    },
    labels: {
      cardNumber: msg`Card Number`,
      expiryDate: msg`Expiry Date`,
      cvv: msg`CVV`,
      cardholderName: msg`Cardholder Name`,
      billingAddress: msg`Billing Address`,
      defaultMethod: msg`Default Payment Method`,
    },
    messages: {
      addSuccess: msg`Payment method added successfully`,
      updateSuccess: msg`Payment method updated successfully`,
      deleteSuccess: msg`Payment method deleted successfully`,
      addError: msg`Failed to add payment method`,
      updateError: msg`Failed to update payment method`,
      deleteError: msg`Failed to delete payment method`,
      retrySuccess: msg`Payment retry initiated`,
      retryError: msg`Failed to retry payment`,
    },
  },

  // Invoice Management
  invoice: {
    status: {
      draft: msg`Draft`,
      open: msg`Open`,
      paid: msg`Paid`,
      void: msg`Void`,
      uncollectible: msg`Uncollectible`,
      overdue: msg`Overdue`,
    },
    actions: {
      download: msg`Download Invoice`,
      viewDetails: msg`View Details`,
      payNow: msg`Pay Now`,
      markPaid: msg`Mark as Paid`,
      sendReminder: msg`Send Reminder`,
    },
    labels: {
      invoiceNumber: msg`Invoice Number`,
      amount: msg`Amount`,
      dueDate: msg`Due Date`,
      paidDate: msg`Paid Date`,
      lineItems: msg`Line Items`,
      subtotal: msg`Subtotal`,
      tax: msg`Tax`,
      total: msg`Total`,
    },
    messages: {
      downloadSuccess: msg`Invoice downloaded successfully`,
      downloadError: msg`Failed to download invoice`,
      paymentSuccess: msg`Invoice paid successfully`,
      paymentError: msg`Failed to process payment`,
    },
  },

  // Usage and Quotas
  usage: {
    metrics: {
      apiCalls: msg`API Calls`,
      storageGb: msg`Storage (GB)`,
      emailSends: msg`Email Sends`,
      activeUsers: msg`Active Users`,
    },
    labels: {
      current: msg`Current Usage`,
      limit: msg`Limit`,
      remaining: msg`Remaining`,
      percentage: msg`Usage Percentage`,
      overage: msg`Overage`,
    },
    status: {
      normal: msg`Normal`,
      warning: msg`Approaching Limit`,
      exceeded: msg`Limit Exceeded`,
      grace: msg`Grace Period`,
    },
    messages: {
      approachingLimit: msg`You are approaching your usage limit`,
      limitExceeded: msg`Usage limit exceeded`,
      graceActive: msg`Grace period active`,
      upgradeRecommended: msg`Consider upgrading your plan`,
    },
  },

  // Plans and Pricing
  plan: {
    tiers: {
      free: msg`Free`,
      pro: msg`Pro`,
      enterprise: msg`Enterprise`,
    },
    cycles: {
      monthly: msg`Monthly`,
      yearly: msg`Yearly`,
      annual: msg`Annual`,
    },
    labels: {
      price: msg`Price`,
      features: msg`Features`,
      popular: msg`Most Popular`,
      recommended: msg`Recommended`,
      currentPlan: msg`Current Plan`,
    },
    actions: {
      selectPlan: msg`Select Plan`,
      upgradeTo: msg`Upgrade to {planName}`,
      downgradeTo: msg`Downgrade to {planName}`,
      startTrial: msg`Start Free Trial`,
    },
  },

  // Forms and Validation
  forms: {
    validation: {
      required: msg`This field is required`,
      invalidEmail: msg`Please enter a valid email address`,
      invalidCard: msg`Please enter a valid card number`,
      invalidCvv: msg`Please enter a valid CVV`,
      invalidExpiry: msg`Please enter a valid expiry date`,
      passwordMismatch: msg`Passwords do not match`,
      minLength: msg`Must be at least {min} characters`,
      maxLength: msg`Must be no more than {max} characters`,
    },
    labels: {
      email: msg`Email Address`,
      firstName: msg`First Name`,
      lastName: msg`Last Name`,
      company: msg`Company`,
      address: msg`Address`,
      city: msg`City`,
      state: msg`State`,
      zipCode: msg`ZIP Code`,
      country: msg`Country`,
    },
    actions: {
      save: msg`Save`,
      cancel: msg`Cancel`,
      submit: msg`Submit`,
      update: msg`Update`,
      delete: msg`Delete`,
      confirm: msg`Confirm`,
    },
  },

  // Notifications
  notifications: {
    titles: {
      success: msg`Success`,
      error: msg`Error`,
      warning: msg`Warning`,
      info: msg`Information`,
    },
    billing: {
      paymentSuccess: msg`Payment processed successfully`,
      paymentFailed: msg`Payment failed`,
      invoiceGenerated: msg`New invoice generated`,
      trialExpiring: msg`Trial expiring soon`,
      subscriptionCanceled: msg`Subscription canceled`,
      planChanged: msg`Plan changed successfully`,
    },
  },

  // Common UI Elements
  common: {
    loading: msg`Loading...`,
    noData: msg`No data available`,
    error: msg`An error occurred`,
    retry: msg`Retry`,
    close: msg`Close`,
    back: msg`Back`,
    next: msg`Next`,
    previous: msg`Previous`,
    search: msg`Search`,
    filter: msg`Filter`,
    sort: msg`Sort`,
    export: msg`Export`,
  },
} as const;

/**
 * Type-safe helper to get billing translation keys
 */
export type BillingTranslationKey = keyof typeof billingTranslations;

/**
 * Helper function to get nested translation messages
 */
export function getBillingMessage(path: string): MessageDescriptor {
  const keys = path.split(".");
  let current: any = billingTranslations;

  for (const key of keys) {
    current = current[key];
    if (!current) {
      throw new Error(`Translation key not found: ${path}`);
    }
  }

  return current;
}
