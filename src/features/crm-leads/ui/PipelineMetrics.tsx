import React from "react";
import { Card, Group, Stack, Text, Badge, SimpleGrid, Tooltip } from "@mantine/core";
import { IconTrendingUp, IconClock, IconTarget } from "@tabler/icons-react";
import { t } from "@lingui/core/macro";
import type { PipelineStage, ConversionMetrics } from "@/shared/api/crm/types";

interface PipelineMetricsProps {
  stages: PipelineStage[];
  conversionMetrics?: ConversionMetrics;
  showVelocity?: boolean;
  showConversionRates?: boolean;
  extraActions?: React.ReactNode;
}

/**
 * PipelineMetrics Component
 *
 * Displays conversion rates, stage velocity, and pipeline health indicators
 * at the top of the pipeline kanban view.
 *
 * Features:
 * - Conversion rate from New to Won leads
 * - Stage velocity (average time in each stage)
 * - Pipeline health indicators
 * - Responsive grid layout
 *
 * Requirements: 7.2, 7.3, 7.5
 */
export const PipelineMetrics: React.FC<PipelineMetricsProps> = ({
  stages,
  conversionMetrics,
  showVelocity = true,
  showConversionRates = true,
  extraActions,
}) => {
  // Calculate total leads across all stages
  const totalLeads = stages.reduce((sum, stage) => sum + (stage.leadCount || 0), 0);

  // Calculate pipeline health score (percentage of leads in active stages)
  const activeLeads = stages
    .filter((stage) => stage.type === "ACTIVE")
    .reduce((sum, stage) => sum + (stage.leadCount || 0), 0);
  const healthScore = totalLeads > 0 ? Math.round((activeLeads / totalLeads) * 100) : 0;

  // Get health color based on score
  const getHealthColor = (score: number): string => {
    if (score >= 70) {
      return "green";
    }
    if (score >= 40) {
      return "yellow";
    }
    return "red";
  };

  return (
    <Card shadow="sm" padding="lg" radius="md" withBorder>
      <Stack gap="md">
        <Group justify="space-between">
          <Text size="lg" fw={600}>
            {t`Pipeline Metrics`}
          </Text>
          <Group gap="sm">
            <Tooltip label={t`Pipeline health based on active leads percentage`}>
              <Badge
                size="lg"
                color={getHealthColor(healthScore)}
                leftSection={<IconTarget size={16} />}
              >
                {t`Health`}: {healthScore}%
              </Badge>
            </Tooltip>
            {extraActions}
          </Group>
        </Group>

        <SimpleGrid cols={{ base: 1, sm: 2, md: 3, lg: 4 }} spacing="md">
          {/* Total Leads */}
          <Card shadow="xs" padding="md" radius="md" withBorder>
            <Stack gap="xs">
              <Text size="xs" c="dimmed" tt="uppercase" fw={600}>
                Total Leads
              </Text>
              <Text size="xl" fw={700}>
                {totalLeads}
              </Text>
            </Stack>
          </Card>

          {/* Conversion Rate */}
          {showConversionRates && conversionMetrics && (
            <Card shadow="xs" padding="md" radius="md" withBorder>
              <Stack gap="xs">
                <Group gap="xs">
                  <IconTrendingUp size={16} />
                  <Text size="xs" c="dimmed" tt="uppercase" fw={600}>
                    Conversion Rate
                  </Text>
                </Group>
                <Text size="xl" fw={700} c="green">
                  {conversionMetrics.conversionRate.toFixed(1)}%
                </Text>
              </Stack>
            </Card>
          )}

          {/* Average Time to Convert */}
          {showVelocity && conversionMetrics && (
            <Card shadow="xs" padding="md" radius="md" withBorder>
              <Stack gap="xs">
                <Group gap="xs">
                  <IconClock size={16} />
                  <Text size="xs" c="dimmed" tt="uppercase" fw={600}>
                    Avg. Time to Convert
                  </Text>
                </Group>
                <Text size="xl" fw={700}>
                  {conversionMetrics.averageTimeToConvert} days
                </Text>
              </Stack>
            </Card>
          )}

          {/* Active Leads */}
          <Card shadow="xs" padding="md" radius="md" withBorder>
            <Stack gap="xs">
              <Text size="xs" c="dimmed" tt="uppercase" fw={600}>
                Active Leads
              </Text>
              <Text size="xl" fw={700} c="blue">
                {activeLeads}
              </Text>
            </Stack>
          </Card>
        </SimpleGrid>

        {/* Stage Velocity Details */}
        {showVelocity && conversionMetrics && conversionMetrics.stageVelocity && (
          <Card shadow="xs" padding="md" radius="md" withBorder>
            <Stack gap="sm">
              <Text size="sm" fw={600}>
                Stage Velocity (Avg. Days)
              </Text>
              <Group gap="md">
                {Object.entries(conversionMetrics.stageVelocity).map(([stageName, days]) => (
                  <Tooltip key={stageName} label={`Average time in ${stageName}`}>
                    <Badge variant="light" size="lg">
                      {stageName}: {days}d
                    </Badge>
                  </Tooltip>
                ))}
              </Group>
            </Stack>
          </Card>
        )}

        {/* Stage Distribution */}
        <Card shadow="xs" padding="md" radius="md" withBorder>
          <Stack gap="sm">
            <Text size="sm" fw={600}>
              Stage Distribution
            </Text>
            <Group gap="md">
              {stages.map((stage) => (
                <Tooltip key={stage.id} label={`${stage.leadCount || 0} leads in ${stage.name}`}>
                  <Badge variant="filled" size="lg" style={{ backgroundColor: stage.color }}>
                    {stage.name}: {stage.leadCount || 0}
                  </Badge>
                </Tooltip>
              ))}
            </Group>
          </Stack>
        </Card>
      </Stack>
    </Card>
  );
};
