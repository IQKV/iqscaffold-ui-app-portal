import type { UsageMetricType } from "../types/usage-types";

/**
 * Quota Error Handler
 * Provides standardized error handling for quota-related operations
 */
export class QuotaErrorHandler {
  // Standard quota error codes
  static readonly ERROR_CODES = {
    QUOTA_EXCEEDED: "QUOTA_EXCEEDED",
    GRACE_PERIOD_EXCEEDED: "GRACE_PERIOD_EXCEEDED",
    INVALID_METRIC_TYPE: "INVALID_METRIC_TYPE",
    QUOTA_NOT_CONFIGURED: "QUOTA_NOT_CONFIGURED",
    USAGE_RECORDING_FAILED: "USAGE_RECORDING_FAILED",
    QUOTA_CHECK_FAILED: "QUOTA_CHECK_FAILED",
  } as const;

  // Create standardized quota exceeded error
  static createQuotaExceededError(
    metricType: UsageMetricType,
    current: number,
    limit: number,
    requested: number,
    withinGrace: boolean = false
  ): QuotaError {
    const exceeded = current + requested - limit;
    const errorCode = withinGrace
      ? this.ERROR_CODES.GRACE_PERIOD_EXCEEDED
      : this.ERROR_CODES.QUOTA_EXCEEDED;

    return new QuotaError(
      errorCode,
      `${metricType} quota ${withinGrace ? "grace period" : "limit"} exceeded`,
      {
        metricType,
        current,
        limit,
        requested,
        exceeded,
        withinGrace,
        upgradeInfo: {
          suggestedPlan: this.getSuggestedPlan(metricType, current + requested),
          upgradeUrl: `/billing/subscription?upgrade=${metricType}`,
        },
      }
    );
  }

  // Create quota not configured error
  static createQuotaNotConfiguredError(
    metricType: UsageMetricType
  ): QuotaError {
    return new QuotaError(
      this.ERROR_CODES.QUOTA_NOT_CONFIGURED,
      `No quota configuration found for metric: ${metricType}`,
      { metricType }
    );
  }

  // Create usage recording failed error
  static createUsageRecordingError(
    metricType: UsageMetricType,
    amount: number,
    originalError: Error
  ): QuotaError {
    return new QuotaError(
      this.ERROR_CODES.USAGE_RECORDING_FAILED,
      `Failed to record usage for ${metricType}`,
      {
        metricType,
        amount,
        originalError: originalError.message,
      }
    );
  }

  // Create quota check failed error
  static createQuotaCheckError(
    metricType: UsageMetricType,
    originalError: Error
  ): QuotaError {
    return new QuotaError(
      this.ERROR_CODES.QUOTA_CHECK_FAILED,
      `Failed to check quota for ${metricType}`,
      {
        metricType,
        originalError: originalError.message,
      }
    );
  }

  // Handle quota errors with user-friendly messages
  static handleQuotaError(error: QuotaError): {
    userMessage: string;
    technicalMessage: string;
    actionable: boolean;
    suggestedActions: string[];
    upgradeInfo?: {
      suggestedPlan: string;
      upgradeUrl: string;
    };
  } {
    switch (error.code) {
      case this.ERROR_CODES.QUOTA_EXCEEDED:
        return {
          userMessage: `You've reached your ${error.details.metricType} limit. Upgrade your plan to continue.`,
          technicalMessage: error.message,
          actionable: true,
          suggestedActions: [
            "Upgrade to a higher plan",
            "Contact support for assistance",
            "Review your usage patterns",
          ],
          upgradeInfo: error.details.upgradeInfo,
        };

      case this.ERROR_CODES.GRACE_PERIOD_EXCEEDED:
        return {
          userMessage: `You've exceeded your ${error.details.metricType} limit and grace period. Please upgrade to continue.`,
          technicalMessage: error.message,
          actionable: true,
          suggestedActions: [
            "Upgrade your plan immediately",
            "Contact support for emergency extension",
          ],
          upgradeInfo: error.details.upgradeInfo,
        };

      case this.ERROR_CODES.QUOTA_NOT_CONFIGURED:
        return {
          userMessage:
            "There seems to be a configuration issue. Please contact support.",
          technicalMessage: error.message,
          actionable: false,
          suggestedActions: [
            "Contact technical support",
            "Check your subscription status",
          ],
        };

      case this.ERROR_CODES.USAGE_RECORDING_FAILED:
        return {
          userMessage:
            "Unable to process your request at the moment. Please try again.",
          technicalMessage: error.message,
          actionable: true,
          suggestedActions: [
            "Try again in a few moments",
            "Check your internet connection",
            "Contact support if the issue persists",
          ],
        };

      case this.ERROR_CODES.QUOTA_CHECK_FAILED:
        return {
          userMessage: "Unable to verify your usage limits. Please try again.",
          technicalMessage: error.message,
          actionable: true,
          suggestedActions: [
            "Refresh the page",
            "Try again in a few moments",
            "Contact support if the issue persists",
          ],
        };

      default:
        return {
          userMessage: "An unexpected error occurred. Please contact support.",
          technicalMessage: error.message,
          actionable: false,
          suggestedActions: ["Contact technical support"],
        };
    }
  }

  // Get user-friendly metric names
  static getMetricDisplayName(metricType: UsageMetricType): string {
    switch (metricType) {
      case "api_calls":
        return "API Calls";
      case "storage_gb":
        return "Storage";
      case "email_sends":
        return "Email Sends";
      case "active_users":
        return "Active Users";
      default:
        return metricType
          .replace(/_/g, " ")
          .replace(/\b\w/g, (l) => l.toUpperCase());
    }
  }

  // Suggest appropriate plan based on usage
  private static getSuggestedPlan(
    metricType: UsageMetricType,
    projectedUsage: number
  ): string {
    switch (metricType) {
      case "api_calls":
        if (projectedUsage > 1000000) {
          return "enterprise";
        }
        if (projectedUsage > 100000) {
          return "pro";
        }
        return "starter";
      case "storage_gb":
        if (projectedUsage > 1000) {
          return "enterprise";
        }
        if (projectedUsage > 100) {
          return "pro";
        }
        return "starter";
      case "email_sends":
        if (projectedUsage > 50000) {
          return "enterprise";
        }
        if (projectedUsage > 10000) {
          return "pro";
        }
        return "starter";
      case "active_users":
        if (projectedUsage > 1000) {
          return "enterprise";
        }
        if (projectedUsage > 100) {
          return "pro";
        }
        return "starter";
      default:
        return "pro";
    }
  }

  // Check if error is quota-related
  static isQuotaError(error: any): error is QuotaError {
    return (
      error instanceof QuotaError ||
      (error &&
        typeof error === "object" &&
        "code" in error &&
        Object.values(this.ERROR_CODES).includes(error.code))
    );
  }

  // Extract quota information from error
  static extractQuotaInfo(error: QuotaError): {
    metricType?: UsageMetricType;
    current?: number;
    limit?: number;
    exceeded?: number;
    upgradeInfo?: {
      suggestedPlan: string;
      upgradeUrl: string;
    };
  } {
    return {
      metricType: error.details?.metricType,
      current: error.details?.current,
      limit: error.details?.limit,
      exceeded: error.details?.exceeded,
      upgradeInfo: error.details?.upgradeInfo,
    };
  }
}

/**
 * Custom error class for quota-related errors
 */
export class QuotaError extends Error {
  public readonly code: string;
  public readonly details: Record<string, any>;

  constructor(
    code: string,
    message: string,
    details: Record<string, any> = {}
  ) {
    super(message);
    this.name = "QuotaError";
    this.code = code;
    this.details = details;

    // Maintains proper stack trace for where our error was thrown (only available on V8)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, QuotaError);
    }
  }

  // Convert to JSON for API responses
  toJSON() {
    return {
      name: this.name,
      code: this.code,
      message: this.message,
      details: this.details,
    };
  }

  // Create from API error response
  static fromApiError(apiError: any): QuotaError {
    return new QuotaError(
      apiError.code || "UNKNOWN_QUOTA_ERROR",
      apiError.message || "Unknown quota error",
      apiError.details || {}
    );
  }
}
