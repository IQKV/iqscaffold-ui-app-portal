import React, { useState, useEffect, useCallback } from "react";
import {
  Modal,
  Stack,
  Group,
  Text,
  Paper,
  Badge,
  Button,
  SimpleGrid,
  Progress,
  Divider,
  Code,
} from "@mantine/core";
import { IconChartBar, IconRefresh, IconDownload } from "@tabler/icons-react";
import {
  usePerformanceMonitor,
  PERFORMANCE_BUDGETS,
} from "@/shared/lib/performance";

/**
 * PerformanceDashboard Component
 *
 * Developer tool for viewing performance metrics in real-time.
 * Shows API performance, render times, and interaction metrics.
 *
 * Requirements: 13.7
 */

interface PerformanceDashboardProps {
  opened: boolean;
  onClose: () => void;
}

export const PerformanceDashboard: React.FC<PerformanceDashboardProps> = ({
  opened,
  onClose,
}) => {
  const { getStats, exportMetrics } = usePerformanceMonitor();
  const [stats, setStats] = useState<ReturnType<typeof getStats>>(null);

  // Refresh stats - memoize to avoid recreating on every render
  const refreshStats = useCallback(() => {
    setStats(getStats());
  }, [getStats]);

  // Auto-refresh every 2 seconds when open
  useEffect(() => {
    if (opened) {
      // Initial load with setTimeout to avoid setState in effect
      const initialTimer = setTimeout(() => {
        setStats(getStats());
      }, 0);

      const interval = setInterval(() => {
        setStats(getStats());
      }, 2000);

      return () => {
        clearTimeout(initialTimer);
        clearInterval(interval);
      };
    }
  }, [opened, getStats]);

  // Export metrics to JSON
  const handleExport = () => {
    const data = exportMetrics();
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `performance-metrics-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Calculate budget usage percentage
  const getBudgetUsage = (value: number, budget: number) => {
    return Math.min((value / budget) * 100, 100);
  };

  // Get color based on budget usage
  const getBudgetColor = (value: number, budget: number) => {
    const usage = getBudgetUsage(value, budget);
    if (usage < 50) {
      return "green";
    }
    if (usage < 80) {
      return "yellow";
    }
    return "red";
  };

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={
        <Group gap="xs">
          <IconChartBar size={20} />
          <Text fw={600}>Performance Dashboard</Text>
        </Group>
      }
      size="xl"
    >
      <Stack gap="md">
        {/* Actions */}
        <Group justify="space-between">
          <Text size="sm" c="dimmed">
            Real-time performance metrics
          </Text>
          <Group gap="xs">
            <Button
              size="xs"
              variant="light"
              leftSection={<IconRefresh size={14} />}
              onClick={refreshStats}
            >
              Refresh
            </Button>
            <Button
              size="xs"
              variant="light"
              leftSection={<IconDownload size={14} />}
              onClick={handleExport}
            >
              Export
            </Button>
          </Group>
        </Group>

        {stats ? (
          <>
            {/* API Performance */}
            {stats.api && (
              <Paper p="md" withBorder>
                <Stack gap="sm">
                  <Group justify="space-between">
                    <Text fw={600}>API Performance</Text>
                    <Badge color={stats.api.errorRate > 5 ? "red" : "green"}>
                      {stats.api.count} calls
                    </Badge>
                  </Group>

                  <SimpleGrid cols={2}>
                    <div>
                      <Text size="xs" c="dimmed">
                        Average Duration
                      </Text>
                      <Group gap="xs" align="center">
                        <Text size="lg" fw={600}>
                          {stats.api.averageDuration.toFixed(0)}ms
                        </Text>
                        <Progress
                          value={getBudgetUsage(
                            stats.api.averageDuration,
                            PERFORMANCE_BUDGETS.API_RESPONSE
                          )}
                          color={getBudgetColor(
                            stats.api.averageDuration,
                            PERFORMANCE_BUDGETS.API_RESPONSE
                          )}
                          size="sm"
                          style={{ flex: 1 }}
                        />
                      </Group>
                    </div>

                    <div>
                      <Text size="xs" c="dimmed">
                        P95 Duration
                      </Text>
                      <Group gap="xs" align="center">
                        <Text size="lg" fw={600}>
                          {stats.api.p95Duration.toFixed(0)}ms
                        </Text>
                        <Progress
                          value={getBudgetUsage(
                            stats.api.p95Duration,
                            PERFORMANCE_BUDGETS.API_RESPONSE
                          )}
                          color={getBudgetColor(
                            stats.api.p95Duration,
                            PERFORMANCE_BUDGETS.API_RESPONSE
                          )}
                          size="sm"
                          style={{ flex: 1 }}
                        />
                      </Group>
                    </div>

                    <div>
                      <Text size="xs" c="dimmed">
                        Error Rate
                      </Text>
                      <Text
                        size="lg"
                        fw={600}
                        c={stats.api.errorRate > 5 ? "red" : "green"}
                      >
                        {stats.api.errorRate.toFixed(1)}%
                      </Text>
                    </div>

                    <div>
                      <Text size="xs" c="dimmed">
                        Slow Calls
                      </Text>
                      <Text
                        size="lg"
                        fw={600}
                        c={stats.api.slowCalls > 0 ? "orange" : "green"}
                      >
                        {stats.api.slowCalls}
                      </Text>
                    </div>
                  </SimpleGrid>

                  <Text size="xs" c="dimmed">
                    Budget: {PERFORMANCE_BUDGETS.API_RESPONSE}ms
                  </Text>
                </Stack>
              </Paper>
            )}

            {/* Render Performance */}
            {stats.render && (
              <Paper p="md" withBorder>
                <Stack gap="sm">
                  <Group justify="space-between">
                    <Text fw={600}>Render Performance</Text>
                    <Badge>{stats.render.count} renders</Badge>
                  </Group>

                  <SimpleGrid cols={2}>
                    <div>
                      <Text size="xs" c="dimmed">
                        Average Duration
                      </Text>
                      <Group gap="xs" align="center">
                        <Text size="lg" fw={600}>
                          {stats.render.averageDuration.toFixed(1)}ms
                        </Text>
                        <Progress
                          value={getBudgetUsage(
                            stats.render.averageDuration,
                            PERFORMANCE_BUDGETS.COMPONENT_RENDER
                          )}
                          color={getBudgetColor(
                            stats.render.averageDuration,
                            PERFORMANCE_BUDGETS.COMPONENT_RENDER
                          )}
                          size="sm"
                          style={{ flex: 1 }}
                        />
                      </Group>
                    </div>

                    <div>
                      <Text size="xs" c="dimmed">
                        P95 Duration
                      </Text>
                      <Group gap="xs" align="center">
                        <Text size="lg" fw={600}>
                          {stats.render.p95Duration.toFixed(1)}ms
                        </Text>
                        <Progress
                          value={getBudgetUsage(
                            stats.render.p95Duration,
                            PERFORMANCE_BUDGETS.COMPONENT_RENDER
                          )}
                          color={getBudgetColor(
                            stats.render.p95Duration,
                            PERFORMANCE_BUDGETS.COMPONENT_RENDER
                          )}
                          size="sm"
                          style={{ flex: 1 }}
                        />
                      </Group>
                    </div>

                    <div>
                      <Text size="xs" c="dimmed">
                        Slow Renders
                      </Text>
                      <Text
                        size="lg"
                        fw={600}
                        c={stats.render.slowRenders > 0 ? "orange" : "green"}
                      >
                        {stats.render.slowRenders}
                      </Text>
                    </div>
                  </SimpleGrid>

                  <Text size="xs" c="dimmed">
                    Budget: {PERFORMANCE_BUDGETS.COMPONENT_RENDER}ms
                  </Text>
                </Stack>
              </Paper>
            )}

            {/* Interaction Performance */}
            {stats.interaction && (
              <Paper p="md" withBorder>
                <Stack gap="sm">
                  <Group justify="space-between">
                    <Text fw={600}>User Interactions</Text>
                    <Badge>{stats.interaction.count} interactions</Badge>
                  </Group>

                  <SimpleGrid cols={2}>
                    <div>
                      <Text size="xs" c="dimmed">
                        Average Duration
                      </Text>
                      <Text size="lg" fw={600}>
                        {stats.interaction.averageDuration.toFixed(1)}ms
                      </Text>
                    </div>

                    <div>
                      <Text size="xs" c="dimmed">
                        Slow Interactions
                      </Text>
                      <Text
                        size="lg"
                        fw={600}
                        c={
                          stats.interaction.slowInteractions > 0
                            ? "orange"
                            : "green"
                        }
                      >
                        {stats.interaction.slowInteractions}
                      </Text>
                    </div>
                  </SimpleGrid>

                  <Text size="xs" c="dimmed">
                    Budget: {PERFORMANCE_BUDGETS.INTERACTION}ms
                  </Text>
                </Stack>
              </Paper>
            )}

            {/* Summary */}
            <Paper p="md" withBorder bg="gray.0">
              <Stack gap="xs">
                <Text size="sm" fw={600}>
                  Summary
                </Text>
                <Text size="xs" c="dimmed">
                  Total metrics collected: {stats.totalMetrics}
                </Text>
                <Text size="xs" c="dimmed">
                  Last updated: {new Date(stats.timestamp).toLocaleTimeString()}
                </Text>
              </Stack>
            </Paper>
          </>
        ) : (
          <Paper p="xl" withBorder>
            <Text c="dimmed" ta="center">
              No performance data available yet
            </Text>
          </Paper>
        )}
      </Stack>
    </Modal>
  );
};
