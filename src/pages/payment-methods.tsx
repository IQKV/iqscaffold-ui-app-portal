/**
 * Payment Methods Page
 * Payment instrument management with provider integration
 */

import React from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Container, Stack, Grid, Alert } from "@mantine/core";
import { IconInfoCircle } from "@tabler/icons-react";
import { BillingPageLayout } from "@/shared/ui/billing";
import { AuthorityProtectedRoute } from "@/shared/ui";
import { Authority } from "@/shared/types";
import { usePaymentMethodsManagement } from "@/features/payment-processing/model/use-payment-methods-management";
import { PaymentMethodsList } from "@/features/payment-processing/ui/payment-methods-list";
import { AddPaymentMethodWizard } from "@/features/payment-processing/ui/add-payment-method-wizard";
import { PaymentHistoryTable } from "@/features/payment-processing/ui/payment-history-table";
import { PaymentFailureResolution } from "@/features/payment-processing/ui/payment-failure-resolution";

function PaymentMethodsPage() {
  const {
    paymentMethods,
    paymentHistory,
    failedPayments,
    isLoading,
    error,
    addPaymentMethod,
    updatePaymentMethod,
    deletePaymentMethod,
    setDefaultPaymentMethod,
    retryFailedPayment,
    isAddingPaymentMethod,
    isDeletingPaymentMethod,
    isRetryingPayment,
    refreshData,
  } = usePaymentMethodsManagement();

  const breadcrumbs = [
    { title: "Dashboard", href: "/dashboard" },
    { title: "Billing", href: "/billing-overview" },
    { title: "Payment Methods" },
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
      label: "View Invoices",
      icon: <IconInfoCircle size={16} />,
      onClick: () => {
        window.location.href = "/billing/invoices";
      },
      variant: "light" as const,
    },
  ];

  if (error) {
    return (
      <BillingPageLayout
        title="Payment Methods"
        description="Manage your payment instruments and billing information"
        breadcrumbs={breadcrumbs}
        onRefresh={refreshData}
      >
        <Alert color="red" icon={<IconInfoCircle size={16} />}>
          Failed to load payment methods: {error}
        </Alert>
      </BillingPageLayout>
    );
  }

  return (
    <BillingPageLayout
      title="Payment Methods"
      description="Manage your payment instruments and billing information"
      breadcrumbs={breadcrumbs}
      quickActions={quickActions}
      onRefresh={refreshData}
      refreshing={isLoading}
    >
      <Container size="xl" px={0}>
        <Stack gap="xl">
          {/* Payment Failure Resolution - Show if there are failed payments */}
          {failedPayments && failedPayments.length > 0 && (
            <PaymentFailureResolution
              failedPayments={failedPayments}
              onRetryPayment={retryFailedPayment}
              onUpdatePaymentMethod={updatePaymentMethod}
              loading={isRetryingPayment}
            />
          )}

          {/* Payment Methods Management */}
          <Grid>
            <Grid.Col span={{ base: 12, lg: 8 }}>
              <PaymentMethodsList
                paymentMethods={paymentMethods}
                onSetDefault={setDefaultPaymentMethod}
                onDelete={deletePaymentMethod}
                loading={isLoading}
                deleting={isDeletingPaymentMethod}
              />
            </Grid.Col>
            <Grid.Col span={{ base: 12, lg: 4 }}>
              <AddPaymentMethodWizard
                onAdd={addPaymentMethod}
                loading={isAddingPaymentMethod}
              />
            </Grid.Col>
          </Grid>

          {/* Payment History */}
          <PaymentHistoryTable
            paymentHistory={paymentHistory}
            loading={isLoading}
          />
        </Stack>
      </Container>
    </BillingPageLayout>
  );
}

export const Route = createFileRoute("/payment-methods")({
  component: () => (
    <AuthorityProtectedRoute
      authorities={[
        Authority.TENANT_ADMIN,
        Authority.PLATFORM_ADMIN,
        Authority.SUPPORT_AGENT,
      ]}
    >
      <PaymentMethodsPage />
    </AuthorityProtectedRoute>
  ),
});
