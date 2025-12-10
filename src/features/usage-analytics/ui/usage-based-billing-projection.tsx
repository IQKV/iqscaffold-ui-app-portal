/**
 * Usage-Based Billing Projection Component
 * Estimated overage charges and cost forecasting
 */

import React from "react";
import {
  Card,
  Text,
  Group,
  Stack,
  Grid,
  Badge,
  Button,
  Alert,
  Box,
  Progress,
  Skeleton,
  ThemeIcon,
} from "@mantine/core";
import {
  IconCurrency,
  IconTrendingUp,
  IconAlertTriangle,
  IconInfoCircle,
  IconArrowUp,
} from "@tabler/icons-react";

interface BillingProjection {
  currentPeriodUsage: Record<string, number>;
  projectedUsage: Record<string, number>;
  currentCost: number;
  projectedCost: number;
  overageCost: number;
  potentialSavings: number;
  recommendedPlan?: string;
}

interface UsageBasedBillingProjectionProps {
  billingProjection: BillingProjection;
  loading?: boolean;
}

export const UsageBasedBillingProjection: React.FC<UsageBasedBillingProjectionProps> = ({
  billingProjection,
  loading = false,
}) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  const getProjectionColor = (current: number, projected: number) => {
    const increase = ((projected - current) / current) * 100;
    if (increase > 20) return "red";
    if (increase > 10) return "orange";
    if (increase > 0) return "yellow";
    return "green";
  };

  const getProjectionPercentage = (current: number, projected: number) => {
    return ((projected - current) / current) * 100;
  };

  if (loading) {
    return (
      <Card withBorder radius="md" p="lg">
        <Stack gap="md">
          <Skeleton height={24} width="60%" />
          <Grid>
            <Grid.Col span={4}>
              <Skeleton height={80} />
            </Grid.Col>
            <Grid.Col span={4}>
              <Skeleton height={80} />
            </Grid.Col>
            <Grid.Col span={4}>
              <Skeleton height={80} />
            </Grid.Col>
          </Grid>
          <Skeleton height={100} />
        </Stack>
      </Card>
    );
  }

  const costIncrease = getProjectionPercentage(billingProjection.currentCost, billingProjection.projectedCost);
  const hasOverage = billingProjection.overageCost > 0;
  const hasSavings = billingProjection.potentialSavings > 0;

  return (
    <Card withBorder radius="md" p="lg">
      <Stack gap="md">
        {/* Header */}
        <Group justify="space-between" align="center">
          <Group gap="sm" align="center">
            <ThemeIcon variant="light" size="sm" color="blue">
              <IconCurrency size={14} />
            </ThemeIcon>
            <Text size="lg" fw={600}>
              Billing Projection
            </Text>
          </Group>
          <Badge variant="light" color="blue" size="sm">
            End of Period Estimate
          </Badge>
        </Group>

        {/* Cost Overview */}
        <Grid>
          <Grid.Col span={{ base: 12, sm: 4 }}>
            <Card withBorder p="md" radius="sm" bg="blue.0">
              <Stack gap="xs" align="center">
                <Text size="xs" c="dimmed" ta="center">
                  Current Period Cost
                </Text>
                <Text size="xl" fw={700} c="blue">
                  {formatCurrency(billingProjection.currentCost)}
                </Text>
                <Badge variant="light" color="blue" size="xs">
                  Actual
                </Badge>
              </Stack>
            </Card>
          </Grid.Col>

          <Grid.Col span={{ base: 12, sm: 4 }}>
            <Card withBorder p="md" radius="sm" bg={getProjectionColor(billingProjection.currentCost, billingProjection.projectedCost) + ".0"}>
              <Stack gap="xs" align="center">
                <Text size="xs" c="dimmed" ta="center">
                  Projected Cost
                </Text>
                <Text size="xl" fw={700} c={getProjectionColor(billingProjection.currentCost, billingProjection.projectedCost)}>
                  {formatCurrency(billingProjection.projectedCost)}
                </Text>
                <Badge
                  variant="light"
                  color={getProjectionColor(billingProjection.currentCost, billingProjection.projectedCost)}
                  size="xs"
                >
                  {costIncrease > 0 ? "+" : ""}{costIncrease.toFixed(1)}%
                </Badge>
              </Stack>
            </Card>
          </Grid.Col>

          <Grid.Col span={{ base: 12, sm: 4 }}>
            <Card withBorder p="md" radius="sm" bg={hasOverage ? "red.0" : "green.0"}>
              <Stack gap="xs" align="center">
                <Text size="xs" c="dimmed" ta="center">
                  Overage Cost
                </Text>
                <Text size="xl" fw={700} c={hasOverage ? "red" : "green"}>
                  {formatCurrency(billingProjection.overageCost)}
                </Text>
                <Badge
                  variant="light"
                  color={hasOverage ? "red" : "green"}
                  size="xs"
                >
                  {hasOverage ? "Over Limit" : "Within Limit"}
                </Badge>
              </Stack>
            </Card>
          </Grid.Col>
        </Grid>

        {/* Usage Projections */}
        <Box>
          <Text size="sm" fw={500} mb="md">
            Usage Projections
          </Text>
          <Stack gap="sm">
            {Object.entries(billingProjection.currentPeriodUsage).map(([metric, current]) => {
              const projected = billingProjection.projectedUsage[metric] || current;
              const percentage = getProjectionPercentage(current, projected);
              const progressValue = Math.min((current / projected) * 100, 100);

              return (
                <Box key={metric}>
                  <Group justify="space-between" mb="xs">
                    <Text size="sm" tt="capitalize">
                      {metric.replace("_", " ")}
                    </Text>
                    <Group gap="xs">
                      <Text size="sm">
                        {current.toLocaleString()} → {projected.toLocaleString()}
                      </Text>
                      <Badge
                        variant="light"
                        color={getProjectionColor(current, projected)}
                        size="xs"
                      >
                        {percentage > 0 ? "+" : ""}{percentage.toFixed(1)}%
                      </Badge>
                    </Group>
                  </Group>
                  <Progress
                    value={progressValue}
                    color={getProjectionColor(current, projected)}
                    size="sm"
                    radius="xl"
                  />
                </Box>
              );
            })}
          </Stack>
        </Box>

        {/* Alerts and Recommendations */}
        <Stack gap="sm">
          {hasOverage && (
            <Alert icon={<IconAlertTriangle size={16} />} color="red" variant="light">
              <Group justify="space-between" align="center">
                <Box>
                  <Text size="sm" fw={500}>
                    Overage Charges Expected
                  </Text>
                  <Text size="sm">
                    Your projected usage will result in {formatCurrency(billingProjection.overageCost)} in overage charges.
                  </Text>
                </Box>
                {billingProjection.recommendedPlan && (
                  <Button
                    variant="light"
                    color="red"
                    size="xs"
                    leftSection={<IconArrowUp size={12} />}
                    onClick={() => {
                      // Navigate to subscription management
                      window.location.href = "/billing/subscription";
                    }}
                  >
                    Upgrade to {billingProjection.recommendedPlan}
                  </Button>
                )}
              </Group>
            </Alert>
          )}

          {hasSavings && (
            <Alert icon={<IconInfoCircle size={16} />} color="green" variant="light">
              <Group justify="space-between" align="center">
                <Box>
                  <Text size="sm" fw={500}>
                    Potential Savings Available
                  </Text>
                  <Text size="sm">
                    You could save {formatCurrency(billingProjection.potentialSavings)} by optimizing your usage or plan.
                  </Text>
                </Box>
                <Button
                  variant="light"
                  color="green"
                  size="xs"
                  onClick={() => {
                    // Show optimization suggestions
                    console.log("Show optimization suggestions");
                  }}
                >
                  View Suggestions
                </Button>
              </Group>
            </Alert>
          )}

          {!hasOverage && !hasSavings && (
            <Alert icon={<IconInfoCircle size={16} />} color="blue" variant="light">
              <Text size="sm">
                Your usage is well within your plan limits. Your projected cost is {formatCurrency(billingProjection.projectedCost)} for this billing period.
              </Text>
            </Alert>
          )}
        </Stack>

        {/* Summary */}
        <Box pt="md" style={{ borderTop: "1px solid var(--mantine-color-gray-3)" }}>
          <Group justify="space-between" align="center">
            <Text size="sm" c="dimmed">
              Projection based on current usage trends
            </Text>
            <Group gap="md">
              <Text size="sm" c="dimmed">
                Period ends in 12 days
              </Text>
              <Button variant="light" size="xs">
                View Details
              </Button>
            </Group>
          </Group>
        </Box>
      </Stack>
    </Card>
  );
};