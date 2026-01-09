import { describe, it, expect, beforeEach, vi } from "vitest";
import {
  getTokens,
  getAccessToken,
  getRefreshToken,
  setTokens,
  clearTokens,
  subscribe,
} from "./auth-tokens";

// Mock auth config
vi.mock("@/app/config", () => ({
  getAuthConfig: () => ({
    tokenStorage: {
      accessTokenKey: "test_access_token",
      refreshTokenKey: "test_refresh_token",
    },
  }),
}));

describe("Auth Tokens", () => {
  beforeEach(() => {
    localStorage.clear();
    clearTokens();
    vi.clearAllMocks();
  });

  describe("getTokens", () => {
    it("returns empty tokens initially", () => {
      const tokens = getTokens();
      expect(tokens.accessToken).toBeNull();
      expect(tokens.refreshToken).toBeNull();
    });

    it("returns stored tokens", () => {
      setTokens({
        accessToken: "access_123",
        refreshToken: "refresh_456",
        expiresAt: Date.now() + 3600000,
      });

      const tokens = getTokens();
      expect(tokens.accessToken).toBe("access_123");
      expect(tokens.refreshToken).toBe("refresh_456");
    });
  });

  describe("getAccessToken", () => {
    it("returns null when no token is set", () => {
      expect(getAccessToken()).toBeNull();
    });

    it("returns access token when set", () => {
      setTokens({
        accessToken: "access_123",
        refreshToken: "refresh_456",
        expiresAt: null,
      });

      expect(getAccessToken()).toBe("access_123");
    });
  });

  describe("getRefreshToken", () => {
    it("returns null when no token is set", () => {
      expect(getRefreshToken()).toBeNull();
    });

    it("returns refresh token when set", () => {
      setTokens({
        accessToken: "access_123",
        refreshToken: "refresh_456",
        expiresAt: null,
      });

      expect(getRefreshToken()).toBe("refresh_456");
    });
  });

  describe("setTokens", () => {
    it("stores tokens in memory", () => {
      setTokens({
        accessToken: "access_123",
        refreshToken: "refresh_456",
        expiresAt: 1234567890,
      });

      const tokens = getTokens();
      expect(tokens.accessToken).toBe("access_123");
      expect(tokens.refreshToken).toBe("refresh_456");
      expect(tokens.expiresAt).toBe(1234567890);
    });

    it("stores tokens in localStorage", () => {
      setTokens({
        accessToken: "access_123",
        refreshToken: "refresh_456",
        expiresAt: 1234567890,
      });

      expect(localStorage.getItem("test_access_token")).toBe("access_123");
      expect(localStorage.getItem("test_refresh_token")).toBe("refresh_456");
      expect(localStorage.getItem("test_access_token:exp")).toBe("1234567890");
    });

    it("notifies subscribers", () => {
      const listener = vi.fn();
      subscribe(listener);

      setTokens({
        accessToken: "access_123",
        refreshToken: "refresh_456",
        expiresAt: null,
      });

      expect(listener).toHaveBeenCalledWith({
        accessToken: "access_123",
        refreshToken: "refresh_456",
        expiresAt: null,
      });
    });
  });

  describe("clearTokens", () => {
    it("clears tokens from memory", () => {
      setTokens({
        accessToken: "access_123",
        refreshToken: "refresh_456",
        expiresAt: null,
      });

      clearTokens();

      const tokens = getTokens();
      expect(tokens.accessToken).toBeNull();
      expect(tokens.refreshToken).toBeNull();
      expect(tokens.expiresAt).toBeNull();
    });

    it("clears tokens from localStorage", () => {
      setTokens({
        accessToken: "access_123",
        refreshToken: "refresh_456",
        expiresAt: 1234567890,
      });

      clearTokens();

      expect(localStorage.getItem("test_access_token")).toBeNull();
      expect(localStorage.getItem("test_refresh_token")).toBeNull();
      expect(localStorage.getItem("test_access_token:exp")).toBeNull();
    });

    it("notifies subscribers", () => {
      const listener = vi.fn();
      subscribe(listener);

      setTokens({
        accessToken: "access_123",
        refreshToken: "refresh_456",
        expiresAt: null,
      });

      listener.mockClear();
      clearTokens();

      expect(listener).toHaveBeenCalledWith({
        accessToken: null,
        refreshToken: null,
        expiresAt: null,
      });
    });
  });

  describe("subscribe", () => {
    it("calls listener when tokens change", () => {
      const listener = vi.fn();
      subscribe(listener);

      setTokens({
        accessToken: "access_123",
        refreshToken: "refresh_456",
        expiresAt: null,
      });

      expect(listener).toHaveBeenCalled();
    });

    it("returns unsubscribe function", () => {
      const listener = vi.fn();
      const unsubscribe = subscribe(listener);

      unsubscribe();

      setTokens({
        accessToken: "access_123",
        refreshToken: "refresh_456",
        expiresAt: null,
      });

      expect(listener).not.toHaveBeenCalled();
    });

    it("supports multiple subscribers", () => {
      const listener1 = vi.fn();
      const listener2 = vi.fn();

      subscribe(listener1);
      subscribe(listener2);

      setTokens({
        accessToken: "access_123",
        refreshToken: "refresh_456",
        expiresAt: null,
      });

      expect(listener1).toHaveBeenCalled();
      expect(listener2).toHaveBeenCalled();
    });
  });
});
