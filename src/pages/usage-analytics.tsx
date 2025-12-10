/**
 * Usage Analytics Page
 * Detailed usage monitoring and forecasting with quota utilization
 */

import React from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Container, Stack, Grid, Alert } from "@mantine/core";
import { IconInfoCircle } from "@tabler/icons-react";
import { BillingPageLayout } from "@/shared/ui/billing";
import { AuthorityProtectedRoute } from "@/shared/ui";
import { Authority } from "@/shared/types/billing";
import { useUsageAnalytics } from "@/features/usage-analytics/model/use-usage-analytics";
import { UsageMetricsGrid } from "@/features/usage-analytics/ui/usage-metrics-grid";
import { UsageTrendCharts } from "@/features/usage-analytics/ui/usage-trend-charts";
import { QuotaUtilizationHeatmap } from "@/features/usage-analytics/ui/quota-utilization-heatmap";
import { UsageBasedBillingProjection } from "@/features/usage-analytics/ui/usage-based-billing-projection";

function UsageAnalyticsPage() {
  const {
    usageMetrics,
    usageTrends,
    quotaUtilization,
    billingProjection,
    isLoading,
    error,
    refreshData,
    dateRange,
    setDateRange,
    selectedMetrics,
    setSelectedMetrics,
  } = useUsageAnalytics();

  const breadcrumbs = [
    { title: "Dashboard", href: "/dashboard" },
    { title: "Billing", href: "/billing-overview" },
    { title: "Usage Analytics" },
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
      label: "Export Report",
      icon: <IconInfoCircle size={16} />,
      onClick: () => {
        // Export usage report
        console.log("Exporting usage report");
      },
      variant: "light" as const,
    },
  ];

  if (error) {
    return (
      <BillingPageLayout
        title="Usage Analytics"
        description="Monitor your resource usage and quota utilization"
        breadcrumbs={breadcrumbs}
        onRefresh={refreshData}
      >
        <Alert color="red" icon={<IconInfoCircle size={16} />}>
          Failed to load usage analytics: {error}
        </Alert>
      </BillingPageLayout>
    );
  }

  return (
    <BillingPageLayout
      title="Usage Analytics"
      description="Monitor your resource usage and quota utilization"
      breadcrumbs={breadcrumbs}
      quickActions={quickActions}
      onRefresh={refreshData}
      refreshing={isLoading}
    >
      <Container size="xl" px={0}>
        <Stack gap="xl">
          {/* Current Usage Metrics */}
          <UsageMetricsGrid usageMetrics={usageMetrics} loading={isLoading} />

          {/* Usage Trends and Quota Utilization */}
          <Grid>
            <Grid.Col span={{ base: 12, lg: 8 }}>
              <UsageTrendCharts
                usageTrends={usageTrends}
                dateRange={dateRange}
                onDateRangeChange={setDateRange}
                selectedMetrics={selectedMetrics}
                onMetricsChange={setSelectedMetrics}
                loading={isLoading}
              />
            </Grid.Col>
            <Grid.Col span={{ base: 12, lg: 4 }}>
              <QuotaUtilizationHeatmap
                quotaUtilization={quotaUtilization}
                loading={isLoading}
              />
            </Grid.Col>
          </Grid>

          {/* Billing Projection */}
          <UsageBasedBillingProjection
            billingProjection={billingProjection}
            loading={isLoading}
          />
        </Stack>
      </Container>
    </BillingPageLayout>
  );
}

export const Route = createFileRoute("/usage-analytics")({
  component: () => (
    <AuthorityProtectedRoute
      authorities={[
        Authority.TENANT_ADMIN,
        Authority.PLATFORM_ADMIN,
        Authority.SUPPORT_AGENT,
        Authority.BILLING_VIEWER,
      ]}
    >
      <UsageAnalyticsPage />
    </AuthorityProtectedRoute>
  ),
});
