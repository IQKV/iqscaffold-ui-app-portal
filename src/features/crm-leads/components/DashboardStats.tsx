import { SimpleGrid, Paper, Stack, Text, Group, ThemeIcon, Card, Title } from "@mantine/core";
import { t } from "@lingui/core/macro";
import {
  IconUsers,
  IconUserCheck,
  IconTrophy,
  IconX,
  IconChartPie,
  IconChartBar,
} from "@tabler/icons-react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts";
import type { DashboardStats as DashboardStatsType, DashboardStatsParams } from "@/shared/api/crm/types";

interface DashboardStatsProps {
  stats: DashboardStatsType;
  dateRange?: DashboardStatsParams;
}

/**
 * DashboardStats - Dashboard statistics cards and charts
 * 
 * Features:
 * - Pipeline stage distribution chart (Requirement 7.1)
 * - Lead source pie chart with tooltips (Requirement 7.4, 7.6)
 * - Conversion metrics and KPI cards (Requirement 7.2, 7.3)
 * 
 * Requirements: 7.1, 7.2, 7.3, 7.4, 7.6
 */
export function DashboardStats({ stats, dateRange }: DashboardStatsProps) {
  return (
    <Stack gap="xl">
      {/* KPI Cards (Requirement 7.3) */}
      <SimpleGrid cols={{ base: 1, sm: 2, lg: 4 }} spacing="lg">
        <KPICard
          title={t`Total Leads`}
          value={stats.totalLeads}
          icon={<IconUsers size={24} />}
          color="blue"
        />
        <KPICard
          title={t`Active Leads`}
          value={stats.activeLeads}
          icon={<IconUserCheck size={24} />}
          color="cyan"
        />
        <KPICard
          title={t`Won Leads`}
          value={stats.wonLeads}
          icon={<IconTrophy size={24} />}
          color="green"
        />
        <KPICard
          title={t`Lost Leads`}
          value={stats.lostLeads}
          icon={<IconX size={24} />}
          color="red"
        />
      </SimpleGrid>

      {/* Charts */}
      <SimpleGrid cols={{ base: 1, lg: 2 }} spacing="lg">
        {/* Pipeline Stage Distribution Chart (Requirement 7.1) */}
        <PipelineStageChart leadsByStage={stats.leadsByStage} />

        {/* Lead Source Pie Chart (Requirement 7.4) */}
        <LeadSourceChart leadsBySource={stats.leadsBySource} />
      </SimpleGrid>
    </Stack>
  );
}

interface KPICardProps {
  title: string;
  value: number;
  icon: React.ReactNode;
  color: string;
}

/**
 * KPICard - Key Performance Indicator card
 * Displays a single metric with an icon and color
 */
function KPICard({ title, value, icon, color }: KPICardProps) {
  return (
    <Paper p="md" withBorder data-testid={`kpi-card-${title.toLowerCase().replace(/\s+/g, "-")}`}>
      <Group justify="space-between">
        <Stack gap={4}>
          <Text size="xs" c="dimmed" tt="uppercase" fw={700}>
            {title}
          </Text>
          <Text size="xl" fw={700} data-testid={`kpi-value-${title.toLowerCase().replace(/\s+/g, "-")}`}>
            {value.toLocaleString()}
          </Text>
        </Stack>
        <ThemeIcon size="xl" radius="md" variant="light" color={color}>
          {icon}
        </ThemeIcon>
      </Group>
    </Paper>
  );
}

interface PipelineStageChartProps {
  leadsByStage: Record<string, number>;
}

/**
 * PipelineStageChart - Bar chart showing lead distribution by pipeline stage
 * 
 * Features:
 * - Bar chart visualization of leads per stage
 * - Tooltips with detailed values (Requirement 7.6)
 * - Color-coded bars for visual clarity
 * 
 * Requirements: 7.1, 7.6
 */
function PipelineStageChart({ leadsByStage }: PipelineStageChartProps) {
  // Transform data for chart
  const chartData = Object.entries(leadsByStage).map(([stage, count]) => ({
    stage,
    count,
  }));

  // Colors for bars
  const COLORS = ["#228be6", "#12b886", "#fab005", "#fa5252", "#be4bdb"];

  return (
    <Card shadow="sm" padding="lg" radius="md" withBorder data-testid="pipeline-stage-chart">
      <Stack gap="md">
        <Group gap="xs">
          <IconChartBar size={20} />
          <Title order={4}>{t`Leads by Pipeline Stage`}</Title>
        </Group>

        {chartData.length === 0 ? (
          <Text size="sm" c="dimmed" ta="center" py="xl">
            {t`No pipeline data available`}
          </Text>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="stage"
                angle={-45}
                textAnchor="end"
                height={100}
                interval={0}
              />
              <YAxis />
              <Tooltip
                contentStyle={{
                  backgroundColor: "white",
                  border: "1px solid #e0e0e0",
                  borderRadius: "4px",
                }}
                formatter={(value: number | undefined) => [value ?? 0, t`Leads`]}
              />
              <Bar dataKey="count" fill="#228be6" radius={[8, 8, 0, 0]}>
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </Stack>
    </Card>
  );
}

interface LeadSourceChartProps {
  leadsBySource: Record<string, number>;
}

/**
 * LeadSourceChart - Pie chart showing lead distribution by source
 * 
 * Features:
 * - Pie chart visualization of leads per source
 * - Tooltips with detailed values and percentages (Requirement 7.6)
 * - Legend for source identification
 * - Color-coded segments
 * 
 * Requirements: 7.4, 7.6
 */
function LeadSourceChart({ leadsBySource }: LeadSourceChartProps) {
  // Transform data for chart
  const chartData = Object.entries(leadsBySource).map(([source, count]) => ({
    name: source,
    value: count,
  }));

  // Calculate total for percentage
  const total = chartData.reduce((sum, item) => sum + item.value, 0);

  // Colors for pie segments
  const COLORS = ["#228be6", "#12b886", "#fab005", "#fa5252", "#be4bdb", "#fd7e14", "#20c997", "#e64980"];

  // Custom tooltip with percentage (Requirement 7.6)
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0];
      const percentage = total > 0 ? ((data.value / total) * 100).toFixed(1) : 0;
      return (
        <Paper p="xs" withBorder shadow="sm">
          <Stack gap={4}>
            <Text size="sm" fw={600}>
              {data.name}
            </Text>
            <Text size="sm">
              {t`Leads`}: {data.value}
            </Text>
            <Text size="sm" c="dimmed">
              {percentage}%
            </Text>
          </Stack>
        </Paper>
      );
    }
    return null;
  };

  return (
    <Card shadow="sm" padding="lg" radius="md" withBorder data-testid="lead-source-chart">
      <Stack gap="md">
        <Group gap="xs">
          <IconChartPie size={20} />
          <Title order={4}>{t`Leads by Source`}</Title>
        </Group>

        {chartData.length === 0 ? (
          <Text size="sm" c="dimmed" ta="center" py="xl">
            {t`No source data available`}
          </Text>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} (${((percent ?? 0) * 100).toFixed(0)}%)`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        )}
      </Stack>
    </Card>
  );
}
