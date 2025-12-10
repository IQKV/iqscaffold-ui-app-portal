/**
 * Subscription Management Page
 * Dedicated subscription lifecycle management with plan changes, trial management, and cancellation
 */

import React from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Container, Stack, Grid, Alert } from "@mantine/core";
import { IconInfoCircle } from "@tabler/icons-react";
import { BillingPageLayout } from "@/shared/ui/billing";
import { AuthorityProtectedRoute } from "@/shared/ui";
import { Authority } from "@/shared/types";
import { useSubscriptionManagement } from "@/features/subscription-management/model/use-subscription-management";
import { CurrentPlanDetails } from "@/features/subscription-management/ui/current-plan-details";
import { PlanUpgradeOptions } from "@/features/subscription-management/ui/plan-upgrade-options";
import { TrialStatusTracker } from "@/features/subscription-management/ui/trial-status-tracker";
import { SubscriptionCancellation } from "@/features/subscription-management/ui/subscription-cancellation";

function SubscriptionManagementPage() {
  const {
    subscription,
    currentPlan,
    availablePlans,
    trialInfo,
    isLoading,
    error,
    upgradeSubscription,
    cancelSubscription,
    extendTrial,
    isUpgrading,
    isCanceling,
    isExtendingTrial,
    refreshData,
  } = useSubscriptionManagement();

  const breadcrumbs = [
    { title: "Dashboard", href: "/dashboard" },
    { title: "Billing", href: "/billing-overview" },
    { title: "Subscription Management" },
  ];

  const quickActions = [
    {
      label: "View Billing Overview",
      icon: <IconInfoCircle size={16} />,
      onClick: () => {
        window.location.href = "/billing-overview";
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
        title="Subscription Management"
        description="Manage your subscription plan, trial, and billing preferences"
        breadcrumbs={breadcrumbs}
        onRefresh={refreshData}
      >
        <Alert color="red" icon={<IconInfoCircle size={16} />}>
          Failed to load subscription information: {error}
        </Alert>
      </BillingPageLayout>
    );
  }

  return (
    <BillingPageLayout
      title="Subscription Management"
      description="Manage your subscription plan, trial, and billing preferences"
      breadcrumbs={breadcrumbs}
      quickActions={quickActions}
      onRefresh={refreshData}
      refreshing={isLoading}
    >
      <Container size="xl" px={0}>
        <Stack gap="xl">
          {/* Trial Status - Show if in trial */}
          {trialInfo?.isInTrial && (
            <TrialStatusTracker
              trialInfo={trialInfo}
              onExtendTrial={extendTrial}
              onConvertTrial={() => upgradeSubscription(currentPlan?.id || "")}
              loading={isExtendingTrial}
            />
          )}

          {/* Current Plan Details and Upgrade Options */}
          <Grid>
            <Grid.Col span={{ base: 12, lg: 6 }}>
              <CurrentPlanDetails
                subscription={subscription || null}
                plan={currentPlan}
                loading={isLoading}
              />
            </Grid.Col>
            <Grid.Col span={{ base: 12, lg: 6 }}>
              <PlanUpgradeOptions
                currentPlan={currentPlan}
                availablePlans={availablePlans}
                onUpgrade={upgradeSubscription}
                loading={isUpgrading}
              />
            </Grid.Col>
          </Grid>

          {/* Subscription Cancellation */}
          <SubscriptionCancellation
            subscription={subscription || null}
            onCancel={cancelSubscription}
            loading={isCanceling}
          />
        </Stack>
      </Container>
    </BillingPageLayout>
  );
}

export const Route = createFileRoute("/billing/subscription")({
  component: () => (
    <AuthorityProtectedRoute
      authorities={[
        Authority.TENANT_ADMIN,
        Authority.PLATFORM_ADMIN,
        Authority.SUPPORT_AGENT,
      ]}
    >
      <SubscriptionManagementPage />
    </AuthorityProtectedRoute>
  ),
});
