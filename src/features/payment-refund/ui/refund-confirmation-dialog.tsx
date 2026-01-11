import { Modal, Stack, Text, Group, Button, Alert } from "@mantine/core";
import { IconAlertTriangle } from "@tabler/icons-react";
import { t } from "@lingui/macro";

interface RefundConfirmationDialogProps {
  opened: boolean;
  onClose: () => void;
  onConfirm: () => void;
  loading?: boolean;
  paymentAmount?: number;
  paymentCurrency?: string;
  paymentId?: string;
}

export const RefundConfirmationDialog = ({
  opened,
  onClose,
  onConfirm,
  loading = false,
  paymentAmount,
  paymentCurrency = "USD",
  paymentId,
}: RefundConfirmationDialogProps) => {
  return (
    <Modal opened={opened} onClose={onClose} title={t`Confirm Refund`} centered>
      <Stack gap="md">
        <Alert
          icon={<IconAlertTriangle size={16} />}
          title={t`Warning`}
          color="yellow"
        >
          {t`This action cannot be undone. The full payment amount will be refunded to the customer.`}
        </Alert>

        {paymentAmount && (
          <div>
            <Text size="sm" c="dimmed">
              {t`Refund Amount`}
            </Text>
            <Text size="lg" fw={700}>
              {new Intl.NumberFormat("en-US", {
                style: "currency",
                currency: paymentCurrency,
              }).format(paymentAmount / 100)}
            </Text>
          </div>
        )}

        {paymentId && (
          <div>
            <Text size="sm" c="dimmed">
              {t`Payment ID`}
            </Text>
            <Text size="sm" ff="monospace">
              {paymentId}
            </Text>
          </div>
        )}

        <Text size="sm" c="dimmed">
          {t`Are you sure you want to proceed with this refund?`}
        </Text>

        <Group justify="flex-end" mt="md">
          <Button variant="subtle" onClick={onClose} disabled={loading}>
            {t`Cancel`}
          </Button>
          <Button color="red" onClick={onConfirm} loading={loading}>
            {t`Refund Payment`}
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
};
