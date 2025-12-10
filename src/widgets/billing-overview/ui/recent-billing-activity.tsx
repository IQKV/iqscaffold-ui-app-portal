import React from "react";
import {
  Card,
  Group,
  Text,
  Stack,
  Badge,
  Skeleton,
  Table,
  ActionIcon,
  Tooltip,
  Button,
  Divider,
  Alert,
} from "@mantine/core";
import {
  IconDownload,
  IconEye,
  IconRefresh,
  IconCreditCard,
  IconReceipt,
  IconArrowRight,
  IconInfoCircle,
} from "@tabler/icons-react";
import { Trans, msg } from "@lingui/macro";
import { useLingui } from "@lingui/react";
import { InvoiceStatusIndicator } from "@/shared/ui/billing";
import {
  LocaleCurrencyUtils,
  LocaleDateUtils,
  useBillingNotifications,
} from "@/shared/lib/i18n";
import type { Invoice, Subscription } from "@/shared/types/billing";
import { InvoiceStatus } from "@/shared/types/billing";

export interface RecentBillingActivityProps {
  invoices: Invoice[];
  subscription: Subscription | null;
  loading?: boolean;
}

const STATUS_COLORS: Record<InvoiceStatus, string> = {
  draft: "gray",
  open: "blue",
  paid: "green",
  void: "red",
  uncollectible: "red",
};

export const RecentBillingActivity: React.FC<RecentBillingActivityProps> = ({
  invoices,
  subscription,
  loading = false,
}) => {
  const { _ } = useLingui();
  const billingNotifications = useBillingNotifications();
  if (loading) {
    return (
      <Card withBorder>
        <Stack gap="md">
          <Group justify="space-between">
            <Skeleton height={24} width={200} />
            <Skeleton height={32} width={120} />
          </Group>
          <Divider />
          <Stack gap="sm">
            {[1, 2, 3].map((i) => (
              <Group key={i} justify="space-between">
                <Group gap="md">
                  <Skeleton height={20} width={100} />
                  <Skeleton height={20} width={80} />
                  <Skeleton height={20} width={60} />
                </Group>
                <Group gap="xs">
                  <Skeleton height={28} width={60} />
                  <Skeleton height={28} width={28} />
                </Group>
              </Group>
            ))}
          </Stack>
        </Stack>
      </Card>
    );
  }

  const overdueInvoices = invoices.filter(
    (invoice) =>
      invoice.status === "open" && new Date(invoice.dueDate) < new Date()
  );

  const handleDownloadInvoice = (invoiceId: string) => {
    // TODO: Implement invoice download
    console.log("Download invoice:", invoiceId);
    billingNotifications.invoiceDownloaded();
  };

  const handleViewInvoice = (invoiceId: string) => {
    // Navigate to invoice detail
    window.location.href = `/billing/invoices/${invoiceId}`;
  };

  const handleRetryPayment = (invoiceId: string) => {
    // TODO: Implement payment retry
    console.log("Retry payment for invoice:", invoiceId);
    // billingNotifications.paymentSuccess() or billingNotifications.paymentFailed() based on result
  };

  return (
    <Card withBorder>
      <Stack gap="md">
        {/* Header */}
        <Group justify="space-between" align="center">
          <div>
            <Text size="lg" fw={600}>
              <Trans>Recent Billing Activity</Trans>
            </Text>
            <Text c="dimmed" size="sm">
              <Trans>Latest invoices and payment history</Trans>
            </Text>
          </div>

          <Button
            variant="light"
            size="sm"
            rightSection={<IconArrowRight size={16} />}
            onClick={() => {
              window.location.href = "/billing/invoices";
            }}
          >
            <Trans>View All Invoices</Trans>
          </Button>
        </Group>

        {/* Overdue Invoices Alert */}
        {overdueInvoices.length > 0 && (
          <Alert
            color="red"
            icon={<IconCreditCard size={16} />}
            title={_(msg`Overdue Invoices`)}
          >
            <Text size="sm" mb="xs">
              <Trans>
                You have {overdueInvoices.length} overdue{" "}
                {overdueInvoices.length > 1 ? "invoices" : "invoice"} requiring
                immediate attention.
              </Trans>
            </Text>
            <Group gap="xs">
              {overdueInvoices.slice(0, 2).map((invoice) => (
                <Badge key={invoice.id} color="red" variant="light" size="sm">
                  {invoice.number} -{" "}
                  {LocaleCurrencyUtils.format(invoice.amount, invoice.currency)}
                </Badge>
              ))}
              {overdueInvoices.length > 2 && (
                <Badge color="red" variant="outline" size="sm">
                  +{overdueInvoices.length - 2} more
                </Badge>
              )}
            </Group>
          </Alert>
        )}

        <Divider />

        {/* Invoices List */}
        {invoices.length === 0 ? (
          <Stack align="center" justify="center" py="xl">
            <IconReceipt size={48} color="var(--mantine-color-gray-5)" />
            <Text c="dimmed" size="lg">
              <Trans>No billing activity yet</Trans>
            </Text>
            <Text c="dimmed" size="sm">
              <Trans>Invoices and payment history will appear here</Trans>
            </Text>
          </Stack>
        ) : (
          <Table>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>
                  <Trans>Invoice</Trans>
                </Table.Th>
                <Table.Th>
                  <Trans>Date</Trans>
                </Table.Th>
                <Table.Th>
                  <Trans>Amount</Trans>
                </Table.Th>
                <Table.Th>
                  <Trans>Status</Trans>
                </Table.Th>
                <Table.Th>
                  <Trans>Actions</Trans>
                </Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {invoices.map((invoice) => {
                const isOverdue =
                  invoice.status === "open" &&
                  new Date(invoice.dueDate) < new Date();

                return (
                  <Table.Tr key={invoice.id}>
                    <Table.Td>
                      <div>
                        <Text size="sm" fw={500}>
                          {invoice.number}
                        </Text>
                        <Text size="xs" c="dimmed">
                          <Trans>Due:</Trans>{" "}
                          {LocaleDateUtils.formatDate(
                            new Date(invoice.dueDate)
                          )}
                        </Text>
                      </div>
                    </Table.Td>

                    <Table.Td>
                      <Text size="sm">
                        {LocaleDateUtils.formatDate(
                          new Date(invoice.createdAt)
                        )}
                      </Text>
                    </Table.Td>

                    <Table.Td>
                      <Text size="sm" fw={500}>
                        {LocaleCurrencyUtils.format(
                          invoice.amount,
                          invoice.currency
                        )}
                      </Text>
                    </Table.Td>

                    <Table.Td>
                      <Group gap="xs">
                        <InvoiceStatusIndicator invoice={invoice} />
                        {isOverdue && (
                          <Badge color="red" size="xs" variant="dot">
                            <Trans>Overdue</Trans>
                          </Badge>
                        )}
                      </Group>
                    </Table.Td>

                    <Table.Td>
                      <Group gap="xs">
                        <Tooltip label={_(msg`View invoice details`)}>
                          <ActionIcon
                            variant="light"
                            size="sm"
                            onClick={() => handleViewInvoice(invoice.id)}
                          >
                            <IconEye size={16} />
                          </ActionIcon>
                        </Tooltip>

                        {invoice.status === "paid" && (
                          <Tooltip label={_(msg`Download PDF`)}>
                            <ActionIcon
                              variant="light"
                              size="sm"
                              onClick={() => handleDownloadInvoice(invoice.id)}
                            >
                              <IconDownload size={16} />
                            </ActionIcon>
                          </Tooltip>
                        )}

                        {(invoice.status === "open" || isOverdue) && (
                          <Tooltip label={_(msg`Retry payment`)}>
                            <ActionIcon
                              variant="light"
                              color="blue"
                              size="sm"
                              onClick={() => handleRetryPayment(invoice.id)}
                            >
                              <IconRefresh size={16} />
                            </ActionIcon>
                          </Tooltip>
                        )}
                      </Group>
                    </Table.Td>
                  </Table.Tr>
                );
              })}
            </Table.Tbody>
          </Table>
        )}

        {/* Summary */}
        {invoices.length > 0 && (
          <>
            <Divider />
            <Group justify="space-between">
              <Text size="sm" c="dimmed">
                <Trans>
                  Showing {invoices.length} recent{" "}
                  {invoices.length > 1 ? "invoices" : "invoice"}
                </Trans>
              </Text>

              {subscription && (
                <Group gap="md">
                  <Group gap="xs">
                    <IconInfoCircle size={14} />
                    <Text size="xs" c="dimmed">
                      <Trans>Next billing:</Trans>{" "}
                      {LocaleDateUtils.formatDate(
                        subscription.currentPeriodEnd
                      )}
                    </Text>
                  </Group>
                </Group>
              )}
            </Group>
          </>
        )}
      </Stack>
    </Card>
  );
};
