import type {
  Invoice as BaseInvoice,
  InvoiceStatus,
  InvoiceLineItem,
  PaymentAttempt,
  PaymentStatus,
} from "@/shared/types/billing";

// Re-export base types
export type { InvoiceStatus, InvoiceLineItem, PaymentAttempt, PaymentStatus };
export type Invoice = BaseInvoice;

// Invoice-specific business operations
export interface InvoiceOperations {
  // Core operations
  getById: (id: string) => Promise<Invoice>;
  getByTenant: (
    tenantId: string,
    filters?: InvoiceFilters
  ) => Promise<Invoice[]>;

  // Payment operations
  retryPayment: (id: string) => Promise<Invoice>;
  voidInvoice: (id: string) => Promise<Invoice>;

  // Document operations
  downloadPDF: (id: string) => Promise<Blob>;
  sendReminder: (id: string) => Promise<void>;

  // Generation operations
  generateInvoice: (
    subscriptionId: string,
    periodEnd: Date
  ) => Promise<Invoice>;
  previewInvoice: (subscriptionId: string, periodEnd: Date) => Promise<Invoice>;
}

export interface InvoiceState {
  invoices: Invoice[];
  currentInvoice: Invoice | null;
  loading: boolean;
  error: string | null;

  // UI state
  showInvoiceModal: boolean;
  selectedInvoiceId: string | null;
  downloadingPDF: boolean;
  processingPayment: boolean;

  // Pagination
  currentPage: number;
  totalPages: number;
  totalCount: number;
}

export interface InvoiceFilters {
  status?: InvoiceStatus;
  startDate?: Date;
  endDate?: Date;
  minAmount?: number;
  maxAmount?: number;
  subscriptionId?: string;
  page?: number;
  limit?: number;
}

// Business logic interfaces
export interface InvoiceCalculation {
  subtotal: number;
  taxAmount: number;
  discountAmount: number;
  totalAmount: number;
  lineItems: InvoiceLineItem[];
}

export interface PaymentRetryInfo {
  canRetry: boolean;
  nextRetryDate: Date | null;
  attemptsRemaining: number;
  lastFailureReason: string | null;
}

export interface InvoiceMetrics {
  totalInvoices: number;
  paidInvoices: number;
  overdueInvoices: number;
  totalRevenue: number;
  averageInvoiceAmount: number;
  paymentSuccessRate: number;
}

export interface InvoiceAging {
  current: number; // 0-30 days
  thirtyDays: number; // 31-60 days
  sixtyDays: number; // 61-90 days
  ninetyDaysPlus: number; // 90+ days
}

// PDF generation options
export interface PDFGenerationOptions {
  includePaymentHistory: boolean;
  includeUsageDetails: boolean;
  customTemplate?: string;
  locale?: string;
  currency?: string;
}

// Line item calculation helpers
export interface LineItemCalculation {
  description: string;
  quantity: number;
  unitPrice: number;
  amount: number;
  taxRate?: number;
  discountRate?: number;
  period?: {
    start: Date;
    end: Date;
  };
}

export interface InvoiceTemplate {
  id: string;
  name: string;
  description: string;
  template: string;
  variables: string[];
  isDefault: boolean;
}
