/**
 * Invoice Management Hook
 * Business logic for invoice operations and payment processing
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { notifications } from "@mantine/notifications";
import { invoiceApi } from "@/entities/invoice/api/invoice-api";
import { useCurrentTenant } from "@/processes/tenant";
import type {
  Invoice,
  InvoiceFilters,
} from "@/entities/invoice/types/invoice-types";

export const useInvoiceManagement = () => {
  const queryClient = useQueryClient();
  const currentTenant = useCurrentTenant();
  const [selectedInvoices, setSelectedInvoices] = useState<string[]>([]);
  const [filters, setFilters] = useState<InvoiceFilters>({});

  // Fetch invoices
  const {
    data: invoicesResponse,
    isLoading: invoicesLoading,
    error: invoicesError,
  } = useQuery({
    queryKey: ["invoices", currentTenant?.tenantId, filters],
    queryFn: () => invoiceApi.getByTenant(currentTenant!.tenantId, filters),
    enabled: !!currentTenant?.tenantId,
  });

  // Extract invoices array from response
  const invoices = Array.isArray(invoicesResponse)
    ? invoicesResponse
    : invoicesResponse?.data || [];

  // Calculate overdue invoices
  const overdueInvoices = Array.isArray(invoices)
    ? (invoices as Invoice[]).filter(
        (invoice) =>
          invoice.status === "open" && new Date(invoice.dueDate) < new Date()
      )
    : [];

  // Download invoice mutation
  const downloadMutation = useMutation({
    mutationFn: (invoiceId: string) => invoiceApi.downloadPDF(invoiceId),
    onSuccess: (blob, invoiceId) => {
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `invoice-${invoiceId}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      notifications.show({
        title: "Invoice Downloaded",
        message: "Invoice PDF has been downloaded successfully.",
        color: "green",
      });
    },
    onError: (error: any) => {
      notifications.show({
        title: "Download Failed",
        message: error.message || "Failed to download invoice.",
        color: "red",
      });
    },
  });

  // Retry payment mutation
  const retryPaymentMutation = useMutation({
    mutationFn: (invoiceId: string) => invoiceApi.retryPayment(invoiceId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["invoices"] });
      notifications.show({
        title: "Payment Retry Initiated",
        message: "We're attempting to process the payment again.",
        color: "blue",
      });
    },
    onError: (error: any) => {
      notifications.show({
        title: "Payment Retry Failed",
        message: error.message || "Failed to retry payment.",
        color: "red",
      });
    },
  });

  // Bulk download mutation
  const bulkDownloadMutation = useMutation({
    mutationFn: async (invoiceIds: string[]) => {
      // Download each invoice and create a zip file
      const downloads = await Promise.all(
        invoiceIds.map(async (id) => {
          const blob = await invoiceApi.downloadPDF(id);
          return { id, blob };
        })
      );

      // In a real app, you'd create a zip file here
      // For now, we'll download them individually
      downloads.forEach(({ id, blob }) => {
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `invoice-${id}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      });

      return downloads;
    },
    onSuccess: (downloads) => {
      notifications.show({
        title: "Bulk Download Complete",
        message: `Downloaded ${downloads.length} invoices successfully.`,
        color: "green",
      });
      setSelectedInvoices([]);
    },
    onError: (error: any) => {
      notifications.show({
        title: "Bulk Download Failed",
        message: error.message || "Failed to download invoices.",
        color: "red",
      });
    },
  });

  // Bulk retry payment mutation
  const bulkRetryMutation = useMutation({
    mutationFn: async (invoiceIds: string[]) => {
      const results = await Promise.all(
        invoiceIds.map(async (id) => {
          try {
            await invoiceApi.retryPayment(id);
            return { id, success: true };
          } catch (error) {
            return { id, success: false, error };
          }
        })
      );
      return results;
    },
    onSuccess: (results) => {
      queryClient.invalidateQueries({ queryKey: ["invoices"] });
      const successCount = results.filter((r) => r.success).length;
      const failCount = results.length - successCount;

      if (failCount === 0) {
        notifications.show({
          title: "Bulk Payment Retry Initiated",
          message: `Retrying payment for ${successCount} invoices.`,
          color: "blue",
        });
      } else {
        notifications.show({
          title: "Partial Success",
          message: `Retrying ${successCount} payments. ${failCount} failed to retry.`,
          color: "orange",
        });
      }
      setSelectedInvoices([]);
    },
    onError: (error: any) => {
      notifications.show({
        title: "Bulk Retry Failed",
        message: error.message || "Failed to retry payments.",
        color: "red",
      });
    },
  });

  const refreshData = () => {
    queryClient.invalidateQueries({ queryKey: ["invoices"] });
  };

  const isLoading = invoicesLoading;
  const error = invoicesError?.message;

  return {
    // Data
    invoices,
    overdueInvoices,
    selectedInvoices,
    filters,

    // Loading states
    isLoading,
    error,
    isDownloading: downloadMutation.isPending || bulkDownloadMutation.isPending,
    isRetryingPayment:
      retryPaymentMutation.isPending || bulkRetryMutation.isPending,

    // Actions
    downloadInvoice: downloadMutation.mutate,
    retryPayment: retryPaymentMutation.mutate,
    bulkDownload: bulkDownloadMutation.mutate,
    bulkRetryPayment: bulkRetryMutation.mutate,
    setSelectedInvoices,
    setFilters,
    refreshData,
  };
};
