/**
 * Tenant Revenue Ranking Component
 * Top performing tenants by revenue
 */

import React from "react";
import {
  Card,
  Text,
  Group,
  Stack,
  Badge,
  Table,
  Progress,
  Skeleton,
  ThemeIcon,
} from "@mantine/core";
import { IconTrophy, IconTrendingUp, IconTrendingDown } from "@tabler/icons-react";

interface TenantRankingData {
  tenantId: string;
  tenantName: string;
  monthlyRevenue: number;
  totalRevenue: number;
  subscriptionTier: string;
  growthRate: number;
  churnRisk: "low" | "medium" | "high";
}

interface TenantRevenueRankingProps {
  tenantRanking: TenantRankingData[];
  loading?: boolean;
}

export const TenantRevenueRanking: React.FC<TenantRevenueRankingProps> = ({
  tenantRanking,
  loading = false,
}) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case "low": return "green";
      case "medium": return "yellow";
      case "high": return "red";
      default: return "gray";
    }
  };

  const getTierColor = (tier: string) => {
    switch (tier) {
      case "Enterprise": return "purple";
      case "Pro": return "blue";
      case "Basic": return "gray";
      default: return "gray";
    }
  };

  if (loading) {
    return (
      <Card withBorder radius="md" p="lg">
        <Stack gap="md">
          <Skeleton height={24} width="60%" />
          <Stack gap="sm">
            {Array.from({ length: 5 }).map((_, index) => (
              <Skeleton key={index} height={60} />
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
            <ThemeIcon variant="light" size="sm" color="yellow">
              <IconTrophy size={14} />
            </ThemeIcon>
            <Text size="lg" fw={600}>
              Top Revenue Tenants
            </Text>
          </Group>
          <Badge variant="light" color="blue" size="sm">
            {tenantRanking.length} tenants
          </Badge>
        </Group>

        <Table striped highlightOnHover>
          <Table.Thead>
            <Table.Tr>
              <Table.Th>Rank</Table.Th>
              <Table.Th>Tenant</Table.Th>
              <Table.Th>Monthly Revenue</Table.Th>
              <Table.Th>Growth Rate</Table.Th>
              <Table.Th>Plan</Table.Th>
              <Table.Th>Risk</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {tenantRanking.map((tenant, index) => (
              <Table.Tr key={tenant.tenantId}>
                <Table.Td>
                  <Group gap="xs" align="center">
                    <Text size="sm" fw={600}>
                      #{index + 1}
                    </Text>
                    {index < 3 && (
                      <ThemeIcon size="xs" variant="light" color="yellow">
                        <IconTrophy size={10} />
                      </ThemeIcon>
                    )}
                  </Group>
                </Table.Td>
                <Table.Td>
                  <div>
                    <Text size="sm" fw={500}>
                      {tenant.tenantName}
                    </Text>
                    <Text size="xs" c="dimmed">
                      Total: {formatCurrency(tenant.totalRevenue)}
                    </Text>
                  </div>
                </Table.Td>
                <Table.Td>
                  <Text size="sm" fw={600}>
                    {formatCurrency(tenant.monthlyRevenue)}
                  </Text>
                </Table.Td>
                <Table.Td>
                  <Group gap="xs" align="center">
                    {tenant.growthRate >= 0 ? (
                      <IconTrendingUp size={14} color="green" />
                    ) : (
                      <IconTrendingDown size={14} color="red" />
                    )}
                    <Text
                      size="sm"
                      fw={500}
                      c={tenant.growthRate >= 0 ? "green" : "red"}
                    >
                      {tenant.growthRate > 0 ? "+" : ""}{tenant.growthRate.toFixed(1)}%
                    </Text>
                  </Group>
                </Table.Td>
                <Table.Td>
                  <Badge
                    variant="light"
                    color={getTierColor(tenant.subscriptionTier)}
                    size="sm"
                  >
                    {tenant.subscriptionTier}
                  </Badge>
                </Table.Td>
                <Table.Td>
                  <Badge
                    variant="light"
                    color={getRiskColor(tenant.churnRisk)}
                    size="sm"
                  >
                    {tenant.churnRisk} risk
                  </Badge>
                </Table.Td>
              </Table.Tr>
            ))}
          </Table.Tbody>
        </Table>

        {/* Revenue Distribution */}
        <div>
          <Text size="sm" fw={500} mb="xs">
            Revenue Distribution
          </Text>
          <Progress.Root size="lg">
            <Progress.Section value={40} color="purple">
              <Progress.Label>Enterprise</Progress.Label>
            </Progress.Section>
            <Progress.Section value={45} color="blue">
              <Progress.Label>Pro</Progress.Label>
            </Progress.Section>
            <Progress.Section value={15} color="gray">
              <Progress.Label>Basic</Progress.Label>
            </Progress.Section>
          </Progress.Root>
        </div>
      </Stack>
    </Card>
  );
};