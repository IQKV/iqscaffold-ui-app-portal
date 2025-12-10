/**
 * Payment Method Management Service
 * Handles CRUD operations for payment methods with provider integration
 */

import { PaymentProviderFactory } from "@/entities/payment-method/services/payment-provider-interface";
import { billingApi } from "@/shared/api/billing-api";
import { notifications } from "@mantine/notifications";
import { PaymentProvider, PaymentMethodType } from "@/shared/types/billing";
import type { PaymentMethod, PaymentMethodData } from "@/shared/types/billing";

export interface PaymentMethodCreationOptions {
  tenantId: string;
  paymentMethodData: PaymentMethodData;
  setAsDefault?: boolean;
  validateOnly?: boolean;
}

export interface PaymentMethodUpdateOptions {
  paymentMethodId: string;
  updates: Partial<PaymentMethodData>;
  validateChanges?: boolean;
}

export interface PaymentMethodValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

/**
 * Payment method management service with provider integration
 */
export class PaymentMethodService {
  /**
   * Create a new payment method
   */
  static async createPaymentMethod(
    options: PaymentMethodCreationOptions
  ): Promise<PaymentMethod> {
    try {
      const {
        tenantId,
        paymentMethodData,
        setAsDefault = false,
        validateOnly = false,
      } = options;

      // Validate payment method data
      const validation = await this.validatePaymentMethod(paymentMethodData);
      if (!validation.isValid) {
        throw new Error(
          `Payment method validation failed: ${validation.errors.join(", ")}`
        );
      }

      // If validation only, return early
      if (validateOnly) {
        notifications.show({
          title: "Validation Successful",
          message: "Payment method data is valid.",
          color: "green",
        });
        throw new Error("Validation only - payment method not created");
      }

      // Get payment provider
      const provider = PaymentProviderFactory.getProvider(
        paymentMethodData.provider || PaymentProvider.STRIPE
      );

      // Tokenize payment method with provider
      const tokenizationResult =
        await provider.tokenizePaymentMethod(paymentMethodData);

      // Create payment method record
      const paymentMethodRecord: PaymentMethodData & { tenantId: string } = {
        ...paymentMethodData,
        tenantId,
        providerPaymentMethodId: tokenizationResult.token,
        metadata: tokenizationResult.metadata,
      };

      // Save to database
      const createdPaymentMethod =
        await billingApi.addPaymentMethod(paymentMethodRecord);

      // Set as default if requested
      if (setAsDefault) {
        await this.setDefaultPaymentMethod(tenantId, createdPaymentMethod.id);
      }

      notifications.show({
        title: "Payment Method Added",
        message: "Your payment method has been added successfully.",
        color: "green",
      });

      return createdPaymentMethod;
    } catch (error) {
      const err = error as Error;

      notifications.show({
        title: "Failed to Add Payment Method",
        message:
          err.message || "Failed to add payment method. Please try again.",
        color: "red",
      });

      throw err;
    }
  }

  /**
   * Update an existing payment method
   */
  static async updatePaymentMethod(
    options: PaymentMethodUpdateOptions
  ): Promise<PaymentMethod> {
    try {
      const { paymentMethodId, updates, validateChanges = true } = options;

      // Get existing payment method
      const existingPaymentMethods = await billingApi.getPaymentMethods("");
      const existingPaymentMethod = existingPaymentMethods.find(
        (pm) => pm.id === paymentMethodId
      );

      if (!existingPaymentMethod) {
        throw new Error("Payment method not found");
      }

      // Validate updates if requested
      if (validateChanges && updates) {
        const mergedData = { ...existingPaymentMethod.metadata, ...updates };
        const validation = await this.validatePaymentMethod(
          mergedData as PaymentMethodData
        );

        if (!validation.isValid) {
          throw new Error(
            `Payment method validation failed: ${validation.errors.join(", ")}`
          );
        }
      }

      // Update with provider if needed
      if (updates && Object.keys(updates).length > 0) {
        const provider = PaymentProviderFactory.getProvider(
          existingPaymentMethod.provider
        );
        await provider.updatePaymentMethod(
          existingPaymentMethod.providerPaymentMethodId,
          updates
        );
      }

      // Update in database
      const updatedPaymentMethod = await billingApi.updatePaymentMethod(
        paymentMethodId,
        updates
      );

      notifications.show({
        title: "Payment Method Updated",
        message: "Your payment method has been updated successfully.",
        color: "green",
      });

      return updatedPaymentMethod;
    } catch (error) {
      const err = error as Error;

      notifications.show({
        title: "Failed to Update Payment Method",
        message:
          err.message || "Failed to update payment method. Please try again.",
        color: "red",
      });

      throw err;
    }
  }

  /**
   * Delete a payment method
   */
  static async deletePaymentMethod(
    paymentMethodId: string,
    tenantId: string
  ): Promise<void> {
    try {
      // Get existing payment methods to check if this is the only one
      const paymentMethods = await billingApi.getPaymentMethods(tenantId);
      const paymentMethod = paymentMethods.find(
        (pm) => pm.id === paymentMethodId
      );

      if (!paymentMethod) {
        throw new Error("Payment method not found");
      }

      // Check if this is the only payment method for an active subscription
      if (paymentMethods.length === 1) {
        // This would need to check if there's an active subscription
        // For now, we'll allow deletion but warn the user
        notifications.show({
          title: "Warning",
          message:
            "This is your only payment method. Make sure to add another before your next billing cycle.",
          color: "yellow",
        });
      }

      // Delete from provider
      const provider = PaymentProviderFactory.getProvider(
        paymentMethod.provider
      );
      await provider.deletePaymentMethod(paymentMethod.providerPaymentMethodId);

      // Delete from database
      await billingApi.deletePaymentMethod(paymentMethodId);

      notifications.show({
        title: "Payment Method Deleted",
        message: "Your payment method has been deleted successfully.",
        color: "blue",
      });
    } catch (error) {
      const err = error as Error;

      notifications.show({
        title: "Failed to Delete Payment Method",
        message:
          err.message || "Failed to delete payment method. Please try again.",
        color: "red",
      });

      throw err;
    }
  }

  /**
   * Set a payment method as default
   */
  static async setDefaultPaymentMethod(
    tenantId: string,
    paymentMethodId: string
  ): Promise<PaymentMethod> {
    try {
      const updatedPaymentMethod = await billingApi.setDefaultPaymentMethod(
        tenantId,
        paymentMethodId
      );

      notifications.show({
        title: "Default Payment Method Updated",
        message: "Your default payment method has been updated.",
        color: "green",
      });

      return updatedPaymentMethod;
    } catch (error) {
      const err = error as Error;

      notifications.show({
        title: "Failed to Update Default Payment Method",
        message: err.message || "Failed to update default payment method.",
        color: "red",
      });

      throw err;
    }
  }

  /**
   * Get payment methods for a tenant
   */
  static async getPaymentMethods(tenantId: string): Promise<PaymentMethod[]> {
    try {
      return await billingApi.getPaymentMethods(tenantId);
    } catch (error) {
      console.error("Failed to get payment methods:", error);
      return [];
    }
  }

  /**
   * Validate payment method data
   */
  static async validatePaymentMethod(
    paymentMethodData: PaymentMethodData
  ): Promise<PaymentMethodValidationResult> {
    const errors: string[] = [];
    const warnings: string[] = [];

    try {
      // Basic validation
      if (!paymentMethodData.type) {
        errors.push("Payment method type is required");
      }

      if (paymentMethodData.type === PaymentMethodType.CARD) {
        if (!paymentMethodData.cardNumber) {
          errors.push("Card number is required");
        } else if (paymentMethodData.cardNumber.length < 13) {
          errors.push("Card number must be at least 13 digits");
        }

        if (!paymentMethodData.expiryMonth || !paymentMethodData.expiryYear) {
          errors.push("Expiry date is required");
        } else {
          const currentDate = new Date();
          const expiryDate = new Date(
            parseInt(paymentMethodData.expiryYear),
            parseInt(paymentMethodData.expiryMonth) - 1
          );

          if (expiryDate < currentDate) {
            errors.push("Card has expired");
          }
        }

        if (!paymentMethodData.cvv) {
          errors.push("CVV is required");
        } else if (paymentMethodData.cvv.length < 3) {
          errors.push("CVV must be at least 3 digits");
        }
      }

      // Billing address validation
      if (!paymentMethodData.billingAddress?.country) {
        warnings.push("Billing address country is recommended");
      }

      // Provider-specific validation
      if (paymentMethodData.provider) {
        const provider = PaymentProviderFactory.getProvider(
          paymentMethodData.provider
        );
        const providerValidation =
          await provider.validatePaymentMethod(paymentMethodData);

        if (!providerValidation.isValid) {
          errors.push(...(providerValidation.errors || []));
        }

        if (providerValidation.warnings) {
          warnings.push(...providerValidation.warnings);
        }
      }

      return {
        isValid: errors.length === 0,
        errors,
        warnings,
      };
    } catch (error) {
      console.error("Payment method validation error:", error);
      return {
        isValid: false,
        errors: ["Validation failed due to system error"],
        warnings,
      };
    }
  }

  /**
   * Test a payment method (small authorization)
   */
  static async testPaymentMethod(
    paymentMethodId: string,
    amount: number = 100 // $1.00 in cents
  ): Promise<{ success: boolean; transactionId?: string; error?: string }> {
    try {
      // Get payment method details
      const paymentMethods = await billingApi.getPaymentMethods("");
      const paymentMethod = paymentMethods.find(
        (pm) => pm.id === paymentMethodId
      );

      if (!paymentMethod) {
        throw new Error("Payment method not found");
      }

      // Get provider and test payment
      const provider = PaymentProviderFactory.getProvider(
        paymentMethod.provider
      );
      const result = await provider.processPayment(
        paymentMethod.providerPaymentMethodId,
        amount,
        "USD",
        { test: true, description: "Payment method verification" }
      );

      if (result.status === "succeeded") {
        notifications.show({
          title: "Payment Method Verified",
          message: "Your payment method has been successfully verified.",
          color: "green",
        });

        return {
          success: true,
          transactionId: result.id,
        };
      }
      return {
        success: false,
        error: result.failureReason || "Payment verification failed",
      };
    } catch (error) {
      const err = error as Error;

      notifications.show({
        title: "Payment Method Verification Failed",
        message: err.message || "Failed to verify payment method.",
        color: "red",
      });

      return {
        success: false,
        error: err.message,
      };
    }
  }

  /**
   * Get supported payment method types for a provider
   */
  static getSupportedPaymentTypes(
    provider: PaymentProvider
  ): PaymentMethodType[] {
    try {
      const providerCapabilities =
        PaymentProviderFactory.getProviderCapabilities(provider);
      return providerCapabilities.supportedTypes;
    } catch (error) {
      console.error("Failed to get supported payment types:", error);
      return [PaymentMethodType.CARD]; // Default fallback
    }
  }

  /**
   * Get supported countries for a provider
   */
  static getSupportedCountries(provider: PaymentProvider): string[] {
    try {
      const providerCapabilities =
        PaymentProviderFactory.getProviderCapabilities(provider);
      return providerCapabilities.supportedCountries;
    } catch (error) {
      console.error("Failed to get supported countries:", error);
      return ["US", "CA", "GB"]; // Default fallback
    }
  }

  /**
   * Format payment method for display
   */
  static formatPaymentMethodForDisplay(paymentMethod: PaymentMethod): string {
    const { type, metadata } = paymentMethod;

    if (type === PaymentMethodType.CARD) {
      const brand = metadata.brand ? metadata.brand.toUpperCase() : "CARD";
      const last4 = metadata.last4 || "****";
      return `${brand} ending in ${last4}`;
    }

    if (type === PaymentMethodType.BANK_ACCOUNT) {
      const last4 = metadata.last4 || "****";
      return `Bank account ending in ${last4}`;
    }

    return "Payment method";
  }
}
