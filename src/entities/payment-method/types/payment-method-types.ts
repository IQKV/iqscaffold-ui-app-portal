import type {
  PaymentMethod as BasePaymentMethod,
  PaymentMethodType,
  PaymentProvider,
  PaymentMethodData as BasePaymentMethodData,
  PaymentMethodMetadata,
  BillingAddress,
} from "@/shared/types/billing";

// Re-export base types
export type {
  PaymentMethodType,
  PaymentProvider,
  PaymentMethodMetadata,
  BillingAddress,
};
export type PaymentMethod = BasePaymentMethod;
export type PaymentMethodData = BasePaymentMethodData;

// Payment Method-specific business operations
export interface PaymentMethodOperations {
  // Core operations
  getByTenant: (tenantId: string) => Promise<PaymentMethod[]>;
  add: (
    data: PaymentMethodData & { tenantId: string }
  ) => Promise<PaymentMethod>;
  update: (
    id: string,
    updates: Partial<PaymentMethodData>
  ) => Promise<PaymentMethod>;
  delete: (id: string) => Promise<void>;

  // Default management
  setDefault: (
    tenantId: string,
    paymentMethodId: string
  ) => Promise<PaymentMethod>;

  // Validation
  validate: (data: PaymentMethodData) => Promise<ValidationResult>;

  // Provider integration
  tokenize: (data: PaymentMethodData) => Promise<TokenizationResult>;
}

export interface PaymentMethodState {
  paymentMethods: PaymentMethod[];
  defaultPaymentMethod: PaymentMethod | null;
  loading: boolean;
  error: string | null;

  // UI state
  showAddModal: boolean;
  showEditModal: boolean;
  selectedPaymentMethodId: string | null;
  validatingPaymentMethod: boolean;
  deletingPaymentMethod: boolean;
}

// Business logic interfaces
export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

export interface TokenizationResult {
  token: string;
  metadata: PaymentMethodMetadata;
  expiresAt: Date;
}

export interface PaymentMethodValidation {
  cardNumber: boolean;
  expiryDate: boolean;
  cvv: boolean;
  billingAddress: boolean;
  overall: boolean;
  errors: Record<string, string>;
}

export interface ProviderCapabilities {
  supportedTypes: PaymentMethodType[];
  supportedCountries: string[];
  requiresBillingAddress: boolean;
  supportsSaveForLater: boolean;
  supportsRecurringPayments: boolean;
}

export interface PaymentMethodMetrics {
  totalMethods: number;
  methodsByType: Record<PaymentMethodType, number>;
  methodsByProvider: Record<PaymentProvider, number>;
  defaultMethodType: PaymentMethodType | null;
  expiringMethods: PaymentMethod[];
}

// Form-related interfaces
export interface PaymentMethodFormData {
  type: PaymentMethodType;
  provider?: PaymentProvider;

  // Card data
  cardNumber: string;
  expiryMonth: string;
  expiryYear: string;
  cvv: string;
  cardholderName: string;

  // Billing address
  billingAddress: BillingAddress;

  // Provider-specific data
  providerPaymentMethodId?: string;
  metadata?: PaymentMethodMetadata;

  // Options
  setAsDefault: boolean;
  saveForFuture: boolean;
}

export interface CardBrand {
  name: string;
  pattern: RegExp;
  gaps: number[];
  lengths: number[];
  code: {
    name: string;
    size: number;
  };
}

// Provider-specific types
export interface StripePaymentMethodData {
  paymentMethodId: string;
  clientSecret?: string;
  setupIntentId?: string;
}

export interface PayPalPaymentMethodData {
  payerId: string;
  paymentId: string;
  billingAgreementId?: string;
}
