/**
 * Churn Analysis Chart Component
 * Customer and revenue churn trends visualization
 */

import React from "react";
import { Card, Text, Group, Stack, Badge, Skeleton } from "@mantine/core";
import { IconChartLine } from "@tabler/icons-react";

interface ChurnAnalysisData {
  date: Date;
  customerChurn: number;
  revenueChurn: number;
  newCustomers: number;
  expandedRevenue: number;
}

interface ChurnAnalysisChartProps {
  churnAnalysis: ChurnAnalysisData[];
  dateRange: { start: Date; end: Date };
  onDateRangeChange: (range: { start: Date; end: Date }) => void;
  loading?: boolean;
}

export const ChurnAnalysisChart: React.FC<ChurnAnalysisChartProps> = ({
  churnAnalysis,
  dateRange,
  onDateRangeChange,
  loading = false,
}) => {
  if (loading) {
    return (
      <Card withBorder radius="md" p="lg">
        <Stack gap="md">
          <Skeleton height={24} width="60%" />
          <Skeleton height={300} />
        </Stack>
      </Card>
    );
  }

  return (
    <Card withBorder radius="md" p="lg">
      <Stack gap="md">
        <Group justify="space-between" align="center">
          <Group gap="sm" align="center">
            <IconChartLine size={20} />
            <Text size="lg" fw={600}>
              Churn Analysis
            </Text>
          </Group>
          <Badge variant="light" color="blue" size="sm">
            Trend Analysis
          </Badge>
        </Group>

        {/* Placeholder for chart */}
        <div
          style={{
            height: 300,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "var(--mantine-color-gray-1)",
            borderRadius: 8,
          }}
        >
          <Text c="dimmed">Churn Analysis Chart Placeholder</Text>
        </div>

        {/* Summary */}
        <Group
          justify="space-around"
          pt="md"
          style={{ borderTop: "1px solid var(--mantine-color-gray-3)" }}
        >
          <div style={{ textAlign: "center" }}>
            <Text size="lg" fw={700} c="red">
              3.2%
            </Text>
            <Text size="xs" c="dimmed">
              Customer Churn
            </Text>
          </div>
          <div style={{ textAlign: "center" }}>
            <Text size="lg" fw={700} c="orange">
              4.1%
            </Text>
            <Text size="xs" c="dimmed">
              Revenue Churn
            </Text>
          </div>
          <div style={{ textAlign: "center" }}>
            <Text size="lg" fw={700} c="green">
              +85
            </Text>
            <Text size="xs" c="dimmed">
              New Customers
            </Text>
          </div>
        </Group>
      </Stack>
    </Card>
  );
};
