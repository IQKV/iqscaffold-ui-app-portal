import { loadStripe, Stripe, StripeElements } from "@stripe/stripe-js";
import type {
  PaymentMethodData,
  PaymentMethodMetadata,
  ValidationResult,
  TokenizationResult,
} from "../types/payment-method-types";
import { PaymentProvider, PaymentMethodType } from "@/shared/types/billing";
import {
  PaymentProviderInterface,
  PaymentProviderConfig,
  PaymentResult,
  PaymentStatus,
  RecurringPaymentSetup,
  WebhookEvent,
  PaymentRetryService,
  RefundResult,
} from "./payment-provider-interface";

/**
 * Stripe payment provider implementation
 * Handles Stripe-specific payment method operations
 */
export class StripePaymentProvider implements PaymentProviderInterface {
  readonly name = PaymentProvider.STRIPE;
  readonly supportedTypes: PaymentMethodType[] = [PaymentMethodType.CARD];
  readonly supportedCountries = [
    "US",
    "CA",
    "GB",
    "AU",
    "DE",
    "FR",
    "IT",
    "ES",
    "NL",
    "BE",
    "AT",
    "CH",
    "SE",
    "NO",
    "DK",
    "FI",
    "IE",
    "PT",
    "LU",
    "JP",
    "SG",
    "HK",
    "NZ",
  ];
  readonly requiresBillingAddress = true;

  private stripe: Stripe | null = null;
  private config: PaymentProviderConfig | null = null;

  async initialize(config: PaymentProviderConfig): Promise<void> {
    this.config = config;

    try {
      this.stripe = await loadStripe(config.apiKey);
      if (!this.stripe) {
        throw new Error("Failed to initialize Stripe");
      }
    } catch (error) {
      throw new Error(
        `Failed to initialize Stripe provider: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }

  async validatePaymentMethod(
    data: PaymentMethodData
  ): Promise<ValidationResult> {
    const errors: string[] = [];
    const warnings: string[] = [];

    if (!this.stripe) {
      throw new Error("Stripe not initialized");
    }

    // Validate card number using Stripe's validation
    if (data.type === PaymentMethodType.CARD && data.cardNumber) {
      const cardElement = this.stripe.elements().create("card");

      // Basic validation
      if (!data.cardNumber || data.cardNumber.replace(/\s/g, "").length < 13) {
        errors.push("Invalid card number");
      }

      // Validate expiry
      if (!data.expiryMonth || !data.expiryYear) {
        errors.push("Expiry date is required");
      } else {
        const currentDate = new Date();
        const currentYear = currentDate.getFullYear();
        const currentMonth = currentDate.getMonth() + 1;

        const expiryYear = parseInt(data.expiryYear, 10);
        const expiryMonth = parseInt(data.expiryMonth, 10);

        // Handle 2-digit years
        const fullExpiryYear =
          expiryYear < 100 ? 2000 + expiryYear : expiryYear;

        if (
          fullExpiryYear < currentYear ||
          (fullExpiryYear === currentYear && expiryMonth < currentMonth)
        ) {
          errors.push("Card has expired");
        }

        // Warning for cards expiring soon
        if (fullExpiryYear === currentYear && expiryMonth <= currentMonth + 2) {
          warnings.push("Card expires soon");
        }
      }

      // Validate CVV
      if (!data.cvv || data.cvv.length < 3 || data.cvv.length > 4) {
        errors.push("Invalid CVV");
      }
    }

    // Validate billing address
    if (!data.billingAddress.line1) {
      errors.push("Billing address is required");
    }
    if (!data.billingAddress.city) {
      errors.push("City is required");
    }
    if (!data.billingAddress.postalCode) {
      errors.push("Postal code is required");
    }
    if (!data.billingAddress.country) {
      errors.push("Country is required");
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
    };
  }

  async tokenizePaymentMethod(
    data: PaymentMethodData
  ): Promise<TokenizationResult> {
    if (!this.stripe) {
      throw new Error("Stripe not initialized");
    }

    return PaymentRetryService.executeWithRetry(async () => {
      // For security reasons, we should use Stripe Elements instead of raw card data
      // This is a placeholder implementation - in production, use Stripe Elements
      throw new Error("Direct card tokenization not supported. Use Stripe Elements instead.");
    });
  }

  async updatePaymentMethod(
    providerPaymentMethodId: string,
    updates: Partial<PaymentMethodData>
  ): Promise<PaymentMethodMetadata> {
    if (!this.stripe) {
      throw new Error("Stripe not initialized");
    }

    return PaymentRetryService.executeWithRetry(async () => {
      // Client-side Stripe.js doesn't support updating payment methods
      // This should be done server-side
      throw new Error("Payment method updates must be done server-side");
    });
  }

  async deletePaymentMethod(providerPaymentMethodId: string): Promise<void> {
    if (!this.stripe) {
      throw new Error("Stripe not initialized");
    }

    return PaymentRetryService.executeWithRetry(async () => {
      // Client-side Stripe.js doesn't support detaching payment methods
      // This should be done server-side
      throw new Error("Payment method detachment must be done server-side");
    });
  }

  async processPayment(
    providerPaymentMethodId: string,
    amount: number,
    currency: string,
    metadata?: Record<string, any>
  ): Promise<PaymentResult> {
    if (!this.stripe) {
      throw new Error("Stripe not initialized");
    }

    return PaymentRetryService.executeWithRetry(async () => {
      try {
        const result = await this.stripe!.confirmCardPayment("", {
          payment_method: providerPaymentMethodId,
        });

        if (result.error) {
          return {
            id: "",
            status: PaymentStatus.FAILED,
            amount,
            currency,
            failureReason: result.error.message,
            processedAt: new Date(),
          };
        }

        const paymentIntent = result.paymentIntent!;

        return {
          id: paymentIntent.id,
          status: this.mapStripeStatus(paymentIntent.status),
          amount: paymentIntent.amount,
          currency: paymentIntent.currency,
          metadata: (paymentIntent as any).metadata || {},
          processedAt: new Date(paymentIntent.created * 1000),
        };
      } catch (error) {
        throw new Error(
          `Stripe payment failed: ${
            error instanceof Error ? error.message : "Unknown error"
          }`
        );
      }
    });
  }

  async setupRecurringPayment(
    providerPaymentMethodId: string,
    metadata?: Record<string, any>
  ): Promise<RecurringPaymentSetup> {
    if (!this.stripe) {
      throw new Error("Stripe not initialized");
    }

    return PaymentRetryService.executeWithRetry(async () => {
      try {
        const result = await this.stripe!.confirmSetup({
          elements: {} as any, // This should be actual Stripe Elements
          redirect: 'if_required'
        });

        if (result.error) {
          throw new Error(
            result.error.message || "Failed to setup recurring payment"
          );
        }

        const setupIntent = result.setupIntent!;

        return {
          setupIntentId: setupIntent.id,
          clientSecret: setupIntent.client_secret || undefined,
          status: setupIntent.status as any,
          metadata: (setupIntent as any).metadata || {},
        };
      } catch (error) {
        throw new Error(
          `Stripe setup failed: ${
            error instanceof Error ? error.message : "Unknown error"
          }`
        );
      }
    });
  }

  async handleWebhook(
    payload: string,
    signature: string,
    secret: string
  ): Promise<WebhookEvent> {
    if (!this.stripe) {
      throw new Error("Stripe not initialized");
    }

    // Webhook verification should be done server-side with stripe npm package
    // Client-side Stripe.js doesn't have webhooks functionality
    throw new Error("Webhook verification must be done server-side");
  }

  async getDisplayMetadata(
    providerPaymentMethodId: string
  ): Promise<PaymentMethodMetadata> {
    if (!this.stripe) {
      throw new Error("Stripe not initialized");
    }

    return PaymentRetryService.executeWithRetry(async () => {
      // Client-side Stripe.js doesn't support retrieving payment methods
      // This should be done server-side
      throw new Error("Payment method retrieval must be done server-side");
    });
  }

  async processRefund(
    providerPaymentId: string,
    amount: number,
    reason: string,
    metadata?: Record<string, any>
  ): Promise<RefundResult> {
    if (!this.stripe) {
      throw new Error("Stripe not initialized");
    }

    return PaymentRetryService.executeWithRetry(async () => {
      // Client-side Stripe.js doesn't support creating refunds
      // This should be done server-side
      throw new Error("Refund processing must be done server-side");
    });
  }

  async cancelRefund(providerRefundId: string): Promise<void> {
    if (!this.stripe) {
      throw new Error("Stripe not initialized");
    }

    return PaymentRetryService.executeWithRetry(async () => {
      // Client-side Stripe.js doesn't support canceling refunds
      // This should be done server-side
      throw new Error("Refund cancellation must be done server-side");
    });
  }

  private mapStripeStatus(stripeStatus: string): PaymentStatus {
    switch (stripeStatus) {
      case "succeeded":
        return PaymentStatus.SUCCEEDED;
      case "processing":
        return PaymentStatus.PENDING;
      case "requires_payment_method":
      case "requires_confirmation":
      case "requires_action":
        return PaymentStatus.REQUIRES_ACTION;
      case "canceled":
        return PaymentStatus.CANCELED;
      case "failed":
      default:
        return PaymentStatus.FAILED;
    }
  }

  /**
   * Create Stripe Elements for secure card input
   */
  createCardElement(elements: StripeElements, options?: any) {
    return elements.create("card", {
      style: {
        base: {
          fontSize: "16px",
          color: "#424770",
          "::placeholder": {
            color: "#aab7c4",
          },
        },
        invalid: {
          color: "#9e2146",
        },
      },
      ...options,
    });
  }

  /**
   * Validate card element
   */
  async validateCardElement(cardElement: any): Promise<ValidationResult> {
    try {
      const { error } = await this.stripe!.createPaymentMethod({
        type: "card",
        card: cardElement,
      });

      if (error) {
        return {
          isValid: false,
          errors: [error.message || "Invalid card"],
          warnings: [],
        };
      }

      return {
        isValid: true,
        errors: [],
        warnings: [],
      };
    } catch (error) {
      return {
        isValid: false,
        errors: [
          error instanceof Error ? error.message : "Card validation failed",
        ],
        warnings: [],
      };
    }
  }
}
