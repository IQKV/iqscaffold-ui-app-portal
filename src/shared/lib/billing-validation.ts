import { z } from "zod";
import {
  SubscriptionStatus,
  BillingCycle,
  PlanTier,
  UsageMetricType,
  InvoiceStatus,
  PaymentMethodType,
  PaymentProvider,
  Authority,
  PaymentStatus,
} from "@/shared/types/billing";

/**
 * Base validation schemas for billing entities
 */

// Common field validations
export const tenantIdSchema = z.string().uuid("Invalid tenant ID format");
export const currencySchema = z
  .string()
  .length(3, "Currency must be 3 characters");
export const emailSchema = z.string().email("Invalid email format");
export const phoneSchema = z
  .string()
  .regex(/^\+?[\d\s\-\(\)]+$/, "Invalid phone format");

// Currency amount validation
export const currencyAmountSchema = z
  .number()
  .min(0, "Amount must be positive")
  .max(999999.99, "Amount too large")
  .refine((val) => Number.isFinite(val), "Amount must be a valid number")
  .refine(
    (val) => Math.round(val * 100) / 100 === val,
    "Amount can have at most 2 decimal places"
  );

// Date validation helpers
export const futureDateSchema = z
  .date()
  .refine((date) => date > new Date(), "Date must be in the future");

export const pastDateSchema = z
  .date()
  .refine((date) => date <= new Date(), "Date cannot be in the future");

/**
 * Subscription validation schemas
 */
export const subscriptionStatusSchema = z.nativeEnum(SubscriptionStatus);
export const billingCycleSchema = z.nativeEnum(BillingCycle);

export const subscriptionSchema = z
  .object({
    id: z.string().uuid(),
    tenantId: tenantIdSchema,
    planId: z.string().uuid(),
    status: subscriptionStatusSchema,
    billingCycle: billingCycleSchema,
    currentPeriodStart: z.date(),
    currentPeriodEnd: z.date(),
    trialEnd: z.date().optional(),
    cancelAtPeriodEnd: z.boolean(),
    metadata: z.record(z.any()).default({}),
    createdAt: z.date(),
    updatedAt: z.date(),
  })
  .refine(
    (data) => data.currentPeriodEnd > data.currentPeriodStart,
    "Period end must be after period start"
  )
  .refine(
    (data) => !data.trialEnd || data.trialEnd > data.currentPeriodStart,
    "Trial end must be after period start"
  );

export const createSubscriptionSchema = z.object({
  tenantId: tenantIdSchema,
  planId: z.string().uuid(),
  paymentMethodId: z.string().uuid(),
  trialDays: z.number().int().min(0).max(365).optional(),
});

export const updateSubscriptionSchema = z.object({
  billingCycle: billingCycleSchema.optional(),
  cancelAtPeriodEnd: z.boolean().optional(),
  metadata: z.record(z.any()).optional(),
});

/**
 * Plan validation schemas
 */
export const planTierSchema = z.nativeEnum(PlanTier);

export const planFeatureSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1, "Feature name is required"),
  description: z.string().min(1, "Feature description is required"),
  enabled: z.boolean(),
});

export const planQuotaSchema = z.object({
  metricType: z.nativeEnum(UsageMetricType),
  limit: z.number().int().min(0),
  gracePercentage: z.number().min(0).max(100).default(5),
});

export const planSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1, "Plan name is required"),
  tier: planTierSchema,
  price: currencyAmountSchema,
  currency: currencySchema,
  billingCycle: billingCycleSchema,
  features: z.array(planFeatureSchema),
  quotas: z.array(planQuotaSchema),
  trialDays: z.number().int().min(0).max(365).optional(),
  active: z.boolean(),
});

export const planChangeRequestSchema = z.object({
  subscriptionId: z.string().uuid(),
  newPlanId: z.string().uuid(),
  prorationDate: z.date().optional(),
});

/**
 * Invoice validation schemas
 */
export const invoiceStatusSchema = z.nativeEnum(InvoiceStatus);

export const invoiceLineItemSchema = z
  .object({
    description: z.string().min(1, "Description is required"),
    amount: currencyAmountSchema,
    quantity: z.number().int().min(1),
    unitPrice: currencyAmountSchema,
    period: z
      .object({
        start: z.date(),
        end: z.date(),
      })
      .optional(),
  })
  .refine(
    (data) => Math.abs(data.amount - data.quantity * data.unitPrice) < 0.01,
    "Amount must equal quantity × unit price"
  );

export const paymentAttemptSchema = z.object({
  id: z.string().uuid(),
  amount: currencyAmountSchema,
  status: z.nativeEnum(PaymentStatus),
  paymentMethodId: z.string().uuid(),
  failureReason: z.string().optional(),
  attemptedAt: z.date(),
});

export const invoiceSchema = z
  .object({
    id: z.string().uuid(),
    tenantId: tenantIdSchema,
    subscriptionId: z.string().uuid(),
    number: z.string().min(1, "Invoice number is required"),
    status: invoiceStatusSchema,
    amount: currencyAmountSchema,
    currency: currencySchema,
    dueDate: z.date(),
    paidAt: z.date().optional(),
    lineItems: z
      .array(invoiceLineItemSchema)
      .min(1, "At least one line item required"),
    paymentAttempts: z.array(paymentAttemptSchema),
    createdAt: z.date(),
  })
  .refine((data) => {
    const totalAmount = data.lineItems.reduce(
      (sum, item) => sum + item.amount,
      0
    );
    return Math.abs(totalAmount - data.amount) < 0.01;
  }, "Invoice amount must equal sum of line items");

/**
 * Payment Method validation schemas
 */
export const paymentMethodTypeSchema = z.nativeEnum(PaymentMethodType);
export const paymentProviderSchema = z.nativeEnum(PaymentProvider);

export const billingAddressSchema = z.object({
  line1: z.string().min(1, "Address line 1 is required").max(100),
  line2: z.string().max(100).optional(),
  city: z.string().min(1, "City is required").max(50),
  state: z.string().min(1, "State is required").max(50),
  postalCode: z.string().min(1, "Postal code is required").max(20),
  country: z.string().length(2, "Country must be 2-letter code"),
});

export const creditCardSchema = z.object({
  cardNumber: z
    .string()
    .regex(/^\d{13,19}$/, "Card number must be 13-19 digits")
    .refine((val) => {
      // Luhn algorithm validation
      let sum = 0;
      let isEven = false;
      for (let i = val.length - 1; i >= 0; i--) {
        let digit = parseInt(val.charAt(i), 10);
        if (isEven) {
          digit *= 2;
          if (digit > 9) digit -= 9;
        }
        sum += digit;
        isEven = !isEven;
      }
      return sum % 10 === 0;
    }, "Invalid card number"),
  expiryMonth: z.string().regex(/^(0[1-9]|1[0-2])$/, "Month must be 01-12"),
  expiryYear: z
    .string()
    .regex(/^\d{4}$/, "Year must be 4 digits")
    .refine((year) => {
      const currentYear = new Date().getFullYear();
      const expYear = parseInt(year, 10);
      return expYear >= currentYear && expYear <= currentYear + 20;
    }, "Invalid expiry year"),
  cvv: z.string().regex(/^\d{3,4}$/, "CVV must be 3-4 digits"),
});

export const paymentMethodDataSchema = z
  .object({
    type: paymentMethodTypeSchema,
    cardNumber: z.string().optional(),
    expiryMonth: z.string().optional(),
    expiryYear: z.string().optional(),
    cvv: z.string().optional(),
    billingAddress: billingAddressSchema,
  })
  .superRefine((data, ctx) => {
    if (data.type === PaymentMethodType.CARD) {
      if (!data.cardNumber) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Card number is required for card payments",
          path: ["cardNumber"],
        });
      }
      if (!data.expiryMonth) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Expiry month is required for card payments",
          path: ["expiryMonth"],
        });
      }
      if (!data.expiryYear) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Expiry year is required for card payments",
          path: ["expiryYear"],
        });
      }
      if (!data.cvv) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "CVV is required for card payments",
          path: ["cvv"],
        });
      }
    }
  });

export const paymentMethodSchema = z.object({
  id: z.string().uuid(),
  tenantId: tenantIdSchema,
  type: paymentMethodTypeSchema,
  provider: paymentProviderSchema,
  providerPaymentMethodId: z.string().min(1),
  isDefault: z.boolean(),
  metadata: z.object({
    last4: z.string().optional(),
    brand: z.string().optional(),
    expiryMonth: z.number().int().min(1).max(12).optional(),
    expiryYear: z.number().int().min(2024).optional(),
    country: z.string().length(2).optional(),
  }),
  createdAt: z.date(),
});

/**
 * Usage and Quota validation schemas
 */
export const usageMetricTypeSchema = z.nativeEnum(UsageMetricType);

export const usageMetricSchema = z.object({
  id: z.string().uuid(),
  tenantId: tenantIdSchema,
  metricType: usageMetricTypeSchema,
  value: z.number().min(0),
  period: z.string().min(1),
  timestamp: z.date(),
});

export const quotaStatusSchema = z.object({
  metricType: usageMetricTypeSchema,
  current: z.number().min(0),
  limit: z.number().min(0),
  percentage: z.number().min(0).max(200), // Allow over 100% for grace period
  withinGrace: z.boolean(),
  exceeded: z.boolean(),
});

export const recordUsageSchema = z.object({
  tenantId: tenantIdSchema,
  metricType: usageMetricTypeSchema,
  amount: z.number().min(0),
  metadata: z.record(z.any()).optional(),
});

export const checkQuotaSchema = z.object({
  tenantId: tenantIdSchema,
  metricType: usageMetricTypeSchema,
  amount: z.number().min(0).default(1),
});

/**
 * Authority and Security validation schemas
 */
export const authoritySchema = z.nativeEnum(Authority);

export const userAuthoritySchema = z.object({
  userId: z.string().uuid(),
  tenantId: tenantIdSchema.optional(),
  authorities: z
    .array(authoritySchema)
    .min(1, "At least one authority required"),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const authorityCheckSchema = z.object({
  authority: authoritySchema,
  resource: z.string().min(1),
  action: z.string().min(1),
  tenantId: tenantIdSchema.optional(),
});

/**
 * Form validation schemas for UI components
 */
export const planSelectorFormSchema = z.object({
  selectedPlanId: z.string().uuid("Please select a plan"),
  billingCycle: billingCycleSchema,
});

export const paymentMethodFormSchema = z
  .object({
    type: paymentMethodTypeSchema,
    cardNumber: z.string().min(1, "Card number is required"),
    expiryMonth: z.string().regex(/^(0[1-9]|1[0-2])$/, "Invalid month"),
    expiryYear: z.string().regex(/^\d{4}$/, "Invalid year"),
    cvv: z.string().regex(/^\d{3,4}$/, "Invalid CVV"),
    billingAddress: billingAddressSchema,
    setAsDefault: z.boolean().default(false),
  })
  .refine((data) => {
    // Validate card number with Luhn algorithm
    const cleanNumber = data.cardNumber.replace(/\D/g, "");
    if (cleanNumber.length < 13 || cleanNumber.length > 19) return false;

    let sum = 0;
    let isEven = false;
    for (let i = cleanNumber.length - 1; i >= 0; i--) {
      let digit = parseInt(cleanNumber.charAt(i), 10);
      if (isEven) {
        digit *= 2;
        if (digit > 9) digit -= 9;
      }
      sum += digit;
      isEven = !isEven;
    }
    return sum % 10 === 0;
  }, "Invalid card number");

export const billingAddressFormSchema = billingAddressSchema.extend({
  sameAsShipping: z.boolean().default(false),
});

export const invoiceFilterSchema = z
  .object({
    status: invoiceStatusSchema.optional(),
    startDate: z.date().optional(),
    endDate: z.date().optional(),
    minAmount: currencyAmountSchema.optional(),
    maxAmount: currencyAmountSchema.optional(),
  })
  .refine(
    (data) =>
      !data.startDate || !data.endDate || data.endDate >= data.startDate,
    "End date must be after start date"
  )
  .refine(
    (data) =>
      !data.minAmount || !data.maxAmount || data.maxAmount >= data.minAmount,
    "Max amount must be greater than min amount"
  );

export const usageAnalyticsFilterSchema = z
  .object({
    metricType: usageMetricTypeSchema.optional(),
    startDate: z.date().optional(),
    endDate: z.date().optional(),
    tenantId: tenantIdSchema.optional(),
  })
  .refine(
    (data) =>
      !data.startDate || !data.endDate || data.endDate >= data.startDate,
    "End date must be after start date"
  );

/**
 * Support operation validation schemas
 */
export const extendTrialSchema = z.object({
  subscriptionId: z.string().uuid(),
  extensionDays: z.number().int().min(1).max(365),
  reason: z.string().min(10, "Reason must be at least 10 characters"),
});

export const processRefundSchema = z.object({
  invoiceId: z.string().uuid(),
  amount: currencyAmountSchema.optional(),
  reason: z.string().min(10, "Reason must be at least 10 characters"),
});

export const suspendSubscriptionSchema = z.object({
  subscriptionId: z.string().uuid(),
  reason: z.string().min(10, "Reason must be at least 10 characters"),
});

/**
 * Validation helper functions
 */
export const validateBillingData = {
  subscription: (data: unknown) => subscriptionSchema.parse(data),
  plan: (data: unknown) => planSchema.parse(data),
  invoice: (data: unknown) => invoiceSchema.parse(data),
  paymentMethod: (data: unknown) => paymentMethodSchema.parse(data),
  usageMetric: (data: unknown) => usageMetricSchema.parse(data),
  quotaStatus: (data: unknown) => quotaStatusSchema.parse(data),

  // Form validations
  paymentMethodForm: (data: unknown) => paymentMethodFormSchema.parse(data),
  billingAddressForm: (data: unknown) => billingAddressFormSchema.parse(data),
  planSelectorForm: (data: unknown) => planSelectorFormSchema.parse(data),

  // Filter validations
  invoiceFilter: (data: unknown) => invoiceFilterSchema.parse(data),
  usageAnalyticsFilter: (data: unknown) =>
    usageAnalyticsFilterSchema.parse(data),
};

/**
 * Safe validation functions that return results instead of throwing
 */
export const safeBillingValidation = {
  subscription: (data: unknown) => subscriptionSchema.safeParse(data),
  plan: (data: unknown) => planSchema.safeParse(data),
  invoice: (data: unknown) => invoiceSchema.safeParse(data),
  paymentMethod: (data: unknown) => paymentMethodSchema.safeParse(data),
  paymentMethodForm: (data: unknown) => paymentMethodFormSchema.safeParse(data),
  billingAddressForm: (data: unknown) =>
    billingAddressFormSchema.safeParse(data),
};
