import { describe, it, expect, vi } from "vitest";
import { PaymentMethodService } from "./payment-method-service";
import type { PaymentMethodData } from "../types/payment-method-types";
import { PaymentMethodType } from "@/shared/types";

describe("PaymentMethodService", () => {
  describe("Card brand detection", () => {
    it("should detect Visa cards", () => {
      const brand = PaymentMethodService.detectCardBrand("4242424242424242");
      expect(brand?.name).toBe("visa");
    });

    it("should detect Mastercard", () => {
      const brand = PaymentMethodService.detectCardBrand("5555555555554444");
      expect(brand?.name).toBe("mastercard");
    });

    it("should detect American Express", () => {
      const brand = PaymentMethodService.detectCardBrand("378282246310005");
      expect(brand?.name).toBe("amex");
    });

    it("should return null for invalid card numbers", () => {
      const brand = PaymentMethodService.detectCardBrand("1234567890");
      expect(brand).toBeNull();
    });
  });

  describe("Card number formatting", () => {
    it("should format Visa card numbers with spaces", () => {
      const formatted =
        PaymentMethodService.formatCardNumber("4242424242424242");
      expect(formatted).toBe("4242 4242 4242 4242");
    });

    it("should format American Express card numbers correctly", () => {
      const formatted =
        PaymentMethodService.formatCardNumber("378282246310005");
      expect(formatted).toBe("3782 822463 10005");
    });
  });

  describe("Card number validation", () => {
    it("should validate correct Visa card number", () => {
      const result =
        PaymentMethodService.validateCardNumber("4242424242424242");
      expect(result.isValid).toBe(true);
      expect(result.brand?.name).toBe("visa");
    });

    it("should reject invalid card number", () => {
      const result = PaymentMethodService.validateCardNumber("1234567890");
      expect(result.isValid).toBe(false);
      expect(result.error).toBeDefined();
    });

    it("should reject empty card number", () => {
      const result = PaymentMethodService.validateCardNumber("");
      expect(result.isValid).toBe(false);
      expect(result.error).toBe("Card number is required");
    });
  });

  describe("Expiry date validation", () => {
    it("should validate future expiry date", () => {
      const currentYear = new Date().getFullYear();
      const result = PaymentMethodService.validateExpiryDate(
        "12",
        (currentYear + 1).toString()
      );
      expect(result.isValid).toBe(true);
    });

    it("should reject past expiry date", () => {
      const result = PaymentMethodService.validateExpiryDate("01", "2020");
      expect(result.isValid).toBe(false);
      expect(result.error).toBe("Card has expired");
    });

    it("should reject invalid month", () => {
      const currentYear = new Date().getFullYear();
      const result = PaymentMethodService.validateExpiryDate(
        "13",
        currentYear.toString()
      );
      expect(result.isValid).toBe(false);
      expect(result.error).toBe("Invalid month");
    });
  });

  describe("CVV validation", () => {
    it("should validate 3-digit CVV", () => {
      const result = PaymentMethodService.validateCVV("123");
      expect(result.isValid).toBe(true);
    });

    it("should validate 4-digit CVV for Amex", () => {
      const amexBrand = PaymentMethodService.detectCardBrand("378282246310005");
      const result = PaymentMethodService.validateCVV("1234", amexBrand!);
      expect(result.isValid).toBe(true);
    });

    it("should reject invalid CVV length", () => {
      const result = PaymentMethodService.validateCVV("12");
      expect(result.isValid).toBe(false);
      expect(result.error).toBe("CVV must be 3 digits");
    });
  });

  describe("Payment method validation", () => {
    const validPaymentMethodData: PaymentMethodData = {
      type: PaymentMethodType.CARD,
      cardNumber: "4242424242424242",
      expiryMonth: "12",
      expiryYear: "2025",
      cvv: "123",
      billingAddress: {
        line1: "123 Main St",
        city: "New York",
        postalCode: "10001",
        country: "US",
      },
    };

    it("should validate complete payment method data", () => {
      const result = PaymentMethodService.validatePaymentMethodData(
        validPaymentMethodData
      );
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it("should reject payment method with missing card number", () => {
      const invalidData = { ...validPaymentMethodData, cardNumber: "" };
      const result =
        PaymentMethodService.validatePaymentMethodData(invalidData);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain("Card number is required");
    });

    it("should reject payment method with missing billing address", () => {
      const invalidData = {
        ...validPaymentMethodData,
        billingAddress: { ...validPaymentMethodData.billingAddress, line1: "" },
      };
      const result =
        PaymentMethodService.validatePaymentMethodData(invalidData);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain("Billing address is required");
    });
  });

  // Provider integration tests would require proper mocking of async initialization
  // These are covered by integration tests

  describe("Utility methods", () => {
    it("should mask card number correctly", () => {
      const masked = PaymentMethodService.maskCardNumber("4242424242424242");
      expect(masked).toBe("************4242");
    });

    it("should get card display name", () => {
      const paymentMethod = {
        id: "pm_test",
        type: "card" as const,
        metadata: {
          brand: "visa",
          last4: "4242",
        },
      } as any;

      const displayName =
        PaymentMethodService.getCardDisplayName(paymentMethod);
      expect(displayName).toBe("visa ending in 4242");
    });
  });
});
