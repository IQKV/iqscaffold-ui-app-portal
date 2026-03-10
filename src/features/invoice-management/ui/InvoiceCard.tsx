import { Card, Text, Group, Stack, Button, Badge, Divider } from "@mantine/core";
import { IconExternalLink, IconDownload } from "@tabler/icons-react";
import { t } from "@lingui/macro";
import { Invoice, InvoiceStatusBadge } from "@/entities/billing";
import { formatCurrency } from "@/shared/lib/format";

interface InvoiceCardProps {
  invoice: Invoice;
}

export function InvoiceCard({ invoice }: InvoiceCardProps) {
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
    <Card withBorder shadow="sm" radius="md">
      <Stack gap="md">
        <Group justify="space-between">
          <Stack gap={4}>
            <Text fw={600} size="lg">
              {(() => {
                const invoiceId = invoice.id.slice(0, 8);
                return t`Invoice ${invoiceId}...`;
              })()}
            </Text>
            <InvoiceStatusBadge status={invoice.status} />
          </Stack>
          <Text fw={700} size="xl">
            {formatCurrency(invoice.amountDue / 100, invoice.currency)}
          </Text>
        </Group>

        <Divider />

        <Stack gap="xs">
          <Group justify="space-between">
            <Text size="sm" c="dimmed">
              {t`Billing Period:`}
            </Text>
            <Text size="sm">
              {formatDate(invoice.periodStart)} - {formatDate(invoice.periodEnd)}
            </Text>
          </Group>

          {invoice.dueDate && (
            <Group justify="space-between">
              <Text size="sm" c="dimmed">
                {t`Due Date:`}
              </Text>
              <Text size="sm">{formatDate(invoice.dueDate)}</Text>
            </Group>
          )}

          {invoice.paidAt && (
            <Group justify="space-between">
              <Text size="sm" c="dimmed">
                {t`Paid On:`}
              </Text>
              <Text size="sm" c="green">
                {formatDate(invoice.paidAt)}
              </Text>
            </Group>
          )}

          {invoice.amountPaid > 0 && invoice.amountPaid !== invoice.amountDue && (
            <Group justify="space-between">
              <Text size="sm" c="dimmed">
                {t`Amount Paid:`}
              </Text>
              <Text size="sm" c="green">
                {formatCurrency(invoice.amountPaid / 100, invoice.currency)}
              </Text>
            </Group>
          )}

          {invoice.stripeInvoiceId && (
            <Group justify="space-between">
              <Text size="sm" c="dimmed">
                {t`Stripe ID:`}
              </Text>
              <Text size="sm" ff="monospace">
                {invoice.stripeInvoiceId}
              </Text>
            </Group>
          )}
        </Stack>

        <Group gap="sm">
          {invoice.hostedInvoiceUrl && (
            <Button
              variant="light"
              leftSection={<IconExternalLink size={16} />}
              onClick={handleViewInvoice}
              flex={1}
            >
              {t`View Invoice`}
            </Button>
          )}
          {invoice.invoicePdf && (
            <Button
              variant="outline"
              leftSection={<IconDownload size={16} />}
              onClick={handleDownloadPdf}
              flex={1}
            >
              {t`Download PDF`}
            </Button>
          )}
        </Group>
      </Stack>
    </Card>
  );
}
