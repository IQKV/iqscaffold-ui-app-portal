import {
  VALIDATION_MESSAGES,
  REGEX_PATTERNS,
  DEFAULTS,
} from "@/shared/constants";

/**
 * Enhanced form field validation utilities
 */

/**
 * Hook for enhanced form field validation
 */
export function useEnhancedFormValidation() {
  const validateEmail = (value: string) => {
    return REGEX_PATTERNS.EMAIL.test(value)
      ? null
      : VALIDATION_MESSAGES.EMAIL_INVALID;
  };

  const validatePassword = (value: string, minLength?: number) => {
    const actualMinLength = minLength ?? DEFAULTS.PASSWORD_MIN_LENGTH;
    if (value.length < actualMinLength) {
      return VALIDATION_MESSAGES.PASSWORD_MIN_LENGTH(actualMinLength);
    }
    if (!REGEX_PATTERNS.PASSWORD_STRENGTH.test(value)) {
      return VALIDATION_MESSAGES.PASSWORD_COMPLEXITY;
    }
    return null;
  };

  const validateRequired = (value: any, fieldName = "This field") => {
    if (
      value === undefined ||
      value === null ||
      value === "" ||
      (Array.isArray(value) && value.length === 0)
    ) {
      return VALIDATION_MESSAGES.REQUIRED(fieldName);
    }
    return null;
  };

  const validateMinLength = (
    value: string,
    minLength: number,
    fieldName = "This field"
  ) => {
    if (value && value.length < minLength) {
      return VALIDATION_MESSAGES.MIN_LENGTH(fieldName, minLength);
    }
    return null;
  };

  const validateMaxLength = (
    value: string,
    maxLength: number,
    fieldName = "This field"
  ) => {
    if (value && value.length > maxLength) {
      return VALIDATION_MESSAGES.MAX_LENGTH(fieldName, maxLength);
    }
    return null;
  };

  const validateNumber = (
    value: number,
    min?: number,
    max?: number,
    fieldName = "This field"
  ) => {
    if (min !== undefined && value < min) {
      return VALIDATION_MESSAGES.MIN_VALUE(fieldName, min);
    }
    if (max !== undefined && value > max) {
      return VALIDATION_MESSAGES.MAX_VALUE(fieldName, max);
    }
    return null;
  };

  return {
    validateEmail,
    validatePassword,
    validateRequired,
    validateMinLength,
    validateMaxLength,
    validateNumber,
  };
}
