import { Card, Stack, Title, Group, Text, SimpleGrid, Paper, ThemeIcon } from "@mantine/core";
import { t } from "@lingui/core/macro";
import { IconTrendingUp, IconClock, IconPercentage, IconChartLine } from "@tabler/icons-react";
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
import type { ConversionMetrics, DashboardStatsParams } from "@/shared/api/crm/types";

interface ConversionChartProps {
  metrics: ConversionMetrics;
  stages: Record<string, number>;
  dateRange?: DashboardStatsParams;
  isMobile?: boolean;
}

/**
 * ConversionChart - Conversion rate visualization and stage velocity metrics
 *
 * Features:
 * - Conversion rate visualization (Requirement 7.2)
 * - Stage velocity metrics (Requirement 7.5)
 * - Time-based trend analysis (Requirement 7.6)
 * - Tooltips with detailed information (Requirement 7.6)
 * - Mobile-optimized stacked layout (Requirement 12.5)
 *
 * Requirements: 7.2, 7.5, 7.6, 12.5
 */
export function ConversionChart({
  metrics,
  stages,
  dateRange,
  isMobile = false,
}: ConversionChartProps) {
  return (
    <Stack gap={isMobile ? "md" : "lg"}>
      {/* Conversion Metrics Cards (Requirement 7.2, 12.5) */}
      <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} spacing={isMobile ? "xs" : "lg"}>
        <MetricCard
          title={t`Conversion Rate`}
          value={`${metrics.conversionRate.toFixed(1)}%`}
          icon={<IconPercentage size={isMobile ? 20 : 24} />}
          color="green"
          description={t`Percentage of leads converted to won`}
          isMobile={isMobile}
        />
        <MetricCard
          title={t`Avg. Time to Convert`}
          value={`${metrics.averageTimeToConvert.toFixed(0)} days`}
          icon={<IconClock size={isMobile ? 20 : 24} />}
          color="blue"
          description={t`Average time from lead creation to conversion`}
          isMobile={isMobile}
        />
        <MetricCard
          title={t`Pipeline Velocity`}
          value={calculateAverageVelocity(metrics.stageVelocity)}
          icon={<IconTrendingUp size={isMobile ? 20 : 24} />}
          color="violet"
          description={t`Average days per stage`}
          isMobile={isMobile}
        />
      </SimpleGrid>

      {/* Stage Velocity Chart (Requirement 7.5, 12.5) */}
      <StageVelocityChart stageVelocity={metrics.stageVelocity} isMobile={isMobile} />
    </Stack>
  );
}

interface MetricCardProps {
  title: string;
  value: string;
  icon: React.ReactNode;
  color: string;
  description: string;
  isMobile?: boolean;
}

/**
 * MetricCard - Individual conversion metric card
 * Displays a single conversion metric with icon, value, and description
 * Mobile-optimized with smaller padding and text
 */
function MetricCard({ title, value, icon, color, description, isMobile = false }: MetricCardProps) {
  const safeTitle = title || "Unknown";
  return (
    <Paper
      p={isMobile ? "xs" : "md"}
      withBorder
      data-testid={`metric-card-${safeTitle.toLowerCase().replace(/\s+/g, "-")}`}
    >
      <Stack gap="xs">
        <Group justify="space-between" wrap="nowrap">
          <Text size={isMobile ? "10px" : "xs"} c="dimmed" tt="uppercase" fw={700}>
            {title}
          </Text>
          <ThemeIcon size={isMobile ? "md" : "lg"} radius="md" variant="light" color={color}>
            {icon}
          </ThemeIcon>
        </Group>
        <Text
          size={isMobile ? "lg" : "xl"}
          fw={700}
          data-testid={`metric-value-${safeTitle.toLowerCase().replace(/\s+/g, "-")}`}
        >
          {value}
        </Text>
        <Text size={isMobile ? "10px" : "xs"} c="dimmed">
          {description}
        </Text>
      </Stack>
    </Paper>
  );
}

interface StageVelocityChartProps {
  stageVelocity: Record<string, number>;
  isMobile?: boolean;
}

/**
 * CustomTooltip for StageVelocityChart
 * Shows detailed stage information on hover
 */
const StageVelocityTooltip = ({ active, payload, isMobile }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0];
    return (
      <Paper p="xs" withBorder shadow="sm">
        <Stack gap={4}>
          <Text size={isMobile ? "xs" : "sm"} fw={600}>
            {data.payload.stage}
          </Text>
          <Text size={isMobile ? "xs" : "sm"}>
            {t`Average Time`}: {data.value} {t`days`}
          </Text>
        </Stack>
      </Paper>
    );
  }
  return null;
};

/**
 * StageVelocityChart - Line chart showing average time spent in each stage
 *
 * Features:
 * - Line chart visualization of stage velocity
 * - Tooltips with detailed time values (Requirement 7.6)
 * - Time-based trend analysis (Requirement 7.6)
 * - Mobile-optimized with smaller height and simplified layout
 *
 * Requirements: 7.5, 7.6, 12.5
 */
function StageVelocityChart({ stageVelocity, isMobile = false }: StageVelocityChartProps) {
  // Transform data for chart
  const chartData = Object.entries(stageVelocity).map(([stage, days]) => ({
    stage,
    days: Number(days.toFixed(1)),
  }));

  return (
    <Card
      shadow="sm"
      padding={isMobile ? "sm" : "lg"}
      radius="md"
      withBorder
      data-testid="stage-velocity-chart"
    >
      <Stack gap={isMobile ? "xs" : "md"}>
        <Group gap="xs">
          <IconChartLine size={isMobile ? 16 : 20} />
          <Title order={isMobile ? 5 : 4}>{t`Stage Velocity (Average Days per Stage)`}</Title>
        </Group>

        {chartData.length === 0 ? (
          <Text size="sm" c="dimmed" ta="center" py="xl">
            {t`No velocity data available`}
          </Text>
        ) : (
          <ResponsiveContainer width="100%" height={isMobile ? 200 : 300}>
            <LineChart
              data={chartData}
              margin={{
                top: 20,
                right: isMobile ? 10 : 30,
                left: isMobile ? 0 : 20,
                bottom: isMobile ? 60 : 60,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="stage"
                angle={-45}
                textAnchor="end"
                height={isMobile ? 80 : 100}
                interval={0}
                tick={{ fontSize: isMobile ? 10 : 12 }}
              />
              <YAxis
                label={
                  !isMobile
                    ? {
                        value: t`Days`,
                        angle: -90,
                        position: "insideLeft",
                      }
                    : undefined
                }
                tick={{ fontSize: isMobile ? 10 : 12 }}
              />
              <Tooltip content={<StageVelocityTooltip isMobile={isMobile} />} />
              {!isMobile && <Legend />}
              <Line
                type="monotone"
                dataKey="days"
                stroke="#228be6"
                strokeWidth={2}
                dot={{ fill: "#228be6", r: isMobile ? 3 : 5 }}
                activeDot={{ r: isMobile ? 5 : 7 }}
                name={t`Average Days`}
              />
            </LineChart>
          </ResponsiveContainer>
        )}

        {/* Summary statistics - simplified on mobile */}
        {chartData.length > 0 && (
          <Group
            justify="space-around"
            mt={isMobile ? "xs" : "md"}
            wrap={isMobile ? "wrap" : "nowrap"}
          >
            <Stack gap={2} align="center">
              <Text size={isMobile ? "10px" : "xs"} c="dimmed" tt="uppercase">
                {t`Fastest Stage`}
              </Text>
              <Text size={isMobile ? "xs" : "sm"} fw={600}>
                {getFastestStage(stageVelocity)}
              </Text>
            </Stack>
            <Stack gap={2} align="center">
              <Text size={isMobile ? "10px" : "xs"} c="dimmed" tt="uppercase">
                {t`Slowest Stage`}
              </Text>
              <Text size={isMobile ? "xs" : "sm"} fw={600}>
                {getSlowestStage(stageVelocity)}
              </Text>
            </Stack>
            <Stack gap={2} align="center">
              <Text size={isMobile ? "10px" : "xs"} c="dimmed" tt="uppercase">
                {t`Total Pipeline Time`}
              </Text>
              <Text size={isMobile ? "xs" : "sm"} fw={600}>
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
function calculateAverageVelocity(stageVelocity: Record<string, number>): string {
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

  const fastest = entries.reduce((min, curr) => (curr[1] < min[1] ? curr : min));

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

  const slowest = entries.reduce((max, curr) => (curr[1] > max[1] ? curr : max));

  return `${slowest[0]} (${slowest[1].toFixed(1)}d)`;
}

/**
 * Helper function to calculate total pipeline time
 */
function getTotalPipelineTime(stageVelocity: Record<string, number>): string {
  const total = Object.values(stageVelocity).reduce((sum, v) => sum + v, 0);
  return total.toFixed(1);
}
