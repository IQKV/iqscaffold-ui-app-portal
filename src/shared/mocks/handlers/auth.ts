import { http, HttpResponse, delay } from "msw";
import { getMSWConfig } from "@/shared/lib/msw-config";
import { getConfig } from "@/app/config";
import { ENV_KEYS } from "@/shared/constants";

const config = getMSWConfig();
const API_BASE_URL = getConfig(ENV_KEYS.API_SERVER_URL) || "";

// Mock user data
const mockUser = {
  id: "1",
  email: "user@example.com",
  name: "John Doe",
  avatar: "https://via.placeholder.com/150",
  role: "user",
};

const mockTokens = {
  accessToken: "mock-access-token-12345",
  refreshToken: "mock-refresh-token-67890",
  expiresIn: 3600,
};

export const authHandlers = [
  // Login
  http.post(`${API_BASE_URL}/v1/auth/login`, async ({ request }) => {
    if (config.delay) {
      await delay(
        typeof config.delay === "object"
          ? Math.random() * (config.delay.max - config.delay.min) +
              config.delay.min
          : config.delay
      );
    }

    const body = (await request.json()) as { email: string; password: string };

    if (config.enableLogging) {
      console.log("🔐 MSW: Login attempt", { email: body.email });
    }

    // Simulate login validation
    if (body.email === "admin@example.com" && body.password === "admin123") {
      return HttpResponse.json({
        user: { ...mockUser, email: body.email, role: "admin" },
        ...mockTokens,
      });
    }

    if (body.email === "user@example.com" && body.password === "user123") {
      return HttpResponse.json({
        user: { ...mockUser, email: body.email },
        ...mockTokens,
      });
    }

    // Invalid credentials
    return HttpResponse.json(
      {
        type: "https://example.com/problems/invalid-credentials",
        title: "Invalid Credentials",
        status: 401,
        detail: "The provided email or password is incorrect.",
      },
      { status: 401 }
    );
  }),

  // Signup
  http.post(`${API_BASE_URL}/v1/auth/signup`, async ({ request }) => {
    if (config.delay) {
      await delay(
        typeof config.delay === "object"
          ? Math.random() * (config.delay.max - config.delay.min) +
              config.delay.min
          : config.delay
      );
    }

    const body = (await request.json()) as {
      email: string;
      password: string;
      name: string;
    };

    if (config.enableLogging) {
      console.log("📝 MSW: Signup attempt", {
        email: body.email,
        name: body.name,
      });
    }

    // Simulate email already exists
    if (body.email === "existing@example.com") {
      return HttpResponse.json(
        {
          type: "https://example.com/problems/email-exists",
          title: "Email Already Exists",
          status: 409,
          detail: "An account with this email already exists.",
        },
        { status: 409 }
      );
    }

    return HttpResponse.json({
      user: {
        ...mockUser,
        email: body.email,
        name: body.name,
        id: Math.random().toString(36).substr(2, 9),
      },
      ...mockTokens,
    });
  }),

  // Refresh token
  http.post(`${API_BASE_URL}/v1/auth/refresh`, async ({ request }) => {
    if (config.delay) {
      await delay(
        typeof config.delay === "object"
          ? Math.random() * (config.delay.max - config.delay.min) +
              config.delay.min
          : config.delay
      );
    }

    const body = (await request.json()) as { refreshToken: string };

    if (config.enableLogging) {
      console.log("🔄 MSW: Token refresh");
    }

    if (!body.refreshToken || body.refreshToken !== mockTokens.refreshToken) {
      return HttpResponse.json(
        {
          type: "https://example.com/problems/invalid-token",
          title: "Invalid Refresh Token",
          status: 401,
          detail: "The provided refresh token is invalid or expired.",
        },
        { status: 401 }
      );
    }

    return HttpResponse.json({
      ...mockTokens,
      accessToken: `mock-access-token-${Date.now()}`,
    });
  }),

  // Logout
  http.post(`${API_BASE_URL}/v1/auth/logout`, async () => {
    if (config.delay) {
      await delay(
        typeof config.delay === "object"
          ? Math.random() * (config.delay.max - config.delay.min) +
              config.delay.min
          : config.delay
      );
    }

    if (config.enableLogging) {
      console.log("👋 MSW: Logout");
    }

    return HttpResponse.json({ message: "Logged out successfully" });
  }),

  // Get current user
  http.get(`${API_BASE_URL}/v1/users/me`, async ({ request }) => {
    if (config.delay) {
      await delay(
        typeof config.delay === "object"
          ? Math.random() * (config.delay.max - config.delay.min) +
              config.delay.min
          : config.delay
      );
    }

    const authHeader = request.headers.get("Authorization");

    if (config.enableLogging) {
      console.log("👤 MSW: Get current user");
    }

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return HttpResponse.json(
        {
          type: "https://example.com/problems/unauthorized",
          title: "Unauthorized",
          status: 401,
          detail: "Authentication required.",
        },
        { status: 401 }
      );
    }

    return HttpResponse.json({ user: mockUser });
  }),

  // Forgot password
  http.post(`${API_BASE_URL}/v1/auth/password/forgot`, async ({ request }) => {
    if (config.delay) {
      await delay(
        typeof config.delay === "object"
          ? Math.random() * (config.delay.max - config.delay.min) +
              config.delay.min
          : config.delay
      );
    }

    const body = (await request.json()) as { email: string };

    if (config.enableLogging) {
      console.log("🔑 MSW: Forgot password", { email: body.email });
    }

    return HttpResponse.json({
      message: "Password reset email sent successfully",
    });
  }),

  // Reset password
  http.post(`${API_BASE_URL}/v1/auth/password/reset`, async ({ request }) => {
    if (config.delay) {
      await delay(
        typeof config.delay === "object"
          ? Math.random() * (config.delay.max - config.delay.min) +
              config.delay.min
          : config.delay
      );
    }

    const body = (await request.json()) as { token: string; password: string };

    if (config.enableLogging) {
      console.log("🔐 MSW: Reset password");
    }

    if (!body.token || body.token !== "valid-reset-token") {
      return HttpResponse.json(
        {
          type: "https://example.com/problems/invalid-token",
          title: "Invalid Reset Token",
          status: 400,
          detail: "The password reset token is invalid or expired.",
        },
        { status: 400 }
      );
    }

    return HttpResponse.json({
      message: "Password reset successfully",
    });
  }),
];
