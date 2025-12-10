/**
 * Overdue Invoices Alert Component
 * Prominent display of unpaid invoices with quick actions
 */

import React from "react";
import {
  Alert,
  Text,
  Button,
  Group,
  Stack,
  Badge,
  Card,
  Box,
  ActionIcon,
  Menu,
} from "@mantine/core";
import {
  IconAlertTriangle,
  IconRefresh,
  IconDownload,
  IconDots,
  IconCreditCard,
} from "@tabler/icons-react";
import type { Invoice } from "@/entities/invoice/types/invoice-types";

interface OverdueInvoicesAlertProps {
  overdueInvoices: Invoice[];
  onRetryPayment: (invoiceId: string) => void;
  onDownload: (invoiceId: string) => void;
  loading?: boolean;
}

export const OverdueInvoicesAlert: React.FC<OverdueInvoicesAlertProps> = ({
  overdueInvoices,
  onRetryPayment,
  onDownload,
  loading = false,
}) => {
  const formatCurrency = (amount: number, currency: string = "USD") => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
    }).format(amount);
  };

  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getDaysOverdue = (dueDate: Date | string) => {
    const due = new Date(dueDate);
    const now = new Date();
    const diffTime = now.getTime() - due.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const totalOverdueAmount = overdueInvoices.reduce((sum, invoice) => sum + invoice.amount, 0);

  if (overdueInvoices.length === 0) {
    return null;
  }

  return (
    <Alert
      icon={<IconAlertTriangle size={16} />}
      color="red"
      variant="light"
      radius="md"
    >
      <Stack gap="md">
        <Group justify="space-between" align="flex-start">
          <Box>
            <Text size="md" fw={600}>
              Overdue Invoices Require Attention
            </Text>
            <Text size="sm" mt="xs">
              You have {overdueInvoices.length} overdue invoice{overdueInvoices.length !== 1 ? "s" : ""} totaling{" "}
              <Text component="span" fw={600} c="red">
                {formatCurrency(totalOverdueAmount)}
              </Text>
            </Text>
          </Box>
          <Badge color="red" variant="filled" size="sm">
            {overdueInvoices.length} Overdue
          </Badge>
        </Group>

        <Stack gap="sm">
          {overdueInvoices.slice(0, 3).map((invoice) => {
            const daysOverdue = getDaysOverdue(invoice.dueDate);
            
            return (
              <Card key={invoice.id} withBorder p="md" radius="sm" bg="white">
                <Group justify="space-between" align="flex-start">
                  <Box style={{ flex: 1 }}>
                    <Group gap="sm" align="center" mb="xs">
                      <Text size="sm" fw={500}>
                        Invoice {invoice.number}
                      </Text>
                      <Badge
                        variant="light"
                        color="red"
                        size="xs"
                      >
                        {daysOverdue} day{daysOverdue !== 1 ? "s" : ""} overdue
                      </Badge>
                    </Group>

                    <Group gap="md" mb="xs">
                      <Text size="sm">
                        Amount: <Text component="span" fw={500}>{formatCurrency(invoice.amount, invoice.currency)}</Text>
                      </Text>
                      <Text size="sm">
                        Due: <Text component="span" fw={500}>{formatDate(invoice.dueDate)}</Text>
                      </Text>
                    </Group>

                    {invoice.paymentAttempts && invoice.paymentAttempts.length > 0 && (
                      <Text size="xs" c="dimmed">
                        Last payment attempt: {invoice.paymentAttempts[invoice.paymentAttempts.length - 1].failureReason}
                      </Text>
                    )}
                  </Box>

                  <Group gap="xs">
                    <Button
                      variant="light"
                      color="blue"
                      size="xs"
                      leftSection={<IconRefresh size={12} />}
                      onClick={() => onRetryPayment(invoice.id)}
                      loading={loading}
                    >
                      Retry Payment
                    </Button>

                    <Menu shadow="md" width={200}>
                      <Menu.Target>
                        <ActionIcon variant="light" size="sm">
                          <IconDots size={16} />
                        </ActionIcon>
                      </Menu.Target>

                      <Menu.Dropdown>
                        <Menu.Item
                          leftSection={<IconDownload size={14} />}
                          onClick={() => onDownload(invoice.id)}
                        >
                          Download Invoice
                        </Menu.Item>
                        <Menu.Item
                          leftSection={<IconRefresh size={14} />}
                          onClick={() => onRetryPayment(invoice.id)}
                        >
                          Retry Payment
                        </Menu.Item>
                        <Menu.Item
                          leftSection={<IconCreditCard size={14} />}
                          onClick={() => {
                            // Navigate to payment methods
                            window.location.href = "/billing/payment-methods";
                          }}
                        >
                          Update Payment Method
                        </Menu.Item>
                      </Menu.Dropdown>
                    </Menu>
                  </Group>
                </Group>
              </Card>
            );
          })}

          {overdueInvoices.length > 3 && (
            <Text size="sm" c="dimmed" ta="center">
              +{overdueInvoices.length - 3} more overdue invoice{overdueInvoices.length - 3 !== 1 ? "s" : ""}
            </Text>
          )}
        </Stack>

        <Group gap="sm">
          <Button
            variant="filled"
            color="red"
            size="sm"
            onClick={() => {
              // Retry all overdue payments
              overdueInvoices.forEach(invoice => onRetryPayment(invoice.id));
            }}
            loading={loading}
            leftSection={<IconRefresh size={14} />}
          >
            Retry All Payments
          </Button>
          <Button
            variant="light"
            size="sm"
            onClick={() => {
              // Navigate to payment methods
              window.location.href = "/billing/payment-methods";
            }}
            leftSection={<IconCreditCard size={14} />}
          >
            Update Payment Method
          </Button>
          <Button
            variant="light"
            size="sm"
            onClick={() => {
              // Download all overdue invoices
              overdueInvoices.forEach(invoice => onDownload(invoice.id));
            }}
            leftSection={<IconDownload size={14} />}
          >
            Download All
          </Button>
        </Group>
      </Stack>
    </Alert>
  );
};