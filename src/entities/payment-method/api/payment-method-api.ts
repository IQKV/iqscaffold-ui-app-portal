import { billingApi } from "@/shared/api/billing-api";
import type {
  PaymentMethod,
  PaymentMethodData,
} from "../types/payment-method-types";

/**
 * Payment Method-specific API client
 * Wraps the shared billing API with payment method-focused methods
 */
export class PaymentMethodApiClient {
  // Core CRUD operations
  async getByTenant(tenantId: string): Promise<PaymentMethod[]> {
    return billingApi.getPaymentMethods(tenantId);
  }

  async add(
    data: PaymentMethodData & { tenantId: string }
  ): Promise<PaymentMethod> {
    return billingApi.addPaymentMethod(data);
  }

  async update(
    paymentMethodId: string,
    updates: Partial<PaymentMethodData>
  ): Promise<PaymentMethod> {
    return billingApi.updatePaymentMethod(paymentMethodId, updates);
  }

  async delete(paymentMethodId: string): Promise<void> {
    return billingApi.deletePaymentMethod(paymentMethodId);
  }

  // Default management
  async setDefault(
    tenantId: string,
    paymentMethodId: string
  ): Promise<PaymentMethod> {
    return billingApi.setDefaultPaymentMethod(tenantId, paymentMethodId);
  }

  // Validation and tokenization (would integrate with payment providers)
  async validatePaymentMethod(
    data: PaymentMethodData
  ): Promise<{ isValid: boolean; errors: string[] }> {
    // This would typically call the payment provider's validation API
    // For now, we'll do client-side validation
    const errors: string[] = [];

    if (data.type === "card") {
      if (!data.cardNumber || data.cardNumber.length < 13) {
        errors.push("Invalid card number");
      }
      if (!data.expiryMonth || !data.expiryYear) {
        errors.push("Invalid expiry date");
      }
      if (!data.cvv || data.cvv.length < 3) {
        errors.push("Invalid CVV");
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  async tokenizePaymentMethod(
    data: PaymentMethodData
  ): Promise<{ token: string; metadata: any }> {
    // This would integrate with Stripe, PayPal, etc.
    // For now, return a mock response
    return {
      token: `pm_${Date.now()}`,
      metadata: {
        last4: data.cardNumber?.slice(-4),
        brand: "visa", // Would be detected
        expiryMonth: parseInt(data.expiryMonth || "0"),
        expiryYear: parseInt(data.expiryYear || "0"),
      },
    };
  }
}

// Export singleton instance
export const paymentMethodApi = new PaymentMethodApiClient();
