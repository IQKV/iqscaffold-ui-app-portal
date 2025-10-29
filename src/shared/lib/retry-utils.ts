/**
 * Retry utilities with exponential backoff and RFC 9457 compliance
 */

import { AxiosRequestConfig } from "axios";
import {
  AppError,
  shouldRetryError,
  calculateRetryDelay,
  RetryConfig,
} from "./rfc9457-problem-details";
import { errorFromAxios } from "./http-error";

/**
 * Helper function to normalize errors to AppError
 */
function normalizeToAppError(error: unknown): AppError {
  // If it's already an AppError, return it as-is
  if (error && typeof error === "object" && "errorType" in error) {
    return error as AppError;
  }
  // Otherwise, convert it using errorFromAxios
  return errorFromAxios(error);
}
import { apiClient } from "../api/base";

/**
 * Retry context for tracking retry attempts
 */
export interface RetryContext {
  attempt: number;
  maxAttempts: number;
  lastError?: AppError;
  startTime: number;
  totalDelay: number;
}

/**
 * Retry options for API requests
 */
export interface RetryOptions {
  /** Custom retry configuration (overrides default) */
  retryConfig?: Partial<RetryConfig>;
  /** Callback called before each retry attempt */
  onRetry?: (context: RetryContext, error: AppError) => void;
  /** Callback called when max retries exceeded */
  onMaxRetriesExceeded?: (context: RetryContext, error: AppError) => void;
  /** Custom retry condition (overrides default logic) */
  shouldRetry?: (error: AppError, attempt: number) => boolean;
}

/**
 * Execute an API request with sophisticated retry logic
 */
export async function executeWithRetry<T>(
  requestConfig: AxiosRequestConfig,
  options: RetryOptions = {}
): Promise<T> {
  const context: RetryContext = {
    attempt: 0,
    maxAttempts: 3, // Default max attempts
    startTime: Date.now(),
    totalDelay: 0,
  };

  while (true) {
    context.attempt++;

    try {
      const response = await apiClient.request<T>(requestConfig);
      return response.data;
    } catch (error) {
      const appError = normalizeToAppError(error);
      context.lastError = appError;

      // Apply custom retry config if provided
      if (options.retryConfig && appError.retryConfig) {
        appError.retryConfig = {
          ...appError.retryConfig,
          ...options.retryConfig,
        };
        context.maxAttempts = appError.retryConfig.maxAttempts;
      }

      // Check if we should retry
      const shouldRetry = options.shouldRetry
        ? options.shouldRetry(appError, context.attempt)
        : shouldRetryError(appError, context.attempt);

      if (!shouldRetry || context.attempt >= context.maxAttempts) {
        // Max retries exceeded
        if (options.onMaxRetriesExceeded) {
          options.onMaxRetriesExceeded(context, appError);
        }
        throw appError;
      }

      // Calculate delay for next attempt
      const delay = appError.retryConfig
        ? calculateRetryDelay(context.attempt, appError.retryConfig)
        : 1000; // Default 1 second

      context.totalDelay += delay;

      // Call retry callback
      if (options.onRetry) {
        options.onRetry(context, appError);
      }

      // Wait before retrying
      await new Promise<void>((resolve) => setTimeout(resolve, delay));
    }
  }
}

/**
 * Create a retry-enabled API request function
 */
export function createRetryableRequest<T>(
  requestConfig: AxiosRequestConfig,
  retryOptions?: RetryOptions
) {
  return () => executeWithRetry<T>(requestConfig, retryOptions);
}

/**
 * Retry wrapper for existing async functions
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  const context: RetryContext = {
    attempt: 0,
    maxAttempts: options.retryConfig?.maxAttempts || 3,
    startTime: Date.now(),
    totalDelay: 0,
  };

  while (true) {
    context.attempt++;

    try {
      return await fn();
    } catch (error) {
      const appError = normalizeToAppError(error);
      context.lastError = appError;

      // Check if we should retry
      const shouldRetry = options.shouldRetry
        ? options.shouldRetry(appError, context.attempt)
        : shouldRetryError(appError, context.attempt);

      if (!shouldRetry || context.attempt >= context.maxAttempts) {
        // Max retries exceeded
        if (options.onMaxRetriesExceeded) {
          options.onMaxRetriesExceeded(context, appError);
        }
        throw appError;
      }

      // Calculate delay for next attempt
      const delay = appError.retryConfig
        ? calculateRetryDelay(context.attempt, appError.retryConfig)
        : 1000; // Default 1 second

      context.totalDelay += delay;

      // Call retry callback
      if (options.onRetry) {
        options.onRetry(context, appError);
      }

      // Wait before retrying
      await new Promise<void>((resolve) => setTimeout(resolve, delay));
    }
  }
}

/**
 * Exponential backoff utility function
 */
export function exponentialBackoff(
  attempt: number,
  baseDelay = 1000,
  maxDelay = 30000,
  multiplier = 2,
  jitter = 0.1
): number {
  const exponentialDelay = baseDelay * multiplier ** (attempt - 1);
  const cappedDelay = Math.min(exponentialDelay, maxDelay);

  // Add jitter to prevent thundering herd
  const jitterAmount = cappedDelay * jitter * Math.random();

  return Math.floor(cappedDelay + jitterAmount);
}

/**
 * Circuit breaker pattern for API requests
 */
export class CircuitBreaker {
  private failures = 0;
  private lastFailureTime = 0;
  private state: "closed" | "open" | "half-open" = "closed";

  constructor(
    private failureThreshold = 5,
    private recoveryTimeout = 60000 // 1 minute
  ) {}

  async execute<T>(fn: () => Promise<T>): Promise<T> {
    if (this.state === "open") {
      if (Date.now() - this.lastFailureTime > this.recoveryTimeout) {
        this.state = "half-open";
      } else {
        throw new Error("Circuit breaker is open");
      }
    }

    try {
      const result = await fn();
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      throw error;
    }
  }

  private onSuccess() {
    this.failures = 0;
    this.state = "closed";
  }

  private onFailure() {
    this.failures++;
    this.lastFailureTime = Date.now();

    if (this.failures >= this.failureThreshold) {
      this.state = "open";
    }
  }

  getState() {
    return {
      state: this.state,
      failures: this.failures,
      lastFailureTime: this.lastFailureTime,
    };
  }

  reset() {
    this.failures = 0;
    this.lastFailureTime = 0;
    this.state = "closed";
  }
}
