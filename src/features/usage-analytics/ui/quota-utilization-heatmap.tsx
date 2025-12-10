/**
 * Quota Utilization Heatmap Component
 * Visual quota usage over time with trend indicators
 */

import React from "react";
import {
  Card,
  Text,
  Group,
  Stack,
  Progress,
  Badge,
  Box,
  Grid,
  Skeleton,
  ThemeIcon,
} from "@mantine/core";
import {
  IconTrendingUp,
  IconTrendingDown,
  IconMinus,
  IconTarget,
} from "@tabler/icons-react";
import type { QuotaUtilizationData, UsageMetricType } from "@/entities/usage/types/usage-types";

interface QuotaUtilizationHeatmapProps {
  quotaUtilization: QuotaUtilizationData[];
  loading?: boolean;
}

const METRIC_LABELS = {
  api_calls: "API Calls",
  storage_gb: "Storage",
  email_sends: "Email Sends",
  active_users: "Active Users",
};

const METRIC_COLORS = {
  api_calls: "blue",
  storage_gb: "green",
  email_sends: "orange",
  active_users: "purple",
};

export const QuotaUtilizationHeatmap: React.FC<QuotaUtilizationHeatmapProps> = ({
  quotaUtilization,
  loading = false,
}) => {
  const getUtilizationColor = (percentage: number) => {
    if (percentage >= 90) return "red";
    if (percentage >= 75) return "orange";
    if (percentage >= 50) return "yellow";
    return "green";
  };

  const getUtilizationStatus = (percentage: number) => {
    if (percentage >= 90) return "Critical";
    if (percentage >= 75) return "High";
    if (percentage >= 50) return "Moderate";
    return "Low";
  };

  const getTrendIcon = (trend: "increasing" | "decreasing" | "stable") => {
    switch (trend) {
      case "increasing":
        return <IconTrendingUp size={14} />;
      case "decreasing":
        return <IconTrendingDown size={14} />;
      default:
        return <IconMinus size={14} />;
    }
  };

  const getTrendColor = (trend: "increasing" | "decreasing" | "stable") => {
    switch (trend) {
      case "increasing":
        return "red";
      case "decreasing":
        return "green";
      default:
        return "gray";
    }
  };

  // Mock weekly utilization data for heatmap
  const weeklyData = [
    { day: "Mon", api_calls: 65, storage_gb: 45, email_sends: 55, active_users: 80 },
    { day: "Tue", api_calls: 70, storage_gb: 46, email_sends: 60, active_users: 82 },
    { day: "Wed", api_calls: 75, storage_gb: 47, email_sends: 58, active_users: 85 },
    { day: "Thu", api_calls: 80, storage_gb: 48, email_sends: 62, active_users: 88 },
    { day: "Fri", api_calls: 85, storage_gb: 49, email_sends: 65, active_users: 90 },
    { day: "Sat", api_calls: 60, storage_gb: 49, email_sends: 40, active_users: 75 },
    { day: "Sun", api_calls: 55, storage_gb: 50, email_sends: 35, active_users: 70 },
  ];

  if (loading) {
    return (
      <Card withBorder radius="md" p="lg">
        <Stack gap="md">
          <Skeleton height={24} width="60%" />
          <Stack gap="sm">
            {Array.from({ length: 4 }).map((_, index) => (
              <Skeleton key={index} height={60} />
            ))}
          </Stack>
        </Stack>
      </Card>
    );
  }

  return (
    <Card withBorder radius="md" p="lg">
      <Stack gap="md">
        {/* Header */}
        <Group justify="space-between" align="center">
          <Group gap="sm" align="center">
            <ThemeIcon variant="light" size="sm" color="blue">
              <IconTarget size={14} />
            </ThemeIcon>
            <Text size="lg" fw={600}>
              Quota Utilization
            </Text>
          </Group>
          <Badge variant="light" color="blue" size="sm">
            Current Period
          </Badge>
        </Group>

        {/* Current Utilization */}
        <Stack gap="md">
          {quotaUtilization.map((data) => (
            <Box key={data.metricType}>
              <Group justify="space-between" mb="xs">
                <Group gap="sm" align="center">
                  <Text size="sm" fw={500}>
                    {METRIC_LABELS[data.metricType]}
                  </Text>
                  <ThemeIcon
                    variant="light"
                    size="xs"
                    color={getTrendColor(data.trend)}
                  >
                    {getTrendIcon(data.trend)}
                  </ThemeIcon>
                </Group>
                <Group gap="xs" align="center">
                  <Text size="sm" fw={600}>
                    {data.utilization}%
                  </Text>
                  <Badge
                    variant="light"
                    color={getUtilizationColor(data.utilization)}
                    size="xs"
                  >
                    {getUtilizationStatus(data.utilization)}
                  </Badge>
                </Group>
              </Group>
              <Progress
                value={data.utilization}
                color={getUtilizationColor(data.utilization)}
                size="md"
                radius="xl"
              />
            </Box>
          ))}
        </Stack>

        {/* Weekly Heatmap */}
        <Box>
          <Text size="sm" fw={500} mb="md">
            Weekly Usage Pattern
          </Text>
          <Stack gap="xs">
            {Object.keys(METRIC_LABELS).map((metric) => (
              <Box key={metric}>
                <Text size="xs" c="dimmed" mb="xs">
                  {METRIC_LABELS[metric as UsageMetricType]}
                </Text>
                <Group gap="xs">
                  {weeklyData.map((day) => {
                    const value = day[metric as UsageMetricType];
                    return (
                      <Box
                        key={`${metric}-${day.day}`}
                        style={{
                          width: 24,
                          height: 24,
                          backgroundColor: `var(--mantine-color-${getUtilizationColor(value)}-2)`,
                          borderRadius: 4,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          border: `1px solid var(--mantine-color-${getUtilizationColor(value)}-4)`,
                        }}
                        title={`${day.day}: ${value}%`}
                      >
                        <Text size="xs" fw={500} c={getUtilizationColor(value)}>
                          {value}
                        </Text>
                      </Box>
                    );
                  })}
                </Group>
              </Box>
            ))}
          </Stack>
          
          {/* Legend */}
          <Group gap="md" mt="md" justify="center">
            <Group gap="xs" align="center">
              <Box
                style={{
                  width: 12,
                  height: 12,
                  backgroundColor: "var(--mantine-color-green-2)",
                  borderRadius: 2,
                }}
              />
              <Text size="xs" c="dimmed">Low (0-50%)</Text>
            </Group>
            <Group gap="xs" align="center">
              <Box
                style={{
                  width: 12,
                  height: 12,
                  backgroundColor: "var(--mantine-color-yellow-2)",
                  borderRadius: 2,
                }}
              />
              <Text size="xs" c="dimmed">Moderate (50-75%)</Text>
            </Group>
            <Group gap="xs" align="center">
              <Box
                style={{
                  width: 12,
                  height: 12,
                  backgroundColor: "var(--mantine-color-orange-2)",
                  borderRadius: 2,
                }}
              />
              <Text size="xs" c="dimmed">High (75-90%)</Text>
            </Group>
            <Group gap="xs" align="center">
              <Box
                style={{
                  width: 12,
                  height: 12,
                  backgroundColor: "var(--mantine-color-red-2)",
                  borderRadius: 2,
                }}
              />
              <Text size="xs" c="dimmed">Critical (90%+)</Text>
            </Group>
          </Group>
        </Box>

        {/* Recommendations */}
        <Box pt="md" style={{ borderTop: "1px solid var(--mantine-color-gray-3)" }}>
          <Text size="sm" fw={500} mb="xs">
            Recommendations
          </Text>
          <Stack gap="xs">
            {quotaUtilization
              .filter(data => data.utilization >= 75)
              .map(data => (
                <Text key={data.metricType} size="xs" c="dimmed">
                  • Consider upgrading {METRIC_LABELS[data.metricType]} limit
                </Text>
              ))}
            {quotaUtilization.every(data => data.utilization < 75) && (
              <Text size="xs" c="dimmed">
                • All quotas are within healthy limits
              </Text>
            )}
          </Stack>
        </Box>
      </Stack>
    </Card>
  );
};