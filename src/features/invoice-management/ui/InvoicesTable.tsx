import { useState } from "react";
import {
  Table,
  Text,
  Group,
  ActionIcon,
  Button,
  Stack,
  Pagination,
  Loader,
  Alert,
  Badge,
  Anchor,
} from "@mantine/core";
import { IconExternalLink, IconDownload, IconEye } from "@tabler/icons-react";
import { t } from "@lingui/macro";
import { useInvoices, Invoice, InvoiceStatusBadge } from "@/entities/billing";
import { formatCurrency } from "@/shared/lib/format";

interface InvoicesTableProps {
  subscriptionId?: string;
}

export function InvoicesTable({ subscriptionId }: InvoicesTableProps) {
  const [page, setPage] = useState(0);
  const pageSize = 10;

  const { data, isLoading, error } = useInvoices({
    page,
    size: pageSize,
    sort: ["createdAt,desc"],
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  if (isLoading) {
    return (
      <Group justify="center" p="xl">
        <Loader />
      </Group>
    );
  }

  if (error) {
    return (
      <Alert color="red" title={t`Error Loading Invoices`}>
        {t`Failed to load invoices. Please try again later.`}
      </Alert>
    );
  }

  if (!data || data.content.length === 0) {
    return (
      <Alert color="blue" title={t`No Invoices`}>
        {t`No invoices found.`}
      </Alert>
    );
  }

  const totalPages = Math.ceil(data.totalElements / pageSize);

  return (
    <Stack gap="md">
      <Table striped highlightOnHover>
        <Table.Thead>
          <Table.Tr>
            <Table.Th>{t`Invoice`}</Table.Th>
            <Table.Th>{t`Status`}</Table.Th>
            <Table.Th>{t`Amount`}</Table.Th>
            <Table.Th>{t`Period`}</Table.Th>
            <Table.Th>{t`Due Date`}</Table.Th>
            <Table.Th>{t`Actions`}</Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {data.content.map((invoice) => (
            <InvoiceRow key={invoice.id} invoice={invoice} />
          ))}
        </Table.Tbody>
      </Table>

      {totalPages > 1 && (
        <Group justify="center">
          <Pagination
            value={page + 1}
            onChange={(newPage) => setPage(newPage - 1)}
            total={totalPages}
          />
        </Group>
      )}
    </Stack>
  );
}

interface InvoiceRowProps {
  invoice: Invoice;
}

function InvoiceRow({ invoice }: InvoiceRowProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const handleViewInvoice = () => {
    if (invoice.hostedInvoiceUrl) {
      window.open(invoice.hostedInvoiceUrl, "_blank");
    }
  };

  const handleDownloadPdf = () => {
    if (invoice.invoicePdf) {
      window.open(invoice.invoicePdf, "_blank");
    }
  };

  return (
    <Table.Tr>
      <Table.Td>
        <Stack gap={2}>
          <Text size="sm" fw={500}>
            {invoice.id.slice(0, 8)}...
          </Text>
          {invoice.stripeInvoiceId && (
            <Text size="xs" c="dimmed">
              {invoice.stripeInvoiceId}
            </Text>
          )}
        </Stack>
      </Table.Td>
      <Table.Td>
        <InvoiceStatusBadge status={invoice.status} />
      </Table.Td>
      <Table.Td>
        <Stack gap={2}>
          <Text size="sm" fw={500}>
            {formatCurrency(invoice.amountDue / 100, invoice.currency)}
          </Text>
          {invoice.amountPaid > 0 && (
            <Text size="xs" c="green">
              {t`Paid: ${formatCurrency(invoice.amountPaid / 100, invoice.currency)}`}
            </Text>
          )}
        </Stack>
      </Table.Td>
      <Table.Td>
        <Text size="sm">
          {formatDate(invoice.periodStart)} - {formatDate(invoice.periodEnd)}
        </Text>
      </Table.Td>
      <Table.Td>
        <Text size="sm">
          {invoice.dueDate ? formatDate(invoice.dueDate) : "-"}
        </Text>
      </Table.Td>
      <Table.Td>
        <Group gap="xs">
          {invoice.hostedInvoiceUrl && (
            <ActionIcon
              variant="subtle"
              color="blue"
              onClick={handleViewInvoice}
              title={t`View Invoice`}
            >
              <IconEye size={16} />
            </ActionIcon>
          )}
          {invoice.invoicePdf && (
            <ActionIcon
              variant="subtle"
              color="green"
              onClick={handleDownloadPdf}
              title={t`Download PDF`}
            >
              <IconDownload size={16} />
            </ActionIcon>
          )}
        </Group>
      </Table.Td>
    </Table.Tr>
  );
}
