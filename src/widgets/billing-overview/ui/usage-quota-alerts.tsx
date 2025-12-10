import React from "react";
import {
  Card,
  Group,
  Text,
  Stack,
  Alert,
  Skeleton,
  Badge,
  Grid,
  Progress,
  ActionIcon,
  Tooltip,
} from "@mantine/core";
import {
  IconAlertTriangle,
  IconExclamationCircle,
  IconTrendingUp,
  IconInfoCircle,
  IconArrowRight,
} from "@tabler/icons-react";
import { UsageProgressBar } from "@/shared/ui/billing";
import { UsageUtils } from "@/shared/lib/billing-utils";
import type { QuotaStatus } from "@/shared/types/billing";
import { UsageMetricType } from "@/shared/types/billing";

export interface UsageQuotaAlertsProps {
  usage: QuotaStatus[];
  loading?: boolean;
}

const METRIC_LABELS: Record<UsageMetricType, string> = {
  [UsageMetricType.API_CALLS]: "API Calls",
  [UsageMetricType.STORAGE_GB]: "Storage",
  [UsageMetricType.EMAIL_SENDS]: "Email Sends",
  [UsageMetricType.ACTIVE_USERS]: "Active Users",
};

export const UsageQuotaAlerts: React.FC<UsageQuotaAlertsProps> = ({
  usage,
  loading = false,
}) => {
  if (loading) {
    return (
      <Card withBorder>
        <Stack gap="md">
          <Group justify="space-between">
            <Skeleton height={24} width={150} />
            <Skeleton height={20} width={100} />
          </Group>
          <Grid>
            {[1, 2, 3, 4].map((i) => (
              <Grid.Col key={i} span={{ base: 12, sm: 6, md: 3 }}>
                <Skeleton height={80} />
              </Grid.Col>
            ))}
          </Grid>
        </Stack>
      </Card>
    );
  }

  if (!usage || usage.length === 0) {
    return (
      <Card withBorder>
        <Stack align="center" justify="center" py="xl">
          <IconInfoCircle size={48} color="var(--mantine-color-gray-5)" />
          <Text c="dimmed" size="lg">
            No usage data available
          </Text>
          <Text c="dimmed" size="sm">
            Usage metrics will appear here once you start using the platform
          </Text>
        </Stack>
      </Card>
    );
  }

  // Categorize usage by status
  const criticalUsage = usage.filter((quota) => quota.exceeded);
  const warningUsage = usage.filter(
    (quota) => !quota.exceeded && quota.percentage >= 90
  );
  const normalUsage = usage.filter(
    (quota) => !quota.exceeded && quota.percentage < 90
  );

  const hasAlerts = criticalUsage.length > 0 || warningUsage.length > 0;

  const getUsageStatusColor = (quota: QuotaStatus) => {
    if (quota.exceeded) {
      return "red";
    }
    if (quota.percentage >= 90) {
      return "orange";
    }
    if (quota.percentage >= 75) {
      return "yellow";
    }
    return "blue";
  };

  const getUsageStatusIcon = (quota: QuotaStatus) => {
    if (quota.exceeded) {
      return <IconExclamationCircle size={16} />;
    }
    if (quota.percentage >= 90) {
      return <IconAlertTriangle size={16} />;
    }
    if (quota.percentage >= 75) {
      return <IconTrendingUp size={16} />;
    }
    return <IconInfoCircle size={16} />;
  };

  return (
    <Card withBorder>
      <Stack gap="md">
        {/* Header */}
        <Group justify="space-between" align="center">
          <div>
            <Text size="lg" fw={600}>
              Usage & Quotas
            </Text>
            <Text c="dimmed" size="sm">
              Current usage across all metrics
            </Text>
          </div>

          {hasAlerts && (
            <Group gap="xs">
              {criticalUsage.length > 0 && (
                <Badge color="red" variant="filled" size="sm">
                  {criticalUsage.length} Exceeded
                </Badge>
              )}
              {warningUsage.length > 0 && (
                <Badge color="orange" variant="light" size="sm">
                  {warningUsage.length} Warning
                </Badge>
              )}
            </Group>
          )}

          <Tooltip label="View detailed usage analytics">
            <ActionIcon
              variant="light"
              size="sm"
              onClick={() => {
                // Navigate to usage analytics page
                window.location.href = "/billing/usage";
              }}
            >
              <IconArrowRight size={16} />
            </ActionIcon>
          </Tooltip>
        </Group>

        {/* Critical Alerts */}
        {criticalUsage.length > 0 && (
          <Alert
            color="red"
            icon={<IconExclamationCircle size={16} />}
            title="Usage Limits Exceeded"
          >
            <Text size="sm" mb="xs">
              The following metrics have exceeded their limits:
            </Text>
            <Stack gap="xs">
              {criticalUsage.map((quota) => (
                <Group key={quota.metricType} justify="space-between">
                  <Text size="sm" fw={500}>
                    {METRIC_LABELS[quota.metricType]}
                  </Text>
                  <Badge color="red" size="sm">
                    {quota.percentage}% used
                  </Badge>
                </Group>
              ))}
            </Stack>
            <Text size="xs" c="dimmed" mt="xs">
              Consider upgrading your plan to avoid service limitations.
            </Text>
          </Alert>
        )}

        {/* Warning Alerts */}
        {warningUsage.length > 0 && (
          <Alert
            color="orange"
            icon={<IconAlertTriangle size={16} />}
            title="Approaching Usage Limits"
          >
            <Text size="sm" mb="xs">
              The following metrics are approaching their limits:
            </Text>
            <Stack gap="xs">
              {warningUsage.map((quota) => (
                <Group key={quota.metricType} justify="space-between">
                  <Text size="sm" fw={500}>
                    {METRIC_LABELS[quota.metricType]}
                  </Text>
                  <Badge color="orange" size="sm">
                    {quota.percentage}% used
                  </Badge>
                </Group>
              ))}
            </Stack>
          </Alert>
        )}

        {/* Usage Metrics Grid */}
        <Grid>
          {usage.map((quota) => (
            <Grid.Col key={quota.metricType} span={{ base: 12, sm: 6, md: 3 }}>
              <Card withBorder p="md" h="100%">
                <Stack gap="xs">
                  <Group justify="space-between" align="flex-start">
                    <Text size="sm" fw={500}>
                      {METRIC_LABELS[quota.metricType]}
                    </Text>
                    {getUsageStatusIcon(quota)}
                  </Group>

                  <Progress
                    value={Math.min(quota.percentage, 100)}
                    color={getUsageStatusColor(quota)}
                    size="sm"
                    animated={quota.percentage >= 90}
                    striped={quota.exceeded}
                  />

                  <Group justify="space-between">
                    <Text size="xs" c="dimmed">
                      {quota.current.toLocaleString()} /{" "}
                      {quota.limit === -1 ? "∞" : quota.limit.toLocaleString()}
                    </Text>
                    <Badge
                      color={getUsageStatusColor(quota)}
                      variant={quota.exceeded ? "filled" : "light"}
                      size="xs"
                    >
                      {quota.percentage}%
                    </Badge>
                  </Group>

                  {quota.withinGrace && (
                    <Text size="xs" c="orange" fs="italic">
                      In grace period
                    </Text>
                  )}
                </Stack>
              </Card>
            </Grid.Col>
          ))}
        </Grid>

        {/* No Alerts Message */}
        {!hasAlerts && (
          <Alert color="green" icon={<IconInfoCircle size={16} />}>
            <Text size="sm">
              All usage metrics are within normal limits. Your current plan
              provides sufficient resources.
            </Text>
          </Alert>
        )}
      </Stack>
    </Card>
  );
};
