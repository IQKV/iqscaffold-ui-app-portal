import { create } from "zustand";
import { devtools, subscribeWithSelector } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";
import type {
  Invoice,
  InvoiceState,
  InvoiceFilters,
  PaymentRetryInfo,
  InvoiceMetrics,
} from "../types/invoice-types";
import { InvoiceService } from "../services/invoice-service";
import type { GenericPaginatedResponse } from "@/shared/types";

interface InvoiceStore extends InvoiceState {
  // Actions
  setInvoices: (invoices: Invoice[]) => void;
  setCurrentInvoice: (invoice: Invoice | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setPagination: (page: number, totalPages: number, totalCount: number) => void;

  // UI Actions
  setShowInvoiceModal: (show: boolean, invoiceId?: string) => void;
  setDownloadingPDF: (downloading: boolean) => void;
  setProcessingPayment: (processing: boolean) => void;

  // Business Operations
  fetchInvoices: (tenantId: string, filters?: InvoiceFilters) => Promise<void>;
  fetchInvoiceById: (invoiceId: string) => Promise<Invoice>;
  retryPayment: (invoiceId: string) => Promise<Invoice>;
  voidInvoice: (invoiceId: string) => Promise<Invoice>;
  downloadPDF: (invoiceId: string) => Promise<Blob>;

  // Selectors
  getInvoiceById: (id: string) => Invoice | undefined;
  getInvoicesByTenant: (tenantId: string) => Invoice[];
  getOverdueInvoices: (tenantId: string) => Invoice[];
  getPaidInvoices: (tenantId: string) => Invoice[];
  getPaymentRetryInfo: (invoiceId: string) => PaymentRetryInfo;
  getInvoiceMetrics: (tenantId: string) => InvoiceMetrics;

  // Utilities
  reset: () => void;
  addInvoice: (invoice: Invoice) => void;
  updateInvoice: (invoiceId: string, updates: Partial<Invoice>) => void;
  removeInvoice: (invoiceId: string) => void;
}

export const useInvoiceStore = create<InvoiceStore>()(
  devtools(
    subscribeWithSelector(
      immer((set, get) => ({
        // Initial state
        invoices: [],
        currentInvoice: null,
        loading: false,
        error: null,
        showInvoiceModal: false,
        selectedInvoiceId: null,
        downloadingPDF: false,
        processingPayment: false,
        currentPage: 1,
        totalPages: 1,
        totalCount: 0,

        // Basic setters
        setInvoices: (invoices: Invoice[]) =>
          set((state) => {
            state.invoices = invoices;
            state.error = null;
          }),

        setCurrentInvoice: (invoice: Invoice | null) =>
          set((state) => {
            state.currentInvoice = invoice;
          }),

        setLoading: (loading: boolean) =>
          set((state) => {
            state.loading = loading;
          }),

        setError: (error: string | null) =>
          set((state) => {
            state.error = error;
            state.loading = false;
          }),

        setPagination: (page: number, totalPages: number, totalCount: number) =>
          set((state) => {
            state.currentPage = page;
            state.totalPages = totalPages;
            state.totalCount = totalCount;
          }),

        // UI Actions
        setShowInvoiceModal: (show: boolean, invoiceId?: string) =>
          set((state) => {
            state.showInvoiceModal = show;
            state.selectedInvoiceId = invoiceId || null;
          }),

        setDownloadingPDF: (downloading: boolean) =>
          set((state) => {
            state.downloadingPDF = downloading;
          }),

        setProcessingPayment: (processing: boolean) =>
          set((state) => {
            state.processingPayment = processing;
          }),

        // Business Operations
        fetchInvoices: async (tenantId: string, filters?: InvoiceFilters) => {
          set((state) => {
            state.loading = true;
            state.error = null;
          });

          try {
            const response = await InvoiceService.getByTenant(
              tenantId,
              filters
            );

            set((state) => {
              if ("data" in response) {
                // Paginated response
                const paginatedResponse =
                  response as GenericPaginatedResponse<Invoice>;
                state.invoices = paginatedResponse.data;
                state.currentPage = paginatedResponse.meta.current_page;
                state.totalPages = paginatedResponse.meta.last_page;
                state.totalCount = paginatedResponse.meta.total;
              } else {
                // Simple array response
                state.invoices = response as Invoice[];
                state.currentPage = 1;
                state.totalPages = 1;
                state.totalCount = (response as Invoice[]).length;
              }
              state.loading = false;
            });
          } catch (error) {
            const errorMessage =
              error instanceof Error
                ? error.message
                : "Failed to fetch invoices";
            set((state) => {
              state.error = errorMessage;
              state.loading = false;
            });
            throw error;
          }
        },

        fetchInvoiceById: async (invoiceId: string) => {
          set((state) => {
            state.loading = true;
            state.error = null;
          });

          try {
            const invoice = await InvoiceService.getById(invoiceId);

            set((state) => {
              state.currentInvoice = invoice;

              // Update in invoices array if it exists
              const index = state.invoices.findIndex((i) => i.id === invoiceId);
              if (index >= 0) {
                state.invoices[index] = invoice;
              }

              state.loading = false;
            });

            return invoice;
          } catch (error) {
            const errorMessage =
              error instanceof Error
                ? error.message
                : "Failed to fetch invoice";
            set((state) => {
              state.error = errorMessage;
              state.loading = false;
            });
            throw error;
          }
        },

        retryPayment: async (invoiceId: string) => {
          set((state) => {
            state.processingPayment = true;
            state.error = null;
          });

          try {
            const invoice = await InvoiceService.retryPayment(invoiceId);

            set((state) => {
              // Update invoice in array
              const index = state.invoices.findIndex((i) => i.id === invoiceId);
              if (index >= 0) {
                state.invoices[index] = invoice;
              }

              // Update current invoice if it matches
              if (state.currentInvoice?.id === invoiceId) {
                state.currentInvoice = invoice;
              }

              state.processingPayment = false;
            });

            return invoice;
          } catch (error) {
            const errorMessage =
              error instanceof Error
                ? error.message
                : "Failed to retry payment";
            set((state) => {
              state.error = errorMessage;
              state.processingPayment = false;
            });
            throw error;
          }
        },

        voidInvoice: async (invoiceId: string) => {
          set((state) => {
            state.loading = true;
            state.error = null;
          });

          try {
            const invoice = await InvoiceService.voidInvoice(invoiceId);

            set((state) => {
              // Update invoice in array
              const index = state.invoices.findIndex((i) => i.id === invoiceId);
              if (index >= 0) {
                state.invoices[index] = invoice;
              }

              // Update current invoice if it matches
              if (state.currentInvoice?.id === invoiceId) {
                state.currentInvoice = invoice;
              }

              state.loading = false;
            });

            return invoice;
          } catch (error) {
            const errorMessage =
              error instanceof Error ? error.message : "Failed to void invoice";
            set((state) => {
              state.error = errorMessage;
              state.loading = false;
            });
            throw error;
          }
        },

        downloadPDF: async (invoiceId: string) => {
          set((state) => {
            state.downloadingPDF = true;
            state.error = null;
          });

          try {
            const blob = await InvoiceService.downloadPDF(invoiceId);

            set((state) => {
              state.downloadingPDF = false;
            });

            return blob;
          } catch (error) {
            const errorMessage =
              error instanceof Error ? error.message : "Failed to download PDF";
            set((state) => {
              state.error = errorMessage;
              state.downloadingPDF = false;
            });
            throw error;
          }
        },

        // Selectors
        getInvoiceById: (id: string) => {
          return get().invoices.find((i) => i.id === id);
        },

        getInvoicesByTenant: (tenantId: string) => {
          return get().invoices.filter((i) => i.tenantId === tenantId);
        },

        getOverdueInvoices: (tenantId: string) => {
          const now = new Date();
          return get().invoices.filter(
            (i) =>
              i.tenantId === tenantId &&
              i.status === "open" &&
              new Date(i.dueDate) < now
          );
        },

        getPaidInvoices: (tenantId: string) => {
          return get().invoices.filter(
            (i) => i.tenantId === tenantId && i.status === "paid"
          );
        },

        getPaymentRetryInfo: (invoiceId: string): PaymentRetryInfo => {
          const invoice = get().getInvoiceById(invoiceId);

          if (!invoice) {
            return {
              canRetry: false,
              nextRetryDate: null,
              attemptsRemaining: 0,
              lastFailureReason: null,
            };
          }

          return InvoiceService.getPaymentRetryInfo(invoice);
        },

        getInvoiceMetrics: (tenantId: string): InvoiceMetrics => {
          const invoices = get().getInvoicesByTenant(tenantId);
          return InvoiceService.calculateMetrics(invoices);
        },

        // Utilities
        reset: () =>
          set((state) => {
            state.invoices = [];
            state.currentInvoice = null;
            state.loading = false;
            state.error = null;
            state.showInvoiceModal = false;
            state.selectedInvoiceId = null;
            state.downloadingPDF = false;
            state.processingPayment = false;
            state.currentPage = 1;
            state.totalPages = 1;
            state.totalCount = 0;
          }),

        addInvoice: (invoice: Invoice) =>
          set((state) => {
            const existingIndex = state.invoices.findIndex(
              (i) => i.id === invoice.id
            );
            if (existingIndex >= 0) {
              state.invoices[existingIndex] = invoice;
            } else {
              state.invoices.unshift(invoice); // Add to beginning for newest first
            }
          }),

        updateInvoice: (invoiceId: string, updates: Partial<Invoice>) =>
          set((state) => {
            const index = state.invoices.findIndex((i) => i.id === invoiceId);
            if (index >= 0) {
              Object.assign(state.invoices[index], updates);
            }

            if (state.currentInvoice?.id === invoiceId) {
              Object.assign(state.currentInvoice, updates);
            }
          }),

        removeInvoice: (invoiceId: string) =>
          set((state) => {
            state.invoices = state.invoices.filter((i) => i.id !== invoiceId);

            if (state.currentInvoice?.id === invoiceId) {
              state.currentInvoice = null;
            }
          }),
      }))
    ),
    { name: "invoice-store" }
  )
);
