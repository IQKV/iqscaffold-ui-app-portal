/**
 * Usage Metrics Grid Component
 * Current usage across all metrics with quota status
 */

import React from "react";
import {
  Card,
  Text,
  Group,
  Stack,
  Grid,
  Progress,
  Badge,
  ThemeIcon,
  Box,
  Skeleton,
} from "@mantine/core";
import {
  IconApi,
  IconDatabase,
  IconMail,
  IconUsers,
  IconTrendingUp,
  IconTrendingDown,
  IconMinus,
} from "@tabler/icons-react";
import type {
  UsageMetric,
  UsageMetricType,
} from "@/entities/usage/types/usage-types";

interface UsageMetricsGridProps {
  usageMetrics: UsageMetric[];
  loading?: boolean;
}

interface MetricConfig {
  icon: React.ReactNode;
  label: string;
  unit: string;
  color: string;
  limit: number;
}

const METRIC_CONFIGS: Record<UsageMetricType, MetricConfig> = {
  api_calls: {
    icon: <IconApi size={20} />,
    label: "API Calls",
    unit: "calls",
    color: "blue",
    limit: 50000,
  },
  storage_gb: {
    icon: <IconDatabase size={20} />,
    label: "Storage",
    unit: "GB",
    color: "green",
    limit: 100,
  },
  email_sends: {
    icon: <IconMail size={20} />,
    label: "Email Sends",
    unit: "emails",
    color: "orange",
    limit: 5000,
  },
  active_users: {
    icon: <IconUsers size={20} />,
    label: "Active Users",
    unit: "users",
    color: "purple",
    limit: 100,
  },
};

export const UsageMetricsGrid: React.FC<UsageMetricsGridProps> = ({
  usageMetrics,
  loading = false,
}) => {
  const formatValue = (value: number, unit: string) => {
    if (unit === "GB") {
      return `${value.toFixed(1)} ${unit}`;
    }
    return `${value.toLocaleString()} ${unit}`;
  };

  const getUtilizationPercentage = (current: number, limit: number) => {
    return Math.min((current / limit) * 100, 100);
  };

  const getUtilizationColor = (percentage: number) => {
    if (percentage >= 90) {
      return "red";
    }
    if (percentage >= 75) {
      return "orange";
    }
    if (percentage >= 50) {
      return "yellow";
    }
    return "green";
  };

  const getTrendIcon = (trend: "increasing" | "decreasing" | "stable") => {
    switch (trend) {
      case "increasing":
        return <IconTrendingUp size={14} color="green" />;
      case "decreasing":
        return <IconTrendingDown size={14} color="red" />;
      default:
        return <IconMinus size={14} color="gray" />;
    }
  };

  // Mock current usage data - in real app this would come from usageMetrics
  const currentUsage = {
    api_calls: 37500,
    storage_gb: 68.5,
    email_sends: 3200,
    active_users: 78,
  };

  // Mock trend data
  const trends = {
    api_calls: "increasing" as const,
    storage_gb: "stable" as const,
    email_sends: "decreasing" as const,
    active_users: "increasing" as const,
  };

  if (loading) {
    return (
      <Grid>
        {Object.keys(METRIC_CONFIGS).map((key) => (
          <Grid.Col key={key} span={{ base: 12, sm: 6, lg: 3 }}>
            <Card withBorder radius="md" p="lg">
              <Stack gap="md">
                <Skeleton height={20} width="60%" />
                <Skeleton height={40} width="80%" />
                <Skeleton height={8} />
              </Stack>
            </Card>
          </Grid.Col>
        ))}
      </Grid>
    );
  }

  return (
    <Grid>
      {Object.entries(METRIC_CONFIGS).map(([metricType, config]) => {
        const current = currentUsage[metricType as UsageMetricType] || 0;
        const percentage = getUtilizationPercentage(current, config.limit);
        const trend = trends[metricType as UsageMetricType];

        return (
          <Grid.Col key={metricType} span={{ base: 12, sm: 6, lg: 3 }}>
            <Card withBorder radius="md" p="lg" h="100%">
              <Stack gap="md">
                {/* Header */}
                <Group justify="space-between" align="flex-start">
                  <Group gap="sm" align="center">
                    <ThemeIcon variant="light" size="md" color={config.color}>
                      {config.icon}
                    </ThemeIcon>
                    <Text size="sm" fw={500}>
                      {config.label}
                    </Text>
                  </Group>
                  {getTrendIcon(trend)}
                </Group>

                {/* Current Usage */}
                <Box>
                  <Text size="xl" fw={700} c={config.color}>
                    {formatValue(current, config.unit)}
                  </Text>
                  <Text size="xs" c="dimmed">
                    of {formatValue(config.limit, config.unit)} limit
                  </Text>
                </Box>

                {/* Progress Bar */}
                <Box>
                  <Group justify="space-between" mb="xs">
                    <Text size="xs" c="dimmed">
                      Usage
                    </Text>
                    <Text size="xs" c="dimmed">
                      {percentage.toFixed(1)}%
                    </Text>
                  </Group>
                  <Progress
                    value={percentage}
                    color={getUtilizationColor(percentage)}
                    size="sm"
                    radius="xl"
                  />
                </Box>

                {/* Status Badge */}
                <Group justify="space-between" align="center">
                  <Badge
                    variant="light"
                    color={getUtilizationColor(percentage)}
                    size="sm"
                  >
                    {percentage >= 90
                      ? "Critical"
                      : percentage >= 75
                        ? "High"
                        : percentage >= 50
                          ? "Moderate"
                          : "Low"}
                  </Badge>
                  {percentage >= 90 && (
                    <Text size="xs" c="red" fw={500}>
                      Upgrade recommended
                    </Text>
                  )}
                </Group>
              </Stack>
            </Card>
          </Grid.Col>
        );
      })}
    </Grid>
  );
};
