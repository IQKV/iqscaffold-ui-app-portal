import { msg } from "@lingui/core/macro";

/**
 * Application-wide constants
 * Centralized location for all repeatable strings and values
 */

// =============================================================================
// API ENDPOINTS
// =============================================================================

export const API_ENDPOINTS = {
  // Auth endpoints
  AUTH: {
    LOGIN: "/v1/auth/login",
    SIGNUP: "/v1/auth/signup",
    REFRESH: "/v1/auth/refresh",
    LOGOUT: "/v1/auth/logout",
    FORGOT_PASSWORD: "/v1/auth/password/forgot",
    RESET_PASSWORD: "/v1/auth/password/reset",
    VERIFY_EMAIL: "/v1/auth/email/verify",
    RESEND_VERIFICATION: "/v1/auth/email/resend",
    VALIDATE_TOKEN: "/v1/auth/validate",
    LOGOUT_ALL: "/v1/auth/logout-all",
    EMAIL_STATUS: "/v1/auth/email/status",
  },

  // User endpoints
  USERS: {
    ME: "/v1/users/me",
    CHANGE_PASSWORD: "/v1/users/me/password",
    AVATAR: "/v1/users/me/avatar",
    ADMIN_USERS: "/v1/admin/users",
    ADMIN_USER_BY_ID: (id: string | number) => `/v1/admin/users/${id}`,
  },
} as const;

// =============================================================================
// HTTP STATUS CODES
// =============================================================================

export const HTTP_STATUS = {
  // Success
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,

  // Client Errors
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  METHOD_NOT_ALLOWED: 405,
  REQUEST_TIMEOUT: 408,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  TOO_MANY_REQUESTS: 429,

  // Server Errors
  INTERNAL_SERVER_ERROR: 500,
  BAD_GATEWAY: 502,
  SERVICE_UNAVAILABLE: 503,
  GATEWAY_TIMEOUT: 504,
} as const;

// =============================================================================
// VALIDATION MESSAGES
// =============================================================================

export const VALIDATION_MESSAGES = {
  REQUIRED: (fieldName = "This field") => `${fieldName} is required`,
  EMAIL_INVALID: msg`Please enter a valid email address`,
  PASSWORD_MIN_LENGTH: (minLength = 8) =>
    `Password must be at least ${minLength} characters long`,
  PASSWORD_COMPLEXITY: msg`Password must contain at least one uppercase letter, one lowercase letter, and one number`,
  MIN_LENGTH: (fieldName: string, minLength: number) =>
    `${fieldName} must be at least ${minLength} characters long`,
  MAX_LENGTH: (fieldName: string, maxLength: number) =>
    `${fieldName} must be no more than ${maxLength} characters long`,
  MIN_VALUE: (fieldName: string, min: number) =>
    `${fieldName} must be at least ${min}`,
  MAX_VALUE: (fieldName: string, max: number) =>
    `${fieldName} must be no more than ${max}`,
} as const;

// =============================================================================
// NOTIFICATION MESSAGES
// =============================================================================

export const NOTIFICATION_MESSAGES = {
  // Success messages
  SUCCESS: {
    GENERIC: msg`Operation completed successfully`,
    SAVED: msg`Changes saved successfully`,
    CREATED: msg`Created successfully`,
    UPDATED: msg`Updated successfully`,
    DELETED: msg`Deleted successfully`,
    UPLOADED: msg`File uploaded successfully`,
    LANGUAGE_CHANGED: msg`Language changed successfully`,
    REFUND_INITIATED: msg`The payment is being refunded`,
    GATEWAY_CONFIGURED: msg`Payment gateway configured successfully`,
    GATEWAY_ACTIVATED: msg`Gateway activated successfully`,
    GATEWAY_DEACTIVATED: msg`Gateway deactivated successfully`,
    PRIMARY_GATEWAY_UPDATED: msg`Primary gateway updated successfully`,
    GATEWAY_DELETED: msg`Gateway deleted successfully`,
  },

  // Error messages
  ERROR: {
    GENERIC: msg`Something went wrong`,
    NETWORK: msg`Network error occurred`,
    SERVER: msg`Server error`,
    VALIDATION: msg`Validation failed`,
    UNAUTHORIZED: msg`You are not authorized to perform this action`,
    NOT_FOUND: msg`Resource not found`,
    TIMEOUT: msg`Request timed out`,
    RATE_LIMIT: msg`Too many requests. Please try again later`,
    LANGUAGE_CHANGE_FAILED: msg`Failed to change language`,
    REFUND_FAILED: msg`Could not process refund. Please try again`,
    GATEWAY_CONFIG_FAILED: msg`Failed to configure payment gateway`,
    GATEWAY_ACTIVATION_FAILED: msg`Failed to activate gateway`,
    GATEWAY_DEACTIVATION_FAILED: msg`Failed to deactivate gateway`,
    PRIMARY_GATEWAY_FAILED: msg`Failed to set primary gateway`,
    GATEWAY_DELETE_FAILED: msg`Failed to delete gateway`,
  },

  // Warning messages
  WARNING: {
    UNSAVED_CHANGES: msg`You have unsaved changes`,
    RATE_LIMIT_EXCEEDED: (retryAfter: number) =>
      `Too many requests. Please wait ${retryAfter} seconds before trying again`,
    SERVICE_UNAVAILABLE: msg`Service temporarily unavailable`,
    USING_CACHED_DATA: msg`Showing cached data due to connectivity issues`,
  },

  // Info messages
  INFO: {
    LOADING: msg`Loading...`,
    PROCESSING: msg`Processing...`,
    RETRYING: (attempt: number, maxAttempts: number) =>
      `Attempt ${attempt} of ${maxAttempts}...`,
    ERROR_REPORTED: msg`Error has been reported to our team`,
  },
} as const;

// =============================================================================
// CONFIRMATION MESSAGES
// =============================================================================

export const CONFIRMATION_MESSAGES = {
  DELETE: msg`Are you sure you want to delete this item? This action cannot be undone.`,
  REFUND: msg`Are you sure you want to refund this payment? This action cannot be undone.`,
  LOGOUT: msg`Are you sure you want to log out?`,
  DISCARD_CHANGES: msg`Are you sure you want to discard your changes?`,
  RESET_FORM: msg`Are you sure you want to reset the form?`,
} as const;

// =============================================================================
// ENVIRONMENT VARIABLE KEYS
// =============================================================================

export const ENV_KEYS = {
  API_SERVER_URL: "VITE_API_SERVER_URL",
  AUTH_DOMAIN_AUTH: "VITE_AUTH_DOMAIN_AUTH",
  AUTH_DOMAIN_APP: "VITE_AUTH_DOMAIN_APP",
  AUTH_REDIRECT_AFTER_LOGIN: "VITE_AUTH_REDIRECT_AFTER_LOGIN",
  AUTH_REDIRECT_AFTER_LOGOUT: "VITE_AUTH_REDIRECT_AFTER_LOGOUT",
  AUTH_REDIRECT_AFTER_SIGNUP: "VITE_AUTH_REDIRECT_AFTER_SIGNUP",
  STRIPE_PUBLIC_KEY: "VITE_STRIPE_PUBLIC_KEY",
  ENABLE_MSW: "VITE_ENABLE_MSW",
  LOG_LEVEL: "VITE_LOG_LEVEL",
  NODE_ENV: "NODE_ENV",
} as const;

// =============================================================================
// DEFAULT VALUES
// =============================================================================

export const DEFAULTS = {
  AUTH_DOMAIN: "https://auth.iqscaffold.com",
  APP_DOMAIN: "https://app.iqscaffold.com",
  PASSWORD_MIN_LENGTH: 8,
  PAGE_SIZE: 10,
  RETRY_ATTEMPTS: 3,
  TIMEOUT_MS: 5000,
  DEBOUNCE_MS: 300,
} as const;

// =============================================================================
// STORAGE KEYS
// =============================================================================

export const STORAGE_KEYS = {
  ACCESS_TOKEN: "accessToken",
  REFRESH_TOKEN: "refreshToken",
  THEME: "theme",
  LOCALE: "locale",
  USER_PREFERENCES: "userPreferences",
} as const;

// =============================================================================
// REGEX PATTERNS
// =============================================================================

export const REGEX_PATTERNS = {
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PASSWORD_STRENGTH: /(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
  PHONE: /^\+?[\d\s\-()]+$/,
  URL: /^https?:\/\/.+/,
} as const;

// =============================================================================
// ERROR TYPES
// =============================================================================

export const ERROR_TYPES = {
  NETWORK: "network",
  TIMEOUT: "timeout",
  CANCELED: "canceled",
  AUTH: "auth",
  VALIDATION: "validation",
  CLIENT: "client",
  SERVER: "server",
  RATE_LIMIT: "rate-limit",
  UNKNOWN: "unknown",
} as const;

// =============================================================================
// PROBLEM TYPES (RFC 9457)
// =============================================================================

export const PROBLEM_TYPES = {
  VALIDATION_ERROR: "https://example.com/probs/validation-error",
  AUTHENTICATION_REQUIRED: "https://example.com/probs/authentication-required",
  AUTHORIZATION_FAILED: "https://example.com/probs/authorization-failed",
  RESOURCE_NOT_FOUND: "https://example.com/probs/resource-not-found",
  RATE_LIMIT_EXCEEDED: "https://example.com/probs/rate-limit-exceeded",
  SERVER_ERROR: "https://example.com/probs/server-error",
  NETWORK_ERROR: "https://example.com/probs/network-error",
  TIMEOUT_ERROR: "https://example.com/probs/timeout-error",
} as const;

// =============================================================================
// RETRY CONFIGURATIONS
// =============================================================================

export const RETRY_CONFIG = {
  NETWORK: {
    maxAttempts: 3,
    baseDelay: 1000,
    maxDelay: 10000,
    backoffMultiplier: 2,
    jitterFactor: 0.1,
    retryableStatusCodes: [],
  },
  TIMEOUT: {
    maxAttempts: 2,
    baseDelay: 2000,
    maxDelay: 8000,
    backoffMultiplier: 2,
    jitterFactor: 0.1,
    retryableStatusCodes: [HTTP_STATUS.REQUEST_TIMEOUT],
  },
  RATE_LIMIT: {
    maxAttempts: 3,
    baseDelay: 5000,
    maxDelay: 30000,
    backoffMultiplier: 2,
    jitterFactor: 0.2,
    retryableStatusCodes: [HTTP_STATUS.TOO_MANY_REQUESTS],
  },
  SERVER: {
    maxAttempts: 2,
    baseDelay: 1000,
    maxDelay: 5000,
    backoffMultiplier: 2,
    jitterFactor: 0.1,
    retryableStatusCodes: [
      HTTP_STATUS.INTERNAL_SERVER_ERROR,
      HTTP_STATUS.BAD_GATEWAY,
      HTTP_STATUS.SERVICE_UNAVAILABLE,
      HTTP_STATUS.GATEWAY_TIMEOUT,
    ],
  },
} as const;

// =============================================================================
// UI CONSTANTS
// =============================================================================

export const UI_CONSTANTS = {
  MODAL_SIZES: {
    XS: "xs",
    SM: "sm",
    MD: "md",
    LG: "lg",
    XL: "xl",
  },
  NOTIFICATION_POSITIONS: {
    TOP_LEFT: "top-left",
    TOP_RIGHT: "top-right",
    BOTTOM_LEFT: "bottom-left",
    BOTTOM_RIGHT: "bottom-right",
  },
  COLORS: {
    SUCCESS: "green",
    ERROR: "red",
    WARNING: "yellow",
    INFO: "blue",
  },
} as const;

// =============================================================================
// TYPE EXPORTS
// =============================================================================

export type HttpStatusCode = (typeof HTTP_STATUS)[keyof typeof HTTP_STATUS];
export type ErrorType = (typeof ERROR_TYPES)[keyof typeof ERROR_TYPES];
export type ProblemType = (typeof PROBLEM_TYPES)[keyof typeof PROBLEM_TYPES];
export type EnvKey = (typeof ENV_KEYS)[keyof typeof ENV_KEYS];
export type StorageKey = (typeof STORAGE_KEYS)[keyof typeof STORAGE_KEYS];
