import { describe, it, expect, vi, beforeEach } from "vitest";
import { getStripe } from "./stripe";
import * as stripeJs from "@stripe/stripe-js";

vi.mock("@stripe/stripe-js", () => ({
  loadStripe: vi.fn(),
}));

vi.mock("@/app/config", () => ({
  getConfig: vi.fn((key: string) => {
    if (key === "VITE_STRIPE_PUBLIC_KEY") {
      return "pk_test_mock_key";
    }
    return undefined;
  }),
}));

describe("Stripe Utilities", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("getStripe", () => {
    it("loads stripe with default public key from config", async () => {
      const mockStripe = {} as any;
      vi.mocked(stripeJs.loadStripe).mockResolvedValue(mockStripe);

      const result = await getStripe();

      expect(stripeJs.loadStripe).toHaveBeenCalledWith("pk_test_mock_key", {});
      expect(result).toBe(mockStripe);
    });

    it("loads stripe with custom public key", async () => {
      const mockStripe = {} as any;
      vi.mocked(stripeJs.loadStripe).mockResolvedValue(mockStripe);

      const customKey = "pk_test_custom_key";
      await getStripe(customKey);

      expect(stripeJs.loadStripe).toHaveBeenCalledWith(customKey, {});
    });

    it("loads stripe with account ID", async () => {
      const mockStripe = {} as any;
      vi.mocked(stripeJs.loadStripe).mockResolvedValue(mockStripe);

      const customKey = "pk_test_custom_key";
      const accountId = "acct_123456";
      await getStripe(customKey, accountId);

      expect(stripeJs.loadStripe).toHaveBeenCalledWith(customKey, {
        stripeAccount: accountId,
      });
    });

    it("returns a promise", async () => {
      const mockStripe = {} as any;
      vi.mocked(stripeJs.loadStripe).mockResolvedValue(mockStripe);

      const result = getStripe();

      expect(result).toBeInstanceOf(Promise);
      await expect(result).resolves.toBeDefined();
    });

    it("handles custom public key and account ID together", async () => {
      const mockStripe = {} as any;
      vi.mocked(stripeJs.loadStripe).mockResolvedValue(mockStripe);

      const customKey = "pk_test_custom_key";
      const accountId = "acct_123456";
      const result = await getStripe(customKey, accountId);

      expect(result).toBe(mockStripe);
    });
  });
});
