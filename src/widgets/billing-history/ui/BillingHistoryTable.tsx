import React, { useState } from "react";
import { DataTable } from "mantine-datatable";
import { usePayments, PaymentStatusBadge } from "@/entities/billing";
import { Stack, Text, Title, Group } from "@mantine/core";
import { t } from "@lingui/macro";
import dayjs from "dayjs";
import { formatCurrency } from "@/shared/lib/currency";

const PAGE_SIZE = 10;

export const BillingHistoryTable = () => {
  const [page, setPage] = useState(1);
  const { data, isLoading } = usePayments({ page: page - 1, size: PAGE_SIZE });

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
        ]}
        noRecordsText={t`No payments found`}
      />
    </Stack>
  );
};
