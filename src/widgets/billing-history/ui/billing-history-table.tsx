import React, { useState } from "react";
import { DataTable } from "mantine-datatable";
import {
  usePayments,
  PaymentStatusBadge,
  useRefundPayment,
  Payment,
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
import { billingKeys } from "@/entities/billing/api/billing-queries";

const PAGE_SIZE = 10;

export const BillingHistoryTable = () => {
  const [page, setPage] = useState(1);
  const { data, isLoading } = usePayments({ page: page - 1, size: PAGE_SIZE });
  const { isAdmin } = useAuth();
  const queryClient = useQueryClient();
  const refundMutation = useRefundPayment();

  const handleRefund = (id: string) => {
    modals.openConfirmModal({
      title: t`Confirm Refund`,
      children: (
        <Text size="sm">
          {t`Are you sure you want to refund this payment? This action cannot be undone.`}
        </Text>
      ),
      labels: { confirm: t`Refund`, cancel: t`Cancel` },
      confirmProps: { color: "red" },
      onConfirm: async () => {
        try {
          await refundMutation.mutateAsync(id);
          notificationService.success({
            title: t`Refund Initiated`,
            message: t`The payment is being refunded.`,
          });
          queryClient.invalidateQueries({ queryKey: billingKeys.payments() });
        } catch (error) {
          notificationService.error({
            title: t`Refund Failed`,
            message: t`Could not process refund. Please try again.`,
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
            render: ({ createdAt }) =>
              dayjs(createdAt).format("YYYY-MM-DD HH:mm"),
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
                {isAdmin() && record.status === "SUCCEEDED" && (
                  <Tooltip label={t`Refund Payment`}>
                    <ActionIcon
                      color="red"
                      variant="subtle"
                      loading={
                        refundMutation.isPending &&
                        refundMutation.variables === record.id
                      }
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
