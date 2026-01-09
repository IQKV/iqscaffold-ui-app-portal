import { describe, it, expect, beforeEach, vi } from "vitest";
import { formatCurrency, getCurrencySymbol, getUserCurrency } from "./currency";

describe("Currency Utilities", () => {
  describe("formatCurrency", () => {
    it("formats currency in cents to dollars", () => {
      expect(formatCurrency(1000, "USD")).toContain("10");
    });

    it("formats string values", () => {
      expect(formatCurrency("2500", "USD")).toContain("25");
    });

    it("handles zero value", () => {
      expect(formatCurrency(0, "USD")).toContain("0");
    });

    it("formats with different currencies", () => {
      const eurResult = formatCurrency(1000, "EUR");
      expect(eurResult).toBeTruthy();
      expect(typeof eurResult).toBe("string");
    });

    it("uses USD as default currency", () => {
      const result = formatCurrency(1000);
      expect(result).toBeTruthy();
      expect(typeof result).toBe("string");
    });

    it("handles decimal values", () => {
      expect(formatCurrency(1050, "USD")).toContain("10");
    });
  });

  describe("getCurrencySymbol", () => {
    it("returns correct symbol for USD", () => {
      expect(getCurrencySymbol("USD")).toBe("$");
    });

    it("returns correct symbol for EUR", () => {
      expect(getCurrencySymbol("EUR")).toBe("€");
    });

    it("returns correct symbol for GBP", () => {
      expect(getCurrencySymbol("GBP")).toBe("£");
    });

    it("returns correct symbol for JPY", () => {
      expect(getCurrencySymbol("JPY")).toBe("¥");
    });

    it("returns correct symbol for INR", () => {
      expect(getCurrencySymbol("INR")).toBe("₹");
    });

    it("handles lowercase currency codes", () => {
      expect(getCurrencySymbol("usd")).toBe("$");
      expect(getCurrencySymbol("eur")).toBe("€");
    });

    it("returns currency code for unknown currencies", () => {
      expect(getCurrencySymbol("XYZ")).toBe("XYZ");
    });
  });

  describe("getUserCurrency", () => {
    const originalNavigator = global.navigator;

    beforeEach(() => {
      vi.clearAllMocks();
    });

    afterEach(() => {
      Object.defineProperty(global, "navigator", {
        value: originalNavigator,
        writable: true,
      });
    });

    it("returns USD for US locale", () => {
      Object.defineProperty(global, "navigator", {
        value: { language: "en-US" },
        writable: true,
      });
      expect(getUserCurrency()).toBe("USD");
    });

    it("returns GBP for GB locale", () => {
      Object.defineProperty(global, "navigator", {
        value: { language: "en-GB" },
        writable: true,
      });
      expect(getUserCurrency()).toBe("GBP");
    });

    it("returns CAD for CA locale", () => {
      Object.defineProperty(global, "navigator", {
        value: { language: "en-CA" },
        writable: true,
      });
      expect(getUserCurrency()).toBe("CAD");
    });

    it("returns AUD for AU locale", () => {
      Object.defineProperty(global, "navigator", {
        value: { language: "en-AU" },
        writable: true,
      });
      expect(getUserCurrency()).toBe("AUD");
    });

    it("returns EUR for European locales", () => {
      Object.defineProperty(global, "navigator", {
        value: { language: "fr-FR" },
        writable: true,
      });
      expect(getUserCurrency()).toBe("EUR");

      Object.defineProperty(global, "navigator", {
        value: { language: "de-DE" },
        writable: true,
      });
      expect(getUserCurrency()).toBe("EUR");
    });

    it("returns USD as fallback for unknown locales", () => {
      Object.defineProperty(global, "navigator", {
        value: { language: "xx-XX" },
        writable: true,
      });
      expect(getUserCurrency()).toBe("USD");
    });

    it("returns USD in server environment", () => {
      const result = getUserCurrency();
      expect(result).toBe("USD");
    });
  });
});
