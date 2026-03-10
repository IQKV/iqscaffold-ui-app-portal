import axios, { AxiosError } from "axios";
import {
  AppError,
  AppErrorType,
  ProblemDetail,
  validateProblemDetail,
  extractExtensionMembers,
  determineErrorType,
  DEFAULT_RETRY_CONFIGS,
  PROBLEM_TYPES,
} from "./rfc9457-problem-details";

// Re-export types for backward compatibility
export type { AppError, AppErrorType, ProblemDetail };

function extractRequestId(from: any): string | undefined {
  const headers = (from?.headers ?? {}) as Record<string, string | string[] | undefined>;
  const id =
    headers["x-request-id"] ??
    headers["x-correlation-id"] ??
    headers.traceparent ??
    headers["x-amzn-trace-id"] ??
    headers["request-id"] ??
    undefined;
  if (Array.isArray(id)) {
    return id[0];
  }
  if (typeof id === "string") {
    return id;
  }
  return undefined;
}

function flattenValidationErrors(errors: any): string[] {
  if (!errors) {
    return [];
  }
  // If array of messages
  if (Array.isArray(errors)) {
    return errors.map(String);
  }
  // If object of field -> [messages]
  if (typeof errors === "object") {
    const out: string[] = [];
    for (const key of Object.keys(errors)) {
      const val = (errors as any)[key];
      if (Array.isArray(val)) {
        out.push(...val.map(String));
      } else if (typeof val === "string") {
        out.push(val);
      } else if (val && typeof val === "object") {
        out.push(...flattenValidationErrors(val));
      }
    }
    return out;
  }
  return [String(errors)];
}

/**
 * Extract Problem Details from response data
 */
function extractProblemDetail(data: any): Partial<ProblemDetail> | null {
  if (!data || typeof data !== "object") {
    return null;
  }

  // Check if it's a valid Problem Detail
  if (validateProblemDetail(data)) {
    return data as ProblemDetail;
  }

  // Try to construct Problem Detail from common response formats
  const problemDetail: Partial<ProblemDetail> = {};

  // Extract standard fields
  if (data.type) {
    problemDetail.type = String(data.type);
  }
  if (data.title) {
    problemDetail.title = String(data.title);
  }
  if (data.status) {
    problemDetail.status = Number(data.status);
  }
  if (data.detail) {
    problemDetail.detail = String(data.detail);
  }
  if (data.instance) {
    problemDetail.instance = String(data.instance);
  }

  return Object.keys(problemDetail).length > 0 ? problemDetail : null;
}

export function normalizeAxiosError(err: unknown): AppError {
  // Axios cancellation
  if (axios.isCancel(err)) {
    const cancelError: AppError = {
      errorType: "canceled",
      message: "Request was canceled",
      code: (err as any)?.code,
      cause: err,
      retryable: false,
      type: PROBLEM_TYPES.NETWORK_ERROR,
      title: "Request Canceled",
      detail: "The request was canceled before completion",
    };
    return cancelError;
  }

  const isAxios = axios.isAxiosError(err);
  const ax = err as AxiosError;

  // Network or timeout
  if (isAxios && !ax.response) {
    const code = ax.code;
    const isTimeout = code === "ECONNABORTED" || /timeout/i.test(ax.message || "");

    const errorType = isTimeout ? "timeout" : "network";
    const message = isTimeout ? "Request timed out" : "Network error. Please check your connection";

    const networkError: AppError = {
      errorType,
      message,
      code,
      cause: err,
      retryable: true,
      requestId: extractRequestId(ax),
      retryConfig: DEFAULT_RETRY_CONFIGS[errorType] || undefined,
      type: isTimeout ? PROBLEM_TYPES.TIMEOUT_ERROR : PROBLEM_TYPES.NETWORK_ERROR,
      title: isTimeout ? "Request Timeout" : "Network Error",
      detail: message,
    };
    return networkError;
  }

  if (isAxios && ax.response) {
    const { status, data } = ax.response as { status: number; data: any };
    const hdrRequestId = extractRequestId(ax.response as any);

    // Extract Problem Detail if present
    const problemDetail = extractProblemDetail(data);

    // Try to extract common shapes: Spring Boot, RFC9457, OAuth2, custom
    const message =
      (typeof data === "string" ? data : undefined) ??
      problemDetail?.detail ??
      data?.message ??
      data?.detail ??
      data?.error_description ??
      data?.error ??
      problemDetail?.title ??
      data?.title ??
      ax.message ??
      "Request failed";

    const fieldErrors = getFieldErrorsFromData(data);
    const hasFieldErrors = Object.keys(fieldErrors).length > 0;

    // Flatten validation errors for message combination
    const flattenedErrors = flattenValidationErrors(
      (data as any)?.errors ?? (data as any)?.violations,
    );

    // Use flattened errors if available, otherwise use field error messages
    const allErrors =
      flattenedErrors.length > 0 ? flattenedErrors : Object.values(fieldErrors).flat();

    // Enhanced error type detection
    const errorType = determineErrorType(
      status,
      message,
      ax.code,
      problemDetail?.type,
      hasFieldErrors,
    );

    const retryable =
      errorType === "timeout" ||
      errorType === "network" ||
      errorType === "rate-limit" ||
      (errorType === "server" && status >= 500);

    // Combine message with validation errors if present
    const combinedMessage = allErrors.length > 0 ? `${message}: ${allErrors.join(", ")}` : message;

    // Create Problem Detail
    const problemType = getProblemTypeForError(errorType, status);
    const problemTitle = getProblemTitleForError(errorType, status);

    // Get extension members but exclude standard RFC 9457 fields and our AppError fields
    const extensionMembers = problemDetail ? extractExtensionMembers(problemDetail) : {};
    const { message: _, ...safeExtensions } = extensionMembers; // Remove message to avoid override

    const appError: AppError = {
      errorType,
      message: combinedMessage,
      status,
      code: (data?.code as any) ?? ax.code,
      details: data,
      requestId: hdrRequestId,
      retryable,
      cause: err,
      fieldErrors: hasFieldErrors ? fieldErrors : undefined,
      retryConfig: retryable ? DEFAULT_RETRY_CONFIGS[errorType] || undefined : undefined,
      // RFC 9457 Problem Detail fields
      type: problemDetail?.type ?? problemType,
      title: problemDetail?.title ?? problemTitle,
      detail: problemDetail?.detail ?? combinedMessage,
      instance: problemDetail?.instance ?? (hdrRequestId ? `/errors/${hdrRequestId}` : undefined),
      // Extension members (excluding message to prevent override)
      ...safeExtensions,
    };

    return appError;
  }

  // Non-axios or unknown error
  const anyErr = err as any;
  const unknownError: AppError = {
    errorType: "unknown",
    message: anyErr?.message || "Unexpected error",
    code: anyErr?.code,
    cause: err,
    retryable: false,
    type: "about:blank",
    title: "Unknown Error",
    detail: anyErr?.message || "An unexpected error occurred",
  };
  return unknownError;
}

/**
 * Get Problem Detail type for error type and status
 */
function getProblemTypeForError(errorType: AppErrorType, status?: number): string {
  switch (errorType) {
    case "auth":
      return status === 401
        ? PROBLEM_TYPES.AUTHENTICATION_REQUIRED
        : PROBLEM_TYPES.AUTHORIZATION_FAILED;
    case "validation":
      return PROBLEM_TYPES.VALIDATION_ERROR;
    case "rate-limit":
      return PROBLEM_TYPES.RATE_LIMIT_EXCEEDED;
    case "server":
      return PROBLEM_TYPES.SERVER_ERROR;
    case "network":
      return PROBLEM_TYPES.NETWORK_ERROR;
    case "timeout":
      return PROBLEM_TYPES.TIMEOUT_ERROR;
    case "client":
      return status === 404 ? PROBLEM_TYPES.RESOURCE_NOT_FOUND : "about:blank";
    default:
      return "about:blank";
  }
}

/**
 * Get Problem Detail title for error type and status
 */
function getProblemTitleForError(errorType: AppErrorType, status?: number): string {
  switch (errorType) {
    case "auth":
      return status === 401 ? "Authentication Required" : "Authorization Failed";
    case "validation":
      return "Validation Error";
    case "rate-limit":
      return "Rate Limit Exceeded";
    case "server":
      return "Server Error";
    case "network":
      return "Network Error";
    case "timeout":
      return "Request Timeout";
    case "client":
      return status === 404 ? "Resource Not Found" : "Client Error";
    case "canceled":
      return "Request Canceled";
    default:
      return "Unknown Error";
  }
}

/**
 * Extract field errors from response data
 */
function getFieldErrorsFromData(data: any): Record<string, string[]> {
  const out: Record<string, string[]> = {};
  if (!data) {
    return out;
  }

  // RFC9457-style violations: [{ field/propertyPath, message }]
  const violations = (data as any)?.violations as Array<any> | undefined;
  if (Array.isArray(violations)) {
    for (const v of violations) {
      const field = normalizeFieldKey(
        (v as any)?.field || (v as any)?.propertyPath || (v as any)?.name || "",
      );
      const msg =
        (v as any)?.message ||
        (v as any)?.reason ||
        (v as any)?.detail ||
        (v as any)?.error ||
        "Invalid value";
      if (!field) {
        continue;
      }
      (out[field] = out[field] || []).push(String(msg));
    }
  }

  // errors: { field: [messages] } or { field: "message" }
  const errorsObj = (data as any)?.errors as Record<string, unknown> | undefined;
  if (errorsObj && typeof errorsObj === "object" && !Array.isArray(errorsObj)) {
    for (const key of Object.keys(errorsObj)) {
      const field = normalizeFieldKey(key);
      const val = (errorsObj as Record<string, unknown>)[key];
      if (Array.isArray(val)) {
        (out[field] = out[field] || []).push(...(val as unknown[]).map(String));
      } else if (val != null) {
        (out[field] = out[field] || []).push(String(val));
      }
    }
  }

  // Check for errors array in RFC 9457 format
  const errorsArray = (data as any)?.errors as Array<any> | undefined;
  if (Array.isArray(errorsArray)) {
    for (const error of errorsArray) {
      if (error && typeof error === "object") {
        const field = normalizeFieldKey((error as any).field || "");
        const message = (error as any).message || "Invalid value";
        if (field) {
          (out[field] = out[field] || []).push(String(message));
        }
      }
    }
  }

  return out;
}

export type FieldErrors = Record<string, string[]>;

function normalizeFieldKey(key: string): string {
  if (!key) {
    return key;
  }
  // Convert propertyPath like "user.email" -> "email"
  const parts = key.split(".");
  const last = parts[parts.length - 1];
  // Unify common backend variants to our snake_case form field names
  if (last === "passwordConfirmation" || last === "password-confirmation") {
    return "password_confirmation";
  }
  return last;
}

export function getFieldErrors(err: unknown): FieldErrors {
  const appErr = normalizeAxiosError(err);

  // Use the enhanced field errors from the normalized error
  if (appErr.fieldErrors) {
    return appErr.fieldErrors;
  }

  // Fallback to extracting from details
  return getFieldErrorsFromData(appErr.details);
}

export function toMantineErrors(err: unknown): Record<string, string> {
  const map = getFieldErrors(err);
  const res: Record<string, string> = {};
  for (const k of Object.keys(map)) {
    if (map[k] && map[k].length) {
      res[k] = map[k][0];
    }
  }
  return res;
}

export function getErrorMessage(err: unknown, fallback = "Something went wrong"): string {
  const appErr = normalizeAxiosError(err);
  // Optionally include request id for server/unknown cases to aid debugging
  if (appErr.requestId && (appErr.errorType === "server" || appErr.errorType === "unknown")) {
    return `${appErr.message} (ref: ${appErr.requestId})`;
  }
  return appErr.message || fallback;
}

/**
 * Create an AppError from axios error with RFC 9457 compliance
 * This is the main function to use for converting axios errors
 */
export function errorFromAxios(err: unknown): AppError {
  return normalizeAxiosError(err);
}

/**
 * Format error for display with Problem Details information
 */
export function formatErrorForDisplay(error: AppError): {
  title: string;
  message: string;
  referenceId?: string;
  type?: string;
} {
  return {
    title: error.title || getProblemTitleForError(error.errorType, error.status),
    message: error.detail || error.message,
    referenceId: error.requestId,
    type: error.type,
  };
}
