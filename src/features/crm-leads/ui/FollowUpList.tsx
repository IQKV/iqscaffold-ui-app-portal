import { useState } from "react";
import {
  Container,
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
  TextInput,
  Select,
  Pagination,
  Checkbox,
  Divider,
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
  IconSearch,
  IconFilter,
  IconChecks,
} from "@tabler/icons-react";
import {
  useFollowUps,
  useCreateFollowUp,
  useUpdateFollowUp,
  useCompleteFollowUp,
  useDeleteFollowUp,
} from "@/entities/crm";
import { FollowUpForm } from "@/entities/crm";
import type { FollowUp } from "@/shared/api/crm/types";
import { notifications } from "@mantine/notifications";
import { modals } from "@mantine/modals";
import { useNavigate } from "@tanstack/react-router";
import { useDebouncedValue } from "@mantine/hooks";

/**
 * FollowUpList - Full follow-up management page
 *
 * Features:
 * - Full follow-up management interface
 * - Advanced filtering and search capabilities
 * - Bulk operations for multiple follow-ups
 *
 * Requirements: Follow-up management interface
 */
export function FollowUpList() {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [debouncedSearch] = useDebouncedValue(search, 300);
  const [completedFilter, setCompletedFilter] = useState<string | null>(
    "pending"
  );
  const [overdueFilter, setOverdueFilter] = useState<string | null>(null);
  const [selectedFollowUps, setSelectedFollowUps] = useState<Set<string>>(
    new Set()
  );
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingFollowUp, setEditingFollowUp] = useState<FollowUp | null>(null);

  // Build query params
  const queryParams = {
    page: page - 1,
    size: 20,
    completed:
      completedFilter === "completed"
        ? true
        : completedFilter === "pending"
          ? false
          : undefined,
    overdue: overdueFilter === "overdue" ? true : undefined,
  };

  // Query hooks
  const {
    data: followUpsResponse,
    isLoading,
    error,
  } = useFollowUps(queryParams);
  const followUps = followUpsResponse?.content || [];
  const totalPages = followUpsResponse?.totalPages || 1;

  // Mutation hooks
  const createFollowUpMutation = useCreateFollowUp();
  const updateFollowUpMutation = useUpdateFollowUp();
  const completeFollowUpMutation = useCompleteFollowUp();
  const deleteFollowUpMutation = useDeleteFollowUp();

  // Filter follow-ups by search term (client-side for now)
  const filteredFollowUps = followUps.filter((followUp) =>
    debouncedSearch
      ? followUp.description
        .toLowerCase()
        .includes(debouncedSearch.toLowerCase())
      : true
  );

  // Handle create follow-up
  const handleCreate = async (data: {
    leadId: string;
    description: string;
    dueDate: string;
    priority: "LOW" | "MEDIUM" | "HIGH";
    type: "CALL" | "EMAIL" | "MEETING" | "TASK";
  }) => {
    await createFollowUpMutation.mutateAsync(data);
  };

  // Handle update follow-up
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

  // Handle complete follow-up
  const handleComplete = async (followUpId: string) => {
    try {
      await completeFollowUpMutation.mutateAsync(followUpId);
      notifications.show({
        title: t`Success`,
        message: t`Follow-up marked as complete`,
        color: "green",
      });
    } catch (error: any) {
      const errorMessage = error?.message || "Unknown error";
      notifications.show({
        title: t`Error`,
        message: t`Failed to complete follow-up: ${errorMessage}`,
        color: "red",
      });
    }
  };

  // Handle delete follow-up with confirmation
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
          // Remove from selection if selected
          setSelectedFollowUps((prev) => {
            const newSet = new Set(prev);
            newSet.delete(followUpId);
            return newSet;
          });
        } catch (error: any) {
          const errorMessage = error?.message || "Unknown error";
          notifications.show({
            title: t`Error`,
            message: t`Failed to delete follow-up: ${errorMessage}`,
            color: "red",
          });
        }
      },
    });
  };

  // Handle edit button click
  const handleEdit = (followUp: FollowUp) => {
    setEditingFollowUp(followUp);
    setIsFormOpen(true);
  };

  // Handle form close
  const handleFormClose = () => {
    setIsFormOpen(false);
    setEditingFollowUp(null);
  };

  // Handle navigate to lead
  const handleNavigateToLead = (leadId: string) => {
    navigate({ to: `/crm/leads/${leadId}` });
  };

  // Handle selection toggle
  const handleToggleSelection = (followUpId: string) => {
    setSelectedFollowUps((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(followUpId)) {
        newSet.delete(followUpId);
      } else {
        newSet.add(followUpId);
      }
      return newSet;
    });
  };

  // Handle select all
  const handleSelectAll = () => {
    if (selectedFollowUps.size === filteredFollowUps.length) {
      setSelectedFollowUps(new Set());
    } else {
      setSelectedFollowUps(new Set(filteredFollowUps.map((f) => f.id)));
    }
  };

  // Handle bulk complete
  const handleBulkComplete = async () => {
    const selectedIds = Array.from(selectedFollowUps);
    if (selectedIds.length === 0) {
      return;
    }

    const count = selectedIds.length;
    modals.openConfirmModal({
      title: t`Complete Selected Follow-ups`,
      children: (
        <Text size="sm">
          {t`Are you sure you want to mark ${count} follow-up(s) as complete?`}
        </Text>
      ),
      labels: { confirm: t`Complete`, cancel: t`Cancel` },
      confirmProps: { color: "green" },
      onConfirm: async () => {
        try {
          await Promise.all(
            selectedIds.map((id) => completeFollowUpMutation.mutateAsync(id))
          );
          const completedCount = selectedIds.length;
          notifications.show({
            title: t`Success`,
            message: t`${completedCount} follow-up(s) marked as complete`,
            color: "green",
          });
          setSelectedFollowUps(new Set());
        } catch (error: any) {
          notifications.show({
            title: t`Error`,
            message: t`Failed to complete some follow-ups`,
            color: "red",
          });
        }
      },
    });
  };

  // Handle bulk delete
  const handleBulkDelete = () => {
    const selectedIds = Array.from(selectedFollowUps);
    if (selectedIds.length === 0) {
      return;
    }

    const count = selectedIds.length;
    modals.openConfirmModal({
      title: t`Delete Selected Follow-ups`,
      children: (
        <Text size="sm">
          {t`Are you sure you want to delete ${count} follow-up(s)? This action cannot be undone.`}
        </Text>
      ),
      labels: { confirm: t`Delete`, cancel: t`Cancel` },
      confirmProps: { color: "red" },
      onConfirm: async () => {
        try {
          await Promise.all(
            selectedIds.map((id) => deleteFollowUpMutation.mutateAsync(id))
          );
          const deletedCount = selectedIds.length;
          notifications.show({
            title: t`Success`,
            message: t`${deletedCount} follow-up(s) deleted successfully`,
            color: "green",
          });
          setSelectedFollowUps(new Set());
        } catch (error: any) {
          notifications.show({
            title: t`Error`,
            message: t`Failed to delete some follow-ups`,
            color: "red",
          });
        }
      },
    });
  };

  return (
    <Container size="xl" py="xl">
      <Stack gap="lg">
        {/* Header */}
        <Group justify="space-between">
          <div>
            <Text size="xl" fw={700}>
              {t`Follow-ups`}
            </Text>
            <Text size="sm" c="dimmed">
              {t`Manage all your follow-up tasks`}
            </Text>
          </div>
          <Button
            leftSection={<IconPlus size={16} />}
            onClick={() => setIsFormOpen(true)}
          >
            {t`Schedule Follow-up`}
          </Button>
        </Group>

        {/* Filters and search */}
        <Card padding="md" withBorder>
          <Stack gap="md">
            <Group grow>
              {/* Search */}
              <TextInput
                placeholder={t`Search follow-ups...`}
                leftSection={<IconSearch size={16} />}
                value={search}
                onChange={(e) => setSearch(e.currentTarget.value)}
              />

              {/* Status filter */}
              <Select
                placeholder={t`Filter by status`}
                leftSection={<IconFilter size={16} />}
                data={[
                  { value: "all", label: t`All` },
                  { value: "pending", label: t`Pending` },
                  { value: "completed", label: t`Completed` },
                ]}
                value={completedFilter}
                onChange={setCompletedFilter}
                clearable
              />

              {/* Overdue filter */}
              <Select
                placeholder={t`Filter by overdue`}
                leftSection={<IconFilter size={16} />}
                data={[
                  { value: "all", label: t`All` },
                  { value: "overdue", label: t`Overdue Only` },
                ]}
                value={overdueFilter}
                onChange={setOverdueFilter}
                clearable
              />
            </Group>

            {/* Bulk actions */}
            {selectedFollowUps.size > 0 && (
              <>
                <Divider />
                <Group justify="space-between">
                  <Text size="sm" c="dimmed">
                    {selectedFollowUps.size} {t`selected`}
                  </Text>
                  <Group gap="xs">
                    <Button
                      size="xs"
                      variant="light"
                      color="green"
                      leftSection={<IconChecks size={14} />}
                      onClick={handleBulkComplete}
                    >
                      {t`Complete Selected`}
                    </Button>
                    <Button
                      size="xs"
                      variant="light"
                      color="red"
                      leftSection={<IconTrash size={14} />}
                      onClick={handleBulkDelete}
                    >
                      {t`Delete Selected`}
                    </Button>
                  </Group>
                </Group>
              </>
            )}
          </Stack>
        </Card>

        {/* Loading state */}
        {isLoading && (
          <Group justify="center" py="xl">
            <Loader size="md" />
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
        {!isLoading && !error && filteredFollowUps.length === 0 && (
          <Card padding="xl" withBorder>
            <Stack align="center" gap="xs">
              <IconClock size={48} stroke={1.5} style={{ opacity: 0.3 }} />
              <Text size="sm" c="dimmed" ta="center">
                {search
                  ? t`No follow-ups found matching your search.`
                  : t`No follow-ups found. Schedule your first follow-up to get started.`}
              </Text>
              {!search && (
                <Button
                  leftSection={<IconPlus size={16} />}
                  onClick={() => setIsFormOpen(true)}
                  variant="light"
                  size="sm"
                  mt="xs"
                >
                  {t`Schedule Follow-up`}
                </Button>
              )}
            </Stack>
          </Card>
        )}

        {/* Follow-ups list */}
        {!isLoading && !error && filteredFollowUps.length > 0 && (
          <Stack gap="xs">
            {/* Select all checkbox */}
            <Group>
              <Checkbox
                checked={selectedFollowUps.size === filteredFollowUps.length}
                indeterminate={
                  selectedFollowUps.size > 0 &&
                  selectedFollowUps.size < filteredFollowUps.length
                }
                onChange={handleSelectAll}
                label={t`Select all`}
              />
            </Group>

            {/* Follow-up cards */}
            {filteredFollowUps.map((followUp) => (
              <FollowUpCard
                key={followUp.id}
                followUp={followUp}
                isSelected={selectedFollowUps.has(followUp.id)}
                onToggleSelection={() => handleToggleSelection(followUp.id)}
                onComplete={() => handleComplete(followUp.id)}
                onEdit={() => handleEdit(followUp)}
                onDelete={() => handleDelete(followUp.id)}
                onNavigateToLead={() => handleNavigateToLead(followUp.leadId)}
                isCompleting={completeFollowUpMutation.isPending}
                isDeleting={deleteFollowUpMutation.isPending}
              />
            ))}
          </Stack>
        )}

        {/* Pagination */}
        {!isLoading && !error && totalPages > 1 && (
          <Group justify="center">
            <Pagination value={page} onChange={setPage} total={totalPages} />
          </Group>
        )}

        {/* Follow-up form modal */}
        <FollowUpForm
          opened={isFormOpen}
          onClose={handleFormClose}
          leadId={editingFollowUp?.leadId || ""}
          followUp={editingFollowUp}
          onSubmit={editingFollowUp ? handleUpdate : handleCreate}
          isLoading={
            createFollowUpMutation.isPending || updateFollowUpMutation.isPending
          }
        />
      </Stack>
    </Container>
  );
}

interface FollowUpCardProps {
  followUp: FollowUp;
  isSelected: boolean;
  onToggleSelection: () => void;
  onComplete: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onNavigateToLead: () => void;
  isCompleting: boolean;
  isDeleting: boolean;
}

/**
 * FollowUpCard - Individual follow-up card in the list
 */
function FollowUpCard({
  followUp,
  isSelected,
  onToggleSelection,
  onComplete,
  onEdit,
  onDelete,
  onNavigateToLead,
  isCompleting,
  isDeleting,
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

  const isOverdue = followUp.isOverdue && !followUp.completed;
  const isCompleted = followUp.completed;

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
        {/* Selection checkbox */}
        <Checkbox
          checked={isSelected}
          onChange={onToggleSelection}
          aria-label={t`Select follow-up`}
        />

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
            <Button size="xs" variant="subtle" onClick={onNavigateToLead}>
              {t`View Lead`}
            </Button>
          </Group>
        </Stack>

        {/* Actions */}
        {!isCompleted && (
          <Group gap="xs" wrap="nowrap">
            {/* Complete button */}
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

            {/* More actions menu */}
            <Menu shadow="md" width={200}>
              <Menu.Target>
                <ActionIcon variant="subtle" color="gray" size="sm">
                  <IconDots size={16} />
                </ActionIcon>
              </Menu.Target>

              <Menu.Dropdown>
                <Menu.Item
                  leftSection={<IconEdit size={14} />}
                  onClick={onEdit}
                >
                  {t`Edit`}
                </Menu.Item>
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
