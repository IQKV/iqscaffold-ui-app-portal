/**
 * Trial Status Tracker Component
 * Shows trial remaining days and conversion options
 */

import React, { useState } from "react";
import {
  Card,
  Text,
  Button,
  Group,
  Stack,
  Progress,
  Badge,
  Alert,
  Modal,
  NumberInput,
  Textarea,
  Box,
} from "@mantine/core";
import {
  IconClock,
  IconGift,
  IconArrowUp,
  IconInfoCircle,
  IconCalendarPlus,
} from "@tabler/icons-react";
import type { TrialInfo } from "@/entities/subscription/types/subscription-types";

interface TrialStatusTrackerProps {
  trialInfo: TrialInfo;
  onExtendTrial: (days: number) => void;
  onConvertTrial: () => void;
  loading?: boolean;
}

export const TrialStatusTracker: React.FC<TrialStatusTrackerProps> = ({
  trialInfo,
  onExtendTrial,
  onConvertTrial,
  loading = false,
}) => {
  const [showExtendModal, setShowExtendModal] = useState(false);
  const [extensionDays, setExtensionDays] = useState(7);
  const [extensionReason, setExtensionReason] = useState("");

  if (!trialInfo.isInTrial) {
    return null;
  }

  const getTrialProgress = () => {
    // Assuming a 30-day trial period for calculation
    const totalTrialDays = 30;
    const usedDays = totalTrialDays - trialInfo.daysRemaining;
    return (usedDays / totalTrialDays) * 100;
  };

  const getTrialUrgency = () => {
    if (trialInfo.daysRemaining <= 3) {
      return "critical";
    }
    if (trialInfo.daysRemaining <= 7) {
      return "warning";
    }
    return "normal";
  };

  const urgency = getTrialUrgency();
  const progress = getTrialProgress();

  const getUrgencyColor = () => {
    switch (urgency) {
      case "critical":
        return "red";
      case "warning":
        return "orange";
      default:
        return "blue";
    }
  };

  const getUrgencyMessage = () => {
    switch (urgency) {
      case "critical":
        return "Your trial expires very soon! Convert to a paid plan to continue using all features.";
      case "warning":
        return "Your trial is ending soon. Consider upgrading to maintain access.";
      default:
        return "You're currently on a free trial. Upgrade anytime to unlock full features.";
    }
  };

  const handleExtendTrial = () => {
    if (extensionDays > 0) {
      onExtendTrial(extensionDays);
      setShowExtendModal(false);
      setExtensionDays(7);
      setExtensionReason("");
    }
  };

  return (
    <>
      <Alert
        icon={<IconClock size={16} />}
        color={getUrgencyColor()}
        variant="light"
        radius="md"
      >
        <Stack gap="md">
          {/* Trial Header */}
          <Group justify="space-between" align="flex-start">
            <Box>
              <Group gap="sm" align="center">
                <Text size="md" fw={600}>
                  Free Trial Active
                </Text>
                <Badge variant="filled" color={getUrgencyColor()} size="sm">
                  {trialInfo.daysRemaining} days left
                </Badge>
              </Group>
              <Text size="sm" mt="xs">
                {getUrgencyMessage()}
              </Text>
            </Box>
          </Group>

          {/* Progress Bar */}
          <Box>
            <Group justify="space-between" mb="xs">
              <Text size="xs" c="dimmed">
                Trial Progress
              </Text>
              <Text size="xs" c="dimmed">
                {Math.round(progress)}% used
              </Text>
            </Group>
            <Progress
              value={progress}
              color={getUrgencyColor()}
              size="sm"
              radius="xl"
            />
          </Box>

          {/* Action Buttons */}
          <Group gap="sm">
            <Button
              variant="filled"
              color={getUrgencyColor()}
              leftSection={<IconArrowUp size={14} />}
              onClick={onConvertTrial}
              loading={loading}
            >
              Upgrade Now
            </Button>

            {trialInfo.canExtend && (
              <Button
                variant="light"
                color={getUrgencyColor()}
                leftSection={<IconCalendarPlus size={14} />}
                onClick={() => setShowExtendModal(true)}
              >
                Extend Trial
              </Button>
            )}
          </Group>
        </Stack>
      </Alert>

      {/* Trial Extension Modal */}
      <Modal
        opened={showExtendModal}
        onClose={() => setShowExtendModal(false)}
        title="Extend Trial Period"
        size="md"
      >
        <Stack gap="md">
          <Alert
            icon={<IconInfoCircle size={16} />}
            color="blue"
            variant="light"
          >
            <Text size="sm">
              You can extend your trial period up to{" "}
              {trialInfo.maxExtensionDays} additional days. This is a one-time
              extension to help you evaluate our platform.
            </Text>
          </Alert>

          <NumberInput
            label="Extension Days"
            description="Number of days to extend your trial"
            value={extensionDays}
            onChange={(value) => setExtensionDays(Number(value) || 0)}
            min={1}
            max={trialInfo.maxExtensionDays}
            required
          />

          <Textarea
            label="Reason for Extension (Optional)"
            description="Help us understand why you need more time to evaluate"
            value={extensionReason}
            onChange={(event) => setExtensionReason(event.currentTarget.value)}
            placeholder="e.g., Need more time to test with my team..."
            rows={3}
          />

          <Card withBorder p="md" bg="gray.0">
            <Stack gap="xs">
              <Text size="sm" fw={500}>
                Extension Summary
              </Text>
              <Group justify="space-between">
                <Text size="sm">Current trial ends:</Text>
                <Text size="sm" fw={500}>
                  {new Date(
                    new Date().getTime() +
                      trialInfo.daysRemaining * 24 * 60 * 60 * 1000
                  ).toLocaleDateString()}
                </Text>
              </Group>
              <Group justify="space-between">
                <Text size="sm">Extended trial ends:</Text>
                <Text size="sm" fw={500} c="blue">
                  {new Date(
                    new Date().getTime() +
                      (trialInfo.daysRemaining + extensionDays) *
                        24 *
                        60 *
                        60 *
                        1000
                  ).toLocaleDateString()}
                </Text>
              </Group>
            </Stack>
          </Card>

          <Group justify="flex-end" gap="sm">
            <Button variant="light" onClick={() => setShowExtendModal(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleExtendTrial}
              loading={loading}
              leftSection={<IconGift size={14} />}
              disabled={extensionDays <= 0}
            >
              Extend Trial
            </Button>
          </Group>
        </Stack>
      </Modal>
    </>
  );
};
