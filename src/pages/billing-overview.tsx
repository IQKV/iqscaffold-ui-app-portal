/**
 * Billing Overview Page
 * Main billing dashboard for tenant administrators showing complete billing status at a glance
 */

import React from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Container, Stack, Grid, Alert } from "@mantine/core";
import { IconInfoCircle } from "@tabler/icons-react";
import { BillingPageLayout } from "@/shared/ui/billing";
import { AuthorityProtectedRoute } from "@/shared/ui";
import { Authority } from "@/shared/types";
import { useBillingOverview } from "@/widgets/billing-overview/model/use-billing-overview";
import { ActiveSubscriptionSummary } from "@/widgets/billing-overview/ui/active-subscription-summary";
import { UsageQuotaAlerts } from "@/widgets/billing-overview/ui/usage-quota-alerts";
import { RecentBillingActivity } from "@/widgets/billing-overview/ui/recent-billing-activity";
import { QuickBillingActions } from "@/widgets/billing-overview/ui/quick-billing-actions";

function BillingOverviewPage() {
  const {
    subscription,
    plan,
    usage,
    recentInvoices,
    paymentMethods,
    isLoading,
    error,
    refreshData,
  } = useBillingOverview();

  const breadcrumbs = [
    { title: "Dashboard", href: "/dashboard" },
    { title: "Billing Overview" },
  ];

  const quickActions = [
    {
      label: "Upgrade Plan",
      icon: <IconInfoCircle size={16} />,
      onClick: () => {
        // Navigate to subscription management
        window.location.href = "/billing/subscription";
      },
      color: "blue",
      variant: "filled" as const,
    },
    {
      label: "Add Payment Method",
      icon: <IconInfoCircle size={16} />,
      onClick: () => {
        // Navigate to payment methods
        window.location.href = "/billing/payment-methods";
      },
      variant: "light" as const,
    },
    {
      label: "View Invoices",
      icon: <IconInfoCircle size={16} />,
      onClick: () => {
        // Navigate to invoices
        window.location.href = "/billing/invoices";
      },
      variant: "light" as const,
    },
  ];

  if (error) {
    return (
      <BillingPageLayout
        title="Billing Overview"
        description="Complete billing status and subscription management"
        breadcrumbs={breadcrumbs}
        onRefresh={refreshData}
      >
        <Alert color="red" icon={<IconInfoCircle size={16} />}>
          Failed to load billing information: {error}
        </Alert>
      </BillingPageLayout>
    );
  }

  return (
    <BillingPageLayout
      title="Billing Overview"
      description="Complete billing status and subscription management"
      breadcrumbs={breadcrumbs}
      quickActions={quickActions}
      onRefresh={refreshData}
      refreshing={isLoading}
    >
      <Container size="xl" px={0}>
        <Stack gap="xl">
          {/* Top Row - Subscription Summary and Quick Actions */}
          <Grid>
            <Grid.Col span={{ base: 12, md: 8 }}>
              <ActiveSubscriptionSummary
                subscription={subscription}
                plan={plan}
                loading={isLoading}
              />
            </Grid.Col>
            <Grid.Col span={{ base: 12, md: 4 }}>
              <QuickBillingActions
                subscription={subscription}
                paymentMethods={paymentMethods}
                loading={isLoading}
              />
            </Grid.Col>
          </Grid>

          {/* Middle Row - Usage Alerts */}
          <UsageQuotaAlerts usage={usage} loading={isLoading} />

          {/* Bottom Row - Recent Activity */}
          <RecentBillingActivity
            invoices={recentInvoices}
            subscription={subscription}
            loading={isLoading}
          />
        </Stack>
      </Container>
    </BillingPageLayout>
  );
}

export const Route = createFileRoute("/billing-overview")({
  component: () => (
    <AuthorityProtectedRoute
      authorities={[
        Authority.TENANT_ADMIN,
        Authority.PLATFORM_ADMIN,
        Authority.SUPPORT_AGENT,
        Authority.BILLING_VIEWER,
      ]}
    >
      <BillingOverviewPage />
    </AuthorityProtectedRoute>
  ),
});
