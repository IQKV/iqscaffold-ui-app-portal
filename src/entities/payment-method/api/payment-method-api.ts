import { billingApi } from "@/shared/api/billing-api";
import type {
  PaymentMethod,
  PaymentMethodData,
  PaymentProvider,
} from "../types/payment-method-types";
import { PaymentMethodService } from "../services/payment-method-service";

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
    data: PaymentMethodData & { tenantId: string; provider: PaymentProvider }
  ): Promise<PaymentMethod> {
    // If provider token already present (e.g., from Stripe Elements or PayPal approval), skip tokenization
    if (data.providerPaymentMethodId) {
      return billingApi.addPaymentMethod(data as any);
    }

    // Otherwise validate and tokenize through the provider abstraction
    const { validation, tokenization } =
      await PaymentMethodService.validateAndTokenizePaymentMethod(
        data,
        data.provider
      );

    if (!validation.isValid) {
      throw new Error(validation.errors.join(", "));
    }

    if (!tokenization) {
      throw new Error("Failed to tokenize payment method");
    }

    // Create payment method with tokenized data
    const paymentMethodData = {
      ...data,
      providerPaymentMethodId: tokenization.token,
      metadata: tokenization.metadata,
    } as any;

    return billingApi.addPaymentMethod(paymentMethodData);
  }

  async update(
    paymentMethodId: string,
    updates: Partial<PaymentMethodData>
  ): Promise<PaymentMethod> {
    // Get the existing payment method to determine provider
    const existingPaymentMethods = await this.getByTenant(
      updates.tenantId || ""
    );
    const existingPaymentMethod = existingPaymentMethods.find(
      (pm) => pm.id === paymentMethodId
    );

    if (!existingPaymentMethod) {
      throw new Error("Payment method not found");
    }

    // Update through provider if needed
    if (updates.billingAddress || updates.cardNumber) {
      try {
        const updatedMetadata =
          await PaymentMethodService.updatePaymentMethodWithProvider(
            existingPaymentMethod,
            updates
          );

        // Merge updated metadata
        updates.metadata = {
          ...existingPaymentMethod.metadata,
          ...updatedMetadata,
        };
      } catch (error) {
        // If provider update fails, still try to update our records
        console.warn("Provider update failed:", error);
      }
    }

    return billingApi.updatePaymentMethod(paymentMethodId, updates);
  }

  async delete(paymentMethodId: string): Promise<void> {
    // Get the payment method to determine provider
    const paymentMethods = await billingApi.getPaymentMethods("");
    const paymentMethod = paymentMethods.find(
      (pm) => pm.id === paymentMethodId
    );

    if (!paymentMethod) {
      throw new Error("Payment method not found");
    }

    // Delete from provider first
    try {
      await PaymentMethodService.deletePaymentMethodWithProvider(paymentMethod);
    } catch (error) {
      console.warn("Provider deletion failed:", error);
      // Continue with our deletion even if provider fails
    }

    // Delete from our system
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
