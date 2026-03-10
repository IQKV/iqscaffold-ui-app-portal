import { describe, it, expect } from "vitest";
import { getConfig, hasConfig, getConfigOrThrow } from "./index";

describe("Config Utilities", () => {
  describe("getConfig", () => {
    it("returns config value or undefined", () => {
      const value = getConfig("VITE_API_SERVER_URL");
      // Value may or may not exist in test environment
      expect(value === undefined || typeof value === "string").toBe(true);
    });

    it("returns fallback when config does not exist", () => {
      const value = getConfig("VITE_NONEXISTENT_KEY", "fallback-value");
      expect(value).toBe("fallback-value");
    });

    it("returns undefined when config does not exist and no fallback", () => {
      const value = getConfig("VITE_NONEXISTENT_KEY");
      expect(value).toBeUndefined();
    });
  });

  describe("hasConfig", () => {
    it("returns boolean for config check", () => {
      const exists = hasConfig("VITE_API_SERVER_URL");
      expect(typeof exists).toBe("boolean");
    });

    it("returns false for non-existing config", () => {
      const exists = hasConfig("VITE_NONEXISTENT_KEY");
      expect(exists).toBe(false);
    });
  });

  describe("getConfigOrThrow", () => {
    it("throws error when config does not exist", () => {
      expect(() => getConfigOrThrow("VITE_NONEXISTENT_KEY")).toThrow(
        "Missing required config: VITE_NONEXISTENT_KEY",
      );
    });

    it("returns value when config exists", () => {
      // Test with a config that should exist or handle gracefully
      const testKey = "VITE_TEST_KEY";
      if (hasConfig(testKey)) {
        const value = getConfigOrThrow(testKey);
        expect(typeof value).toBe("string");
      } else {
        expect(() => getConfigOrThrow(testKey)).toThrow();
      }
    });
  });
});
