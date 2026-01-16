import { Card, Stack, Text, Group, Badge, Button, Loader, Alert, ActionIcon, Tooltip } from "@mantine/core";
import { t } from "@lingui/core/macro";
import { IconCheck, IconClock, IconAlertCircle, IconChevronRight } from "@tabler/icons-react";
import { useTodaysFollowUps, useOverdueFollowUps, useCompleteFollowUp } from "@/entities/crm/api/crm-queries";
import type { FollowUp } from "@/shared/api/crm/types";
import { useNavigate } from "@tanstack/react-router";
import { notifications } from "@mantine/notifications";

/**
 * FollowUpPanel - Dashboard widget for today's and overdue follow-ups
 * 
 * Features:
 * - Display today's follow-ups with due times (Requirement 6.1)
 * - Show overdue follow-ups with red styling (Requirement 6.2, 6.6)
 * - Sort by due time with overdue items first (Requirement 6.7)
 * - Add quick completion and navigation actions (Requirement 6.4, 6.3)
 * 
 * Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 6.6, 6.7
 */
export function FollowUpPanel() {
  const navigate = useNavigate();
  const { data: todaysFollowUps, isLoading: loadingToday, error: errorToday } = useTodaysFollowUps();
  const { data: overdueFollowUps, isLoading: loadingOverdue, error: errorOverdue } = useOverdueFollowUps();
  const completeFollowUpMutation = useCompleteFollowUp();

  // Combine and sort follow-ups: overdue first, then by due time (Requirement 6.7)
  const allFollowUps = [
    ...(overdueFollowUps || []),
    ...(todaysFollowUps || []),
  ].sort((a, b) => {
    // Overdue items first
    if (a.isOverdue && !b.isOverdue) return -1;
    if (!a.isOverdue && b.isOverdue) return 1;
    // Then sort by due time
    return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
  });

  const handleComplete = async (followUp: FollowUp) => {
    try {
      await completeFollowUpMutation.mutateAsync(followUp.id);
      notifications.show({
        title: t`Success`,
        message: t`Follow-up marked as complete`,
        color: "green",
      });
    } catch (error: any) {
      notifications.show({
        title: t`Error`,
        message: t`Failed to complete follow-up: ${error?.message || "Unknown error"}`,
        color: "red",
      });
    }
  };

  const handleNavigateToLead = (leadId: string) => {
    navigate({ to: `/crm/leads/${leadId}` });
  };

  const isLoading = loadingToday || loadingOverdue;
  const hasError = errorToday || errorOverdue;

  return (
    <Card shadow="sm" padding="lg" radius="md" withBorder>
      <Stack gap="md">
        {/* Header */}
        <Group justify="space-between">
          <Group gap="xs">
            <IconClock size={20} />
            <Text fw={600} size="lg">
              {t`Today's Follow-ups`}
            </Text>
          </Group>
          {allFollowUps.length > 0 && (
            <Badge color="blue" variant="light">
              {allFollowUps.length}
            </Badge>
          )}
        </Group>

        {/* Loading state */}
        {isLoading && (
          <Group justify="center" py="xl">
            <Loader size="sm" />
            <Text size="sm" c="dimmed">
              {t`Loading follow-ups...`}
            </Text>
          </Group>
        )}

        {/* Error state */}
        {hasError && !isLoading && (
          <Alert icon={<IconAlertCircle size={16} />} title={t`Error`} color="red">
            {t`Failed to load follow-ups. Please try again later.`}
          </Alert>
        )}

        {/* Empty state (Requirement 6.5) */}
        {!isLoading && !hasError && allFollowUps.length === 0 && (
          <Stack align="center" py="xl" gap="xs">
            <IconCheck size={48} stroke={1.5} style={{ opacity: 0.3 }} />
            <Text size="sm" c="dimmed" ta="center">
              {t`No follow-ups scheduled for today. Great job staying on top of things!`}
            </Text>
          </Stack>
        )}

        {/* Follow-ups list */}
        {!isLoading && !hasError && allFollowUps.length > 0 && (
          <Stack gap="xs">
            {allFollowUps.map((followUp) => (
              <FollowUpItem
                key={followUp.id}
                followUp={followUp}
                onComplete={() => handleComplete(followUp)}
                onNavigate={() => handleNavigateToLead(followUp.leadId)}
                isCompleting={completeFollowUpMutation.isPending}
              />
            ))}
          </Stack>
        )}
      </Stack>
    </Card>
  );
}

interface FollowUpItemProps {
  followUp: FollowUp;
  onComplete: () => void;
  onNavigate: () => void;
  isCompleting: boolean;
}

/**
 * FollowUpItem - Individual follow-up item in the panel
 * 
 * Features:
 * - Display follow-up details with due time
 * - Red styling for overdue items (Requirement 6.6)
 * - Quick completion action (Requirement 6.4)
 * - Navigation to lead detail (Requirement 6.3)
 */
function FollowUpItem({ followUp, onComplete, onNavigate, isCompleting }: FollowUpItemProps) {
  const dueTime = new Date(followUp.dueDate).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

  // Overdue styling (Requirement 6.6)
  const isOverdue = followUp.isOverdue;
  const cardColor = isOverdue ? "red.0" : undefined;
  const borderColor = isOverdue ? "red.5" : undefined;

  return (
    <Card
      padding="sm"
      radius="sm"
      withBorder
      style={{
        backgroundColor: cardColor,
        borderColor: borderColor,
        borderWidth: isOverdue ? 2 : 1,
      }}
    >
      <Group justify="space-between" wrap="nowrap">
        <Stack gap={4} style={{ flex: 1, minWidth: 0 }}>
          {/* Follow-up description */}
          <Text size="sm" fw={500} lineClamp={1}>
            {followUp.description}
          </Text>

          {/* Due time and badges */}
          <Group gap="xs">
            <Group gap={4}>
              <IconClock size={14} />
              <Text size="xs" c={isOverdue ? "red" : "dimmed"}>
                {dueTime}
              </Text>
            </Group>

            {/* Overdue indicator (Requirement 6.6) */}
            {isOverdue && (
              <Badge color="red" size="xs" variant="filled">
                {t`Overdue`}
              </Badge>
            )}

            {/* Priority badge */}
            <Badge
              color={
                followUp.priority === "HIGH"
                  ? "red"
                  : followUp.priority === "MEDIUM"
                    ? "yellow"
                    : "gray"
              }
              size="xs"
              variant="light"
            >
              {followUp.priority}
            </Badge>

            {/* Type badge */}
            <Badge color="blue" size="xs" variant="light">
              {followUp.type}
            </Badge>
          </Group>
        </Stack>

        {/* Actions */}
        <Group gap="xs" wrap="nowrap">
          {/* Complete button (Requirement 6.4) */}
          <Tooltip label={t`Mark as complete`}>
            <ActionIcon
              color="green"
              variant="light"
              onClick={onComplete}
              loading={isCompleting}
              disabled={isCompleting}
              size="sm"
            >
              <IconCheck size={16} />
            </ActionIcon>
          </Tooltip>

          {/* Navigate to lead button (Requirement 6.3) */}
          <Tooltip label={t`View lead details`}>
            <ActionIcon
              color="blue"
              variant="light"
              onClick={onNavigate}
              size="sm"
            >
              <IconChevronRight size={16} />
            </ActionIcon>
          </Tooltip>
        </Group>
      </Group>
    </Card>
  );
}
