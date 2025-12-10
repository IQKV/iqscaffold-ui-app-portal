import type {
  PaymentMethod,
  PaymentMethodData,
  ValidationResult,
  PaymentMethodValidation,
  PaymentMethodMetrics,
  CardBrand,
} from "../types/payment-method-types";
import { ValidationUtils } from "@/shared/lib/billing-utils";

/**
 * Payment Method business logic service
 * Contains all payment method-related business rules and validations
 */
export class PaymentMethodService {
  // Card brand detection
  private static cardBrands: CardBrand[] = [
    {
      name: "visa",
      pattern: /^4/,
      gaps: [4, 8, 12],
      lengths: [16, 18, 19],
      code: { name: "CVV", size: 3 },
    },
    {
      name: "mastercard",
      pattern: /^(5[1-5]|2[2-7])/,
      gaps: [4, 8, 12],
      lengths: [16],
      code: { name: "CVC", size: 3 },
    },
    {
      name: "amex",
      pattern: /^3[47]/,
      gaps: [4, 10],
      lengths: [15],
      code: { name: "CID", size: 4 },
    },
    {
      name: "discover",
      pattern: /^6(?:011|5)/,
      gaps: [4, 8, 12],
      lengths: [16, 19],
      code: { name: "CID", size: 3 },
    },
  ];

  // Validation methods
  static validatePaymentMethodData(data: PaymentMethodData): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Validate card number
    if (data.type === "card") {
      if (!data.cardNumber) {
        errors.push("Card number is required");
      } else if (!ValidationUtils.isValidCreditCard(data.cardNumber)) {
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

        if (
          expiryYear < currentYear ||
          (expiryYear === currentYear && expiryMonth < currentMonth)
        ) {
          errors.push("Card has expired");
        }

        // Warning for cards expiring soon
        if (expiryYear === currentYear && expiryMonth === currentMonth) {
          warnings.push("Card expires this month");
        } else if (
          expiryYear === currentYear &&
          expiryMonth === currentMonth + 1
        ) {
          warnings.push("Card expires next month");
        }
      }

      // Validate CVV
      if (!data.cvv) {
        errors.push("CVV is required");
      } else if (!ValidationUtils.isValidCVV(data.cvv)) {
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

  static validatePaymentMethod(
    paymentMethod: PaymentMethod
  ): PaymentMethodValidation {
    const validation: PaymentMethodValidation = {
      cardNumber: true,
      expiryDate: true,
      cvv: true,
      billingAddress: true,
      overall: true,
      errors: {},
    };

    if (paymentMethod.type === "card") {
      // Check if card is expiring soon
      const metadata = paymentMethod.metadata;
      if (metadata.expiryMonth && metadata.expiryYear) {
        const currentDate = new Date();
        const currentYear = currentDate.getFullYear();
        const currentMonth = currentDate.getMonth() + 1;

        if (
          metadata.expiryYear < currentYear ||
          (metadata.expiryYear === currentYear &&
            metadata.expiryMonth < currentMonth)
        ) {
          validation.expiryDate = false;
          validation.errors.expiryDate = "Card has expired";
        } else if (
          metadata.expiryYear === currentYear &&
          metadata.expiryMonth <= currentMonth + 2
        ) {
          validation.errors.expiryDate = "Card expires soon";
        }
      }
    }

    validation.overall =
      validation.cardNumber &&
      validation.expiryDate &&
      validation.cvv &&
      validation.billingAddress;

    return validation;
  }

  // Card brand detection
  static detectCardBrand(cardNumber: string): CardBrand | null {
    const cleanNumber = cardNumber.replace(/\D/g, "");

    for (const brand of this.cardBrands) {
      if (brand.pattern.test(cleanNumber)) {
        return brand;
      }
    }

    return null;
  }

  static formatCardNumber(cardNumber: string, brand?: CardBrand): string {
    const cleanNumber = cardNumber.replace(/\D/g, "");
    const detectedBrand = brand || this.detectCardBrand(cleanNumber);

    if (!detectedBrand) {
      return cleanNumber;
    }

    let formatted = "";
    let index = 0;

    for (let i = 0; i < cleanNumber.length; i++) {
      if (detectedBrand.gaps.includes(i) && i > 0) {
        formatted += " ";
      }
      formatted += cleanNumber[i];
    }

    return formatted;
  }

  // Business logic methods
  static canDelete(
    paymentMethod: PaymentMethod,
    allPaymentMethods: PaymentMethod[]
  ): boolean {
    // Cannot delete if it's the only payment method for an active subscription
    const activePaymentMethods = allPaymentMethods.filter(
      (pm) => pm.tenantId === paymentMethod.tenantId
    );

    return activePaymentMethods.length > 1 || !paymentMethod.isDefault;
  }

  static getDefaultPaymentMethod(
    paymentMethods: PaymentMethod[]
  ): PaymentMethod | null {
    return paymentMethods.find((pm) => pm.isDefault) || null;
  }

  static calculateMetrics(
    paymentMethods: PaymentMethod[]
  ): PaymentMethodMetrics {
    const methodsByType = paymentMethods.reduce(
      (acc, pm) => {
        acc[pm.type] = (acc[pm.type] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );

    const methodsByProvider = paymentMethods.reduce(
      (acc, pm) => {
        acc[pm.provider] = (acc[pm.provider] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );

    const defaultMethod = this.getDefaultPaymentMethod(paymentMethods);
    const defaultMethodType = defaultMethod?.type || null;

    // Find cards expiring in the next 3 months
    const threeMonthsFromNow = new Date();
    threeMonthsFromNow.setMonth(threeMonthsFromNow.getMonth() + 3);

    const expiringMethods = paymentMethods.filter((pm) => {
      if (
        pm.type !== "card" ||
        !pm.metadata.expiryYear ||
        !pm.metadata.expiryMonth
      ) {
        return false;
      }

      const expiryDate = new Date(
        pm.metadata.expiryYear,
        pm.metadata.expiryMonth - 1
      );
      return expiryDate <= threeMonthsFromNow;
    });

    return {
      totalMethods: paymentMethods.length,
      methodsByType: methodsByType as Record<any, number>,
      methodsByProvider: methodsByProvider as Record<any, number>,
      defaultMethodType: defaultMethodType as any,
      expiringMethods,
    };
  }

  // Security helpers
  static maskCardNumber(cardNumber: string): string {
    const cleanNumber = cardNumber.replace(/\D/g, "");
    if (cleanNumber.length < 4) return cleanNumber;

    const lastFour = cleanNumber.slice(-4);
    const masked = "*".repeat(cleanNumber.length - 4);
    return masked + lastFour;
  }

  static getCardDisplayName(paymentMethod: PaymentMethod): string {
    if (paymentMethod.type !== "card") {
      return paymentMethod.type;
    }

    const brand = paymentMethod.metadata.brand || "Card";
    const last4 = paymentMethod.metadata.last4 || "****";

    return `${brand} ending in ${last4}`;
  }

  // Validation helpers for forms
  static validateCardNumber(cardNumber: string): {
    isValid: boolean;
    error?: string;
    brand?: CardBrand;
  } {
    const cleanNumber = cardNumber.replace(/\D/g, "");

    if (!cleanNumber) {
      return { isValid: false, error: "Card number is required" };
    }

    if (cleanNumber.length < 13 || cleanNumber.length > 19) {
      return { isValid: false, error: "Card number must be 13-19 digits" };
    }

    const brand = this.detectCardBrand(cleanNumber);
    if (!brand) {
      return { isValid: false, error: "Unsupported card type" };
    }

    if (!brand.lengths.includes(cleanNumber.length)) {
      return { isValid: false, error: `Invalid length for ${brand.name}` };
    }

    if (!ValidationUtils.isValidCreditCard(cleanNumber)) {
      return { isValid: false, error: "Invalid card number" };
    }

    return { isValid: true, brand };
  }

  static validateExpiryDate(
    month: string,
    year: string
  ): { isValid: boolean; error?: string } {
    if (!month || !year) {
      return { isValid: false, error: "Expiry date is required" };
    }

    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth() + 1;

    const expiryYear = parseInt(year, 10);
    const expiryMonth = parseInt(month, 10);

    if (isNaN(expiryYear) || isNaN(expiryMonth)) {
      return { isValid: false, error: "Invalid expiry date" };
    }

    if (expiryMonth < 1 || expiryMonth > 12) {
      return { isValid: false, error: "Invalid month" };
    }

    if (
      expiryYear < currentYear ||
      (expiryYear === currentYear && expiryMonth < currentMonth)
    ) {
      return { isValid: false, error: "Card has expired" };
    }

    return { isValid: true };
  }

  static validateCVV(
    cvv: string,
    brand?: CardBrand
  ): { isValid: boolean; error?: string } {
    if (!cvv) {
      return { isValid: false, error: "CVV is required" };
    }

    const cleanCVV = cvv.replace(/\D/g, "");
    const expectedLength = brand?.code.size || 3;

    if (cleanCVV.length !== expectedLength) {
      return { isValid: false, error: `CVV must be ${expectedLength} digits` };
    }

    return { isValid: true };
  }
}
