import {
  Card,
  Stack,
  Title,
  Group,
  Text,
  SimpleGrid,
  Paper,
  ThemeIcon,
} from "@mantine/core";
import { t } from "@lingui/core/macro";
import {
  IconTrendingUp,
  IconClock,
  IconPercentage,
  IconChartLine,
} from "@tabler/icons-react";
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
import type {
  ConversionMetrics,
  DashboardStatsParams,
} from "@/shared/api/crm/types";

interface ConversionChartProps {
  metrics: ConversionMetrics;
  stages: Record<string, number>;
  dateRange?: DashboardStatsParams;
}

/**
 * ConversionChart - Conversion rate visualization and stage velocity metrics
 *
 * Features:
 * - Conversion rate visualization (Requirement 7.2)
 * - Stage velocity metrics (Requirement 7.5)
 * - Time-based trend analysis (Requirement 7.6)
 * - Tooltips with detailed information (Requirement 7.6)
 *
 * Requirements: 7.2, 7.5, 7.6
 */
export function ConversionChart({
  metrics,
  stages,
  dateRange,
}: ConversionChartProps) {
  return (
    <Stack gap="lg">
      {/* Conversion Metrics Cards (Requirement 7.2) */}
      <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} spacing="lg">
        <MetricCard
          title={t`Conversion Rate`}
          value={`${metrics.conversionRate.toFixed(1)}%`}
          icon={<IconPercentage size={24} />}
          color="green"
          description={t`Percentage of leads converted to won`}
        />
        <MetricCard
          title={t`Avg. Time to Convert`}
          value={`${metrics.averageTimeToConvert.toFixed(0)} days`}
          icon={<IconClock size={24} />}
          color="blue"
          description={t`Average time from lead creation to conversion`}
        />
        <MetricCard
          title={t`Pipeline Velocity`}
          value={calculateAverageVelocity(metrics.stageVelocity)}
          icon={<IconTrendingUp size={24} />}
          color="violet"
          description={t`Average days per stage`}
        />
      </SimpleGrid>

      {/* Stage Velocity Chart (Requirement 7.5) */}
      <StageVelocityChart stageVelocity={metrics.stageVelocity} />
    </Stack>
  );
}

interface MetricCardProps {
  title: string;
  value: string;
  icon: React.ReactNode;
  color: string;
  description: string;
}

/**
 * MetricCard - Individual conversion metric card
 * Displays a single conversion metric with icon, value, and description
 */
function MetricCard({
  title,
  value,
  icon,
  color,
  description,
}: MetricCardProps) {
  return (
    <Paper
      p="md"
      withBorder
      data-testid={`metric-card-${title.toLowerCase().replace(/\s+/g, "-")}`}
    >
      <Stack gap="xs">
        <Group justify="space-between">
          <Text size="xs" c="dimmed" tt="uppercase" fw={700}>
            {title}
          </Text>
          <ThemeIcon size="lg" radius="md" variant="light" color={color}>
            {icon}
          </ThemeIcon>
        </Group>
        <Text
          size="xl"
          fw={700}
          data-testid={`metric-value-${title.toLowerCase().replace(/\s+/g, "-")}`}
        >
          {value}
        </Text>
        <Text size="xs" c="dimmed">
          {description}
        </Text>
      </Stack>
    </Paper>
  );
}

interface StageVelocityChartProps {
  stageVelocity: Record<string, number>;
}

/**
 * StageVelocityChart - Line chart showing average time spent in each stage
 *
 * Features:
 * - Line chart visualization of stage velocity
 * - Tooltips with detailed time values (Requirement 7.6)
 * - Time-based trend analysis (Requirement 7.6)
 *
 * Requirements: 7.5, 7.6
 */
function StageVelocityChart({ stageVelocity }: StageVelocityChartProps) {
  // Transform data for chart
  const chartData = Object.entries(stageVelocity).map(([stage, days]) => ({
    stage,
    days: Number(days.toFixed(1)),
  }));

  // Custom tooltip with detailed information (Requirement 7.6)
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0];
      return (
        <Paper p="xs" withBorder shadow="sm">
          <Stack gap={4}>
            <Text size="sm" fw={600}>
              {data.payload.stage}
            </Text>
            <Text size="sm">
              {t`Average Time`}: {data.value} {t`days`}
            </Text>
          </Stack>
        </Paper>
      );
    }
    return null;
  };

  return (
    <Card
      shadow="sm"
      padding="lg"
      radius="md"
      withBorder
      data-testid="stage-velocity-chart"
    >
      <Stack gap="md">
        <Group gap="xs">
          <IconChartLine size={20} />
          <Title order={4}>{t`Stage Velocity (Average Days per Stage)`}</Title>
        </Group>

        {chartData.length === 0 ? (
          <Text size="sm" c="dimmed" ta="center" py="xl">
            {t`No velocity data available`}
          </Text>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart
              data={chartData}
              margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="stage"
                angle={-45}
                textAnchor="end"
                height={100}
                interval={0}
              />
              <YAxis
                label={{
                  value: t`Days`,
                  angle: -90,
                  position: "insideLeft",
                }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Line
                type="monotone"
                dataKey="days"
                stroke="#228be6"
                strokeWidth={2}
                dot={{ fill: "#228be6", r: 5 }}
                activeDot={{ r: 7 }}
                name={t`Average Days`}
              />
            </LineChart>
          </ResponsiveContainer>
        )}

        {/* Summary statistics */}
        {chartData.length > 0 && (
          <Group justify="space-around" mt="md">
            <Stack gap={4} align="center">
              <Text size="xs" c="dimmed" tt="uppercase">
                {t`Fastest Stage`}
              </Text>
              <Text size="sm" fw={600}>
                {getFastestStage(stageVelocity)}
              </Text>
            </Stack>
            <Stack gap={4} align="center">
              <Text size="xs" c="dimmed" tt="uppercase">
                {t`Slowest Stage`}
              </Text>
              <Text size="sm" fw={600}>
                {getSlowestStage(stageVelocity)}
              </Text>
            </Stack>
            <Stack gap={4} align="center">
              <Text size="xs" c="dimmed" tt="uppercase">
                {t`Total Pipeline Time`}
              </Text>
              <Text size="sm" fw={600}>
                {getTotalPipelineTime(stageVelocity)} {t`days`}
              </Text>
            </Stack>
          </Group>
        )}
      </Stack>
    </Card>
  );
}

/**
 * Helper function to calculate average velocity across all stages
 */
function calculateAverageVelocity(
  stageVelocity: Record<string, number>
): string {
  const velocities = Object.values(stageVelocity);
  if (velocities.length === 0) {
    return "0 days";
  }

  const average = velocities.reduce((sum, v) => sum + v, 0) / velocities.length;
  return `${average.toFixed(1)} days`;
}

/**
 * Helper function to find the fastest stage
 */
function getFastestStage(stageVelocity: Record<string, number>): string {
  const entries = Object.entries(stageVelocity);
  if (entries.length === 0) {
    return "-";
  }

  const fastest = entries.reduce((min, curr) =>
    curr[1] < min[1] ? curr : min
  );

  return `${fastest[0]} (${fastest[1].toFixed(1)}d)`;
}

/**
 * Helper function to find the slowest stage
 */
function getSlowestStage(stageVelocity: Record<string, number>): string {
  const entries = Object.entries(stageVelocity);
  if (entries.length === 0) {
    return "-";
  }

  const slowest = entries.reduce((max, curr) =>
    curr[1] > max[1] ? curr : max
  );

  return `${slowest[0]} (${slowest[1].toFixed(1)}d)`;
}

/**
 * Helper function to calculate total pipeline time
 */
function getTotalPipelineTime(stageVelocity: Record<string, number>): string {
  const total = Object.values(stageVelocity).reduce((sum, v) => sum + v, 0);
  return total.toFixed(1);
}
