import React from "react";
import { Badge, Progress, Text, Group, Stack, Alert } from "@mantine/core";
import {
  IconAlertTriangle,
  IconCheck,
  IconExclamationMark,
} from "@tabler/icons-react";
import type { QuotaStatus } from "../types/usage-types";
import { UsageService } from "../services/usage-service";

interface QuotaStatusIndicatorProps {
  quotaStatus: QuotaStatus;
  showDetails?: boolean;
  size?: "sm" | "md" | "lg";
}

/**
 * Quota Status Indicator Component
 * Displays current quota usage with visual indicators
 */
export const QuotaStatusIndicator: React.FC<QuotaStatusIndicatorProps> = ({
  quotaStatus,
  showDetails = true,
  size = "md",
}) => {
  const getStatusColor = (): string => {
    if (quotaStatus.exceeded && !quotaStatus.withinGrace) {
      return "red";
    }
    if (quotaStatus.exceeded && quotaStatus.withinGrace) {
      return "orange";
    }
    if (quotaStatus.percentage >= 90) {
      return "yellow";
    }
    return "green";
  };

  const getStatusIcon = () => {
    if (quotaStatus.exceeded && !quotaStatus.withinGrace) {
      return <IconExclamationMark size={16} />;
    }
    if (quotaStatus.exceeded && quotaStatus.withinGrace) {
      return <IconAlertTriangle size={16} />;
    }
    if (quotaStatus.percentage >= 90) {
      return <IconAlertTriangle size={16} />;
    }
    return <IconCheck size={16} />;
  };

  const getStatusText = (): string => {
    if (quotaStatus.exceeded && !quotaStatus.withinGrace) {
      return "Exceeded";
    }
    if (quotaStatus.exceeded && quotaStatus.withinGrace) {
      return "Grace Period";
    }
    if (quotaStatus.percentage >= 90) {
      return "Warning";
    }
    return "Normal";
  };

  const formatUsageAmount = (amount: number): string => {
    return UsageService.formatUsageAmount(amount, quotaStatus.metricType);
  };

  const getMetricDisplayName = (): string => {
    return UsageService.getMetricDisplayName(quotaStatus.metricType);
  };

  return (
    <Stack gap="xs">
      <Group justify="space-between" align="center">
        <Text size={size} fw={500}>
          {getMetricDisplayName()}
        </Text>
        <Badge
          color={getStatusColor()}
          variant="light"
          leftSection={getStatusIcon()}
          size={size}
        >
          {getStatusText()}
        </Badge>
      </Group>

      <Progress
        value={Math.min(quotaStatus.percentage, 100)}
        color={getStatusColor()}
        size={size}
        striped={quotaStatus.exceeded}
        animated={quotaStatus.exceeded}
      />

      {showDetails && (
        <Group justify="space-between" align="center">
          <Text size="sm" c="dimmed">
            {formatUsageAmount(quotaStatus.current)} /{" "}
            {formatUsageAmount(quotaStatus.limit)}
          </Text>
          <Text size="sm" c="dimmed">
            {quotaStatus.percentage}%
          </Text>
        </Group>
      )}

      {quotaStatus.exceeded && (
        <Alert
          color={quotaStatus.withinGrace ? "orange" : "red"}
          icon={
            quotaStatus.withinGrace ? (
              <IconAlertTriangle size={16} />
            ) : (
              <IconExclamationMark size={16} />
            )
          }
          title={
            quotaStatus.withinGrace ? "Grace Period Active" : "Quota Exceeded"
          }
        >
          {quotaStatus.withinGrace
            ? `You've exceeded your ${getMetricDisplayName().toLowerCase()} limit but are within the grace period. Consider upgrading your plan.`
            : `Your ${getMetricDisplayName().toLowerCase()} quota has been exceeded. Operations may be blocked until you upgrade your plan.`}
        </Alert>
      )}
    </Stack>
  );
};

interface QuotaStatusGridProps {
  quotaStatuses: QuotaStatus[];
  columns?: number;
}

/**
 * Quota Status Grid Component
 * Displays multiple quota statuses in a grid layout
 */
export const QuotaStatusGrid: React.FC<QuotaStatusGridProps> = ({
  quotaStatuses,
  columns = 2,
}) => {
  const gridStyle: React.CSSProperties = {
    display: "grid",
    gridTemplateColumns: `repeat(${columns}, 1fr)`,
    gap: "1rem",
  };

  return (
    <div style={gridStyle}>
      {quotaStatuses.map((status) => (
        <QuotaStatusIndicator
          key={status.metricType}
          quotaStatus={status}
          showDetails
        />
      ))}
    </div>
  );
};
