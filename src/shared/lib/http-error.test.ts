import { describe, it, expect, vi } from "vitest";
import axios, { AxiosError } from "axios";
import {
  normalizeAxiosError,
  getFieldErrors,
  toMantineErrors,
  getErrorMessage,
  type AppError,
} from "./http-error";
import { beforeEach } from "node:test";

// Mock axios
vi.mock("axios", () => ({
  default: {
    isCancel: vi.fn(),
    isAxiosError: vi.fn(),
  },
  isCancel: vi.fn(),
  isAxiosError: vi.fn(),
}));

describe("HTTP Error Utilities", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("normalizeAxiosError", () => {
    it("handles axios cancellation", () => {
      const cancelError = { code: "ERR_CANCELED", message: "canceled" };
      (axios.isCancel as any).mockReturnValue(true);

      const result = normalizeAxiosError(cancelError);

      expect(result).toEqual({
        type: "canceled",
        message: "Request was canceled",
        code: "ERR_CANCELED",
        cause: cancelError,
        retryable: false,
      });
    });

    it("handles network errors", () => {
      const networkError = {
        code: "ECONNREFUSED",
        message: "Network Error",
      } as unknown as AxiosError;

      (axios.isAxiosError as any).mockReturnValue(true);
      (axios.isCancel as any).mockReturnValue(false);

      const result = normalizeAxiosError(networkError);

      expect(result.type).toBe("network");
      expect(result.message).toBe(
        "Network error. Please check your connection"
      );
      expect(result.retryable).toBe(true);
    });

    it("handles timeout errors", () => {
      const timeoutError = {
        code: "ECONNABORTED",
        message: "timeout of 5000ms exceeded",
      } as unknown as AxiosError;

      (axios.isAxiosError as any).mockReturnValue(true);
      (axios.isCancel as any).mockReturnValue(false);

      const result = normalizeAxiosError(timeoutError);

      expect(result.type).toBe("timeout");
      expect(result.message).toBe("Request timed out");
      expect(result.retryable).toBe(true);
    });

    it("handles 401 authentication errors", () => {
      const authError = {
        response: {
          status: 401,
          data: { message: "Unauthorized" },
        },
      } as unknown as AxiosError;

      (axios.isAxiosError as any).mockReturnValue(true);
      (axios.isCancel as any).mockReturnValue(false);

      const result = normalizeAxiosError(authError);

      expect(result.type).toBe("auth");
      expect(result.status).toBe(401);
      expect(result.message).toBe("Unauthorized");
      expect(result.retryable).toBe(false);
    });

    it("handles 422 validation errors", () => {
      const validationError = {
        response: {
          status: 422,
          data: {
            message: "Validation failed",
            errors: {
              email: ["Email is required"],
              name: ["Name must be at least 2 characters"],
            },
          },
        },
      } as unknown as AxiosError;

      (axios.isAxiosError as any).mockReturnValue(true);
      (axios.isCancel as any).mockReturnValue(false);

      const result = normalizeAxiosError(validationError);

      expect(result.type).toBe("validation");
      expect(result.status).toBe(422);
      expect(result.message).toBe(
        "Validation failed: Email is required, Name must be at least 2 characters"
      );
    });

    it("handles 500 server errors", () => {
      const serverError = {
        response: {
          status: 500,
          data: { message: "Internal Server Error" },
          headers: { "x-request-id": "req-123" },
        },
      } as unknown as AxiosError;

      (axios.isAxiosError as any).mockReturnValue(true);
      (axios.isCancel as any).mockReturnValue(false);

      const result = normalizeAxiosError(serverError);

      expect(result.type).toBe("server");
      expect(result.status).toBe(500);
      expect(result.message).toBe("Internal Server Error");
      expect(result.requestId).toBe("req-123");
      expect(result.retryable).toBe(true);
    });

    it("handles string response data", () => {
      const error = {
        response: {
          status: 400,
          data: "Bad Request",
        },
      } as unknown as AxiosError;

      (axios.isAxiosError as any).mockReturnValue(true);
      (axios.isCancel as any).mockReturnValue(false);

      const result = normalizeAxiosError(error);

      expect(result.message).toBe("Bad Request");
    });

    it("handles unknown errors", () => {
      const unknownError = new Error("Something unexpected");

      (axios.isAxiosError as any).mockReturnValue(false);
      (axios.isCancel as any).mockReturnValue(false);

      const result = normalizeAxiosError(unknownError);

      expect(result.type).toBe("unknown");
      expect(result.message).toBe("Something unexpected");
      expect(result.retryable).toBe(false);
    });
  });

  describe("getFieldErrors", () => {
    it("extracts field errors from violations array", () => {
      const error = {
        response: {
          status: 422,
          data: {
            violations: [
              { field: "email", message: "Invalid email" },
              { propertyPath: "user.name", message: "Name required" },
            ],
          },
        },
      } as AxiosError;

      (axios.isAxiosError as any).mockReturnValue(true);

      const result = getFieldErrors(error);

      expect(result).toEqual({
        email: ["Invalid email"],
        name: ["Name required"],
      });
    });

    it("extracts field errors from errors object", () => {
      const error = {
        response: {
          status: 422,
          data: {
            errors: {
              email: ["Email is required", "Email must be valid"],
              name: "Name is required",
            },
          },
        },
      } as AxiosError;

      (axios.isAxiosError as any).mockReturnValue(true);

      const result = getFieldErrors(error);

      expect(result).toEqual({
        email: ["Email is required", "Email must be valid"],
        name: ["Name is required"],
      });
    });

    it("normalizes field keys", () => {
      const error = {
        response: {
          status: 422,
          data: {
            violations: [
              {
                field: "passwordConfirmation",
                message: "Passwords don't match",
              },
              {
                propertyPath: "user.password-confirmation",
                message: "Required",
              },
            ],
          },
        },
      } as AxiosError;

      (axios.isAxiosError as any).mockReturnValue(true);

      const result = getFieldErrors(error);

      expect(result).toEqual({
        password_confirmation: ["Passwords don't match", "Required"],
      });
    });

    it("returns empty object for no field errors", () => {
      const error = {
        response: {
          status: 500,
          data: { message: "Server error" },
        },
      } as AxiosError;

      (axios.isAxiosError as any).mockReturnValue(true);

      const result = getFieldErrors(error);

      expect(result).toEqual({});
    });
  });

  describe("toMantineErrors", () => {
    it("converts field errors to Mantine format", () => {
      const error = {
        response: {
          status: 422,
          data: {
            errors: {
              email: ["Email is required", "Email must be valid"],
              name: ["Name is required"],
            },
          },
        },
      } as AxiosError;

      (axios.isAxiosError as any).mockReturnValue(true);

      const result = toMantineErrors(error);

      expect(result).toEqual({
        email: "Email is required", // Only first error
        name: "Name is required",
      });
    });

    it("returns empty object for no errors", () => {
      const error = {
        response: {
          status: 500,
          data: { message: "Server error" },
        },
      } as AxiosError;

      (axios.isAxiosError as any).mockReturnValue(true);

      const result = toMantineErrors(error);

      expect(result).toEqual({});
    });
  });

  describe("getErrorMessage", () => {
    it("returns error message", () => {
      const error = {
        response: {
          status: 400,
          data: { message: "Bad request" },
        },
      } as AxiosError;

      (axios.isAxiosError as any).mockReturnValue(true);

      const result = getErrorMessage(error);

      expect(result).toBe("Bad request");
    });

    it("includes request ID for server errors", () => {
      const error = {
        response: {
          status: 500,
          data: { message: "Server error" },
          headers: { "x-request-id": "req-456" },
        },
      } as unknown as AxiosError;

      (axios.isAxiosError as any).mockReturnValue(true);

      const result = getErrorMessage(error);

      expect(result).toBe("Server error (ref: req-456)");
    });

    it("uses fallback message", () => {
      const error = {
        response: {
          status: 400,
          data: {},
        },
        message: undefined,
      } as unknown as AxiosError;

      (axios.isAxiosError as any).mockReturnValue(true);

      const result = getErrorMessage(error, "Custom fallback");

      expect(result).toBe("Request failed");
    });

    it("uses default fallback", () => {
      const error = {
        response: {
          status: 400,
          data: {},
        },
        message: undefined,
      } as unknown as AxiosError;

      (axios.isAxiosError as any).mockReturnValue(true);

      const result = getErrorMessage(error);

      expect(result).toBe("Request failed");
    });
  });
});
