import { invoiceApi } from "../api/invoice-api";
import type {
  Invoice,
  InvoiceFilters,
  PaymentRetryInfo,
  InvoiceMetrics,
  InvoiceCalculation,
  LineItemCalculation,
  InvoiceAging,
} from "../types/invoice-types";
import type { GenericPaginatedResponse } from "@/shared/types";
import { CurrencyUtils, BillingDateUtils } from "@/shared/lib/billing-utils";

/**
 * Invoice business logic service
 * Contains all invoice-related business rules and calculations
 */
export class InvoiceService {
  // Core operations
  static async getById(invoiceId: string): Promise<Invoice> {
    if (!invoiceId) {
      throw new Error("Invoice ID is required");
    }

    try {
      return await invoiceApi.getById(invoiceId);
    } catch (error) {
      throw new Error(
        `Failed to get invoice: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  }

  static async getByTenant(
    tenantId: string,
    filters?: InvoiceFilters
  ): Promise<GenericPaginatedResponse<Invoice> | Invoice[]> {
    if (!tenantId) {
      throw new Error("Tenant ID is required");
    }

    try {
      return await invoiceApi.getByTenant(tenantId, filters);
    } catch (error) {
      throw new Error(
        `Failed to get invoices: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  }

  // Payment operations
  static async retryPayment(invoiceId: string): Promise<Invoice> {
    if (!invoiceId) {
      throw new Error("Invoice ID is required");
    }

    try {
      return await invoiceApi.retryPayment(invoiceId);
    } catch (error) {
      throw new Error(
        `Failed to retry payment: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  }

  static async voidInvoice(invoiceId: string): Promise<Invoice> {
    if (!invoiceId) {
      throw new Error("Invoice ID is required");
    }

    try {
      return await invoiceApi.voidInvoice(invoiceId);
    } catch (error) {
      throw new Error(
        `Failed to void invoice: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  }

  // Document operations
  static async downloadPDF(invoiceId: string): Promise<Blob> {
    if (!invoiceId) {
      throw new Error("Invoice ID is required");
    }

    try {
      return await invoiceApi.downloadPDF(invoiceId);
    } catch (error) {
      throw new Error(
        `Failed to download PDF: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  }

  // Business logic methods
  static getPaymentRetryInfo(invoice: Invoice): PaymentRetryInfo {
    const maxRetries = 3;
    const retryIntervalHours = 24;

    const failedAttempts = invoice.paymentAttempts.filter(
      (attempt) => attempt.status === "failed"
    );

    const lastAttempt = invoice.paymentAttempts.sort(
      (a, b) =>
        new Date(b.attemptedAt).getTime() - new Date(a.attemptedAt).getTime()
    )[0];

    const attemptsRemaining = Math.max(0, maxRetries - failedAttempts.length);
    const canRetry = attemptsRemaining > 0 && invoice.status === "open";

    let nextRetryDate: Date | null = null;
    if (canRetry && lastAttempt) {
      nextRetryDate = new Date(lastAttempt.attemptedAt);
      nextRetryDate.setHours(nextRetryDate.getHours() + retryIntervalHours);
    }

    return {
      canRetry,
      nextRetryDate,
      attemptsRemaining,
      lastFailureReason: lastAttempt?.failureReason || null,
    };
  }

  static calculateMetrics(invoices: Invoice[]): InvoiceMetrics {
    const totalInvoices = invoices.length;
    const paidInvoices = invoices.filter((i) => i.status === "paid").length;
    const overdueInvoices = invoices.filter((i) => this.isOverdue(i)).length;

    const totalRevenue = invoices
      .filter((i) => i.status === "paid")
      .reduce((sum, invoice) => sum + invoice.amount, 0);

    const averageInvoiceAmount =
      totalInvoices > 0
        ? invoices.reduce((sum, invoice) => sum + invoice.amount, 0) /
          totalInvoices
        : 0;

    const totalAttempts = invoices.reduce(
      (sum, invoice) => sum + invoice.paymentAttempts.length,
      0
    );
    const successfulAttempts = invoices.reduce(
      (sum, invoice) =>
        sum +
        invoice.paymentAttempts.filter(
          (attempt) => attempt.status === "succeeded"
        ).length,
      0
    );

    const paymentSuccessRate =
      totalAttempts > 0 ? (successfulAttempts / totalAttempts) * 100 : 0;

    return {
      totalInvoices,
      paidInvoices,
      overdueInvoices,
      totalRevenue,
      averageInvoiceAmount,
      paymentSuccessRate,
    };
  }

  static calculateInvoiceAging(invoices: Invoice[]): InvoiceAging {
    const now = new Date();
    const aging = {
      current: 0,
      thirtyDays: 0,
      sixtyDays: 0,
      ninetyDaysPlus: 0,
    };

    invoices
      .filter((invoice) => invoice.status === "open")
      .forEach((invoice) => {
        const dueDate = new Date(invoice.dueDate);
        const daysPastDue = Math.floor(
          (now.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24)
        );

        if (daysPastDue <= 0) {
          aging.current += invoice.amount;
        } else if (daysPastDue <= 30) {
          aging.thirtyDays += invoice.amount;
        } else if (daysPastDue <= 60) {
          aging.sixtyDays += invoice.amount;
        } else {
          aging.ninetyDaysPlus += invoice.amount;
        }
      });

    return aging;
  }

  // Status checks
  static isOverdue(invoice: Invoice): boolean {
    return invoice.status === "open" && new Date(invoice.dueDate) < new Date();
  }

  static isPaid(invoice: Invoice): boolean {
    return invoice.status === "paid" && invoice.paidAt !== undefined;
  }

  static canRetryPayment(invoice: Invoice): boolean {
    const retryInfo = this.getPaymentRetryInfo(invoice);
    return retryInfo.canRetry;
  }

  static canVoid(invoice: Invoice): boolean {
    return invoice.status === "open" || invoice.status === "draft";
  }

  // Calculation helpers
  static calculateLineItemTotal(
    lineItems: LineItemCalculation[]
  ): InvoiceCalculation {
    let subtotal = 0;
    let taxAmount = 0;
    let discountAmount = 0;

    const processedLineItems = lineItems.map((item) => {
      const itemSubtotal = item.quantity * item.unitPrice;
      const itemDiscount = item.discountRate
        ? itemSubtotal * (item.discountRate / 100)
        : 0;
      const itemTax = item.taxRate
        ? (itemSubtotal - itemDiscount) * (item.taxRate / 100)
        : 0;
      const itemTotal = itemSubtotal - itemDiscount + itemTax;

      subtotal += itemSubtotal;
      discountAmount += itemDiscount;
      taxAmount += itemTax;

      return {
        description: item.description,
        amount: Math.round(itemTotal * 100) / 100,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        period: item.period,
      };
    });

    const totalAmount = subtotal - discountAmount + taxAmount;

    return {
      subtotal: Math.round(subtotal * 100) / 100,
      taxAmount: Math.round(taxAmount * 100) / 100,
      discountAmount: Math.round(discountAmount * 100) / 100,
      totalAmount: Math.round(totalAmount * 100) / 100,
      lineItems: processedLineItems,
    };
  }

  // Formatting helpers
  static formatInvoiceNumber(invoice: Invoice): string {
    return invoice.number;
  }

  static formatAmount(
    amount: number,
    currency: string = "USD",
    locale: string = "en-US"
  ): string {
    return CurrencyUtils.format(amount, currency, locale);
  }

  static formatDueDate(dueDate: Date, locale: string = "en-US"): string {
    return BillingDateUtils.formatBillingDate(dueDate, locale);
  }

  static getDaysUntilDue(invoice: Invoice): number {
    const now = new Date();
    const dueDate = new Date(invoice.dueDate);
    const diffTime = dueDate.getTime() - now.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  static getDaysPastDue(invoice: Invoice): number {
    const now = new Date();
    const dueDate = new Date(invoice.dueDate);
    const diffTime = now.getTime() - dueDate.getTime();
    return Math.max(0, Math.floor(diffTime / (1000 * 60 * 60 * 24)));
  }

  // Validation helpers
  static validateInvoiceData(invoice: Partial<Invoice>): {
    isValid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];

    if (!invoice.tenantId) {
      errors.push("Tenant ID is required");
    }
    if (!invoice.subscriptionId) {
      errors.push("Subscription ID is required");
    }
    if (!invoice.amount || invoice.amount <= 0) {
      errors.push("Amount must be greater than 0");
    }
    if (!invoice.currency) {
      errors.push("Currency is required");
    }
    if (!invoice.dueDate) {
      errors.push("Due date is required");
    }
    if (!invoice.lineItems || invoice.lineItems.length === 0) {
      errors.push("At least one line item is required");
    }

    // Validate line items sum to total
    if (invoice.lineItems && invoice.amount) {
      const lineItemTotal = invoice.lineItems.reduce(
        (sum, item) => sum + item.amount,
        0
      );
      if (Math.abs(lineItemTotal - invoice.amount) > 0.01) {
        errors.push("Line items total must equal invoice amount");
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  // Bulk operations
  static async downloadMultiplePDFs(invoiceIds: string[]): Promise<Blob[]> {
    if (!invoiceIds.length) {
      throw new Error("At least one invoice ID is required");
    }

    try {
      return await invoiceApi.downloadMultiplePDFs(invoiceIds);
    } catch (error) {
      throw new Error(
        `Failed to download PDFs: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  }

  static async retryMultiplePayments(invoiceIds: string[]): Promise<Invoice[]> {
    if (!invoiceIds.length) {
      throw new Error("At least one invoice ID is required");
    }

    try {
      return await invoiceApi.retryMultiplePayments(invoiceIds);
    } catch (error) {
      throw new Error(
        `Failed to retry payments: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  }

  // Invoice generation
  static async generateInvoice(
    subscriptionId: string,
    periodEnd: Date
  ): Promise<Invoice> {
    if (!subscriptionId) {
      throw new Error("Subscription ID is required");
    }

    if (!periodEnd) {
      throw new Error("Period end date is required");
    }

    if (periodEnd <= new Date()) {
      throw new Error("Period end date must be in the future");
    }

    try {
      return await invoiceApi.generateInvoice(subscriptionId, periodEnd);
    } catch (error) {
      throw new Error(
        `Failed to generate invoice: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  }
}
