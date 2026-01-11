import { describe, it, expect } from "vitest";
import { billingKeys } from "./billing-queries";

describe("Billing Query Keys", () => {
  describe("billingKeys", () => {
    it("generates correct all key", () => {
      expect(billingKeys.all).toEqual(["billing"]);
    });

    it("generates correct payments key", () => {
      expect(billingKeys.payments()).toEqual(["billing", "payments"]);
    });

    it("generates correct payment key with id", () => {
      expect(billingKeys.payment("pay_123")).toEqual([
        "billing",
        "payments",
        "pay_123",
      ]);
    });

    it("generates correct history key with params", () => {
      const params = { page: 1, limit: 10 };
      expect(billingKeys.history(params)).toEqual([
        "billing",
        "payments",
        "history",
        params,
      ]);
    });

    it("generates correct merchant status key", () => {
      expect(billingKeys.merchantStatus()).toEqual([
        "billing",
        "merchant-status",
        undefined,
      ]);
    });

    it("generates correct merchant status key with organizationId", () => {
      expect(billingKeys.merchantStatus(123)).toEqual([
        "billing",
        "merchant-status",
        123,
      ]);
    });

    it("generates correct payouts key", () => {
      expect(billingKeys.payouts()).toEqual(["billing", "payouts"]);
    });

    it("generates correct payout key with id", () => {
      expect(billingKeys.payout("po_456")).toEqual([
        "billing",
        "payouts",
        "po_456",
      ]);
    });

    it("generates correct payout history key with params", () => {
      const params = { page: 2, limit: 20 };
      expect(billingKeys.payoutHistory(params)).toEqual([
        "billing",
        "payouts",
        "history",
        params,
      ]);
    });

    it("generates unique keys for different params", () => {
      const params1 = { page: 1, limit: 10 };
      const params2 = { page: 2, limit: 20 };

      const key1 = billingKeys.history(params1);
      const key2 = billingKeys.history(params2);

      expect(key1).not.toEqual(key2);
    });
  });
});
