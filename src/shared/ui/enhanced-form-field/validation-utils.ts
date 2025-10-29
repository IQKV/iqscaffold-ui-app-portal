/**
 * Enhanced form field validation utilities
 */

/**
 * Hook for enhanced form field validation
 */
export function useEnhancedFormValidation() {
  const validateEmail = (value: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(value) ? null : "Please enter a valid email address";
  };

  const validatePassword = (value: string, minLength = 8) => {
    if (value.length < minLength) {
      return `Password must be at least ${minLength} characters long`;
    }
    if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(value)) {
      return "Password must contain at least one uppercase letter, one lowercase letter, and one number";
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
      return `${fieldName} is required`;
    }
    return null;
  };

  const validateMinLength = (
    value: string,
    minLength: number,
    fieldName = "This field"
  ) => {
    if (value && value.length < minLength) {
      return `${fieldName} must be at least ${minLength} characters long`;
    }
    return null;
  };

  const validateMaxLength = (
    value: string,
    maxLength: number,
    fieldName = "This field"
  ) => {
    if (value && value.length > maxLength) {
      return `${fieldName} must be no more than ${maxLength} characters long`;
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
      return `${fieldName} must be at least ${min}`;
    }
    if (max !== undefined && value > max) {
      return `${fieldName} must be no more than ${max}`;
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
