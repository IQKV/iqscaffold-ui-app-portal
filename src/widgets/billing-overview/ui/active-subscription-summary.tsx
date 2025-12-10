import React from "react";
import {
  Card,
  Group,
  Text,
  Stack,
  Badge,
  Skeleton,
  Divider,
  Grid,
  Box,
} from "@mantine/core";
import {
  IconCalendar,
  IconCreditCard,
  IconTrendingUp,
  IconClock,
} from "@tabler/icons-react";
import { SubscriptionStatusBadge } from "@/shared/ui/billing";
import {
  CurrencyUtils,
  BillingDateUtils,
  SubscriptionUtils,
} from "@/shared/lib/billing-utils";
import type { Subscription, Plan } from "@/shared/types/billing";

export interface ActiveSubscriptionSummaryProps {
  subscription: Subscription | null;
  plan: Plan | null;
  loading?: boolean;
}

export const ActiveSubscriptionSummary: React.FC<
  ActiveSubscriptionSummaryProps
> = ({ subscription, plan, loading = false }) => {
  if (loading) {
    return (
      <Card withBorder h={300}>
        <Stack gap="md">
          <Group justify="space-between">
            <Skeleton height={24} width={200} />
            <Skeleton height={28} width={80} />
          </Group>
          <Skeleton height={20} width="100%" />
          <Divider />
          <Grid>
            <Grid.Col span={6}>
              <Skeleton height={60} />
            </Grid.Col>
            <Grid.Col span={6}>
              <Skeleton height={60} />
            </Grid.Col>
          </Grid>
          <Skeleton height={40} />
        </Stack>
      </Card>
    );
  }

  if (!subscription || !plan) {
    return (
      <Card withBorder h={300}>
        <Stack align="center" justify="center" h="100%">
          <Text c="dimmed" size="lg">
            No active subscription found
          </Text>
          <Text c="dimmed" size="sm">
            Contact support or upgrade to get started
          </Text>
        </Stack>
      </Card>
    );
  }

  const isInTrial = SubscriptionUtils.isInTrial(subscription);
  const trialDaysRemaining = isInTrial
    ? SubscriptionUtils.getTrialDaysRemaining(subscription)
    : 0;
  const nextBillingDate = BillingDateUtils.formatBillingDate(
    subscription.currentPeriodEnd
  );
  const billingCycleText =
    subscription.billingCycle === "monthly" ? "Monthly" : "Yearly";

  return (
    <Card withBorder>
      <Stack gap="md">
        {/* Header */}
        <Group justify="space-between" align="flex-start">
          <div>
            <Text size="lg" fw={600}>
              Current Subscription
            </Text>
            <Text c="dimmed" size="sm">
              {plan.name} Plan • {billingCycleText} Billing
            </Text>
          </div>
          <SubscriptionStatusBadge subscription={subscription} showDetails />
        </Group>

        {/* Plan Details */}
        <Box>
          <Group gap="xs" mb="xs">
            <Text size="xl" fw={700}>
              {CurrencyUtils.format(plan.price, plan.currency)}
            </Text>
            <Text c="dimmed" size="sm">
              / {subscription.billingCycle}
            </Text>
          </Group>

          {isInTrial && (
            <Badge
              color="blue"
              variant="light"
              leftSection={<IconClock size={12} />}
            >
              {trialDaysRemaining} days left in trial
            </Badge>
          )}
        </Box>

        <Divider />

        {/* Billing Information */}
        <Grid>
          <Grid.Col span={6}>
            <Group gap="xs">
              <IconCalendar size={16} color="var(--mantine-color-blue-6)" />
              <div>
                <Text size="sm" fw={500}>
                  Next Billing Date
                </Text>
                <Text size="xs" c="dimmed">
                  {nextBillingDate}
                </Text>
              </div>
            </Group>
          </Grid.Col>

          <Grid.Col span={6}>
            <Group gap="xs">
              <IconCreditCard size={16} color="var(--mantine-color-green-6)" />
              <div>
                <Text size="sm" fw={500}>
                  Billing Cycle
                </Text>
                <Text size="xs" c="dimmed">
                  {billingCycleText}
                </Text>
              </div>
            </Group>
          </Grid.Col>
        </Grid>

        {/* Plan Features Preview */}
        {plan.features && plan.features.length > 0 && (
          <>
            <Divider />
            <div>
              <Text size="sm" fw={500} mb="xs">
                Plan Features
              </Text>
              <Stack gap="xs">
                {plan.features.slice(0, 3).map((feature, index) => (
                  <Group key={index} gap="xs">
                    <IconTrendingUp
                      size={12}
                      color="var(--mantine-color-green-6)"
                    />
                    <Text size="xs" c="dimmed">
                      {feature.name}
                    </Text>
                  </Group>
                ))}
                {plan.features.length > 3 && (
                  <Text size="xs" c="dimmed" fs="italic">
                    +{plan.features.length - 3} more features
                  </Text>
                )}
              </Stack>
            </div>
          </>
        )}

        {/* Cancellation Notice */}
        {subscription.cancelAtPeriodEnd && (
          <>
            <Divider />
            <Badge color="orange" variant="light" size="sm">
              Subscription will cancel on {nextBillingDate}
            </Badge>
          </>
        )}
      </Stack>
    </Card>
  );
};
