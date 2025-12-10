import type {
  PaymentMethodData,
  PaymentMethodMetadata,
  ValidationResult,
  TokenizationResult,
  PaymentMethodType,
} from "../types/payment-method-types";
import { PaymentProvider } from "@/shared/types/billing";

/**
 * Abstract interface for payment providers
 * Defines the contract that all payment providers must implement
 */
export interface PaymentProviderInterface {
  readonly name: PaymentProvider;
  readonly supportedTypes: PaymentMethodType[];
  readonly supportedCountries: string[];
  readonly requiresBillingAddress: boolean;

  /**
   * Initialize the provider with configuration
   */
  initialize(config: PaymentProviderConfig): Promise<void>;

  /**
   * Validate payment method data before tokenization
   */
  validatePaymentMethod(data: PaymentMethodData): Promise<ValidationResult>;

  /**
   * Tokenize payment method data for secure storage
   */
  tokenizePaymentMethod(data: PaymentMethodData): Promise<TokenizationResult>;

  /**
   * Update an existing payment method
   */
  updatePaymentMethod(
    providerPaymentMethodId: string,
    updates: Partial<PaymentMethodData>
  ): Promise<PaymentMethodMetadata>;

  /**
   * Delete a payment method from the provider
   */
  deletePaymentMethod(providerPaymentMethodId: string): Promise<void>;

  /**
   * Process a payment using the payment method
   */
  processPayment(
    providerPaymentMethodId: string,
    amount: number,
    currency: string,
    metadata?: Record<string, any>
  ): Promise<PaymentResult>;

  /**
   * Set up a payment method for recurring payments
   */
  setupRecurringPayment(
    providerPaymentMethodId: string,
    metadata?: Record<string, any>
  ): Promise<RecurringPaymentSetup>;

  /**
   * Handle webhook events from the provider
   */
  handleWebhook(
    payload: string,
    signature: string,
    secret: string
  ): Promise<WebhookEvent>;

  /**
   * Get provider-specific metadata for display
   */
  getDisplayMetadata(
    providerPaymentMethodId: string
  ): Promise<PaymentMethodMetadata>;
}

export interface PaymentProviderConfig {
  apiKey: string;
  secretKey?: string;
  webhookSecret?: string;
  environment: "sandbox" | "production";
  additionalConfig?: Record<string, any>;
}

export interface PaymentResult {
  id: string;
  status: PaymentStatus;
  amount: number;
  currency: string;
  failureReason?: string;
  metadata?: Record<string, any>;
  processedAt: Date;
}

export enum PaymentStatus {
  PENDING = "pending",
  SUCCEEDED = "succeeded",
  FAILED = "failed",
  CANCELED = "canceled",
  REQUIRES_ACTION = "requires_action",
}

export interface RecurringPaymentSetup {
  setupIntentId: string;
  clientSecret?: string;
  status: "requires_payment_method" | "requires_confirmation" | "succeeded";
  metadata?: Record<string, any>;
}

export interface WebhookEvent {
  id: string;
  type: string;
  data: Record<string, any>;
  timestamp: Date;
  processed: boolean;
}

/**
 * Payment provider factory for creating provider instances
 */
export class PaymentProviderFactory {
  private static providers = new Map<PaymentProvider, PaymentProviderInterface>();

  static registerProvider(
    provider: PaymentProvider,
    implementation: PaymentProviderInterface
  ): void {
    this.providers.set(provider, implementation);
  }

  static getProvider(provider: PaymentProvider): PaymentProviderInterface {
    const implementation = this.providers.get(provider);
    if (!implementation) {
      throw new Error(`Payment provider ${provider} not registered`);
    }
    return implementation;
  }

  static getSupportedProviders(): PaymentProvider[] {
    return Array.from(this.providers.keys());
  }

  static getProviderCapabilities(provider: PaymentProvider) {
    const implementation = this.getProvider(provider);
    return {
      supportedTypes: implementation.supportedTypes,
      supportedCountries: implementation.supportedCountries,
      requiresBillingAddress: implementation.requiresBillingAddress,
    };
  }
}

/**
 * Retry configuration for payment operations
 */
export interface RetryConfig {
  maxAttempts: number;
  baseDelayMs: number;
  maxDelayMs: number;
  backoffMultiplier: number;
  jitterMs: number;
}

export const DEFAULT_RETRY_CONFIG: RetryConfig = {
  maxAttempts: 5,
  baseDelayMs: 100,
  maxDelayMs: 30000,
  backoffMultiplier: 2,
  jitterMs: 100,
};

/**
 * Retry utility with exponential backoff
 */
export class PaymentRetryService {
  static async executeWithRetry<T>(
    operation: () => Promise<T>,
    config: RetryConfig = DEFAULT_RETRY_CONFIG
  ): Promise<T> {
    let lastError: Error;
    let delay = config.baseDelayMs;

    for (let attempt = 1; attempt <= config.maxAttempts; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error as Error;

        // Don't retry on certain types of errors
        if (this.isNonRetryableError(error)) {
          throw error;
        }

        // If this was the last attempt, throw the error
        if (attempt === config.maxAttempts) {
          throw lastError;
        }

        // Calculate delay with jitter
        const jitter = Math.random() * config.jitterMs;
        const totalDelay = Math.min(delay + jitter, config.maxDelayMs);

        await this.sleep(totalDelay);

        // Exponential backoff
        delay *= config.backoffMultiplier;
      }
    }

    throw lastError!;
  }

  private static isNonRetryableError(error: any): boolean {
    // Don't retry on validation errors, authentication errors, etc.
    if (error?.code) {
      const nonRetryableCodes = [
        "card_declined",
        "insufficient_funds",
        "invalid_request_error",
        "authentication_required",
        "card_not_supported",
      ];
      return nonRetryableCodes.includes(error.code);
    }

    // Don't retry on 4xx HTTP errors (except 429 - rate limit)
    if (error?.response?.status) {
      const status = error.response.status;
      return status >= 400 && status < 500 && status !== 429;
    }

    return false;
  }

  private static sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}