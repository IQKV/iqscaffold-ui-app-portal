import { describe, it, expect, vi } from "vitest";
import axios, { AxiosError } from "axios";
import {
  normalizeAxiosError,
  errorFromAxios,
  getFieldErrors,
  toMantineErrors,
  getErrorMessage,
  formatErrorForDisplay,
  type AppError,
} from "./http-error";
import { PROBLEM_TYPES } from "./rfc9457-problem-details";
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

      expect(result).toEqual(
        expect.objectContaining({
          errorType: "canceled",
          message: "Request was canceled",
          code: "ERR_CANCELED",
          cause: cancelError,
          retryable: false,
          type: PROBLEM_TYPES.NETWORK_ERROR,
          title: "Request Canceled",
          detail: "The request was canceled before completion",
        }),
      );
    });

    it("handles network errors", () => {
      const networkError = {
        code: "ECONNREFUSED",
        message: "Network Error",
      } as unknown as AxiosError;

      (axios.isAxiosError as any).mockReturnValue(true);
      (axios.isCancel as any).mockReturnValue(false);

      const result = normalizeAxiosError(networkError);

      expect(result.errorType).toBe("network");
      expect(result.message).toBe("Network error. Please check your connection");
      expect(result.retryable).toBe(true);
      expect(result.type).toBe(PROBLEM_TYPES.NETWORK_ERROR);
      expect(result.title).toBe("Network Error");
    });

    it("handles timeout errors", () => {
      const timeoutError = {
        code: "ECONNABORTED",
        message: "timeout of 5000ms exceeded",
      } as unknown as AxiosError;

      (axios.isAxiosError as any).mockReturnValue(true);
      (axios.isCancel as any).mockReturnValue(false);

      const result = normalizeAxiosError(timeoutError);

      expect(result.errorType).toBe("timeout");
      expect(result.message).toBe("Request timed out");
      expect(result.retryable).toBe(true);
      expect(result.type).toBe(PROBLEM_TYPES.TIMEOUT_ERROR);
      expect(result.title).toBe("Request Timeout");
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

      expect(result.errorType).toBe("auth");
      expect(result.status).toBe(401);
      expect(result.message).toBe("Unauthorized");
      expect(result.retryable).toBe(false);
      expect(result.type).toBe(PROBLEM_TYPES.AUTHENTICATION_REQUIRED);
      expect(result.title).toBe("Authentication Required");
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

      expect(result.errorType).toBe("validation");
      expect(result.status).toBe(422);
      expect(result.message).toBe(
        "Validation failed: Email is required, Name must be at least 2 characters",
      );
      expect(result.type).toBe(PROBLEM_TYPES.VALIDATION_ERROR);
      expect(result.title).toBe("Validation Error");
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

      expect(result.errorType).toBe("server");
      expect(result.status).toBe(500);
      expect(result.message).toBe("Internal Server Error");
      expect(result.requestId).toBe("req-123");
      expect(result.retryable).toBe(true);
      expect(result.type).toBe(PROBLEM_TYPES.SERVER_ERROR);
      expect(result.title).toBe("Server Error");
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

      expect(result.errorType).toBe("unknown");
      expect(result.message).toBe("Something unexpected");
      expect(result.retryable).toBe(false);
      expect(result.type).toBe("about:blank");
      expect(result.title).toBe("Unknown Error");
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

  describe("errorFromAxios", () => {
    it("is an alias for normalizeAxiosError", () => {
      const error = {
        response: {
          status: 400,
          data: { message: "Bad request" },
        },
      } as AxiosError;

      (axios.isAxiosError as any).mockReturnValue(true);

      const result1 = errorFromAxios(error);
      const result2 = normalizeAxiosError(error);

      expect(result1).toEqual(result2);
    });
  });

  describe("formatErrorForDisplay", () => {
    it("formats error for display", () => {
      const appError: AppError = {
        errorType: "validation",
        message: "Validation failed",
        status: 422,
        type: PROBLEM_TYPES.VALIDATION_ERROR,
        title: "Validation Error",
        detail: "The request contains invalid data",
        requestId: "req-456",
      };

      const result = formatErrorForDisplay(appError);

      expect(result).toEqual({
        title: "Validation Error",
        message: "The request contains invalid data",
        referenceId: "req-456",
        type: PROBLEM_TYPES.VALIDATION_ERROR,
      });
    });

    it("falls back to message when detail is missing", () => {
      const appError: AppError = {
        errorType: "server",
        message: "Server error occurred",
        status: 500,
        type: PROBLEM_TYPES.SERVER_ERROR,
        title: "Server Error",
      };

      const result = formatErrorForDisplay(appError);

      expect(result).toEqual({
        title: "Server Error",
        message: "Server error occurred",
        referenceId: undefined,
        type: PROBLEM_TYPES.SERVER_ERROR,
      });
    });
  });

  describe("RFC 9457 Problem Details integration", () => {
    it("handles RFC 9457 compliant response", () => {
      const rfc9457Error = {
        response: {
          status: 422,
          data: {
            type: PROBLEM_TYPES.VALIDATION_ERROR,
            title: "Validation Error",
            status: 422,
            detail: "The request body contains invalid data",
            instance: "/users/123",
            errors: [
              { field: "email", message: "Invalid email format" },
              { field: "name", message: "Name is required" },
            ],
            timestamp: "2023-10-01T12:00:00Z",
          },
        },
      } as AxiosError;

      (axios.isAxiosError as any).mockReturnValue(true);
      (axios.isCancel as any).mockReturnValue(false);

      const result = normalizeAxiosError(rfc9457Error);

      expect(result.type).toBe(PROBLEM_TYPES.VALIDATION_ERROR);
      expect(result.title).toBe("Validation Error");
      expect(result.detail).toBe("The request body contains invalid data");
      expect(result.instance).toBe("/users/123");
      expect(result.errorType).toBe("validation");
      expect(result.status).toBe(422);

      // Extension members should be preserved
      expect((result as any).errors).toEqual([
        { field: "email", message: "Invalid email format" },
        { field: "name", message: "Name is required" },
      ]);
      expect((result as any).timestamp).toBe("2023-10-01T12:00:00Z");
    });

    it("handles rate limiting with retry-after header", () => {
      const rateLimitError = {
        response: {
          status: 429,
          data: {
            type: PROBLEM_TYPES.RATE_LIMIT_EXCEEDED,
            title: "Rate Limit Exceeded",
            status: 429,
            detail: "Too many requests. Please try again later.",
            instance: "/api/users",
          },
          headers: {
            "retry-after": "60",
            "x-request-id": "req-789",
          },
        },
      } as unknown as AxiosError;

      (axios.isAxiosError as any).mockReturnValue(true);
      (axios.isCancel as any).mockReturnValue(false);

      const result = normalizeAxiosError(rateLimitError);

      expect(result.errorType).toBe("rate-limit");
      expect(result.type).toBe(PROBLEM_TYPES.RATE_LIMIT_EXCEEDED);
      expect(result.title).toBe("Rate Limit Exceeded");
      expect(result.retryable).toBe(true);
      expect(result.requestId).toBe("req-789");
      expect(result.retryConfig).toBeDefined();
    });
  });
});
