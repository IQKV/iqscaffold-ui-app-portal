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
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";
import type {
  DashboardStats as DashboardStatsType,
  DashboardStatsParams,
} from "@/shared/api/crm/types";

interface DashboardStatsProps {
  stats: DashboardStatsType;
  dateRange?: DashboardStatsParams;
  isMobile?: boolean;
}

/**
 * DashboardStats - Dashboard statistics cards and charts
 *
 * Features:
 * - Pipeline stage distribution chart (Requirement 7.1)
 * - Lead source pie chart with tooltips (Requirement 7.4, 7.6)
 * - Conversion metrics and KPI cards (Requirement 7.2, 7.3)
 * - Mobile-optimized stacked layout (Requirement 12.5)
 * - Simplified metrics display for mobile
 *
 * Requirements: 7.1, 7.2, 7.3, 7.4, 7.6, 12.5
 */
export function DashboardStats({ stats, dateRange, isMobile = false }: DashboardStatsProps) {
  return (
    <Stack gap={isMobile ? "md" : "xl"}>
      {/* KPI Cards (Requirement 7.3, 12.5) */}
      <SimpleGrid cols={{ base: 2, sm: 2, lg: 4 }} spacing={isMobile ? "xs" : "lg"}>
        <KPICard
          title={t`Total Leads`}
          value={stats.totalLeads}
          icon={<IconUsers size={isMobile ? 20 : 24} />}
          color="blue"
          isMobile={isMobile}
        />
        <KPICard
          title={t`Active Leads`}
          value={stats.activeLeads}
          icon={<IconUserCheck size={isMobile ? 20 : 24} />}
          color="cyan"
          isMobile={isMobile}
        />
        <KPICard
          title={t`Won Leads`}
          value={stats.wonLeads}
          icon={<IconTrophy size={isMobile ? 20 : 24} />}
          color="green"
          isMobile={isMobile}
        />
        <KPICard
          title={t`Lost Leads`}
          value={stats.lostLeads}
          icon={<IconX size={isMobile ? 20 : 24} />}
          color="red"
          isMobile={isMobile}
        />
      </SimpleGrid>

      {/* Charts - Stacked on mobile (Requirement 12.5) */}
      <SimpleGrid cols={{ base: 1, lg: 2 }} spacing={isMobile ? "md" : "lg"}>
        {/* Pipeline Stage Distribution Chart (Requirement 7.1) */}
        <PipelineStageChart leadsByStage={stats.leadsByStage} isMobile={isMobile} />

        {/* Lead Source Pie Chart (Requirement 7.4) */}
        <LeadSourceChart leadsBySource={stats.leadsBySource} isMobile={isMobile} />
      </SimpleGrid>
    </Stack>
  );
}

interface KPICardProps {
  title: string;
  value: number;
  icon: React.ReactNode;
  color: string;
  isMobile?: boolean;
}

/**
 * KPICard - Key Performance Indicator card
 * Displays a single metric with an icon and color
 * Mobile-optimized with smaller padding and text
 */
function KPICard({ title, value, icon, color, isMobile = false }: KPICardProps) {
  const safeTitle = title || "Unknown";
  return (
    <Paper
      p={isMobile ? "xs" : "md"}
      withBorder
      data-testid={`kpi-card-${safeTitle.toLowerCase().replace(/\s+/g, "-")}`}
    >
      <Group justify="space-between" wrap="nowrap">
        <Stack gap={2}>
          <Text size={isMobile ? "10px" : "xs"} c="dimmed" tt="uppercase" fw={700}>
            {title}
          </Text>
          <Text
            size={isMobile ? "lg" : "xl"}
            fw={700}
            data-testid={`kpi-value-${safeTitle.toLowerCase().replace(/\s+/g, "-")}`}
          >
            {value.toLocaleString()}
          </Text>
        </Stack>
        <ThemeIcon size={isMobile ? "lg" : "xl"} radius="md" variant="light" color={color}>
          {icon}
        </ThemeIcon>
      </Group>
    </Paper>
  );
}

interface PipelineStageChartProps {
  leadsByStage: Record<string, number>;
  isMobile?: boolean;
}

/**
 * PipelineStageChart - Bar chart showing lead distribution by pipeline stage
 *
 * Features:
 * - Bar chart visualization of leads per stage
 * - Tooltips with detailed values (Requirement 7.6)
 * - Color-coded bars for visual clarity
 * - Mobile-optimized with smaller height and rotated labels
 *
 * Requirements: 7.1, 7.6, 12.5
 */
function PipelineStageChart({ leadsByStage, isMobile = false }: PipelineStageChartProps) {
  // Transform data for chart
  const chartData = Object.entries(leadsByStage).map(([stage, count]) => ({
    stage,
    count,
  }));

  // Colors for bars
  const COLORS = ["#228be6", "#12b886", "#fab005", "#fa5252", "#be4bdb"];

  return (
    <Card
      shadow="sm"
      padding={isMobile ? "sm" : "lg"}
      radius="md"
      withBorder
      data-testid="pipeline-stage-chart"
    >
      <Stack gap={isMobile ? "xs" : "md"}>
        <Group gap="xs">
          <IconChartBar size={isMobile ? 16 : 20} />
          <Title order={isMobile ? 5 : 4}>{t`Leads by Pipeline Stage`}</Title>
        </Group>

        {chartData.length === 0 ? (
          <Text size="sm" c="dimmed" ta="center" py="xl">
            {t`No pipeline data available`}
          </Text>
        ) : (
          <ResponsiveContainer width="100%" height={isMobile ? 200 : 300}>
            <BarChart
              data={chartData}
              margin={{
                top: 20,
                right: isMobile ? 10 : 30,
                left: isMobile ? 0 : 20,
                bottom: isMobile ? 60 : 5,
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
              <YAxis tick={{ fontSize: isMobile ? 10 : 12 }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "white",
                  border: "1px solid #e0e0e0",
                  borderRadius: "4px",
                  fontSize: isMobile ? "12px" : "14px",
                }}
                formatter={(value) => [typeof value === "number" ? value : 0, t`Leads`]}
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
  isMobile?: boolean;
}

/**
 * CustomTooltip for LeadSourceChart
 * Shows detailed source information with percentage
 */
const LeadSourceTooltip = ({ active, payload, total, isMobile }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0];
    const percentage = total > 0 ? ((data.value / total) * 100).toFixed(1) : 0;
    return (
      <Paper p="xs" withBorder shadow="sm">
        <Stack gap={4}>
          <Text size={isMobile ? "xs" : "sm"} fw={600}>
            {data.name}
          </Text>
          <Text size={isMobile ? "xs" : "sm"}>
            {t`Leads`}: {data.value}
          </Text>
          <Text size={isMobile ? "xs" : "sm"} c="dimmed">
            {percentage}%
          </Text>
        </Stack>
      </Paper>
    );
  }
  return null;
};

/**
 * LeadSourceChart - Pie chart showing lead distribution by source
 *
 * Features:
 * - Pie chart visualization of leads per source
 * - Tooltips with detailed values and percentages (Requirement 7.6)
 * - Legend for source identification
 * - Color-coded segments
 * - Mobile-optimized with smaller size and simplified labels
 *
 * Requirements: 7.4, 7.6, 12.5
 */
function LeadSourceChart({ leadsBySource, isMobile = false }: LeadSourceChartProps) {
  // Transform data for chart
  const chartData = Object.entries(leadsBySource).map(([source, count]) => ({
    name: source,
    value: count,
  }));

  // Calculate total for percentage
  const total = chartData.reduce((sum, item) => sum + item.value, 0);

  // Colors for pie segments
  const COLORS = [
    "#228be6",
    "#12b886",
    "#fab005",
    "#fa5252",
    "#be4bdb",
    "#fd7e14",
    "#20c997",
    "#e64980",
  ];

  return (
    <Card
      shadow="sm"
      padding={isMobile ? "sm" : "lg"}
      radius="md"
      withBorder
      data-testid="lead-source-chart"
    >
      <Stack gap={isMobile ? "xs" : "md"}>
        <Group gap="xs">
          <IconChartPie size={isMobile ? 16 : 20} />
          <Title order={isMobile ? 5 : 4}>{t`Leads by Source`}</Title>
        </Group>

        {chartData.length === 0 ? (
          <Text size="sm" c="dimmed" ta="center" py="xl">
            {t`No source data available`}
          </Text>
        ) : (
          <ResponsiveContainer width="100%" height={isMobile ? 200 : 300}>
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={
                  isMobile
                    ? false
                    : ({ name, percent }) => `${name} (${((percent ?? 0) * 100).toFixed(0)}%)`
                }
                outerRadius={isMobile ? 60 : 80}
                fill="#8884d8"
                dataKey="value"
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip content={<LeadSourceTooltip total={total} isMobile={isMobile} />} />
              {!isMobile && <Legend wrapperStyle={{ fontSize: "12px" }} />}
            </PieChart>
          </ResponsiveContainer>
        )}
      </Stack>
    </Card>
  );
}
