import React, { useState } from "react";
import { DataTable } from "mantine-datatable";
import {
  usePaymentsQuery,
  PaymentStatusBadge,
  useRefundPaymentMutation,
  Payment,
  billingKeys,
} from "@/entities/billing";
import { Stack, Text, Title, Group, ActionIcon, Tooltip } from "@mantine/core";
import { modals } from "@mantine/modals";
import { IconRotate2 } from "@tabler/icons-react";
import { t } from "@lingui/macro";
import dayjs from "dayjs";
import { formatCurrency } from "@/shared/lib/currency";
import { useAuth } from "@/processes/auth";
import { notificationService } from "@/shared/lib/notifications";
import { useQueryClient } from "@tanstack/react-query";
import { CONFIRMATION_MESSAGES, NOTIFICATION_MESSAGES, DEFAULTS } from "@/shared/constants";
import { i18n } from "@lingui/core";

const PAGE_SIZE = DEFAULTS.PAGE_SIZE;

export const BillingHistoryTable = () => {
  const [page, setPage] = useState(1);
  const { data, isLoading } = usePaymentsQuery({
    page: page - 1,
    size: PAGE_SIZE,
  });
  const { canProcessRefunds, canViewPayments } = useAuth();
  const queryClient = useQueryClient();
  const refundMutation = useRefundPaymentMutation();

  if (!canViewPayments()) {
    return (
      <Stack gap="md">
        <Text c="dimmed">{t`You don't have permission to view payment history.`}</Text>
      </Stack>
    );
  }

  const handleRefund = (id: string) => {
    modals.openConfirmModal({
      title: t`Confirm Refund`,
      children: <Text size="sm">{i18n._(CONFIRMATION_MESSAGES.REFUND)}</Text>,
      labels: { confirm: t`Refund`, cancel: t`Cancel` },
      confirmProps: { color: "red" },
      onConfirm: async () => {
        try {
          await refundMutation.mutateAsync(id);
          notificationService.success({
            title: t`Refund Initiated`,
            message: i18n._(NOTIFICATION_MESSAGES.SUCCESS.REFUND_INITIATED),
          });
          queryClient.invalidateQueries({ queryKey: billingKeys.payments() });
        } catch {
          notificationService.error({
            title: t`Refund Failed`,
            message: i18n._(NOTIFICATION_MESSAGES.ERROR.REFUND_FAILED),
          });
        }
      },
    });
  };

  return (
    <Stack gap="md">
      <Group justify="space-between">
        <Title order={3}>{t`Payment History`}</Title>
      </Group>

      <DataTable
        withTableBorder
        borderRadius="sm"
        withColumnBorders
        striped
        highlightOnHover
        fetching={isLoading}
        records={data?.content || []}
        totalRecords={data?.totalElements || 0}
        recordsPerPage={PAGE_SIZE}
        page={page}
        onPageChange={(p) => setPage(p)}
        columns={[
          {
            accessor: "id",
            title: t`Payment ID`,
            render: ({ id }) => (
              <Text size="xs" truncate>
                {id}
              </Text>
            ),
          },
          {
            accessor: "createdAt",
            title: t`Date`,
            render: ({ createdAt }) => dayjs(createdAt).format("YYYY-MM-DD HH:mm"),
          },
          {
            accessor: "amount",
            title: t`Amount`,
            render: ({ amount, currency }) => formatCurrency(amount, currency),
          },
          {
            accessor: "status",
            title: t`Status`,
            render: ({ status }) => <PaymentStatusBadge status={status} />,
          },
          {
            accessor: "actions",
            title: t`Actions`,
            textAlign: "right",
            render: (record: Payment) => (
              <Group justify="flex-end" gap={4} wrap="nowrap">
                {canProcessRefunds() && record.status === "SUCCEEDED" && (
                  <Tooltip label={t`Refund Payment`}>
                    <ActionIcon
                      color="red"
                      variant="subtle"
                      loading={refundMutation.isPending && refundMutation.variables === record.id}
                      onClick={() => handleRefund(record.id)}
                    >
                      <IconRotate2 size={16} />
                    </ActionIcon>
                  </Tooltip>
                )}
              </Group>
            ),
          },
        ]}
        noRecordsText={t`No payments found`}
      />
    </Stack>
  );
};
