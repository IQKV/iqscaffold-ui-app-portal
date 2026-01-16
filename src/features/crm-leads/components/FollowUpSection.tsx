import { useState } from "react";
import {
  Stack,
  Text,
  Group,
  Button,
  Card,
  Badge,
  ActionIcon,
  Tooltip,
  Alert,
  Loader,
  Menu,
  Modal,
} from "@mantine/core";
import { t } from "@lingui/core/macro";
import {
  IconPlus,
  IconCheck,
  IconEdit,
  IconTrash,
  IconClock,
  IconAlertCircle,
  IconDots,
} from "@tabler/icons-react";
import {
  useFollowUps,
  useCreateFollowUp,
  useUpdateFollowUp,
  useCompleteFollowUp,
  useDeleteFollowUp,
} from "@/entities/crm/api/crm-queries";
import { FollowUpForm } from "@/entities/crm/ui/FollowUpForm";
import type { FollowUp } from "@/shared/api/crm/types";
import { notifications } from "@mantine/notifications";
import { modals } from "@mantine/modals";

interface FollowUpSectionProps {
  leadId: string;
}

/**
 * FollowUpSection - Component for managing follow-ups on lead detail page
 *
 * Features:
 * - Display all follow-ups for a specific lead (Requirement 5.3)
 * - Add scheduling form with date picker (Requirement 5.2)
 * - Implement editing and completion functionality (Requirement 5.4, 5.5, 5.6)
 * - Handle deletion with confirmation dialogs (Requirement 5.7)
 *
 * Requirements: 5.2, 5.3, 5.4, 5.5, 5.6, 5.7
 */
export function FollowUpSection({ leadId }: FollowUpSectionProps) {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingFollowUp, setEditingFollowUp] = useState<FollowUp | null>(null);

  // Query hooks
  const {
    data: followUpsResponse,
    isLoading,
    error,
  } = useFollowUps({ leadId });
  const followUps = followUpsResponse?.content || [];

  // Mutation hooks
  const createFollowUpMutation = useCreateFollowUp();
  const updateFollowUpMutation = useUpdateFollowUp();
  const completeFollowUpMutation = useCompleteFollowUp();
  const deleteFollowUpMutation = useDeleteFollowUp();

  // Handle create follow-up (Requirement 5.2)
  const handleCreate = async (data: {
    leadId: string;
    description: string;
    dueDate: string;
    priority: "LOW" | "MEDIUM" | "HIGH";
    type: "CALL" | "EMAIL" | "MEETING" | "TASK";
  }) => {
    await createFollowUpMutation.mutateAsync(data);
  };

  // Handle update follow-up (Requirement 5.5, 5.6)
  const handleUpdate = async (data: {
    leadId: string;
    description: string;
    dueDate: string;
    priority: "LOW" | "MEDIUM" | "HIGH";
    type: "CALL" | "EMAIL" | "MEETING" | "TASK";
  }) => {
    if (!editingFollowUp) {
      return;
    }
    await updateFollowUpMutation.mutateAsync({
      id: editingFollowUp.id,
      data: {
        description: data.description,
        dueDate: data.dueDate,
        priority: data.priority,
        type: data.type,
      },
    });
  };

  // Handle complete follow-up (Requirement 5.4)
  const handleComplete = async (followUpId: string) => {
    try {
      await completeFollowUpMutation.mutateAsync(followUpId);
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

  // Handle delete follow-up with confirmation (Requirement 5.7)
  const handleDelete = (followUpId: string) => {
    modals.openConfirmModal({
      title: t`Delete Follow-up`,
      children: (
        <Text size="sm">
          {t`Are you sure you want to delete this follow-up? This action cannot be undone.`}
        </Text>
      ),
      labels: { confirm: t`Delete`, cancel: t`Cancel` },
      confirmProps: { color: "red" },
      onConfirm: async () => {
        try {
          await deleteFollowUpMutation.mutateAsync(followUpId);
          notifications.show({
            title: t`Success`,
            message: t`Follow-up deleted successfully`,
            color: "green",
          });
        } catch (error: any) {
          notifications.show({
            title: t`Error`,
            message: t`Failed to delete follow-up: ${error?.message || "Unknown error"}`,
            color: "red",
          });
        }
      },
    });
  };

  // Handle edit button click (Requirement 5.5)
  const handleEdit = (followUp: FollowUp) => {
    setEditingFollowUp(followUp);
    setIsFormOpen(true);
  };

  // Handle form close
  const handleFormClose = () => {
    setIsFormOpen(false);
    setEditingFollowUp(null);
  };

  // Separate completed and pending follow-ups
  const pendingFollowUps = followUps.filter((f) => !f.completed);
  const completedFollowUps = followUps.filter((f) => f.completed);

  return (
    <Stack gap="md">
      {/* Header with add button */}
      <Group justify="space-between">
        <Text fw={600} size="lg">
          {t`Follow-ups`}
        </Text>
        <Button
          leftSection={<IconPlus size={16} />}
          onClick={() => setIsFormOpen(true)}
          size="sm"
        >
          {t`Schedule Follow-up`}
        </Button>
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
      {error && !isLoading && (
        <Alert
          icon={<IconAlertCircle size={16} />}
          title={t`Error`}
          color="red"
        >
          {t`Failed to load follow-ups. Please try again later.`}
        </Alert>
      )}

      {/* Empty state */}
      {!isLoading && !error && followUps.length === 0 && (
        <Card padding="xl" withBorder>
          <Stack align="center" gap="xs">
            <IconClock size={48} stroke={1.5} style={{ opacity: 0.3 }} />
            <Text size="sm" c="dimmed" ta="center">
              {t`No follow-ups scheduled for this lead yet.`}
            </Text>
            <Button
              leftSection={<IconPlus size={16} />}
              onClick={() => setIsFormOpen(true)}
              variant="light"
              size="sm"
              mt="xs"
            >
              {t`Schedule First Follow-up`}
            </Button>
          </Stack>
        </Card>
      )}

      {/* Pending follow-ups (Requirement 5.3) */}
      {!isLoading && !error && pendingFollowUps.length > 0 && (
        <Stack gap="xs">
          <Text size="sm" fw={500} c="dimmed">
            {t`Pending`} ({pendingFollowUps.length})
          </Text>
          {pendingFollowUps.map((followUp) => (
            <FollowUpCard
              key={followUp.id}
              followUp={followUp}
              onComplete={() => handleComplete(followUp.id)}
              onEdit={() => handleEdit(followUp)}
              onDelete={() => handleDelete(followUp.id)}
              isCompleting={completeFollowUpMutation.isPending}
              isDeleting={deleteFollowUpMutation.isPending}
            />
          ))}
        </Stack>
      )}

      {/* Completed follow-ups */}
      {!isLoading && !error && completedFollowUps.length > 0 && (
        <Stack gap="xs" mt="md">
          <Text size="sm" fw={500} c="dimmed">
            {t`Completed`} ({completedFollowUps.length})
          </Text>
          {completedFollowUps.map((followUp) => (
            <FollowUpCard
              key={followUp.id}
              followUp={followUp}
              onDelete={() => handleDelete(followUp.id)}
              isDeleting={deleteFollowUpMutation.isPending}
              isCompleted
            />
          ))}
        </Stack>
      )}

      {/* Follow-up form modal (Requirement 5.2, 5.5) */}
      <FollowUpForm
        opened={isFormOpen}
        onClose={handleFormClose}
        leadId={leadId}
        followUp={editingFollowUp}
        onSubmit={editingFollowUp ? handleUpdate : handleCreate}
        isLoading={
          createFollowUpMutation.isPending || updateFollowUpMutation.isPending
        }
      />
    </Stack>
  );
}

interface FollowUpCardProps {
  followUp: FollowUp;
  onComplete?: () => void;
  onEdit?: () => void;
  onDelete: () => void;
  isCompleting?: boolean;
  isDeleting?: boolean;
  isCompleted?: boolean;
}

/**
 * FollowUpCard - Individual follow-up card component
 */
function FollowUpCard({
  followUp,
  onComplete,
  onEdit,
  onDelete,
  isCompleting = false,
  isDeleting = false,
  isCompleted = false,
}: FollowUpCardProps) {
  const dueDate = new Date(followUp.dueDate);
  const formattedDate = dueDate.toLocaleDateString([], {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
  const formattedTime = dueDate.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

  const isOverdue = followUp.isOverdue && !isCompleted;

  return (
    <Card
      padding="md"
      radius="sm"
      withBorder
      style={{
        backgroundColor: isOverdue ? "var(--mantine-color-red-0)" : undefined,
        borderColor: isOverdue ? "var(--mantine-color-red-5)" : undefined,
        borderWidth: isOverdue ? 2 : 1,
        opacity: isCompleted ? 0.6 : 1,
      }}
    >
      <Group justify="space-between" align="flex-start" wrap="nowrap">
        <Stack gap="xs" style={{ flex: 1, minWidth: 0 }}>
          {/* Description */}
          <Text
            size="sm"
            fw={500}
            style={{ textDecoration: isCompleted ? "line-through" : undefined }}
          >
            {followUp.description}
          </Text>

          {/* Date and time */}
          <Group gap="xs">
            <Group gap={4}>
              <IconClock size={14} />
              <Text size="xs" c={isOverdue ? "red" : "dimmed"}>
                {formattedDate} at {formattedTime}
              </Text>
            </Group>

            {/* Overdue badge */}
            {isOverdue && (
              <Badge color="red" size="xs" variant="filled">
                {t`Overdue`}
              </Badge>
            )}

            {/* Completed badge */}
            {isCompleted && followUp.completedAt && (
              <Badge color="green" size="xs" variant="light">
                {t`Completed`}{" "}
                {new Date(followUp.completedAt).toLocaleDateString()}
              </Badge>
            )}
          </Group>

          {/* Priority and type badges */}
          <Group gap="xs">
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
            <Badge color="blue" size="xs" variant="light">
              {followUp.type}
            </Badge>
          </Group>
        </Stack>

        {/* Actions */}
        {!isCompleted && (
          <Group gap="xs" wrap="nowrap">
            {/* Complete button (Requirement 5.4) */}
            {onComplete && (
              <Tooltip label={t`Mark as complete`}>
                <ActionIcon
                  color="green"
                  variant="light"
                  onClick={onComplete}
                  loading={isCompleting}
                  disabled={isCompleting || isDeleting}
                  size="sm"
                >
                  <IconCheck size={16} />
                </ActionIcon>
              </Tooltip>
            )}

            {/* More actions menu */}
            <Menu shadow="md" width={200}>
              <Menu.Target>
                <ActionIcon variant="subtle" color="gray" size="sm">
                  <IconDots size={16} />
                </ActionIcon>
              </Menu.Target>

              <Menu.Dropdown>
                {/* Edit action (Requirement 5.5) */}
                {onEdit && (
                  <Menu.Item
                    leftSection={<IconEdit size={14} />}
                    onClick={onEdit}
                  >
                    {t`Edit`}
                  </Menu.Item>
                )}

                {/* Delete action (Requirement 5.7) */}
                <Menu.Item
                  leftSection={<IconTrash size={14} />}
                  color="red"
                  onClick={onDelete}
                  disabled={isDeleting}
                >
                  {t`Delete`}
                </Menu.Item>
              </Menu.Dropdown>
            </Menu>
          </Group>
        )}

        {/* Completed follow-up actions */}
        {isCompleted && (
          <Menu shadow="md" width={200}>
            <Menu.Target>
              <ActionIcon variant="subtle" color="gray" size="sm">
                <IconDots size={16} />
              </ActionIcon>
            </Menu.Target>

            <Menu.Dropdown>
              <Menu.Item
                leftSection={<IconTrash size={14} />}
                color="red"
                onClick={onDelete}
                disabled={isDeleting}
              >
                {t`Delete`}
              </Menu.Item>
            </Menu.Dropdown>
          </Menu>
        )}
      </Group>
    </Card>
  );
}
