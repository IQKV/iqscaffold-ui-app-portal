/**
 * Usage Trend Charts Component
 * Historical usage patterns with interactive filtering
 */

import React, { useState } from "react";
import {
  Card,
  Text,
  Group,
  Stack,
  Select,
  MultiSelect,
  DatePickerInput,
  Skeleton,
  Box,
  Badge,
} from "@mantine/core";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { IconCalendar, IconChartLine } from "@tabler/icons-react";
import type { UsageTrendData, UsageMetricType } from "@/entities/usage/types/usage-types";

interface UsageTrendChartsProps {
  usageTrends: UsageTrendData[];
  dateRange: { start: Date; end: Date };
  onDateRangeChange: (range: { start: Date; end: Date }) => void;
  selectedMetrics: UsageMetricType[];
  onMetricsChange: (metrics: UsageMetricType[]) => void;
  loading?: boolean;
}

const METRIC_COLORS = {
  api_calls: "#228be6",
  storage_gb: "#40c057",
  email_sends: "#fd7e14",
  active_users: "#7c2d12",
};

const METRIC_LABELS = {
  api_calls: "API Calls",
  storage_gb: "Storage (GB)",
  email_sends: "Email Sends",
  active_users: "Active Users",
};

export const UsageTrendCharts: React.FC<UsageTrendChartsProps> = ({
  usageTrends,
  dateRange,
  onDateRangeChange,
  selectedMetrics,
  onMetricsChange,
  loading = false,
}) => {
  const [chartType, setChartType] = useState<"daily" | "weekly" | "monthly">("daily");

  // Mock chart data - in real app this would be processed from usageTrends
  const chartData = [
    {
      date: "2024-01-01",
      api_calls: 1200,
      storage_gb: 45.2,
      email_sends: 280,
      active_users: 65,
    },
    {
      date: "2024-01-02",
      api_calls: 1350,
      storage_gb: 46.1,
      email_sends: 320,
      active_users: 68,
    },
    {
      date: "2024-01-03",
      api_calls: 1180,
      storage_gb: 46.8,
      email_sends: 295,
      active_users: 72,
    },
    {
      date: "2024-01-04",
      api_calls: 1420,
      storage_gb: 47.5,
      email_sends: 340,
      active_users: 75,
    },
    {
      date: "2024-01-05",
      api_calls: 1580,
      storage_gb: 48.2,
      email_sends: 380,
      active_users: 78,
    },
    {
      date: "2024-01-06",
      api_calls: 1320,
      storage_gb: 48.9,
      email_sends: 310,
      active_users: 76,
    },
    {
      date: "2024-01-07",
      api_calls: 1450,
      storage_gb: 49.5,
      email_sends: 350,
      active_users: 80,
    },
  ];

  const formatTooltipValue = (value: number, name: string) => {
    if (name === "storage_gb") {
      return [`${value.toFixed(1)} GB`, METRIC_LABELS[name as UsageMetricType]];
    }
    return [value.toLocaleString(), METRIC_LABELS[name as UsageMetricType]];
  };

  const formatXAxisLabel = (tickItem: string) => {
    const date = new Date(tickItem);
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  if (loading) {
    return (
      <Card withBorder radius="md" p="lg">
        <Stack gap="md">
          <Skeleton height={24} width="60%" />
          <Group gap="md">
            <Skeleton height={36} width={150} />
            <Skeleton height={36} width={200} />
          </Group>
          <Skeleton height={300} />
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
            <IconChartLine size={20} />
            <Text size="lg" fw={600}>
              Usage Trends
            </Text>
          </Group>
          <Badge variant="light" color="blue" size="sm">
            {selectedMetrics.length} metric{selectedMetrics.length !== 1 ? "s" : ""}
          </Badge>
        </Group>

        {/* Filters */}
        <Group gap="md">
          <Select
            label="Time Period"
            value={chartType}
            onChange={(value) => setChartType(value as "daily" | "weekly" | "monthly")}
            data={[
              { value: "daily", label: "Daily" },
              { value: "weekly", label: "Weekly" },
              { value: "monthly", label: "Monthly" },
            ]}
            w={120}
          />

          <MultiSelect
            label="Metrics"
            value={selectedMetrics}
            onChange={(value) => onMetricsChange(value as UsageMetricType[])}
            data={[
              { value: "api_calls", label: "API Calls" },
              { value: "storage_gb", label: "Storage" },
              { value: "email_sends", label: "Email Sends" },
              { value: "active_users", label: "Active Users" },
            ]}
            w={250}
          />

          <DatePickerInput
            type="range"
            label="Date Range"
            leftSection={<IconCalendar size={16} />}
            value={[dateRange.start, dateRange.end]}
            onChange={(value) => {
              if (value[0] && value[1]) {
                onDateRangeChange({ start: value[0], end: value[1] });
              }
            }}
            w={200}
          />
        </Group>

        {/* Chart */}
        <Box h={300}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="date"
                tickFormatter={formatXAxisLabel}
                fontSize={12}
              />
              <YAxis fontSize={12} />
              <Tooltip
                formatter={formatTooltipValue}
                labelFormatter={(label) => `Date: ${formatXAxisLabel(label)}`}
              />
              <Legend />
              {selectedMetrics.map((metric) => (
                <Line
                  key={metric}
                  type="monotone"
                  dataKey={metric}
                  stroke={METRIC_COLORS[metric]}
                  strokeWidth={2}
                  dot={{ r: 4 }}
                  activeDot={{ r: 6 }}
                  name={METRIC_LABELS[metric]}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </Box>

        {/* Summary Stats */}
        <Group justify="space-around" pt="md" style={{ borderTop: "1px solid var(--mantine-color-gray-3)" }}>
          {selectedMetrics.map((metric) => {
            const values = chartData.map(d => d[metric]);
            const avg = values.reduce((sum, val) => sum + val, 0) / values.length;
            const trend = values[values.length - 1] > values[0] ? "up" : "down";
            
            return (
              <Box key={metric} ta="center">
                <Text size="xs" c="dimmed" mb="xs">
                  {METRIC_LABELS[metric]} Avg
                </Text>
                <Text size="sm" fw={600} c={METRIC_COLORS[metric]}>
                  {metric === "storage_gb" ? `${avg.toFixed(1)} GB` : avg.toLocaleString()}
                </Text>
                <Badge
                  variant="light"
                  color={trend === "up" ? "green" : "red"}
                  size="xs"
                >
                  {trend === "up" ? "↗" : "↘"} Trend
                </Badge>
              </Box>
            );
          })}
        </Group>
      </Stack>
    </Card>
  );
};