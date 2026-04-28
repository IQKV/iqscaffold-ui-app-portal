import { z } from "zod";
import { t } from "@lingui/core/macro";

/**
 * CRM-specific validation schemas
 *
 * This module provides reusable Zod validation schemas for CRM forms
 * following the existing platform patterns from auth.iqkv.site
 *
 * Requirements: 11.1, 11.2, 11.3, 11.4
 */

// Factory function to create CRM validation schemas with Lingui
export const createCrmValidationSchemas = () => ({
  // Lead form validation schemas
  leadName: z
    .string()
    .trim()
    .min(2, t`Name must be at least 2 characters`)
    .max(100, t`Name must be less than 100 characters`),

  leadEmail: z
    .string()
    .trim()
    .min(1, t`Email is required`)
    .email(t`Please enter a valid email address`)
    .max(255, t`Email must be less than 255 characters`),

  leadPhone: z
    .string()
    .regex(/^\+?[\d\s\-()]+$/, t`Please enter a valid phone number`)
    .optional()
    .or(z.literal("")),

  leadCompany: z
    .string()
    .trim()
    .max(200, t`Company name must be less than 200 characters`)
    .optional()
    .or(z.literal("")),

  leadSource: z.enum(
    [
      "WEBSITE",
      "REFERRAL",
      "COLD_CALL",
      "EMAIL_CAMPAIGN",
      "SOCIAL_MEDIA",
      "TRADE_SHOW",
      "PARTNER",
      "OTHER",
    ] as const,
    {
      errorMap: () => ({ message: t`Please select a lead source` }),
    },
  ),

  // Follow-up form validation schemas
  followUpDescription: z
    .string()
    .trim()
    .min(3, t`Description must be at least 3 characters`)
    .max(500, t`Description must be less than 500 characters`),

  followUpDueDate: z.date({
    required_error: t`Due date is required`,
    invalid_type_error: t`Invalid date`,
  }),

  followUpPriority: z.enum(["LOW", "MEDIUM", "HIGH"] as const, {
    errorMap: () => ({ message: t`Please select a priority` }),
  }),

  followUpType: z.enum(["CALL", "EMAIL", "MEETING", "TASK"] as const, {
    errorMap: () => ({ message: t`Please select a follow-up type` }),
  }),

  // Note validation schemas
  noteContent: z
    .string()
    .trim()
    .min(1, t`Note content is required`)
    .max(2000, t`Note must be less than 2000 characters`),

  // Search and filter validation
  searchTerm: z
    .string()
    .max(100, t`Search term must be less than 100 characters`)
    .optional()
    .or(z.literal("")),
});

// Lazy initialization proxy for validation schemas
let _crmValidationSchemas: ReturnType<typeof createCrmValidationSchemas> | null = null;

export const crmValidationSchemas = new Proxy({} as ReturnType<typeof createCrmValidationSchemas>, {
  get(target, prop) {
    if (!_crmValidationSchemas) {
      _crmValidationSchemas = createCrmValidationSchemas();
    }
    return _crmValidationSchemas[prop as keyof typeof _crmValidationSchemas];
  },
});

/**
 * Lead form schema with all validations
 * Requirements: 11.1, 11.2
 */
export const createLeadFormSchema = () => {
  const schemas = createCrmValidationSchemas();
  return z.object({
    firstName: schemas.leadName,
    lastName: schemas.leadName,
    email: schemas.leadEmail,
    phone: schemas.leadPhone,
    company: schemas.leadCompany,
    source: schemas.leadSource,
  });
};

export type LeadFormData = z.infer<ReturnType<typeof createLeadFormSchema>>;

/**
 * Follow-up form schema with date constraints
 * Requirements: 11.4
 */
export const createFollowUpFormSchema = () => {
  const schemas = createCrmValidationSchemas();
  return z.object({
    description: schemas.followUpDescription,
    dueDate: schemas.followUpDueDate,
    priority: schemas.followUpPriority,
    type: schemas.followUpType,
  });
};

export type FollowUpFormData = z.infer<ReturnType<typeof createFollowUpFormSchema>>;

/**
 * Note form schema
 */
export const createNoteFormSchema = () => {
  const schemas = createCrmValidationSchemas();
  return z.object({
    content: schemas.noteContent,
  });
};

export type NoteFormData = z.infer<ReturnType<typeof createNoteFormSchema>>;

/**
 * Utility to check if a date is in the past
 * Used for follow-up date warnings (Requirement 11.4)
 */
export const isPastDate = (date: Date): boolean => {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const checkDate = new Date(date);
  checkDate.setHours(0, 0, 0, 0);
  return checkDate < now;
};

/**
 * Utility to check if a date is today
 */
export const isToday = (date: Date): boolean => {
  const now = new Date();
  const checkDate = new Date(date);
  return (
    checkDate.getDate() === now.getDate() &&
    checkDate.getMonth() === now.getMonth() &&
    checkDate.getFullYear() === now.getFullYear()
  );
};

/**
 * Utility to format validation errors for display
 */
export const formatValidationError = (error: z.ZodError): Record<string, string> => {
  const errors: Record<string, string> = {};
  error.errors.forEach((err) => {
    const path = err.path.join(".");
    errors[path] = err.message;
  });
  return errors;
};

/**
 * Email duplicate validation helper
 * This should be called after API validation (Requirement 11.3)
 */
export const isDuplicateEmailError = (error: any): boolean => {
  const errorMessage = error?.response?.data?.message || error?.message || "";
  return (
    errorMessage.toLowerCase().includes("duplicate") ||
    errorMessage.toLowerCase().includes("already exists") ||
    (errorMessage.toLowerCase().includes("email") && errorMessage.toLowerCase().includes("taken"))
  );
};

/**
 * Get user-friendly error message for duplicate email
 * Requirement: 11.3
 */
export const getDuplicateEmailMessage = (): string => {
  return t`A lead with this email already exists`;
};
