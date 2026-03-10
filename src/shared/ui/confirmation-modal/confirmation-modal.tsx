import { Button, Group, Modal, Stack, Text, Title } from "@mantine/core";
import { IconAlertTriangle } from "@tabler/icons-react";
import { t } from "@lingui/core/macro";

interface ConfirmationModalProps {
  opened: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  message?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  confirmColor?: string;
  loading?: boolean;
  danger?: boolean;
}

export function ConfirmationModal({
  opened,
  onClose,
  onConfirm,
  title = t`Confirm Action`,
  message = t`Are you sure you want to proceed?`,
  confirmLabel = t`Confirm`,
  cancelLabel = t`Cancel`,
  confirmColor = "blue",
  loading = false,
  danger = false,
}: ConfirmationModalProps) {
  const handleConfirm = () => {
    onConfirm();
  };

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={
        <Group gap="xs">
          {danger && <IconAlertTriangle size="1.2rem" color="var(--mantine-color-red-6)" />}
          <Title order={4}>{title}</Title>
        </Group>
      }
      centered
      size="sm"
    >
      <Stack>
        <Text>{message}</Text>

        <Group justify="flex-end" gap="sm">
          <Button variant="subtle" onClick={onClose} disabled={loading}>
            {cancelLabel}
          </Button>
          <Button color={danger ? "red" : confirmColor} onClick={handleConfirm} loading={loading}>
            {confirmLabel}
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
}
