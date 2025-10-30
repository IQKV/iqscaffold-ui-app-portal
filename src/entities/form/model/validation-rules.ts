import { FormValidationRule } from "./types";
import { t } from "@lingui/core/macro";

// Common validation rules
export const required: FormValidationRule<string> = (value) => {
  return !value || value.trim().length === 0 ? t`This field is required` : null;
};

export const email: FormValidationRule<string> = (value) => {
  if (!value) {
    return null;
  }
  return /^\S+@\S+\.\S+$/.test(value) ? null : t`Invalid email address`;
};

export const minLength =
  (min: number): FormValidationRule<string> =>
  (value) => {
    if (!value) {
      return null;
    }
    return value.length < min ? t`Must be at least ${min} characters` : null;
  };

export const maxLength =
  (max: number): FormValidationRule<string> =>
  (value) => {
    if (!value) {
      return null;
    }
    return value.length > max
      ? t`Must be no more than ${max} characters`
      : null;
  };

export const passwordStrength: FormValidationRule<string> = (value) => {
  if (!value) {
    return null;
  }
  if (value.length < 8) {
    return t`Password must be at least 8 characters`;
  }
  if (!/(?=.*[a-z])/.test(value)) {
    return t`Password must contain at least one lowercase letter`;
  }
  if (!/(?=.*[A-Z])/.test(value)) {
    return t`Password must contain at least one uppercase letter`;
  }
  if (!/(?=.*\d)/.test(value)) {
    return t`Password must contain at least one number`;
  }
  return null;
};

export const confirmPassword: FormValidationRule<string> = (value, values) => {
  if (!value) {
    return null;
  }
  return value !== values?.password ? t`Passwords do not match` : null;
};

export const phoneNumber: FormValidationRule<string> = (value) => {
  if (!value) {
    return null;
  }
  const phoneRegex = /^[+]?[1-9][\d]{0,15}$/;
  return phoneRegex.test(value.replace(/\s/g, ""))
    ? null
    : t`Invalid phone number`;
};

export const url: FormValidationRule<string> = (value) => {
  if (!value) {
    return null;
  }
  try {
    new URL(value);
    return null;
  } catch {
    return t`Invalid URL`;
  }
};

export const numeric: FormValidationRule<string> = (value) => {
  if (!value) {
    return null;
  }
  return /^\d+$/.test(value) ? null : t`Must be a number`;
};

export const alphanumeric: FormValidationRule<string> = (value) => {
  if (!value) {
    return null;
  }
  return /^[a-zA-Z0-9]+$/.test(value)
    ? null
    : t`Must contain only letters and numbers`;
};
