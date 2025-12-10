/**
 * Current Plan Details Component
 * Displays current plan features, pricing, and billing cycle information
 */

import React from "react";
import {
  Card,
  Text,
  Badge,
  Group,
  Stack,
  Divider,
  List,
  ThemeIcon,
  Skeleton,
  Box,
  Grid,
} from "@mantine/core";
import {
  IconCheck,
  IconCreditCard,
  IconCalendar,
  IconCurrency,
  IconX,
} from "@tabler/icons-react";
import { SubscriptionStatusBadge } from "@/shared/ui/billing";
import type { Subscription, Plan } from "@/entities/subscription/types/subscription-types";

interface CurrentPlanDetailsProps {
  subscription: Subscription | null;
  plan: Plan | null;
  loading?: boolean;
}

export const CurrentPlanDetails: React.FC<CurrentPlanDetailsProps> = ({
  subscription,
  plan,
  loading = false,
}) => {
  if (loading) {
    return (
      <Card withBorder radius="md" p="lg">
        <Stack gap="md">
          <Skeleton height={24} width="60%" />
          <Skeleton height={20} width="40%" />
          <Divider />
          <Stack gap="xs">
            <Skeleton height={16} />
            <Skeleton height={16} />
            <Skeleton height={16} />
          </Stack>
        </Stack>
      </Card>
    );
  }

  if (!subscription || !plan) {
    return (
      <Card withBorder radius="md" p="lg">
        <Text c="dimmed" ta="center">
          No active subscription found
        </Text>
      </Card>
    );
  }

  const formatCurrency = (amount: number, currency: string = "USD") => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
    }).format(amount);
  };

  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getBillingCycleText = (cycle: string) => {
    return cycle === "monthly" ? "Monthly" : "Yearly";
  };

  return (
    <Card withBorder radius="md" p="lg">
      <Stack gap="md">
        {/* Plan Header */}
        <Group justify="space-between" align="flex-start">
          <Box>
            <Group gap="sm" align="center">
              <Text size="xl" fw={700}>
                {plan.name}
              </Text>
              <Badge variant="light" color="blue" size="sm">
                {plan.tier.toUpperCase()}
              </Badge>
            </Group>
            <Text size="sm" c="dimmed" mt="xs">
              Current subscription plan
            </Text>
          </Box>
          <SubscriptionStatusBadge status={subscription.status} />
        </Group>

        <Divider />

        {/* Billing Information */}
        <Grid>
          <Grid.Col span={6}>
            <Group gap="xs" align="center">
              <ThemeIcon variant="light" size="sm" color="blue">
                <IconCurrency size={14} />
              </ThemeIcon>
              <Box>
                <Text size="sm" fw={500}>
                  {formatCurrency(plan.price, plan.currency)}
                </Text>
                <Text size="xs" c="dimmed">
                  per {plan.billingCycle}
                </Text>
              </Box>
            </Group>
          </Grid.Col>
          <Grid.Col span={6}>
            <Group gap="xs" align="center">
              <ThemeIcon variant="light" size="sm" color="green">
                <IconCalendar size={14} />
              </ThemeIcon>
              <Box>
                <Text size="sm" fw={500}>
                  {getBillingCycleText(subscription.billingCycle)}
                </Text>
                <Text size="xs" c="dimmed">
                  billing cycle
                </Text>
              </Box>
            </Group>
          </Grid.Col>
        </Grid>

        {/* Billing Period */}
        <Box>
          <Text size="sm" fw={500} mb="xs">
            Current Billing Period
          </Text>
          <Group gap="xs" align="center">
            <ThemeIcon variant="light" size="sm" color="orange">
              <IconCreditCard size={14} />
            </ThemeIcon>
            <Text size="sm">
              {formatDate(subscription.currentPeriodStart)} -{" "}
              {formatDate(subscription.currentPeriodEnd)}
            </Text>
          </Group>
        </Box>

        <Divider />

        {/* Plan Features */}
        <Box>
          <Text size="sm" fw={500} mb="md">
            Plan Features
          </Text>
          <List spacing="xs" size="sm">
            {plan.features.map((feature) => (
              <List.Item
                key={feature.id}
                icon={
                  <ThemeIcon
                    color={feature.enabled ? "green" : "gray"}
                    size={18}
                    radius="xl"
                    variant="light"
                  >
                    {feature.enabled ? (
                      <IconCheck size={12} />
                    ) : (
                      <IconX size={12} />
                    )}
                  </ThemeIcon>
                }
              >
                <Box>
                  <Text
                    size="sm"
                    c={feature.enabled ? undefined : "dimmed"}
                    td={feature.enabled ? undefined : "line-through"}
                  >
                    {feature.name}
                  </Text>
                  {feature.description && (
                    <Text size="xs" c="dimmed">
                      {feature.description}
                    </Text>
                  )}
                </Box>
              </List.Item>
            ))}
          </List>
        </Box>

        {/* Quotas */}
        {plan.quotas && plan.quotas.length > 0 && (
          <>
            <Divider />
            <Box>
              <Text size="sm" fw={500} mb="md">
                Usage Limits
              </Text>
              <Stack gap="xs">
                {plan.quotas.map((quota) => (
                  <Group key={quota.metricType} justify="space-between">
                    <Text size="sm" tt="capitalize">
                      {quota.metricType.replace("_", " ")}
                    </Text>
                    <Badge variant="light" size="sm">
                      {quota.limit === -1 ? "Unlimited" : quota.limit.toLocaleString()}
                    </Badge>
                  </Group>
                ))}
              </Stack>
            </Box>
          </>
        )}

        {/* Cancellation Notice */}
        {subscription.cancelAtPeriodEnd && (
          <>
            <Divider />
            <Box>
              <Badge color="orange" variant="light" size="sm" mb="xs">
                Scheduled for Cancellation
              </Badge>
              <Text size="xs" c="dimmed">
                Your subscription will end on{" "}
                {formatDate(subscription.currentPeriodEnd)}
              </Text>
            </Box>
          </>
        )}
      </Stack>
    </Card>
  );
};