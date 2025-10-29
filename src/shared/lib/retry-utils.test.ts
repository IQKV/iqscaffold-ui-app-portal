import { describe, it, expect, vi, beforeEach } from "vitest";
import { AxiosRequestConfig } from "axios";
import {
  executeWithRetry,
  createRetryableRequest,
  withRetry,
  exponentialBackoff,
  CircuitBreaker,
  type RetryOptions,
  type RetryContext,
} from "./retry-utils";
import { AppError, DEFAULT_RETRY_CONFIGS } from "./rfc9457-problem-details";
import { apiClient } from "../api/base";

// Mock the API client
vi.mock("../api/base", () => ({
  apiClient: {
    request: vi.fn(),
  },
}));

describe("Retry Utilities", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe("executeWithRetry", () => {
    const mockRequest: AxiosRequestConfig = {
      method: "GET",
      url: "/test",
    };

    it("succeeds on first attempt", async () => {
      const mockResponse = { data: { success: true } };
      (apiClient.request as any).mockResolvedValueOnce(mockResponse);

      const result = await executeWithRetry(mockRequest);

      expect(result).toEqual({ success: true });
      expect(apiClient.request).toHaveBeenCalledTimes(1);
    });

    it("retries on network error", async () => {
      const networkError: AppError = {
        errorType: "network",
        message: "Network error",
        retryable: true,
        retryConfig: DEFAULT_RETRY_CONFIGS.network!,
        type: "https://example.com/probs/network-error",
        title: "Network Error",
      };

      const mockResponse = { data: { success: true } };

      (apiClient.request as any)
        .mockRejectedValueOnce(networkError)
        .mockRejectedValueOnce(networkError)
        .mockResolvedValueOnce(mockResponse);

      const retryPromise = executeWithRetry(mockRequest);

      // Fast-forward through the delays
      await vi.runAllTimersAsync();

      const result = await retryPromise;

      expect(result).toEqual({ success: true });
      expect(apiClient.request).toHaveBeenCalledTimes(3);
    });

    it("fails after max retries", async () => {
      const networkError: AppError = {
        errorType: "network",
        message: "Network error",
        retryable: true,
        retryConfig: { ...DEFAULT_RETRY_CONFIGS.network!, maxAttempts: 2 },
        type: "https://example.com/probs/network-error",
        title: "Network Error",
      };

      (apiClient.request as any).mockRejectedValue(networkError);

      const retryPromise = executeWithRetry(mockRequest, {
        retryConfig: { maxAttempts: 2 },
      });

      await vi.runAllTimersAsync();

      await expect(retryPromise).rejects.toEqual(networkError);
      expect(apiClient.request).toHaveBeenCalledTimes(2);
    });

    it("does not retry non-retryable errors", async () => {
      const authError: AppError = {
        errorType: "auth",
        message: "Unauthorized",
        retryable: false,
        type: "https://example.com/probs/authentication-required",
        title: "Authentication Required",
      };

      (apiClient.request as any).mockRejectedValueOnce(authError);

      await expect(executeWithRetry(mockRequest)).rejects.toEqual(authError);
      expect(apiClient.request).toHaveBeenCalledTimes(1);
    });

    it("calls retry callbacks", async () => {
      const networkError: AppError = {
        errorType: "network",
        message: "Network error",
        retryable: true,
        retryConfig: DEFAULT_RETRY_CONFIGS.network!,
        type: "https://example.com/probs/network-error",
        title: "Network Error",
      };

      const onRetry = vi.fn();
      const onMaxRetriesExceeded = vi.fn();

      (apiClient.request as any).mockRejectedValue(networkError);

      const retryPromise = executeWithRetry(mockRequest, {
        retryConfig: { maxAttempts: 2 },
        onRetry,
        onMaxRetriesExceeded,
      });

      await vi.runAllTimersAsync();

      await expect(retryPromise).rejects.toEqual(networkError);

      expect(onRetry).toHaveBeenCalledTimes(1);
      expect(onMaxRetriesExceeded).toHaveBeenCalledTimes(1);

      const retryContext = onRetry.mock.calls[0][0] as RetryContext;
      expect(retryContext.attempt).toBe(2);
      expect(retryContext.maxAttempts).toBe(2);
    });

    it("uses custom shouldRetry function", async () => {
      const serverError: AppError = {
        errorType: "server",
        message: "Server error",
        status: 500,
        retryable: true,
        retryConfig: DEFAULT_RETRY_CONFIGS.server!,
        type: "https://example.com/probs/server-error",
        title: "Server Error",
      };

      const shouldRetry = vi.fn().mockReturnValue(false);

      (apiClient.request as any).mockRejectedValueOnce(serverError);

      await expect(
        executeWithRetry(mockRequest, { shouldRetry })
      ).rejects.toEqual(serverError);

      expect(shouldRetry).toHaveBeenCalledWith(serverError, 1);
      expect(apiClient.request).toHaveBeenCalledTimes(1);
    });
  });

  describe("createRetryableRequest", () => {
    it("creates a retryable request function", async () => {
      const mockRequest: AxiosRequestConfig = {
        method: "GET",
        url: "/test",
      };

      const mockResponse = { data: { success: true } };
      (apiClient.request as any).mockResolvedValueOnce(mockResponse);

      const retryableRequest = createRetryableRequest(mockRequest);
      const result = await retryableRequest();

      expect(result).toEqual({ success: true });
      expect(apiClient.request).toHaveBeenCalledWith(mockRequest);
    });
  });

  describe("withRetry", () => {
    it("retries a function", async () => {
      let attempts = 0;
      const testFunction = vi.fn().mockImplementation(() => {
        attempts++;
        if (attempts < 3) {
          const error: AppError = {
            errorType: "network",
            message: "Network error",
            retryable: true,
            retryConfig: DEFAULT_RETRY_CONFIGS.network!,
            type: "https://example.com/probs/network-error",
            title: "Network Error",
          };
          throw error;
        }
        return "success";
      });

      const retryPromise = withRetry(testFunction);

      await vi.runAllTimersAsync();

      const result = await retryPromise;

      expect(result).toBe("success");
      expect(testFunction).toHaveBeenCalledTimes(3);
    });
  });

  describe("exponentialBackoff", () => {
    it("calculates exponential backoff", () => {
      const delay1 = exponentialBackoff(1, 1000, 30000, 2, 0);
      const delay2 = exponentialBackoff(2, 1000, 30000, 2, 0);
      const delay3 = exponentialBackoff(3, 1000, 30000, 2, 0);

      expect(delay1).toBe(1000);
      expect(delay2).toBe(2000);
      expect(delay3).toBe(4000);
    });

    it("caps delay at maxDelay", () => {
      const delay = exponentialBackoff(10, 1000, 5000, 2, 0);
      expect(delay).toBe(5000);
    });

    it("adds jitter", () => {
      const delays = Array.from({ length: 10 }, () =>
        exponentialBackoff(1, 1000, 30000, 2, 0.5)
      );

      // With jitter, delays should vary
      const uniqueDelays = new Set(delays);
      expect(uniqueDelays.size).toBeGreaterThan(1);

      // All delays should be within expected range
      delays.forEach((delay) => {
        expect(delay).toBeGreaterThanOrEqual(1000);
        expect(delay).toBeLessThanOrEqual(1500); // 1000 + 50% jitter
      });
    });
  });

  describe("CircuitBreaker", () => {
    let circuitBreaker: CircuitBreaker;

    beforeEach(() => {
      circuitBreaker = new CircuitBreaker(3, 5000); // 3 failures, 5 second recovery
    });

    it("executes function when closed", async () => {
      const testFunction = vi.fn().mockResolvedValue("success");

      const result = await circuitBreaker.execute(testFunction);

      expect(result).toBe("success");
      expect(testFunction).toHaveBeenCalledTimes(1);
      expect(circuitBreaker.getState().state).toBe("closed");
    });

    it("opens after failure threshold", async () => {
      const testFunction = vi.fn().mockRejectedValue(new Error("failure"));

      // Cause 3 failures to open the circuit
      for (let i = 0; i < 3; i++) {
        try {
          await circuitBreaker.execute(testFunction);
        } catch (error) {
          // Expected
        }
      }

      expect(circuitBreaker.getState().state).toBe("open");
      expect(circuitBreaker.getState().failures).toBe(3);

      // Next call should fail immediately without calling the function
      await expect(circuitBreaker.execute(testFunction)).rejects.toThrow(
        "Circuit breaker is open"
      );

      expect(testFunction).toHaveBeenCalledTimes(3); // Not called again
    });

    it("transitions to half-open after recovery timeout", async () => {
      const testFunction = vi.fn().mockRejectedValue(new Error("failure"));

      // Open the circuit
      for (let i = 0; i < 3; i++) {
        try {
          await circuitBreaker.execute(testFunction);
        } catch (error) {
          // Expected
        }
      }

      expect(circuitBreaker.getState().state).toBe("open");

      // Fast-forward past recovery timeout
      vi.advanceTimersByTime(6000);

      // Next call should transition to half-open
      testFunction.mockResolvedValueOnce("success");
      const result = await circuitBreaker.execute(testFunction);

      expect(result).toBe("success");
      expect(circuitBreaker.getState().state).toBe("closed");
      expect(circuitBreaker.getState().failures).toBe(0);
    });

    it("can be reset manually", async () => {
      const testFunction = vi.fn().mockRejectedValue(new Error("failure"));

      // Open the circuit
      for (let i = 0; i < 3; i++) {
        try {
          await circuitBreaker.execute(testFunction);
        } catch (error) {
          // Expected
        }
      }

      expect(circuitBreaker.getState().state).toBe("open");

      // Reset the circuit breaker
      circuitBreaker.reset();

      expect(circuitBreaker.getState().state).toBe("closed");
      expect(circuitBreaker.getState().failures).toBe(0);

      // Should work normally now
      testFunction.mockResolvedValueOnce("success");
      const result = await circuitBreaker.execute(testFunction);
      expect(result).toBe("success");
    });
  });
});
