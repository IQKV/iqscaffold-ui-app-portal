/**
 * Invoice Management Page
 * Invoice viewing and payment processing with history and retry functionality
 */

import React from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Container, Stack, Alert } from "@mantine/core";
import { IconInfoCircle } from "@tabler/icons-react";
import { BillingPageLayout } from "@/shared/ui/billing";
import { AuthorityProtectedRoute } from "@/shared/ui";
import { Authority } from "@/shared/types/billing";
import { useInvoiceManagement } from "@/features/invoice-management/model/use-invoice-management";
import { InvoicesList } from "@/features/invoice-management/ui/invoices-list";
import { OverdueInvoicesAlert } from "@/features/invoice-management/ui/overdue-invoices-alert";
import { BulkInvoiceActions } from "@/features/invoice-management/ui/bulk-invoice-actions";

function InvoiceManagementPage() {
  const {
    invoices,
    overdueInvoices,
    selectedInvoices,
    isLoading,
    error,
    downloadInvoice,
    retryPayment,
    bulkDownload,
    bulkRetryPayment,
    setSelectedInvoices,
    isDownloading,
    isRetryingPayment,
    refreshData,
  } = useInvoiceManagement();

  const breadcrumbs = [
    { title: "Dashboard", href: "/dashboard" },
    { title: "Billing", href: "/billing-overview" },
    { title: "Invoices" },
  ];

  const quickActions = [
    {
      label: "Billing Overview",
      icon: <IconInfoCircle size={16} />,
      onClick: () => {
        window.location.href = "/billing-overview";
      },
      variant: "light" as const,
    },
    {
      label: "Subscription",
      icon: <IconInfoCircle size={16} />,
      onClick: () => {
        window.location.href = "/billing/subscription";
      },
      variant: "light" as const,
    },
    {
      label: "Payment Methods",
      icon: <IconInfoCircle size={16} />,
      onClick: () => {
        window.location.href = "/billing/payment-methods";
      },
      variant: "light" as const,
    },
  ];

  if (error) {
    return (
      <BillingPageLayout
        title="Invoice Management"
        description="View and manage your billing invoices and payment history"
        breadcrumbs={breadcrumbs}
        onRefresh={refreshData}
      >
        <Alert color="red" icon={<IconInfoCircle size={16} />}>
          Failed to load invoices: {error}
        </Alert>
      </BillingPageLayout>
    );
  }

  return (
    <BillingPageLayout
      title="Invoice Management"
      description="View and manage your billing invoices and payment history"
      breadcrumbs={breadcrumbs}
      quickActions={quickActions}
      onRefresh={refreshData}
      refreshing={isLoading}
    >
      <Container size="xl" px={0}>
        <Stack gap="xl">
          {/* Overdue Invoices Alert */}
          {overdueInvoices && overdueInvoices.length > 0 && (
            <OverdueInvoicesAlert
              overdueInvoices={overdueInvoices}
              onRetryPayment={retryPayment}
              onDownload={downloadInvoice}
              loading={isRetryingPayment}
            />
          )}

          {/* Bulk Actions */}
          {selectedInvoices.length > 0 && (
            <BulkInvoiceActions
              selectedCount={selectedInvoices.length}
              onBulkDownload={() => bulkDownload(selectedInvoices)}
              onBulkRetryPayment={() => bulkRetryPayment(selectedInvoices)}
              onClearSelection={() => setSelectedInvoices([])}
              downloading={isDownloading}
              retrying={isRetryingPayment}
            />
          )}

          {/* Invoices List */}
          <InvoicesList
            invoices={Array.isArray(invoices) ? invoices : invoices?.data || []}
            selectedInvoices={selectedInvoices}
            onSelectionChange={setSelectedInvoices}
            onDownload={downloadInvoice}
            onRetryPayment={retryPayment}
            loading={isLoading}
            downloading={isDownloading}
            retrying={isRetryingPayment}
          />
        </Stack>
      </Container>
    </BillingPageLayout>
  );
}

export const Route = createFileRoute("/invoice-management")({
  component: () => (
    <AuthorityProtectedRoute
      authorities={[
        Authority.TENANT_ADMIN,
        Authority.PLATFORM_ADMIN,
        Authority.SUPPORT_AGENT,
        Authority.BILLING_VIEWER,
      ]}
    >
      <InvoiceManagementPage />
    </AuthorityProtectedRoute>
  ),
});