import { describe, it, expect, vi, beforeEach } from "vitest";
import { authApi } from "./auth-api";
import { apiClient } from "./base";

// Mock the API client
vi.mock("./base", () => ({
  apiClient: {
    post: vi.fn(),
  },
}));

// Mock the config
vi.mock("@/app/config", () => ({
  getAuthConfig: () => ({
    endpoints: {
      login: "/api/v1/auth/login",
      signup: "/api/v1/auth/signup",
      refresh: "/api/v1/auth/refresh",
      logout: "/api/v1/auth/logout",
      forgotPassword: "/api/v1/auth/forgot-password",
      resetPassword: "/api/v1/auth/reset-password",
      verifyEmail: "/api/v1/auth/email/verify",
      resendVerification: "/api/v1/auth/email/resend",
    },
  }),
}));

describe("authApi", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("login", () => {
    it("should call login endpoint with credentials", async () => {
      const mockResponse = {
        data: {
          accessToken: "access-token",
          refreshToken: "refresh-token",
          tokenType: "Bearer",
          expiresIn: 900,
          user: {
            userId: 1,
            username: "testuser",
            email: "test@example.com",
            roles: ["USER"],
            permissions: [],
            firstName: "Test",
            lastName: "User",
            tenantId: "default",
            customClaims: {},
          },
        },
      };

      vi.mocked(apiClient.post).mockResolvedValue(mockResponse);

      const credentials = {
        username: "testuser",
        password: "password123",
        rememberMe: false,
      };

      const result = await authApi.login(credentials);

      expect(apiClient.post).toHaveBeenCalledWith(
        "/api/v1/auth/login",
        credentials
      );
      expect(result).toEqual(mockResponse.data);
    });
  });

  describe("signup", () => {
    it("should call signup endpoint with user data", async () => {
      const mockResponse = {
        data: {
          userId: 1,
          username: "newuser",
          email: "new@example.com",
          firstName: "New",
          lastName: "User",
          emailVerified: false,
          createdAt: "2024-01-01T00:00:00Z",
          message: "User registered successfully",
        },
      };

      vi.mocked(apiClient.post).mockResolvedValue(mockResponse);

      const userData = {
        username: "newuser",
        email: "new@example.com",
        password: "Password123!",
        firstName: "New",
        lastName: "User",
      };

      const result = await authApi.signup(userData);

      expect(apiClient.post).toHaveBeenCalledWith(
        "/api/v1/auth/signup",
        userData
      );
      expect(result).toEqual(mockResponse.data);
    });
  });

  describe("refresh", () => {
    it("should call refresh endpoint with refresh token", async () => {
      const mockResponse = {
        data: {
          accessToken: "new-access-token",
          refreshToken: "new-refresh-token",
          tokenType: "Bearer",
          expiresIn: 900,
          user: {
            userId: 1,
            username: "testuser",
            email: "test@example.com",
            roles: ["USER"],
            permissions: [],
            firstName: "Test",
            lastName: "User",
            tenantId: "default",
            customClaims: {},
          },
        },
      };

      vi.mocked(apiClient.post).mockResolvedValue(mockResponse);

      const refreshData = { refreshToken: "old-refresh-token" };

      const result = await authApi.refresh(refreshData);

      expect(apiClient.post).toHaveBeenCalledWith(
        "/api/v1/auth/refresh",
        refreshData
      );
      expect(result).toEqual(mockResponse.data);
    });
  });

  describe("logout", () => {
    it("should call logout endpoint", async () => {
      vi.mocked(apiClient.post).mockResolvedValue({ data: undefined });

      await authApi.logout();

      expect(apiClient.post).toHaveBeenCalledWith("/api/v1/auth/logout");
    });
  });

  describe("forgotPassword", () => {
    it("should call forgot password endpoint with email", async () => {
      vi.mocked(apiClient.post).mockResolvedValue({ data: undefined });

      const email = "test@example.com";

      await authApi.forgotPassword(email);

      expect(apiClient.post).toHaveBeenCalledWith(
        "/api/v1/auth/forgot-password",
        { email }
      );
    });
  });

  describe("resetPassword", () => {
    it("should call reset password endpoint with token and new password", async () => {
      vi.mocked(apiClient.post).mockResolvedValue({ data: undefined });

      const token = "reset-token";
      const newPassword = "NewPassword123!";

      await authApi.resetPassword(token, newPassword);

      expect(apiClient.post).toHaveBeenCalledWith(
        "/api/v1/auth/reset-password",
        { token, newPassword }
      );
    });
  });

  describe("verifyEmail", () => {
    it("should call verify email endpoint with token", async () => {
      vi.mocked(apiClient.post).mockResolvedValue({ data: undefined });

      const token = "verify-token";

      await authApi.verifyEmail(token);

      expect(apiClient.post).toHaveBeenCalledWith(
        "/api/v1/auth/email/verify",
        { token }
      );
    });
  });

  describe("resendVerification", () => {
    it("should call resend verification endpoint with email", async () => {
      vi.mocked(apiClient.post).mockResolvedValue({ data: undefined });

      const email = "test@example.com";

      await authApi.resendVerification(email);

      expect(apiClient.post).toHaveBeenCalledWith(
        "/api/v1/auth/email/resend",
        { email }
      );
    });
  });
});
