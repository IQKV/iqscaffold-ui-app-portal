import { Button, Group, Stack, Text, Title } from "@mantine/core";
import { IconAlertTriangle } from "@tabler/icons-react";
import { type ContextModalProps } from "@mantine/modals";
import { t } from "@lingui/core/macro";

interface ConfirmContextInnerProps {
  title?: string;
  message?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  confirmColor?: string;
  danger?: boolean;
  onConfirm: () => void | Promise<void>;
}

export function ConfirmContextModal({
  context,
  id,
  innerProps,
}: ContextModalProps<ConfirmContextInnerProps>) {
  const {
    title = t`Confirm Action`,
    message = t`Are you sure you want to proceed?`,
    confirmLabel = t`Confirm`,
    cancelLabel = t`Cancel`,
    confirmColor = "blue",
    danger = false,
    onConfirm,
  } = innerProps;

  const handleClose = () => context.closeModal(id);
  const handleConfirm = async () => {
    await onConfirm();
    context.closeModal(id);
  };

  return (
    <Stack>
      <Group gap="xs">
        {danger && <IconAlertTriangle size="1.2rem" color="var(--mantine-color-red-6)" />}
        <Title order={4}>{title}</Title>
      </Group>

      <Text>{message}</Text>

      <Group justify="flex-end" gap="sm">
        <Button variant="subtle" onClick={handleClose}>
          {cancelLabel}
        </Button>
        <Button color={danger ? "red" : confirmColor} onClick={handleConfirm}>
          {confirmLabel}
        </Button>
      </Group>
    </Stack>
  );
}
