import {
  Container,
  Title,
  Stack,
  Group,
  Paper,
  Text,
  Loader,
  Alert,
} from "@mantine/core";
import { t } from "@lingui/core/macro";
import { IconAlertCircle } from "@tabler/icons-react";
import { useState } from "react";
import { useMediaQuery } from "@mantine/hooks";
import { FollowUpPanel } from "@/widgets/follow-up-panel";
import { DashboardStats } from "./DashboardStats";
import { ConversionChart } from "./ConversionChart";
import { DateRangeFilter } from "./DateRangeFilter";
import {
  useDashboardStats,
  useConversionMetrics,
} from "@/entities/crm/api/crm-queries";
import type { DashboardStatsParams } from "@/shared/api/crm/types";

/**
 * CRMDashboard - Main dashboard page for CRM statistics and follow-ups
 *
 * Features:
 * - Integrate FollowUpPanel for today's reminders (Requirement 6.1-6.7)
 * - Add dashboard statistics cards and charts (Requirement 7.1-7.4)
 * - Implement date range filtering (Requirement 7.5)
 * - Show loading states and error boundaries (Requirement 7.7)
 * - Mobile-optimized layout with stacked charts (Requirement 12.5)
 * - Touch-friendly date range selection
 * - Simplified metrics display for mobile
 *
 * Requirements: 7.1, 7.2, 7.3, 7.4, 7.5, 7.6, 7.7, 12.5
 */
export function CRMDashboard() {
  const isMobile = useMediaQuery("(max-width: 768px)");
  
  // Date range state for filtering (Requirement 7.5)
  const [dateRange, setDateRange] = useState<DashboardStatsParams | undefined>(
    undefined
  );

  // Fetch dashboard data with date range filtering
  const {
    data: dashboardStats,
    isLoading: loadingStats,
    error: statsError,
  } = useDashboardStats(dateRange);

  const {
    data: conversionMetrics,
    isLoading: loadingMetrics,
    error: metricsError,
  } = useConversionMetrics(dateRange);

  const isLoading = loadingStats || loadingMetrics;
  const hasError = statsError || metricsError;

  return (
    <Container size="xl" py={isMobile ? "sm" : "xl"} px={isMobile ? "xs" : "md"} data-testid="crm-dashboard">
      <Stack gap={isMobile ? "md" : "xl"}>
        {/* Header with date range filter */}
        <Group justify="space-between" align="center" wrap={isMobile ? "wrap" : "nowrap"}>
          <Title order={isMobile ? 2 : 1} size={isMobile ? "h3" : "h1"} data-testid="crm-dashboard-title">
            {t`CRM Dashboard`}
          </Title>

          {/* Date range filtering (Requirement 7.5, 12.5) */}
          <DateRangeFilter value={dateRange} onChange={setDateRange} isMobile={isMobile} />
        </Group>

        {/* Error state (Requirement 7.7) */}
        {hasError && !isLoading && (
          <Alert
            icon={<IconAlertCircle size={16} />}
            title={t`Error Loading Dashboard`}
            color="red"
            data-testid="dashboard-error"
          >
            {t`Failed to load dashboard data. Please try again later.`}
          </Alert>
        )}

        {/* Loading state (Requirement 7.7) */}
        {isLoading && (
          <Paper p={isMobile ? "md" : "xl"} withBorder>
            <Group justify="center" gap="md">
              <Loader size={isMobile ? "md" : "lg"} />
              <Text size={isMobile ? "sm" : "lg"} c="dimmed">
                {t`Loading dashboard statistics...`}
              </Text>
            </Group>
          </Paper>
        )}

        {/* Dashboard content */}
        {!isLoading && !hasError && dashboardStats && conversionMetrics && (
          <Stack gap={isMobile ? "md" : "xl"}>
            {/* Follow-up panel for today's reminders (Requirement 6.1-6.7) */}
            <FollowUpPanel />

            {/* Dashboard statistics cards and charts (Requirement 7.1-7.4, 12.5) */}
            <DashboardStats stats={dashboardStats} dateRange={dateRange} isMobile={isMobile} />

            {/* Conversion metrics and charts (Requirement 7.2, 7.5, 7.6, 12.5) */}
            <ConversionChart
              metrics={conversionMetrics}
              stages={dashboardStats.leadsByStage}
              dateRange={dateRange}
              isMobile={isMobile}
            />
          </Stack>
        )}
      </Stack>
    </Container>
  );
}
