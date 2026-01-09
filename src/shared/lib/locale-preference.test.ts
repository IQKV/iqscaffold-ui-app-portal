import { describe, it, expect, beforeEach, vi } from "vitest";
import {
  getUserLocalePreference,
  setUserLocalePreference,
  clearUserLocalePreference,
  hasUserLocalePreference,
} from "./locale-preference";

describe("Locale Preference", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  describe("getUserLocalePreference", () => {
    it("returns null when no preference is set", () => {
      expect(getUserLocalePreference()).toBeNull();
    });

    it("returns stored locale preference", () => {
      localStorage.setItem("userLocalePreference", "es");
      expect(getUserLocalePreference()).toBe("es");
    });

    it("returns null in server environment", () => {
      const originalWindow = global.window;
      // @ts-ignore
      delete global.window;

      expect(getUserLocalePreference()).toBeNull();

      global.window = originalWindow;
    });
  });

  describe("setUserLocalePreference", () => {
    it("stores locale preference in localStorage", () => {
      setUserLocalePreference("fr");
      expect(localStorage.getItem("userLocalePreference")).toBe("fr");
    });

    it("overwrites existing preference", () => {
      setUserLocalePreference("en");
      expect(localStorage.getItem("userLocalePreference")).toBe("en");

      setUserLocalePreference("de");
      expect(localStorage.getItem("userLocalePreference")).toBe("de");
    });

    it("does nothing in server environment", () => {
      const originalWindow = global.window;
      // @ts-ignore
      delete global.window;

      setUserLocalePreference("es");
      // Should not throw error

      global.window = originalWindow;
    });
  });

  describe("clearUserLocalePreference", () => {
    it("removes locale preference from localStorage", () => {
      localStorage.setItem("userLocalePreference", "en");
      clearUserLocalePreference();
      expect(localStorage.getItem("userLocalePreference")).toBeNull();
    });

    it("does nothing when no preference exists", () => {
      clearUserLocalePreference();
      expect(localStorage.getItem("userLocalePreference")).toBeNull();
    });

    it("does nothing in server environment", () => {
      const originalWindow = global.window;
      // @ts-ignore
      delete global.window;

      clearUserLocalePreference();
      // Should not throw error

      global.window = originalWindow;
    });
  });

  describe("hasUserLocalePreference", () => {
    it("returns false when no preference is set", () => {
      expect(hasUserLocalePreference()).toBe(false);
    });

    it("returns true when preference exists", () => {
      localStorage.setItem("userLocalePreference", "en");
      expect(hasUserLocalePreference()).toBe(true);
    });

    it("returns false after clearing preference", () => {
      localStorage.setItem("userLocalePreference", "en");
      clearUserLocalePreference();
      expect(hasUserLocalePreference()).toBe(false);
    });
  });
});
