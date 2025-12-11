import React from "react";
import {
  Progress,
  Group,
  Text,
  Stack,
  Badge,
  Tooltip,
  Alert,
  Box,
} from "@mantine/core";
import {
  IconTrendingUp,
  IconAlertTriangle,
  IconExclamationCircle,
  IconInfoCircle,
} from "@tabler/icons-react";
import { UsageUtils } from "@/shared/lib/billing-utils";
import { UsageMetricType, type QuotaStatus } from "@/shared/types/billing";
import classes from "./usage-progress-bar.module.css";

export interface UsageProgressBarProps {
  quota: QuotaStatus;
  showDetails?: boolean;
  showAlert?: boolean;
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  animated?: boolean;
  compact?: boolean;
}

const METRIC_LABELS: Record<UsageMetricType, string> = {
  [UsageMetricType.API_CALLS]: "API Calls",
  [UsageMetricType.STORAGE_GB]: "Storage",
  [UsageMetricType.EMAIL_SENDS]: "Email Sends",
  [UsageMetricType.ACTIVE_USERS]: "Active Users",
};

const METRIC_UNITS: Record<UsageMetricType, string> = {
  [UsageMetricType.API_CALLS]: "calls",
  [UsageMetricType.STORAGE_GB]: "GB",
  [UsageMetricType.EMAIL_SENDS]: "emails",
  [UsageMetricType.ACTIVE_USERS]: "users",
};

export const UsageProgressBar: React.FC<UsageProgressBarProps> = ({
  quota,
  showDetails = true,
  showAlert = true,
  size = "md",
  animated = true,
  compact = false,
}) => {
  const status = UsageUtils.getUsageStatus(
    quota.current,
    quota.limit,
    5 // 5% grace period
  );

  const getProgressColor = () => {
    switch (status) {
      case "exceeded":
        return "red";
      case "grace":
        return "orange";
      case "warning":
        return "yellow";
      default:
        return "blue";
    }
  };

  const getStatusIcon = () => {
    switch (status) {
      case "exceeded":
        return <IconExclamationCircle size={16} />;
      case "grace":
        return <IconAlertTriangle size={16} />;
      case "warning":
        return <IconTrendingUp size={16} />;
      default:
        return <IconInfoCircle size={16} />;
    }
  };

  const getStatusMessage = () => {
    switch (status) {
      case "exceeded":
        return "Usage limit exceeded";
      case "grace":
        return "In grace period - upgrade recommended";
      case "warning":
        return "Approaching usage limit";
      default:
        return "Usage within normal limits";
    }
  };

  const formatValue = (value: number, metricType: UsageMetricType) => {
    const unit = METRIC_UNITS[metricType];

    if (metricType === UsageMetricType.STORAGE_GB) {
      if (value >= 1024) {
        return `${(value / 1024).toFixed(1)} TB`;
      }
      return `${value.toFixed(1)} ${unit}`;
    }

    if (value >= 1000000) {
      return `${(value / 1000000).toFixed(1)}M ${unit}`;
    }

    if (value >= 1000) {
      return `${(value / 1000).toFixed(1)}K ${unit}`;
    }

    return `${value.toLocaleString()} ${unit}`;
  };

  const progressValue = Math.min(quota.percentage, 100);
  const isUnlimited = quota.limit === -1;

  if (compact) {
    return (
      <Group gap="xs" className={classes.compactUsage}>
        <Text size="sm" fw={500}>
          {METRIC_LABELS[quota.metricType]}
        </Text>
        <Progress
          value={progressValue}
          color={getProgressColor()}
          size="sm"
          className={classes.compactProgress}
          animated={animated}
        />
        <Text size="xs" c="dimmed">
          {isUnlimited
            ? formatValue(quota.current, quota.metricType)
            : `${formatValue(quota.current, quota.metricType)} / ${formatValue(quota.limit, quota.metricType)}`}
        </Text>
        {status !== "normal" && (
          <Badge color={getProgressColor()} size="xs" variant="dot">
            {quota.percentage}%
          </Badge>
        )}
      </Group>
    );
  }

  return (
    <Stack gap="xs" className={classes.usageProgressBar}>
      {/* Header */}
      <Group justify="space-between" align="flex-start">
        <div>
          <Text size="sm" fw={500}>
            {METRIC_LABELS[quota.metricType]}
          </Text>
          {showDetails && (
            <Text size="xs" c="dimmed">
              {isUnlimited
                ? `${formatValue(quota.current, quota.metricType)} used`
                : `${formatValue(quota.current, quota.metricType)} of ${formatValue(quota.limit, quota.metricType)} used`}
            </Text>
          )}
        </div>

        <Group gap="xs">
          {!isUnlimited && (
            <Badge
              color={getProgressColor()}
              variant={status === "normal" ? "light" : "filled"}
              size="sm"
            >
              {quota.percentage}%
            </Badge>
          )}

          {status !== "normal" && (
            <Tooltip label={getStatusMessage()} withArrow>
              <Box className={classes.statusIcon}>{getStatusIcon()}</Box>
            </Tooltip>
          )}
        </Group>
      </Group>

      {/* Progress Bar */}
      {!isUnlimited && (
        <Progress
          value={progressValue}
          color={getProgressColor()}
          size={size}
          className={classes.progressBar}
          animated={animated}
          striped={status === "exceeded"}
        />
      )}

      {/* Alert for critical states */}
      {showAlert && (status === "exceeded" || status === "grace") && (
        <Alert
          color={getProgressColor()}
          icon={getStatusIcon()}
          className={classes.usageAlert}
        >
          <Text size="sm">
            {getStatusMessage()}
            {status === "exceeded" && (
              <Text size="xs" c="dimmed" mt="xs">
                Additional usage may incur overage charges or service
                limitations.
              </Text>
            )}
            {status === "grace" && (
              <Text size="xs" c="dimmed" mt="xs">
                You're in the grace period. Consider upgrading your plan to
                avoid service interruption.
              </Text>
            )}
          </Text>
        </Alert>
      )}

      {/* Remaining quota info */}
      {showDetails && !isUnlimited && quota.percentage < 100 && (
        <Group justify="space-between" className={classes.remainingInfo}>
          <Text size="xs" c="dimmed">
            Remaining:{" "}
            {formatValue(quota.limit - quota.current, quota.metricType)}
          </Text>
          {quota.percentage >= 80 && (
            <Text size="xs" c={getProgressColor()}>
              {100 - quota.percentage}% left
            </Text>
          )}
        </Group>
      )}
    </Stack>
  );
};
