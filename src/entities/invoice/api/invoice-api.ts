import { billingApi } from "@/shared/api/billing-api";
import type { Invoice, InvoiceFilters } from "../types/invoice-types";
import type { GenericPaginatedResponse } from "@/shared/types";

/**
 * Invoice-specific API client
 * Wraps the shared billing API with invoice-focused methods
 */
export class InvoiceApiClient {
  // Core CRUD operations
  async getById(invoiceId: string): Promise<Invoice> {
    return billingApi.getInvoice(invoiceId);
  }

  async getByTenant(
    tenantId: string,
    filters?: InvoiceFilters
  ): Promise<GenericPaginatedResponse<Invoice>> {
    const params = {
      page: filters?.page || 1,
      limit: filters?.limit || 20,
      status: filters?.status,
      startDate: filters?.startDate?.toISOString(),
      endDate: filters?.endDate?.toISOString(),
    };

    return billingApi.getInvoices(tenantId, params);
  }

  async getRecentInvoices(
    tenantId: string,
    limit: number = 5
  ): Promise<Invoice[]> {
    const response = await billingApi.getInvoices(tenantId, {
      page: 1,
      limit,
    });
    return response.data;
  }

  // Payment operations
  async retryPayment(invoiceId: string): Promise<Invoice> {
    return billingApi.retryInvoicePayment(invoiceId);
  }

  async voidInvoice(invoiceId: string): Promise<Invoice> {
    return billingApi.voidInvoice(invoiceId);
  }

  // Document operations
  async downloadPDF(invoiceId: string): Promise<Blob> {
    return billingApi.downloadInvoicePDF(invoiceId);
  }

  // Bulk operations
  async downloadMultiplePDFs(invoiceIds: string[]): Promise<Blob[]> {
    const downloads = invoiceIds.map((id) => this.downloadPDF(id));
    return Promise.all(downloads);
  }

  async retryMultiplePayments(invoiceIds: string[]): Promise<Invoice[]> {
    const retries = invoiceIds.map((id) => this.retryPayment(id));
    return Promise.all(retries);
  }

  // Invoice generation
  async generateInvoice(
    subscriptionId: string,
    periodEnd: Date
  ): Promise<Invoice> {
    return billingApi.generateInvoice(subscriptionId, periodEnd);
  }

  // Search and filtering
  async searchInvoices(
    tenantId: string,
    query: string,
    filters?: Omit<InvoiceFilters, "page" | "limit">
  ): Promise<Invoice[]> {
    // This would need to be implemented in the backend API
    // For now, we'll use the existing getByTenant and filter client-side
    const response = await this.getByTenant(tenantId, {
      ...filters,
      limit: 1000, // Get more results for searching
    });

    const invoices = response.data;

    if (!query.trim()) {
      return invoices;
    }

    const searchTerm = query.toLowerCase();
    return invoices.filter(
      (invoice) =>
        invoice.number.toLowerCase().includes(searchTerm) ||
        invoice.lineItems.some((item) =>
          item.description.toLowerCase().includes(searchTerm)
        )
    );
  }

  // Analytics and reporting
  async getInvoiceAnalytics(
    tenantId: string,
    startDate?: Date,
    endDate?: Date
  ): Promise<{
    totalInvoices: number;
    totalRevenue: number;
    paidInvoices: number;
    overdueInvoices: number;
    averageAmount: number;
  }> {
    const response = await this.getByTenant(tenantId, {
      startDate,
      endDate,
      limit: 1000, // Get all invoices for analytics
    });

    const invoices = response.data;
    const paidInvoices = invoices.filter((i) => i.status === "paid");
    const overdueInvoices = invoices.filter(
      (i) => i.status === "open" && new Date(i.dueDate) < new Date()
    );

    const totalRevenue = paidInvoices.reduce(
      (sum, invoice) => sum + invoice.amount,
      0
    );
    const averageAmount =
      invoices.length > 0 ? totalRevenue / invoices.length : 0;

    return {
      totalInvoices: invoices.length,
      totalRevenue,
      paidInvoices: paidInvoices.length,
      overdueInvoices: overdueInvoices.length,
      averageAmount,
    };
  }
}

// Export singleton instance
export const invoiceApi = new InvoiceApiClient();
