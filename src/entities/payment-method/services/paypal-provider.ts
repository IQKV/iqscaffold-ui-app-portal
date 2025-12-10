import type {
  PaymentMethodData,
  PaymentMethodMetadata,
  ValidationResult,
  TokenizationResult,
} from "../types/payment-method-types";
import { PaymentProvider, PaymentMethodType } from "@/shared/types/billing";
import {
  PaymentProviderInterface,
  PaymentProviderConfig,
  PaymentResult,
  PaymentStatus,
  RecurringPaymentSetup,
  WebhookEvent,
  PaymentRetryService,
  RefundResult,
} from "./payment-provider-interface";

/**
 * PayPal payment provider implementation
 * Handles PayPal-specific payment method operations
 */
export class PayPalPaymentProvider implements PaymentProviderInterface {
  readonly name = PaymentProvider.PAYPAL;
  readonly supportedTypes: PaymentMethodType[] = [PaymentMethodType.CARD, PaymentMethodType.BANK_ACCOUNT];
  readonly supportedCountries = [
    "US",
    "CA",
    "GB",
    "AU",
    "DE",
    "FR",
    "IT",
    "ES",
    "NL",
    "BE",
    "AT",
    "CH",
    "SE",
    "NO",
    "DK",
    "FI",
    "IE",
    "PT",
    "LU",
    "JP",
    "SG",
    "HK",
    "NZ",
    "MX",
    "BR",
    "IN",
  ];
  readonly requiresBillingAddress = false; // PayPal can work without billing address

  private config: PaymentProviderConfig | null = null;
  private paypalSdk: any = null;

  async initialize(config: PaymentProviderConfig): Promise<void> {
    this.config = config;

    try {
      // Load PayPal SDK dynamically
      await this.loadPayPalSDK();

      // Initialize PayPal with client ID
      if (typeof window !== "undefined" && (window as any).paypal) {
        this.paypalSdk = (window as any).paypal;
      } else {
        throw new Error("PayPal SDK not available");
      }
    } catch (error) {
      throw new Error(
        `Failed to initialize PayPal provider: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }

  private async loadPayPalSDK(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (typeof window === "undefined") {
        reject(new Error("PayPal SDK requires browser environment"));
        return;
      }

      // Check if already loaded
      if ((window as any).paypal) {
        resolve();
        return;
      }

      const script = document.createElement("script");
      script.src = `https://www.paypal.com/sdk/js?client-id=${this.config?.apiKey}&vault=true&intent=subscription`;
      script.onload = () => resolve();
      script.onerror = () => reject(new Error("Failed to load PayPal SDK"));
      document.head.appendChild(script);
    });
  }

  async validatePaymentMethod(
    data: PaymentMethodData
  ): Promise<ValidationResult> {
    const errors: string[] = [];
    const warnings: string[] = [];

    // PayPal validation is typically done through their SDK
    // For card payments through PayPal, basic validation
    if (data.type === PaymentMethodType.CARD) {
      if (data.cardNumber && data.cardNumber.replace(/\s/g, "").length < 13) {
        errors.push("Invalid card number");
      }

      if (!data.expiryMonth || !data.expiryYear) {
        errors.push("Expiry date is required");
      } else {
        const currentDate = new Date();
        const currentYear = currentDate.getFullYear();
        const currentMonth = currentDate.getMonth() + 1;

        const expiryYear = parseInt(data.expiryYear, 10);
        const expiryMonth = parseInt(data.expiryMonth, 10);

        const fullExpiryYear =
          expiryYear < 100 ? 2000 + expiryYear : expiryYear;

        if (
          fullExpiryYear < currentYear ||
          (fullExpiryYear === currentYear && expiryMonth < currentMonth)
        ) {
          errors.push("Card has expired");
        }
      }

      if (data.cvv && (data.cvv.length < 3 || data.cvv.length > 4)) {
        errors.push("Invalid CVV");
      }
    }

    // For bank account validation
    if (data.type === PaymentMethodType.BANK_ACCOUNT) {
      // PayPal handles bank account validation through their flow
      // Basic checks can be done here
      if (!data.billingAddress.country) {
        errors.push("Country is required for bank account");
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
    };
  }

  async tokenizePaymentMethod(
    data: PaymentMethodData
  ): Promise<TokenizationResult> {
    if (!this.paypalSdk) {
      throw new Error("PayPal SDK not initialized");
    }

    return PaymentRetryService.executeWithRetry(async () => {
      try {
        // For PayPal, tokenization typically happens through their hosted flow
        // This is a simplified implementation
        const vaultResponse = await this.createVaultedPaymentMethod(data);

        const metadata: PaymentMethodMetadata = {
          last4: vaultResponse.last4 || "****",
          brand: vaultResponse.brand || "paypal",
          country: data.billingAddress.country,
        };

        if (
          data.type === PaymentMethodType.CARD &&
          vaultResponse.expiryMonth &&
          vaultResponse.expiryYear
        ) {
          metadata.expiryMonth = vaultResponse.expiryMonth;
          metadata.expiryYear = vaultResponse.expiryYear;
        }

        return {
          token: vaultResponse.id,
          metadata,
          expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year from now
        };
      } catch (error) {
        throw new Error(
          `PayPal tokenization failed: ${
            error instanceof Error ? error.message : "Unknown error"
          }`
        );
      }
    });
  }

  private async createVaultedPaymentMethod(
    data: PaymentMethodData
  ): Promise<any> {
    // This would typically use PayPal's REST API to create a vaulted payment method
    // For now, we'll simulate the response
    const mockResponse = {
      id: `paypal_pm_${Date.now()}`,
      last4: data.cardNumber?.slice(-4),
      brand: this.detectCardBrand(data.cardNumber || ""),
      expiryMonth: data.expiryMonth
        ? parseInt(data.expiryMonth, 10)
        : undefined,
      expiryYear: data.expiryYear ? parseInt(data.expiryYear, 10) : undefined,
    };

    // In a real implementation, this would make an API call to PayPal
    return new Promise((resolve) => {
      setTimeout(() => resolve(mockResponse), 1000);
    });
  }

  private detectCardBrand(cardNumber: string): string {
    const cleanNumber = cardNumber.replace(/\D/g, "");

    if (/^4/.test(cleanNumber)) {
      return "visa";
    }
    if (/^5[1-5]/.test(cleanNumber)) {
      return "mastercard";
    }
    if (/^3[47]/.test(cleanNumber)) {
      return "amex";
    }
    if (/^6(?:011|5)/.test(cleanNumber)) {
      return "discover";
    }

    return "unknown";
  }

  async updatePaymentMethod(
    providerPaymentMethodId: string,
    updates: Partial<PaymentMethodData>
  ): Promise<PaymentMethodMetadata> {
    return PaymentRetryService.executeWithRetry(async () => {
      try {
        // PayPal typically doesn't allow updating vaulted payment methods
        // You usually need to create a new one
        throw new Error(
          "PayPal does not support updating vaulted payment methods"
        );
      } catch (error) {
        throw new Error(
          `PayPal update failed: ${
            error instanceof Error ? error.message : "Unknown error"
          }`
        );
      }
    });
  }

  async deletePaymentMethod(providerPaymentMethodId: string): Promise<void> {
    return PaymentRetryService.executeWithRetry(async () => {
      try {
        // Make API call to PayPal to delete the vaulted payment method
        await this.makePayPalApiCall(
          `DELETE`,
          `/v1/vault/payment-tokens/${providerPaymentMethodId}`
        );
      } catch (error) {
        throw new Error(
          `PayPal deletion failed: ${
            error instanceof Error ? error.message : "Unknown error"
          }`
        );
      }
    });
  }

  async processPayment(
    providerPaymentMethodId: string,
    amount: number,
    currency: string,
    metadata?: Record<string, any>
  ): Promise<PaymentResult> {
    return PaymentRetryService.executeWithRetry(async () => {
      try {
        const paymentData = {
          intent: "sale",
          payer: {
            payment_method: "paypal",
            funding_instruments: [
              {
                payment_token: {
                  payment_token_id: providerPaymentMethodId,
                },
              },
            ],
          },
          transactions: [
            {
              amount: {
                total: (amount / 100).toFixed(2), // Convert cents to dollars
                currency: currency.toUpperCase(),
              },
            },
          ],
        };

        const response = await this.makePayPalApiCall(
          "POST",
          "/v1/payments/payment",
          paymentData
        );

        return {
          id: response.id,
          status: this.mapPayPalStatus(response.state),
          amount,
          currency,
          metadata: response.metadata,
          processedAt: new Date(),
        };
      } catch (error) {
        return {
          id: "",
          status: PaymentStatus.FAILED,
          amount,
          currency,
          failureReason:
            error instanceof Error ? error.message : "Unknown error",
          processedAt: new Date(),
        };
      }
    });
  }

  async setupRecurringPayment(
    providerPaymentMethodId: string,
    metadata?: Record<string, any>
  ): Promise<RecurringPaymentSetup> {
    return PaymentRetryService.executeWithRetry(async () => {
      try {
        // Create billing agreement for recurring payments
        const agreementData = {
          name: "Subscription Agreement",
          description: "Agreement for recurring subscription payments",
          start_date: new Date(Date.now() + 60000).toISOString(), // Start in 1 minute
          payer: {
            payment_method: "paypal",
            funding_instruments: [
              {
                payment_token: {
                  payment_token_id: providerPaymentMethodId,
                },
              },
            ],
          },
          plan: {
            id: metadata?.planId || "default-plan",
          },
        };

        const response = await this.makePayPalApiCall(
          "POST",
          "/v1/payments/billing-agreements",
          agreementData
        );

        return {
          setupIntentId: response.id,
          status: "succeeded",
          metadata: response,
        };
      } catch (error) {
        throw new Error(
          `PayPal recurring setup failed: ${
            error instanceof Error ? error.message : "Unknown error"
          }`
        );
      }
    });
  }

  async handleWebhook(
    payload: string,
    signature: string,
    secret: string
  ): Promise<WebhookEvent> {
    try {
      // PayPal webhook verification
      const isValid = await this.verifyPayPalWebhook(
        payload,
        signature,
        secret
      );

      if (!isValid) {
        throw new Error("Invalid PayPal webhook signature");
      }

      const event = JSON.parse(payload) as any;

      return {
        id: event.id,
        type: event.event_type,
        data: event.resource,
        timestamp: new Date(event.create_time),
        processed: false,
      };
    } catch (error) {
      throw new Error(
        `PayPal webhook verification failed: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }

  async getDisplayMetadata(
    providerPaymentMethodId: string
  ): Promise<PaymentMethodMetadata> {
    return PaymentRetryService.executeWithRetry(async () => {
      try {
        const response = await this.makePayPalApiCall(
          "GET",
          `/v1/vault/payment-tokens/${providerPaymentMethodId}`
        );

        return {
          last4: response.last4 || "****",
          brand: response.brand || "paypal",
          country: response.billing_address?.country_code,
        };
      } catch (error) {
        throw new Error(
          `PayPal retrieval failed: ${
            error instanceof Error ? error.message : "Unknown error"
          }`
        );
      }
    });
  }

  async processRefund(
    providerPaymentId: string,
    amount: number,
    reason: string,
    metadata?: Record<string, any>
  ): Promise<RefundResult> {
    return PaymentRetryService.executeWithRetry(async () => {
      try {
        const response = await this.makePayPalApiCall(
          "POST",
          `/v2/payments/captures/${providerPaymentId}/refund`,
          {
            amount: {
              value: (amount / 100).toFixed(2), // Convert cents to dollars
              currency_code: metadata?.currency || "USD",
            },
            note_to_payer: reason,
          }
        );

        return {
          id: response.id,
          status: response.status,
          amount,
          currency: metadata?.currency || "USD",
          processedAt: new Date(response.create_time),
          metadata,
        };
      } catch (error) {
        throw new Error(
          `PayPal refund failed: ${
            error instanceof Error ? error.message : "Unknown error"
          }`
        );
      }
    });
  }

  async cancelRefund(providerRefundId: string): Promise<void> {
    // PayPal doesn't support canceling refunds once initiated
    // Refunds are either completed or failed
    throw new Error("PayPal does not support canceling refunds");
  }

  private mapPayPalStatus(paypalStatus: string): PaymentStatus {
    switch (paypalStatus) {
      case "approved":
      case "completed":
        return PaymentStatus.SUCCEEDED;
      case "created":
      case "pending":
        return PaymentStatus.PENDING;
      case "cancelled":
        return PaymentStatus.CANCELED;
      case "failed":
      case "expired":
      default:
        return PaymentStatus.FAILED;
    }
  }

  private async makePayPalApiCall(
    method: string,
    endpoint: string,
    data?: any
  ): Promise<any> {
    if (!this.config) {
      throw new Error("PayPal not configured");
    }

    const baseUrl =
      this.config.environment === "production"
        ? "https://api.paypal.com"
        : "https://api.sandbox.paypal.com";

    // Get access token
    const accessToken = await this.getAccessToken();

    const response = await fetch(`${baseUrl}${endpoint}`, {
      method,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: data ? JSON.stringify(data) : undefined,
    });

    if (!response.ok) {
      const errorData = (await response.json().catch(() => ({}))) as any;
      throw new Error(
        errorData.message || `PayPal API error: ${response.status}`
      );
    }

    return response.json();
  }

  private async getAccessToken(): Promise<string> {
    if (!this.config) {
      throw new Error("PayPal not configured");
    }

    const baseUrl =
      this.config.environment === "production"
        ? "https://api.paypal.com"
        : "https://api.sandbox.paypal.com";

    const credentials = btoa(`${this.config.apiKey}:${this.config.secretKey}`);

    const response = await fetch(`${baseUrl}/v1/oauth2/token`, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: `Basic ${credentials}`,
      },
      body: "grant_type=client_credentials",
    });

    if (!response.ok) {
      throw new Error("Failed to get PayPal access token");
    }

    const data = (await response.json()) as any;
    return data.access_token;
  }

  private async verifyPayPalWebhook(
    payload: string,
    signature: string,
    secret: string
  ): Promise<boolean> {
    // PayPal webhook verification logic
    // This is a simplified implementation
    try {
      const verificationData = {
        auth_algo: "SHA256withRSA",
        cert_id: signature,
        transmission_id: signature,
        webhook_id: secret,
        webhook_event: JSON.parse(payload),
      };

      const response = await this.makePayPalApiCall(
        "POST",
        "/v1/notifications/verify-webhook-signature",
        verificationData
      );

      return response.verification_status === "SUCCESS";
    } catch (error) {
      return false;
    }
  }

  /**
   * Create PayPal button for payment method setup
   */
  createPayPalButton(containerId: string, options: any = {}) {
    if (!this.paypalSdk) {
      throw new Error("PayPal SDK not initialized");
    }

    return this.paypalSdk
      .Buttons({
        style: {
          layout: "vertical",
          color: "blue",
          shape: "rect",
          label: "paypal",
          ...options.style,
        },
        createVaultSetupToken: async () => {
          // Create vault setup token
          const response = await this.makePayPalApiCall(
            "POST",
            "/v3/vault/setup-tokens",
            {
              payment_source: {
                paypal: {
                  usage_type: "MERCHANT",
                  customer_type: "CONSUMER",
                },
              },
            }
          );
          return response.id;
        },
        onApprove: async (data: any) => {
          // Handle approval
          return options.onApprove?.(data);
        },
        onError: (error: any) => {
          // Handle error
          options.onError?.(error);
        },
      })
      .render(`#${containerId}`);
  }
}
