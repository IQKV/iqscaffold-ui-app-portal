/**
 * Subscription Conversion Funnel Component
 * Trial to paid conversion rates visualization
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
  Skeleton,
  ThemeIcon,
} from "@mantine/core";
import { IconChartBar } from "@tabler/icons-react";

interface ConversionFunnelData {
  stage: string;
  count: number;
  conversionRate: number;
  dropoffRate: number;
}

interface SubscriptionConversionFunnelProps {
  conversionFunnel: ConversionFunnelData[];
  loading?: boolean;
}

export const SubscriptionConversionFunnel: React.FC<
  SubscriptionConversionFunnelProps
> = ({ conversionFunnel, loading = false }) => {
  const getStageColor = (index: number) => {
    const colors = ["blue", "green", "orange", "purple", "teal", "red"];
    return colors[index % colors.length];
  };

  if (loading) {
    return (
      <Card withBorder radius="md" p="lg">
        <Stack gap="md">
          <Skeleton height={24} width="60%" />
          <Stack gap="sm">
            {Array.from({ length: 6 }).map((_, index) => (
              <Skeleton key={index} height={40} />
            ))}
          </Stack>
        </Stack>
      </Card>
    );
  }

  return (
    <Card withBorder radius="md" p="lg">
      <Stack gap="md">
        <Group justify="space-between" align="center">
          <Group gap="sm" align="center">
            <ThemeIcon variant="light" size="sm" color="blue">
              <IconChartBar size={14} />
            </ThemeIcon>
            <Text size="lg" fw={600}>
              Conversion Funnel
            </Text>
          </Group>
          <Badge variant="light" color="blue" size="sm">
            Current Period
          </Badge>
        </Group>

        <Stack gap="sm">
          {conversionFunnel.map((stage, index) => (
            <Box key={stage.stage}>
              <Group justify="space-between" mb="xs">
                <Text size="sm" fw={500}>
                  {stage.stage}
                </Text>
                <Group gap="xs">
                  <Text size="sm" fw={600}>
                    {stage.count.toLocaleString()}
                  </Text>
                  <Badge variant="light" color={getStageColor(index)} size="xs">
                    {stage.conversionRate.toFixed(1)}%
                  </Badge>
                </Group>
              </Group>

              <Progress
                value={stage.conversionRate}
                color={getStageColor(index)}
                size="lg"
                radius="xl"
                mb="xs"
              />

              {stage.dropoffRate > 0 && (
                <Text size="xs" c="dimmed">
                  {stage.dropoffRate.toFixed(1)}% drop-off from previous stage
                </Text>
              )}
            </Box>
          ))}
        </Stack>

        {/* Summary */}
        <Box
          pt="md"
          style={{ borderTop: "1px solid var(--mantine-color-gray-3)" }}
        >
          <Group justify="space-between">
            <div>
              <Text size="sm" fw={500}>
                Overall Conversion
              </Text>
              <Text size="xs" c="dimmed">
                Visitor to Subscriber
              </Text>
            </div>
            <Badge variant="filled" color="blue" size="lg">
              {conversionFunnel.length > 0
                ? conversionFunnel[
                    conversionFunnel.length - 1
                  ].conversionRate.toFixed(1)
                : 0}
              %
            </Badge>
          </Group>
        </Box>
      </Stack>
    </Card>
  );
};
