import React, { useState } from "react";
import {
  Container,
  Title,
  Button,
  Group,
  Stack,
  Card,
  Text,
  NumberInput,
  Select,
  Alert,
  Notification,
  LoadingOverlay,
} from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { IconCheck, IconX, IconAlertTriangle } from "@tabler/icons-react";
import { useQuotaEnforcement } from "../model/use-quota-enforcement";
import { QuotaStatusGrid } from "../ui/quota-status-indicator";
import { QuotaErrorHandler } from "../lib/quota-error-handler";
import type { UsageMetricType } from "../types/usage-types";

/**
 * Quota Enforcement Example Component
 * Demonstrates the quota enforcement system functionality
 */
export const QuotaEnforcementExample: React.FC = () => {
  const tenantId = "demo-tenant-123"; // In real app, this would come from auth context

  const {
    quotaStatus,
    quotaWarnings,
    quotaExceeded,
    loading,
    error,
    checkQuota,
    recordUsage,
    validateOperation,
    getUsagePercentage,
    isApproachingLimit,
    isQuotaExceeded,
    isWithinGracePeriod,
    getUpgradeSuggestions,
  } = useQuotaEnforcement(tenantId);

  const [selectedMetric, setSelectedMetric] =
    useState<UsageMetricType>("api_calls");
  const [usageAmount, setUsageAmount] = useState<number>(1);
  const [isRecording, setIsRecording] = useState(false);
  const [isChecking, setIsChecking] = useState(false);

  const metricOptions = [
    { value: "api_calls", label: "API Calls" },
    { value: "storage_gb", label: "Storage (GB)" },
    { value: "email_sends", label: "Email Sends" },
    { value: "active_users", label: "Active Users" },
  ];

  const handleQuotaCheck = async () => {
    setIsChecking(true);
    try {
      const result = await checkQuota(selectedMetric, usageAmount);

      if (result.allowed) {
        notifications.show({
          title: "Quota Check Passed",
          message: `Operation allowed. ${result.remaining} ${selectedMetric} remaining.`,
          color: "green",
          icon: <IconCheck size={16} />,
        });
      } else {
        notifications.show({
          title: "Quota Check Failed",
          message: `Operation would exceed quota. Current: ${result.quotaStatus.current}, Limit: ${result.quotaStatus.limit}`,
          color: "red",
          icon: <IconX size={16} />,
        });
      }
    } catch (error) {
      notifications.show({
        title: "Quota Check Error",
        message: error instanceof Error ? error.message : "Unknown error",
        color: "red",
        icon: <IconX size={16} />,
      });
    } finally {
      setIsChecking(false);
    }
  };

  const handleRecordUsage = async () => {
    setIsRecording(true);
    try {
      const result = await recordUsage(selectedMetric, usageAmount, {
        source: "demo-component",
        timestamp: new Date().toISOString(),
      });

      if (result.success) {
        notifications.show({
          title: "Usage Recorded",
          message: `Successfully recorded ${usageAmount} ${selectedMetric}`,
          color: "green",
          icon: <IconCheck size={16} />,
        });
      } else {
        notifications.show({
          title: "Usage Recording Failed",
          message: result.errorMessage || "Failed to record usage",
          color: "red",
          icon: <IconX size={16} />,
        });

        if (result.upgradeInfo) {
          notifications.show({
            title: "Upgrade Suggested",
            message: `Consider upgrading to ${result.upgradeInfo.suggestedPlan} plan`,
            color: "blue",
            autoClose: false,
          });
        }
      }
    } catch (error) {
      const quotaError = QuotaErrorHandler.isQuotaError(error)
        ? QuotaErrorHandler.handleQuotaError(error)
        : null;

      notifications.show({
        title: "Error",
        message:
          quotaError?.userMessage ||
          (error instanceof Error ? error.message : "Unknown error"),
        color: "red",
        icon: <IconX size={16} />,
      });
    } finally {
      setIsRecording(false);
    }
  };

  const handleValidateOperation = async () => {
    try {
      const result = await validateOperation(selectedMetric, usageAmount);

      if (result.allowed) {
        notifications.show({
          title: "Operation Valid",
          message: "This operation is allowed within your current quota",
          color: "green",
          icon: <IconCheck size={16} />,
        });
      } else {
        notifications.show({
          title: "Operation Invalid",
          message: result.reason || "Operation would exceed quota",
          color: "orange",
          icon: <IconAlertTriangle size={16} />,
        });
      }
    } catch (error) {
      notifications.show({
        title: "Validation Error",
        message: error instanceof Error ? error.message : "Unknown error",
        color: "red",
        icon: <IconX size={16} />,
      });
    }
  };

  const upgradeSuggestions = getUpgradeSuggestions();

  return (
    <Container size="lg" py="xl">
      <Stack gap="xl">
        <Title order={2}>Quota Enforcement System Demo</Title>

        {error && (
          <Alert color="red" title="Error">
            {error}
          </Alert>
        )}

        {/* Current Quota Status */}
        <Card withBorder>
          <Card.Section withBorder inheritPadding py="xs">
            <Title order={4}>Current Quota Status</Title>
          </Card.Section>
          <Card.Section inheritPadding py="md">
            <LoadingOverlay visible={loading} />
            {quotaStatus.length > 0 ? (
              <QuotaStatusGrid quotaStatuses={quotaStatus} columns={2} />
            ) : (
              <Text c="dimmed">No quota data available</Text>
            )}
          </Card.Section>
        </Card>

        {/* Quota Warnings */}
        {quotaWarnings.length > 0 && (
          <Card withBorder>
            <Card.Section withBorder inheritPadding py="xs">
              <Title order={4}>Active Warnings</Title>
            </Card.Section>
            <Card.Section inheritPadding py="md">
              <Stack gap="xs">
                {quotaWarnings.map((warning, index) => (
                  <Alert
                    key={index}
                    color={warning.severity === "critical" ? "red" : "yellow"}
                    icon={<IconAlertTriangle size={16} />}
                  >
                    {warning.message}
                  </Alert>
                ))}
              </Stack>
            </Card.Section>
          </Card>
        )}

        {/* Upgrade Suggestions */}
        {upgradeSuggestions.length > 0 && (
          <Card withBorder>
            <Card.Section withBorder inheritPadding py="xs">
              <Title order={4}>Upgrade Suggestions</Title>
            </Card.Section>
            <Card.Section inheritPadding py="md">
              <Stack gap="xs">
                {upgradeSuggestions.map((suggestion, index) => (
                  <Alert key={index} color="blue">
                    <Group justify="space-between">
                      <Text>
                        {suggestion.metricType}: Upgrade to{" "}
                        {suggestion.suggestedPlan} plan
                      </Text>
                      <Button
                        size="xs"
                        variant="light"
                        onClick={() =>
                          window.open(suggestion.upgradeUrl, "_blank")
                        }
                      >
                        Upgrade
                      </Button>
                    </Group>
                  </Alert>
                ))}
              </Stack>
            </Card.Section>
          </Card>
        )}

        {/* Testing Controls */}
        <Card withBorder>
          <Card.Section withBorder inheritPadding py="xs">
            <Title order={4}>Test Quota Operations</Title>
          </Card.Section>
          <Card.Section inheritPadding py="md">
            <Stack gap="md">
              <Group grow>
                <Select
                  label="Metric Type"
                  value={selectedMetric}
                  onChange={(value) =>
                    setSelectedMetric(value as UsageMetricType)
                  }
                  data={metricOptions}
                />
                <NumberInput
                  label="Amount"
                  value={usageAmount}
                  onChange={(value) => setUsageAmount(Number(value) || 1)}
                  min={1}
                  max={10000}
                />
              </Group>

              <Group>
                <Button
                  onClick={handleQuotaCheck}
                  loading={isChecking}
                  variant="light"
                >
                  Check Quota
                </Button>
                <Button
                  onClick={handleValidateOperation}
                  variant="light"
                  color="blue"
                >
                  Validate Operation
                </Button>
                <Button
                  onClick={handleRecordUsage}
                  loading={isRecording}
                  color="green"
                >
                  Record Usage
                </Button>
              </Group>
            </Stack>
          </Card.Section>
        </Card>

        {/* Quota Status Summary */}
        <Card withBorder>
          <Card.Section withBorder inheritPadding py="xs">
            <Title order={4}>Quota Status Summary</Title>
          </Card.Section>
          <Card.Section inheritPadding py="md">
            <Stack gap="xs">
              {metricOptions.map((option) => {
                const metricType = option.value as UsageMetricType;
                const percentage = getUsagePercentage(metricType);
                const approaching = isApproachingLimit(metricType);
                const exceeded = isQuotaExceeded(metricType);
                const gracePeriod = isWithinGracePeriod(metricType);

                return (
                  <Group key={metricType} justify="space-between">
                    <Text>{option.label}</Text>
                    <Group gap="xs">
                      <Text size="sm" c="dimmed">
                        {percentage}%
                      </Text>
                      {exceeded && (
                        <Text size="xs" c={gracePeriod ? "orange" : "red"}>
                          {gracePeriod ? "Grace" : "Exceeded"}
                        </Text>
                      )}
                      {approaching && !exceeded && (
                        <Text size="xs" c="yellow">
                          Warning
                        </Text>
                      )}
                    </Group>
                  </Group>
                );
              })}
            </Stack>
          </Card.Section>
        </Card>
      </Stack>
    </Container>
  );
};
