import React, { useState } from "react";
import {
  Modal,
  Stack,
  Group,
  Text,
  Button,
  ActionIcon,
  TextInput,
  Select,
  ColorInput,
  Paper,
  Divider,
  Tooltip,
  Alert,
  Box,
} from "@mantine/core";
import {
  IconPlus,
  IconTrash,
  IconEdit,
  IconArrowUp,
  IconArrowDown,
  IconAlertCircle,
  IconCheck,
  IconX,
} from "@tabler/icons-react";
import { t } from "@lingui/core/macro";
import {
  usePipelineStages,
  useCreatePipelineStage,
  useUpdatePipelineStage,
  useDeletePipelineStage,
  useReorderPipelineStage,
} from "@/entities/crm/api/crm-queries";
import { PipelineStage } from "@/shared/api/crm/types";
import { notifications } from "@mantine/notifications";

interface PipelineSettingsModalProps {
  opened: boolean;
  onClose: () => void;
}

export const PipelineSettingsModal: React.FC<PipelineSettingsModalProps> = ({
  opened,
  onClose,
}) => {
  const { data: stages = [], isLoading } = usePipelineStages();
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Mutations
  const createMutation = useCreatePipelineStage();
  const updateMutation = useUpdatePipelineStage();
  const deleteMutation = useDeletePipelineStage();
  const reorderMutation = useReorderPipelineStage();

  // New Stage form state
  const [newStage, setNewStage] = useState({
    name: "",
    type: "ACTIVE" as const,
    color: "#228be6",
  });

  // Edit Stage form state
  const [editStage, setEditStage] = useState<Partial<PipelineStage>>({});

  const handleCreate = async () => {
    if (!newStage.name) return;
    try {
      await createMutation.mutateAsync({
        ...newStage,
        orderIndex: stages.length,
      });
      setIsAdding(false);
      setNewStage({ name: "", type: "ACTIVE", color: "#228be6" });
      notifications.show({
        title: t`Success`,
        message: t`Stage created successfully`,
        color: "green",
      });
    } catch (error: any) {
      notifications.show({
        title: t`Error`,
        message: error.message || t`Failed to create stage`,
        color: "red",
      });
    }
  };

  const handleUpdate = async () => {
    if (!editingId || !editStage.name) return;
    try {
      await updateMutation.mutateAsync({
        id: editingId,
        data: {
          name: editStage.name,
          type: editStage.type,
          color: editStage.color,
        },
      });
      setEditingId(null);
      notifications.show({
        title: t`Success`,
        message: t`Stage updated successfully`,
        color: "green",
      });
    } catch (error: any) {
      notifications.show({
        title: t`Error`,
        message: error.message || t`Failed to update stage`,
        color: "red",
      });
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteMutation.mutateAsync(id);
      notifications.show({
        title: t`Success`,
        message: t`Stage deleted successfully`,
        color: "green",
      });
    } catch (error: any) {
      notifications.show({
        title: t`Error`,
        message: error.message || t`Failed to delete stage`,
        color: "red",
      });
    }
  };

  const handleReorder = async (
    id: string,
    currentOrder: number,
    direction: "up" | "down"
  ) => {
    const newOrder = direction === "up" ? currentOrder - 1 : currentOrder + 1;
    if (newOrder < 0 || newOrder >= stages.length) return;

    try {
      await reorderMutation.mutateAsync({ id, newOrder });
    } catch (error: any) {
      notifications.show({
        title: t`Error`,
        message: error.message || t`Failed to reorder stage`,
        color: "red",
      });
    }
  };

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={t`Manage Pipeline Stages`}
      size="lg"
    >
      <Stack gap="md">
        <Text size="sm" c="dimmed">
          {t`Customize your sales process by adding, removing, or reordering pipeline stages.`}
        </Text>

        <Divider />

        {/* Stage List */}
        <Stack gap="xs">
          {stages
            .sort((a, b) => a.orderIndex - b.orderIndex)
            .map((stage, index) => (
              <Paper key={stage.id} p="sm" withBorder>
                {editingId === stage.id ? (
                  // Edit Row
                  <Stack gap="xs">
                    <Group grow>
                      <TextInput
                        label={t`Name`}
                        value={editStage.name}
                        onChange={(e) =>
                          setEditStage({
                            ...editStage,
                            name: e.currentTarget.value,
                          })
                        }
                        required
                      />
                      <Select
                        label={t`Type`}
                        value={editStage.type}
                        onChange={(val) =>
                          setEditStage({ ...editStage, type: val as any })
                        }
                        data={[
                          { value: "ACTIVE", label: t`Active` },
                          { value: "WON", label: t`Won` },
                          { value: "LOST", label: t`Lost` },
                        ]}
                      />
                    </Group>
                    <Group align="flex-end">
                      <ColorInput
                        label={t`Color`}
                        value={editStage.color}
                        onChange={(val) =>
                          setEditStage({ ...editStage, color: val })
                        }
                        style={{ flex: 1 }}
                      />
                      <Group gap="xs">
                        <Button
                          variant="light"
                          onClick={handleUpdate}
                          loading={updateMutation.isPending}
                        >
                          <IconCheck size={16} />
                        </Button>
                        <Button
                          variant="subtle"
                          color="gray"
                          onClick={() => setEditingId(null)}
                        >
                          <IconX size={16} />
                        </Button>
                      </Group>
                    </Group>
                  </Stack>
                ) : (
                  // View Row
                  <Group justify="space-between">
                    <Group gap="md">
                      <Box
                        w={12}
                        h={24}
                        bg={stage.color}
                        style={{ borderRadius: 2 }}
                      />
                      <div>
                        <Text fw={500}>{stage.name}</Text>
                        <Text size="xs" c="dimmed">
                          {stage.type} • {stage.leadCount || 0} {t`leads`}
                        </Text>
                      </div>
                    </Group>
                    <Group gap="xs">
                      <Tooltip label={t`Move Up`}>
                        <ActionIcon
                          variant="subtle"
                          disabled={index === 0}
                          onClick={() =>
                            handleReorder(stage.id, stage.orderIndex, "up")
                          }
                        >
                          <IconArrowUp size={16} />
                        </ActionIcon>
                      </Tooltip>
                      <Tooltip label={t`Move Down`}>
                        <ActionIcon
                          variant="subtle"
                          disabled={index === stages.length - 1}
                          onClick={() =>
                            handleReorder(stage.id, stage.orderIndex, "down")
                          }
                        >
                          <IconArrowDown size={16} />
                        </ActionIcon>
                      </Tooltip>
                      <Divider orientation="vertical" />
                      <ActionIcon
                        variant="subtle"
                        onClick={() => {
                          setEditingId(stage.id);
                          setEditStage(stage);
                        }}
                      >
                        <IconEdit size={16} />
                      </ActionIcon>
                      <ActionIcon
                        variant="subtle"
                        color="red"
                        onClick={() => handleDelete(stage.id)}
                        loading={
                          deleteMutation.isPending &&
                          deleteMutation.variables === stage.id
                        }
                      >
                        <IconTrash size={16} />
                      </ActionIcon>
                    </Group>
                  </Group>
                )}
              </Paper>
            ))}
        </Stack>

        {/* Add New Stage */}
        {isAdding ? (
          <Paper p="md" withBorder bg="var(--mantine-color-blue-0)">
            <Stack gap="xs">
              <Text fw={600} size="sm">{t`Add New Stage`}</Text>
              <Group grow>
                <TextInput
                  placeholder={t`Stage Name`}
                  value={newStage.name}
                  onChange={(e) =>
                    setNewStage({ ...newStage, name: e.currentTarget.value })
                  }
                  required
                />
                <Select
                  value={newStage.type}
                  onChange={(val) =>
                    setNewStage({ ...newStage, type: val as any })
                  }
                  data={[
                    { value: "ACTIVE", label: t`Active` },
                    { value: "WON", label: t`Won` },
                    { value: "LOST", label: t`Lost` },
                  ]}
                />
              </Group>
              <Group align="flex-end">
                <ColorInput
                  placeholder={t`Color`}
                  value={newStage.color}
                  onChange={(val) => setNewStage({ ...newStage, color: val })}
                  style={{ flex: 1 }}
                />
                <Group gap="xs">
                  <Button
                    onClick={handleCreate}
                    loading={createMutation.isPending}
                  >
                    {t`Add`}
                  </Button>
                  <Button
                    variant="subtle"
                    color="gray"
                    onClick={() => setIsAdding(false)}
                  >
                    {t`Cancel`}
                  </Button>
                </Group>
              </Group>
            </Stack>
          </Paper>
        ) : (
          <Button
            leftSection={<IconPlus size={16} />}
            variant="light"
            onClick={() => setIsAdding(true)}
            fullWidth
          >
            {t`Add Stage`}
          </Button>
        )}

        {stages.length === 0 && !isLoading && (
          <Alert
            icon={<IconAlertCircle size={16} />}
            title={t`No Stages`}
            color="blue"
          >
            {t`Your pipeline has no stages. Create some to get started.`}
          </Alert>
        )}

        <Group justify="flex-end" mt="md">
          <Button onClick={onClose} variant="default">{t`Close`}</Button>
        </Group>
      </Stack>
    </Modal>
  );
};
