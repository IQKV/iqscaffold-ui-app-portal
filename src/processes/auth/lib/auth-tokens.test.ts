import { describe, it, expect, beforeEach, vi } from "vitest";
import {
  getTokens,
  getAccessToken,
  getRefreshToken,
  setTokens,
  clearTokens,
  subscribe,
  type TokenPair,
} from "./auth-tokens";

describe("Auth Tokens", () => {
  beforeEach(() => {
    localStorage.clear();
    clearTokens();
  });

  describe("getTokens", () => {
    it("returns empty tokens initially", () => {
      const tokens = getTokens();
      expect(tokens.accessToken).toBeNull();
      expect(tokens.refreshToken).toBeNull();
    });

    it("returns stored tokens after setting", () => {
      const testTokens: TokenPair = {
        accessToken: "access-123",
        refreshToken: "refresh-456",
        expiresAt: Date.now() + 3600000,
      };

      setTokens(testTokens);
      const tokens = getTokens();

      expect(tokens.accessToken).toBe("access-123");
      expect(tokens.refreshToken).toBe("refresh-456");
      expect(tokens.expiresAt).toBe(testTokens.expiresAt);
    });
  });

  describe("getAccessToken", () => {
    it("returns null when no token is set", () => {
      expect(getAccessToken()).toBeNull();
    });

    it("returns access token when set", () => {
      setTokens({
        accessToken: "access-token",
        refreshToken: "refresh-token",
      });
      expect(getAccessToken()).toBe("access-token");
    });
  });

  describe("getRefreshToken", () => {
    it("returns null when no token is set", () => {
      expect(getRefreshToken()).toBeNull();
    });

    it("returns refresh token when set", () => {
      setTokens({
        accessToken: "access-token",
        refreshToken: "refresh-token",
      });
      expect(getRefreshToken()).toBe("refresh-token");
    });
  });

  describe("setTokens", () => {
    it("stores tokens in memory", () => {
      const tokens: TokenPair = {
        accessToken: "new-access",
        refreshToken: "new-refresh",
        expiresAt: Date.now() + 3600000,
      };

      setTokens(tokens);

      expect(getAccessToken()).toBe("new-access");
      expect(getRefreshToken()).toBe("new-refresh");
    });

    it("persists tokens to localStorage", () => {
      const tokens: TokenPair = {
        accessToken: "persist-access",
        refreshToken: "persist-refresh",
        expiresAt: Date.now() + 3600000,
      };

      setTokens(tokens);

      expect(localStorage.getItem("accessToken")).toBe("persist-access");
      expect(localStorage.getItem("refreshToken")).toBe("persist-refresh");
    });

    it("notifies subscribers when tokens change", () => {
      const listener = vi.fn();
      subscribe(listener);

      const tokens: TokenPair = {
        accessToken: "notify-access",
        refreshToken: "notify-refresh",
      };

      setTokens(tokens);

      expect(listener).toHaveBeenCalledWith(
        expect.objectContaining({
          accessToken: "notify-access",
          refreshToken: "notify-refresh",
        })
      );
    });
  });

  describe("clearTokens", () => {
    it("clears tokens from memory", () => {
      setTokens({
        accessToken: "clear-access",
        refreshToken: "clear-refresh",
      });

      clearTokens();

      expect(getAccessToken()).toBeNull();
      expect(getRefreshToken()).toBeNull();
    });

    it("removes tokens from localStorage", () => {
      setTokens({
        accessToken: "remove-access",
        refreshToken: "remove-refresh",
      });

      clearTokens();

      expect(localStorage.getItem("accessToken")).toBeNull();
      expect(localStorage.getItem("refreshToken")).toBeNull();
    });

    it("notifies subscribers when tokens are cleared", () => {
      const listener = vi.fn();
      setTokens({
        accessToken: "test-access",
        refreshToken: "test-refresh",
      });

      subscribe(listener);
      clearTokens();

      expect(listener).toHaveBeenCalledWith(
        expect.objectContaining({
          accessToken: null,
          refreshToken: null,
        })
      );
    });
  });

  describe("subscribe", () => {
    it("calls listener when tokens change", () => {
      const listener = vi.fn();
      subscribe(listener);

      setTokens({
        accessToken: "sub-access",
        refreshToken: "sub-refresh",
      });

      expect(listener).toHaveBeenCalled();
    });

    it("returns unsubscribe function", () => {
      const listener = vi.fn();
      const unsubscribe = subscribe(listener);

      unsubscribe();

      setTokens({
        accessToken: "unsub-access",
        refreshToken: "unsub-refresh",
      });

      expect(listener).not.toHaveBeenCalled();
    });

    it("supports multiple subscribers", () => {
      const listener1 = vi.fn();
      const listener2 = vi.fn();

      subscribe(listener1);
      subscribe(listener2);

      setTokens({
        accessToken: "multi-access",
        refreshToken: "multi-refresh",
      });

      expect(listener1).toHaveBeenCalled();
      expect(listener2).toHaveBeenCalled();
    });
  });
});
