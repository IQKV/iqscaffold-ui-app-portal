/**
 * Revenue Metrics Cards Component
 * MRR, ARR, and growth rate display
 */

import React from "react";
import {
  Card,
  Text,
  Group,
  Stack,
  Grid,
  Badge,
  Select,
  ThemeIcon,
  Box,
  Skeleton,
} from "@mantine/core";
import {
  IconTrendingUp,
  IconTrendingDown,
  IconCurrency,
  IconUsers,
  IconChartLine,
  IconTarget,
} from "@tabler/icons-react";

interface RevenueMetrics {
  mrr: number;
  arr: number;
  growthRate: number;
  churnRate: number;
  ltv: number;
  totalRevenue: number;
  activeSubscriptions: number;
  newSubscriptions: number;
  canceledSubscriptions: number;
}

interface RevenueMetricsCardsProps {
  revenueMetrics: RevenueMetrics | undefined;
  selectedPeriod: string;
  onPeriodChange: (period: string) => void;
  loading?: boolean;
}

export const RevenueMetricsCards: React.FC<RevenueMetricsCardsProps> = ({
  revenueMetrics,
  selectedPeriod,
  onPeriodChange,
  loading = false,
}) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatPercentage = (value: number) => {
    return `${value > 0 ? "+" : ""}${value.toFixed(1)}%`;
  };

  const getGrowthColor = (value: number) => {
    return value >= 0 ? "green" : "red";
  };

  const getGrowthIcon = (value: number) => {
    return value >= 0 ? <IconTrendingUp size={14} /> : <IconTrendingDown size={14} />;
  };

  if (loading || !revenueMetrics) {
    return (
      <Grid>
        {Array.from({ length: 6 }).map((_, index) => (
          <Grid.Col key={index} span={{ base: 12, sm: 6, lg: 4, xl: 2 }}>
            <Card withBorder radius="md" p="lg">
              <Stack gap="md">
                <Skeleton height={20} width="60%" />
                <Skeleton height={32} width="80%" />
                <Skeleton height={16} width="40%" />
              </Stack>
            </Card>
          </Grid.Col>
        ))}
      </Grid>
    );
  }

  const metrics = [
    {
      title: "Monthly Recurring Revenue",
      value: formatCurrency(revenueMetrics.mrr),
      change: revenueMetrics.growthRate,
      icon: <IconCurrency size={20} />,
      color: "blue",
      description: "MRR",
    },
    {
      title: "Annual Recurring Revenue",
      value: formatCurrency(revenueMetrics.arr),
      change: revenueMetrics.growthRate * 12,
      icon: <IconChartLine size={20} />,
      color: "green",
      description: "ARR",
    },
    {
      title: "Active Subscriptions",
      value: revenueMetrics.activeSubscriptions.toLocaleString(),
      change: ((revenueMetrics.newSubscriptions - revenueMetrics.canceledSubscriptions) / revenueMetrics.activeSubscriptions) * 100,
      icon: <IconUsers size={20} />,
      color: "purple",
      description: "Subscribers",
    },
    {
      title: "Customer Lifetime Value",
      value: formatCurrency(revenueMetrics.ltv),
      change: 8.5, // Mock change
      icon: <IconTarget size={20} />,
      color: "orange",
      description: "LTV",
    },
    {
      title: "Churn Rate",
      value: `${revenueMetrics.churnRate.toFixed(1)}%`,
      change: -0.5, // Mock change (negative is good for churn)
      icon: <IconTrendingDown size={20} />,
      color: revenueMetrics.churnRate > 5 ? "red" : "green",
      description: "Monthly",
    },
    {
      title: "Total Revenue",
      value: formatCurrency(revenueMetrics.totalRevenue),
      change: 15.2, // Mock change
      icon: <IconCurrency size={20} />,
      color: "teal",
      description: "All-time",
    },
  ];

  return (
    <Stack gap="md">
      {/* Period Selector */}
      <Group justify="space-between" align="center">
        <Text size="lg" fw={600}>
          Revenue Overview
        </Text>
        <Select
          value={selectedPeriod}
          onChange={(value) => onPeriodChange(value || "30d")}
          data={[
            { value: "7d", label: "Last 7 days" },
            { value: "30d", label: "Last 30 days" },
            { value: "90d", label: "Last 90 days" },
            { value: "1y", label: "Last year" },
          ]}
          w={150}
        />
      </Group>

      {/* Metrics Grid */}
      <Grid>
        {metrics.map((metric, index) => (
          <Grid.Col key={index} span={{ base: 12, sm: 6, lg: 4, xl: 2 }}>
            <Card withBorder radius="md" p="lg" h="100%">
              <Stack gap="md">
                {/* Header */}
                <Group justify="space-between" align="flex-start">
                  <ThemeIcon variant="light" size="md" color={metric.color}>
                    {metric.icon}
                  </ThemeIcon>
                  <Badge
                    variant="light"
                    color={getGrowthColor(metric.change)}
                    size="sm"
                    leftSection={getGrowthIcon(metric.change)}
                  >
                    {formatPercentage(metric.change)}
                  </Badge>
                </Group>

                {/* Value */}
                <Box>
                  <Text size="xl" fw={700} c={metric.color}>
                    {metric.value}
                  </Text>
                  <Text size="xs" c="dimmed" mt="xs">
                    {metric.description}
                  </Text>
                </Box>

                {/* Title */}
                <Text size="sm" fw={500} lineClamp={2}>
                  {metric.title}
                </Text>
              </Stack>
            </Card>
          </Grid.Col>
        ))}
      </Grid>

      {/* Summary Stats */}
      <Card withBorder radius="md" p="md" bg="gray.0">
        <Group justify="space-around">
          <Box ta="center">
            <Text size="lg" fw={700} c="green">
              +{revenueMetrics.newSubscriptions}
            </Text>
            <Text size="xs" c="dimmed">
              New Subscriptions
            </Text>
          </Box>
          <Box ta="center">
            <Text size="lg" fw={700} c="red">
              -{revenueMetrics.canceledSubscriptions}
            </Text>
            <Text size="xs" c="dimmed">
              Canceled Subscriptions
            </Text>
          </Box>
          <Box ta="center">
            <Text size="lg" fw={700} c="blue">
              +{revenueMetrics.newSubscriptions - revenueMetrics.canceledSubscriptions}
            </Text>
            <Text size="xs" c="dimmed">
              Net Growth
            </Text>
          </Box>
          <Box ta="center">
            <Text size="lg" fw={700} c="purple">
              {((revenueMetrics.newSubscriptions - revenueMetrics.canceledSubscriptions) / revenueMetrics.activeSubscriptions * 100).toFixed(1)}%
            </Text>
            <Text size="xs" c="dimmed">
              Growth Rate
            </Text>
          </Box>
        </Group>
      </Card>
    </Stack>
  );
};