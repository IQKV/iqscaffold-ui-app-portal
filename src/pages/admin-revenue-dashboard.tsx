/**
 * Admin Revenue Dashboard Page
 * Platform-wide revenue analytics for administrators
 */

import React from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Container, Stack, Grid, Alert } from "@mantine/core";
import { IconInfoCircle } from "@tabler/icons-react";
import { BillingPageLayout } from "@/shared/ui/billing";
import { AuthorityProtectedRoute } from "@/shared/ui";
import { Authority } from "@/shared/types/billing";
import { useAdminRevenueAnalytics } from "@/features/admin-revenue-analytics/model/use-admin-revenue-analytics";
import { RevenueMetricsCards } from "@/features/admin-revenue-analytics/ui/revenue-metrics-cards";
import { ChurnAnalysisChart } from "@/features/admin-revenue-analytics/ui/churn-analysis-chart";
import { TenantRevenueRanking } from "@/features/admin-revenue-analytics/ui/tenant-revenue-ranking";
import { SubscriptionConversionFunnel } from "@/features/admin-revenue-analytics/ui/subscription-conversion-funnel";

function AdminRevenueDashboardPage() {
  const {
    revenueMetrics,
    churnAnalysis,
    tenantRanking,
    conversionFunnel,
    isLoading,
    error,
    refreshData,
    dateRange,
    setDateRange,
    selectedPeriod,
    setSelectedPeriod,
  } = useAdminRevenueAnalytics();

  const breadcrumbs = [
    { title: "Admin", href: "/admin" },
    { title: "Revenue Dashboard" },
  ];

  const quickActions = [
    {
      label: "Export Report",
      icon: <IconInfoCircle size={16} />,
      onClick: () => {
        // Export revenue report
        console.log("Exporting revenue report");
      },
      variant: "light" as const,
    },
    {
      label: "Billing Settings",
      icon: <IconInfoCircle size={16} />,
      onClick: () => {
        // Navigate to billing settings
        console.log("Navigate to billing settings");
      },
      variant: "light" as const,
    },
    {
      label: "User Management",
      icon: <IconInfoCircle size={16} />,
      onClick: () => {
        // Navigate to user management
        window.location.href = "/admin/users";
      },
      variant: "light" as const,
    },
  ];

  if (error) {
    return (
      <BillingPageLayout
        title="Revenue Dashboard"
        description="Platform-wide revenue analytics and business metrics"
        breadcrumbs={breadcrumbs}
        onRefresh={refreshData}
      >
        <Alert color="red" icon={<IconInfoCircle size={16} />}>
          Failed to load revenue analytics: {error}
        </Alert>
      </BillingPageLayout>
    );
  }

  return (
    <BillingPageLayout
      title="Revenue Dashboard"
      description="Platform-wide revenue analytics and business metrics"
      breadcrumbs={breadcrumbs}
      quickActions={quickActions}
      onRefresh={refreshData}
      refreshing={isLoading}
    >
      <Container size="xl" px={0}>
        <Stack gap="xl">
          {/* Revenue Metrics Overview */}
          <RevenueMetricsCards
            revenueMetrics={revenueMetrics}
            selectedPeriod={selectedPeriod}
            onPeriodChange={(period) => setSelectedPeriod(period as any)}
            loading={isLoading}
          />

          {/* Charts and Analytics */}
          <Grid>
            <Grid.Col span={{ base: 12, lg: 8 }}>
              <ChurnAnalysisChart
                churnAnalysis={churnAnalysis}
                dateRange={dateRange}
                onDateRangeChange={setDateRange}
                loading={isLoading}
              />
            </Grid.Col>
            <Grid.Col span={{ base: 12, lg: 4 }}>
              <SubscriptionConversionFunnel
                conversionFunnel={conversionFunnel}
                loading={isLoading}
              />
            </Grid.Col>
          </Grid>

          {/* Tenant Performance */}
          <TenantRevenueRanking
            tenantRanking={tenantRanking}
            loading={isLoading}
          />
        </Stack>
      </Container>
    </BillingPageLayout>
  );
}

export const Route = createFileRoute("/admin-revenue-dashboard")({
  component: () => (
    <AuthorityProtectedRoute authorities={[Authority.PLATFORM_ADMIN]}>
      <AdminRevenueDashboardPage />
    </AuthorityProtectedRoute>
  ),
});
