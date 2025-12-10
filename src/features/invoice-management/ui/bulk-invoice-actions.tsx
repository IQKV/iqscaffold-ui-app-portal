/**
 * Bulk Invoice Actions Component
 * Multiple downloads and bulk payment retry functionality
 */

import React from "react";
import {
  Card,
  Text,
  Button,
  Group,
  Badge,
  ActionIcon,
} from "@mantine/core";
import {
  IconDownload,
  IconRefresh,
  IconX,
  IconCheck,
} from "@tabler/icons-react";

interface BulkInvoiceActionsProps {
  selectedCount: number;
  onBulkDownload: () => void;
  onBulkRetryPayment: () => void;
  onClearSelection: () => void;
  downloading?: boolean;
  retrying?: boolean;
}

export const BulkInvoiceActions: React.FC<BulkInvoiceActionsProps> = ({
  selectedCount,
  onBulkDownload,
  onBulkRetryPayment,
  onClearSelection,
  downloading = false,
  retrying = false,
}) => {
  return (
    <Card withBorder radius="md" p="md" bg="blue.0">
      <Group justify="space-between" align="center">
        <Group gap="md" align="center">
          <Badge variant="filled" color="blue" size="lg">
            <Group gap="xs" align="center">
              <IconCheck size={14} />
              {selectedCount} selected
            </Group>
          </Badge>
          <Text size="sm" c="dimmed">
            Bulk actions for selected invoices
          </Text>
        </Group>

        <Group gap="sm">
          <Button
            variant="light"
            color="blue"
            size="sm"
            leftSection={<IconDownload size={14} />}
            onClick={onBulkDownload}
            loading={downloading}
          >
            Download All ({selectedCount})
          </Button>

          <Button
            variant="light"
            color="green"
            size="sm"
            leftSection={<IconRefresh size={14} />}
            onClick={onBulkRetryPayment}
            loading={retrying}
          >
            Retry Payments ({selectedCount})
          </Button>

          <ActionIcon
            variant="light"
            color="gray"
            size="sm"
            onClick={onClearSelection}
          >
            <IconX size={16} />
          </ActionIcon>
        </Group>
      </Group>
    </Card>
  );
};