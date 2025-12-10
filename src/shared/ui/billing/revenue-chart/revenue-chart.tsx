import React from "react";
import {
  Card,
  Group,
  Text,
  Stack,
  Select,
  Badge,
  Skeleton,
  Alert,
  Box,
} from "@mantine/core";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import {
  IconTrendingUp,
  IconTrendingDown,
  IconMinus,
  IconInfoCircle,
} from "@tabler/icons-react";
import { CurrencyUtils, BillingDateUtils } from "@/shared/lib/billing-utils";
import classes from "./revenue-chart.module.css";

export interface RevenueDataPoint {
  date: string;
  mrr: number;
  arr: number;
  newRevenue: number;
  churnRevenue: number;
  netRevenue: number;
}

export interface RevenueChartProps {
  data: RevenueDataPoint[];
  loading?: boolean;
  error?: string;
  timeRange?: "7d" | "30d" | "90d" | "1y";
  onTimeRangeChange?: (range: "7d" | "30d" | "90d" | "1y") => void;
  showMRR?: boolean;
  showARR?: boolean;
  showNetRevenue?: boolean;
  currency?: string;
  height?: number;
}

const TIME_RANGE_OPTIONS = [
  { value: "7d", label: "Last 7 days" },
  { value: "30d", label: "Last 30 days" },
  { value: "90d", label: "Last 90 days" },
  { value: "1y", label: "Last year" },
];

export const RevenueChart: React.FC<RevenueChartProps> = ({
  data,
  loading = false,
  error,
  timeRange = "30d",
  onTimeRangeChange,
  showMRR = true,
  showARR = false,
  showNetRevenue = true,
  currency = "USD",
  height = 300,
}) => {
  const formatCurrency = (value: number) => {
    return CurrencyUtils.format(value, currency);
  };

  const formatTooltipValue = (value: number, name: string) => {
    return [formatCurrency(value), name];
  };

  const formatXAxisLabel = (dateStr: string) => {
    const date = new Date(dateStr);
    switch (timeRange) {
      case "7d":
        return date.toLocaleDateString("en-US", { weekday: "short" });
      case "30d":
        return date.toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        });
      case "90d":
        return date.toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        });
      case "1y":
        return date.toLocaleDateString("en-US", { month: "short" });
      default:
        return dateStr;
    }
  };

  const calculateTrend = () => {
    if (data.length < 2) {
      return { direction: "stable", percentage: 0 };
    }

    const latest = data[data.length - 1];
    const previous = data[data.length - 2];
    const metric = showMRR ? "mrr" : "netRevenue";

    const currentValue = latest[metric];
    const previousValue = previous[metric];

    if (previousValue === 0) {
      return { direction: "stable", percentage: 0 };
    }

    const percentage = ((currentValue - previousValue) / previousValue) * 100;

    if (percentage > 1) {
      return { direction: "up", percentage };
    }
    if (percentage < -1) {
      return { direction: "down", percentage: Math.abs(percentage) };
    }
    return { direction: "stable", percentage: Math.abs(percentage) };
  };

  const trend = calculateTrend();

  const getTrendIcon = () => {
    switch (trend.direction) {
      case "up":
        return <IconTrendingUp size={16} />;
      case "down":
        return <IconTrendingDown size={16} />;
      default:
        return <IconMinus size={16} />;
    }
  };

  const getTrendColor = () => {
    switch (trend.direction) {
      case "up":
        return "green";
      case "down":
        return "red";
      default:
        return "gray";
    }
  };

  if (loading) {
    return (
      <Card withBorder padding="md" className={classes.revenueChart}>
        <Stack gap="md">
          <Group justify="space-between">
            <Skeleton height={24} width={120} />
            <Skeleton height={32} width={100} />
          </Group>
          <Skeleton height={height} />
        </Stack>
      </Card>
    );
  }

  if (error) {
    return (
      <Card withBorder padding="md" className={classes.revenueChart}>
        <Alert color="red" icon={<IconInfoCircle size={16} />}>
          {error}
        </Alert>
      </Card>
    );
  }

  if (data.length === 0) {
    return (
      <Card withBorder padding="md" className={classes.revenueChart}>
        <Alert color="blue" icon={<IconInfoCircle size={16} />}>
          No revenue data available for the selected time period.
        </Alert>
      </Card>
    );
  }

  const latestData = data[data.length - 1];

  return (
    <Card withBorder padding="md" className={classes.revenueChart}>
      <Stack gap="md">
        {/* Header */}
        <Group justify="space-between" align="flex-start">
          <div>
            <Text size="lg" fw={600}>
              Revenue Overview
            </Text>
            <Group gap="xs" mt="xs">
              <Text size="xl" fw={700}>
                {formatCurrency(
                  showMRR ? latestData.mrr : latestData.netRevenue
                )}
              </Text>
              <Badge
                color={getTrendColor()}
                variant="light"
                leftSection={getTrendIcon()}
                size="sm"
              >
                {trend.percentage.toFixed(1)}%
              </Badge>
            </Group>
          </div>

          {onTimeRangeChange && (
            <Select
              data={TIME_RANGE_OPTIONS}
              value={timeRange}
              onChange={(value) => onTimeRangeChange(value as any)}
              size="sm"
              w={140}
            />
          )}
        </Group>

        {/* Chart */}
        <Box className={classes.chartContainer} style={{ height }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={data}
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="var(--mantine-color-gray-3)"
              />
              <XAxis
                dataKey="date"
                tickFormatter={formatXAxisLabel}
                stroke="var(--mantine-color-gray-6)"
                fontSize={12}
              />
              <YAxis
                tickFormatter={(value) =>
                  CurrencyUtils.format(value, currency, "en-US").replace(
                    /\.\d{2}/,
                    ""
                  )
                }
                stroke="var(--mantine-color-gray-6)"
                fontSize={12}
              />
              <Tooltip
                formatter={formatTooltipValue}
                labelFormatter={(label) =>
                  `Date: ${new Date(label).toLocaleDateString()}`
                }
                contentStyle={{
                  backgroundColor: "var(--mantine-color-white)",
                  border: "1px solid var(--mantine-color-gray-3)",
                  borderRadius: "var(--mantine-radius-sm)",
                }}
              />
              <Legend />

              {showMRR && (
                <Line
                  type="monotone"
                  dataKey="mrr"
                  stroke="var(--mantine-color-blue-6)"
                  strokeWidth={2}
                  dot={{
                    fill: "var(--mantine-color-blue-6)",
                    strokeWidth: 2,
                    r: 4,
                  }}
                  activeDot={{
                    r: 6,
                    stroke: "var(--mantine-color-blue-6)",
                    strokeWidth: 2,
                  }}
                  name="MRR"
                />
              )}

              {showARR && (
                <Line
                  type="monotone"
                  dataKey="arr"
                  stroke="var(--mantine-color-green-6)"
                  strokeWidth={2}
                  dot={{
                    fill: "var(--mantine-color-green-6)",
                    strokeWidth: 2,
                    r: 4,
                  }}
                  activeDot={{
                    r: 6,
                    stroke: "var(--mantine-color-green-6)",
                    strokeWidth: 2,
                  }}
                  name="ARR"
                />
              )}

              {showNetRevenue && (
                <Line
                  type="monotone"
                  dataKey="netRevenue"
                  stroke="var(--mantine-color-purple-6)"
                  strokeWidth={2}
                  dot={{
                    fill: "var(--mantine-color-purple-6)",
                    strokeWidth: 2,
                    r: 4,
                  }}
                  activeDot={{
                    r: 6,
                    stroke: "var(--mantine-color-purple-6)",
                    strokeWidth: 2,
                  }}
                  name="Net Revenue"
                />
              )}
            </LineChart>
          </ResponsiveContainer>
        </Box>

        {/* Summary Stats */}
        <Group justify="space-around" className={classes.summaryStats}>
          <div className={classes.statItem}>
            <Text size="xs" c="dimmed" tt="uppercase" fw={600}>
              New Revenue
            </Text>
            <Text size="sm" fw={600} c="green">
              {formatCurrency(latestData.newRevenue)}
            </Text>
          </div>

          <div className={classes.statItem}>
            <Text size="xs" c="dimmed" tt="uppercase" fw={600}>
              Churn Revenue
            </Text>
            <Text size="sm" fw={600} c="red">
              -{formatCurrency(latestData.churnRevenue)}
            </Text>
          </div>

          <div className={classes.statItem}>
            <Text size="xs" c="dimmed" tt="uppercase" fw={600}>
              Net Growth
            </Text>
            <Text
              size="sm"
              fw={600}
              c={latestData.netRevenue > 0 ? "green" : "red"}
            >
              {formatCurrency(latestData.netRevenue)}
            </Text>
          </div>
        </Group>
      </Stack>
    </Card>
  );
};
