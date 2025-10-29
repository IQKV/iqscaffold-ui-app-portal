import { describe, it, expect } from "vitest";
import {
  createProblemDetail,
  validateProblemDetail,
  extractExtensionMembers,
  determineErrorType,
  calculateRetryDelay,
  shouldRetryError,
  DEFAULT_RETRY_CONFIGS,
  PROBLEM_TYPES,
  ERROR_PATTERNS,
  type ProblemDetail,
  type AppError,
} from "./rfc9457-problem-details";

describe("RFC 9457 Problem Details", () => {
  describe("createProblemDetail", () => {
    it("creates a basic problem detail", () => {
      const problem = createProblemDetail(
        "https://example.com/probs/validation-error",
        "Validation Error",
        400,
        "The request body is invalid",
        "/users/123"
      );

      expect(problem).toEqual({
        type: "https://example.com/probs/validation-error",
        title: "Validation Error",
        status: 400,
        detail: "The request body is invalid",
        instance: "/users/123",
      });
    });

    it("creates problem detail with extensions", () => {
      const problem = createProblemDetail(
        PROBLEM_TYPES.VALIDATION_ERROR,
        "Validation Error",
        422,
        "Multiple validation errors occurred",
        undefined,
        {
          errors: [
            { field: "email", message: "Invalid email format" },
            { field: "name", message: "Name is required" },
          ],
          timestamp: "2023-10-01T12:00:00Z",
        }
      );

      expect(problem).toEqual({
        type: PROBLEM_TYPES.VALIDATION_ERROR,
        title: "Validation Error",
        status: 422,
        detail: "Multiple validation errors occurred",
        errors: [
          { field: "email", message: "Invalid email format" },
          { field: "name", message: "Name is required" },
        ],
        timestamp: "2023-10-01T12:00:00Z",
      });
    });

    it("omits undefined optional fields", () => {
      const problem = createProblemDetail(
        "https://example.com/probs/server-error",
        "Server Error"
      );

      expect(problem).toEqual({
        type: "https://example.com/probs/server-error",
        title: "Server Error",
      });
    });
  });

  describe("validateProblemDetail", () => {
    it("validates a correct problem detail", () => {
      const problem: ProblemDetail = {
        type: "https://example.com/probs/validation-error",
        title: "Validation Error",
        status: 400,
        detail: "Invalid input",
        instance: "/users/123",
      };

      expect(validateProblemDetail(problem)).toBe(true);
    });

    it("validates problem detail with only required fields", () => {
      const problem: ProblemDetail = {};
      expect(validateProblemDetail(problem)).toBe(true);
    });

    it("validates problem detail with extension members", () => {
      const problem = {
        type: "https://example.com/probs/validation-error",
        title: "Validation Error",
        status: 400,
        customField: "custom value",
        errors: ["error1", "error2"],
      };

      expect(validateProblemDetail(problem)).toBe(true);
    });

    it("rejects invalid problem details", () => {
      expect(validateProblemDetail(null)).toBe(false);
      expect(validateProblemDetail(undefined)).toBe(false);
      expect(validateProblemDetail("string")).toBe(false);
      expect(validateProblemDetail(123)).toBe(false);
      expect(validateProblemDetail([])).toBe(false);
    });

    it("rejects problem details with invalid field types", () => {
      expect(validateProblemDetail({ type: 123 })).toBe(false);
      expect(validateProblemDetail({ title: 123 })).toBe(false);
      expect(validateProblemDetail({ status: "400" })).toBe(false);
      expect(validateProblemDetail({ detail: 123 })).toBe(false);
      expect(validateProblemDetail({ instance: 123 })).toBe(false);
    });
  });

  describe("extractExtensionMembers", () => {
    it("extracts extension members", () => {
      const problem: ProblemDetail = {
        type: "https://example.com/probs/validation-error",
        title: "Validation Error",
        status: 400,
        detail: "Invalid input",
        instance: "/users/123",
        customField: "custom value",
        errors: ["error1", "error2"],
        timestamp: "2023-10-01T12:00:00Z",
      };

      const extensions = extractExtensionMembers(problem);

      expect(extensions).toEqual({
        customField: "custom value",
        errors: ["error1", "error2"],
        timestamp: "2023-10-01T12:00:00Z",
      });
    });

    it("returns empty object when no extension members", () => {
      const problem: ProblemDetail = {
        type: "https://example.com/probs/validation-error",
        title: "Validation Error",
        status: 400,
        detail: "Invalid input",
        instance: "/users/123",
      };

      const extensions = extractExtensionMembers(problem);
      expect(extensions).toEqual({});
    });
  });

  describe("determineErrorType", () => {
    it("determines auth error from status code", () => {
      expect(determineErrorType(401)).toBe("auth");
      expect(determineErrorType(403)).toBe("auth");
    });

    it("determines validation error from status and field errors", () => {
      expect(
        determineErrorType(400, undefined, undefined, undefined, true)
      ).toBe("validation");
      expect(
        determineErrorType(422, undefined, undefined, undefined, true)
      ).toBe("validation");
    });

    it("determines client error from status without field errors", () => {
      expect(
        determineErrorType(400, undefined, undefined, undefined, false)
      ).toBe("client");
      expect(determineErrorType(404)).toBe("client");
    });

    it("determines timeout error from status and message", () => {
      expect(determineErrorType(408)).toBe("timeout");
      expect(determineErrorType(undefined, "Request timed out")).toBe(
        "timeout"
      );
      expect(determineErrorType(undefined, "Connection timeout")).toBe(
        "timeout"
      );
    });

    it("determines network error from message and code", () => {
      expect(determineErrorType(undefined, "Network error")).toBe("network");
      expect(determineErrorType(undefined, "Connection refused")).toBe(
        "network"
      );
      expect(determineErrorType(undefined, undefined, "ECONNREFUSED")).toBe(
        "network"
      );
      expect(determineErrorType(undefined, undefined, "ENOTFOUND")).toBe(
        "network"
      );
    });

    it("determines rate limit error", () => {
      expect(determineErrorType(429)).toBe("rate-limit");
      expect(determineErrorType(undefined, "Rate limit exceeded")).toBe(
        "rate-limit"
      );
      expect(determineErrorType(undefined, "Too many requests")).toBe(
        "rate-limit"
      );
    });

    it("determines server error from status", () => {
      expect(determineErrorType(500)).toBe("server");
      expect(determineErrorType(502)).toBe("server");
      expect(determineErrorType(503)).toBe("server");
      expect(determineErrorType(504)).toBe("server");
    });

    it("determines error type from problem type", () => {
      expect(
        determineErrorType(
          undefined,
          undefined,
          undefined,
          PROBLEM_TYPES.AUTHENTICATION_REQUIRED
        )
      ).toBe("auth");
      expect(
        determineErrorType(
          undefined,
          undefined,
          undefined,
          PROBLEM_TYPES.VALIDATION_ERROR
        )
      ).toBe("validation");
      expect(
        determineErrorType(
          undefined,
          undefined,
          undefined,
          PROBLEM_TYPES.RATE_LIMIT_EXCEEDED
        )
      ).toBe("rate-limit");
    });

    it("falls back to unknown for unrecognized errors", () => {
      expect(determineErrorType()).toBe("unknown");
      expect(determineErrorType(999)).toBe("unknown");
    });
  });

  describe("calculateRetryDelay", () => {
    const config = DEFAULT_RETRY_CONFIGS.network!;

    it("calculates exponential backoff delay", () => {
      const delay1 = calculateRetryDelay(1, config);
      const delay2 = calculateRetryDelay(2, config);
      const delay3 = calculateRetryDelay(3, config);

      expect(delay1).toBeGreaterThanOrEqual(config.baseDelay * 0.9); // Account for jitter
      expect(delay1).toBeLessThanOrEqual(config.baseDelay * 1.1);

      expect(delay2).toBeGreaterThanOrEqual(config.baseDelay * 2 * 0.9);
      expect(delay2).toBeLessThanOrEqual(config.baseDelay * 2 * 1.1);

      expect(delay3).toBeGreaterThanOrEqual(config.baseDelay * 4 * 0.9);
      expect(delay3).toBeLessThanOrEqual(config.baseDelay * 4 * 1.1);
    });

    it("caps delay at maxDelay", () => {
      const delay = calculateRetryDelay(10, config);
      expect(delay).toBeLessThanOrEqual(config.maxDelay * 1.1); // Account for jitter
    });

    it("includes jitter", () => {
      const delays = Array.from({ length: 10 }, () =>
        calculateRetryDelay(1, config)
      );
      const uniqueDelays = new Set(delays);

      // With jitter, we should get different delays
      expect(uniqueDelays.size).toBeGreaterThan(1);
    });
  });

  describe("shouldRetryError", () => {
    it("returns false for non-retryable errors", () => {
      const authError: AppError = {
        errorType: "auth",
        message: "Unauthorized",
        retryable: false,
        type: PROBLEM_TYPES.AUTHENTICATION_REQUIRED,
        title: "Authentication Required",
      };

      expect(shouldRetryError(authError, 1)).toBe(false);
    });

    it("returns false when max attempts exceeded", () => {
      const networkError: AppError = {
        errorType: "network",
        message: "Network error",
        retryable: true,
        retryConfig: DEFAULT_RETRY_CONFIGS.network!,
        type: PROBLEM_TYPES.NETWORK_ERROR,
        title: "Network Error",
      };

      expect(shouldRetryError(networkError, 4)).toBe(false); // Max attempts is 3
    });

    it("returns true for retryable errors within limits", () => {
      const networkError: AppError = {
        errorType: "network",
        message: "Network error",
        retryable: true,
        retryConfig: DEFAULT_RETRY_CONFIGS.network!,
        type: PROBLEM_TYPES.NETWORK_ERROR,
        title: "Network Error",
      };

      expect(shouldRetryError(networkError, 1)).toBe(true);
      expect(shouldRetryError(networkError, 2)).toBe(true);
      expect(shouldRetryError(networkError, 3)).toBe(true);
    });

    it("checks retryable status codes", () => {
      const serverError: AppError = {
        errorType: "server",
        message: "Server error",
        status: 500,
        retryable: true,
        retryConfig: DEFAULT_RETRY_CONFIGS.server!,
        type: PROBLEM_TYPES.SERVER_ERROR,
        title: "Server Error",
      };

      expect(shouldRetryError(serverError, 1)).toBe(true);

      // Non-retryable status code
      const clientError: AppError = {
        ...serverError,
        status: 400,
        retryConfig: {
          ...DEFAULT_RETRY_CONFIGS.server!,
          retryableStatusCodes: [500, 502, 503],
        },
      };

      expect(shouldRetryError(clientError, 1)).toBe(false);
    });
  });

  describe("DEFAULT_RETRY_CONFIGS", () => {
    it("has configurations for retryable error types", () => {
      expect(DEFAULT_RETRY_CONFIGS.network).toBeDefined();
      expect(DEFAULT_RETRY_CONFIGS.timeout).toBeDefined();
      expect(DEFAULT_RETRY_CONFIGS["rate-limit"]).toBeDefined();
      expect(DEFAULT_RETRY_CONFIGS.server).toBeDefined();
    });

    it("has null configurations for non-retryable error types", () => {
      expect(DEFAULT_RETRY_CONFIGS.auth).toBeNull();
      expect(DEFAULT_RETRY_CONFIGS.validation).toBeNull();
      expect(DEFAULT_RETRY_CONFIGS.client).toBeNull();
      expect(DEFAULT_RETRY_CONFIGS.canceled).toBeNull();
      expect(DEFAULT_RETRY_CONFIGS.unknown).toBeNull();
    });

    it("has valid retry configurations", () => {
      const networkConfig = DEFAULT_RETRY_CONFIGS.network!;

      expect(networkConfig.maxAttempts).toBeGreaterThan(0);
      expect(networkConfig.baseDelay).toBeGreaterThan(0);
      expect(networkConfig.maxDelay).toBeGreaterThan(networkConfig.baseDelay);
      expect(networkConfig.backoffMultiplier).toBeGreaterThan(1);
      expect(networkConfig.jitterFactor).toBeGreaterThanOrEqual(0);
      expect(networkConfig.jitterFactor).toBeLessThanOrEqual(1);
      expect(Array.isArray(networkConfig.retryableStatusCodes)).toBe(true);
    });
  });

  describe("ERROR_PATTERNS", () => {
    it("has patterns for all error types", () => {
      const errorTypes = [
        "auth",
        "validation",
        "timeout",
        "network",
        "rate-limit",
        "server",
      ];

      for (const errorType of errorTypes) {
        expect(
          ERROR_PATTERNS[errorType as keyof typeof ERROR_PATTERNS]
        ).toBeDefined();
      }
    });

    it("has valid pattern structures", () => {
      for (const [errorType, pattern] of Object.entries(ERROR_PATTERNS)) {
        if (pattern.statusCodes) {
          expect(Array.isArray(pattern.statusCodes)).toBe(true);
          expect(
            pattern.statusCodes.every((code) => typeof code === "number")
          ).toBe(true);
        }

        if (pattern.messagePatterns) {
          expect(Array.isArray(pattern.messagePatterns)).toBe(true);
          expect(
            pattern.messagePatterns.every((p) => p instanceof RegExp)
          ).toBe(true);
        }

        if (pattern.codes) {
          expect(Array.isArray(pattern.codes)).toBe(true);
          expect(pattern.codes.every((code) => typeof code === "string")).toBe(
            true
          );
        }

        if (pattern.typePatterns) {
          expect(Array.isArray(pattern.typePatterns)).toBe(true);
          expect(
            pattern.typePatterns.every((type) => typeof type === "string")
          ).toBe(true);
        }
      }
    });
  });

  describe("PROBLEM_TYPES", () => {
    it("has valid URI problem types", () => {
      for (const [key, value] of Object.entries(PROBLEM_TYPES)) {
        expect(typeof value).toBe("string");
        expect(value).toMatch(/^https?:\/\//);
      }
    });

    it("has expected problem types", () => {
      expect(PROBLEM_TYPES.VALIDATION_ERROR).toBeDefined();
      expect(PROBLEM_TYPES.AUTHENTICATION_REQUIRED).toBeDefined();
      expect(PROBLEM_TYPES.AUTHORIZATION_FAILED).toBeDefined();
      expect(PROBLEM_TYPES.RESOURCE_NOT_FOUND).toBeDefined();
      expect(PROBLEM_TYPES.RATE_LIMIT_EXCEEDED).toBeDefined();
      expect(PROBLEM_TYPES.SERVER_ERROR).toBeDefined();
      expect(PROBLEM_TYPES.NETWORK_ERROR).toBeDefined();
      expect(PROBLEM_TYPES.TIMEOUT_ERROR).toBeDefined();
    });
  });
});
