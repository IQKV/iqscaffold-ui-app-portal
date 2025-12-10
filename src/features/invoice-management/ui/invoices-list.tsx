/**
 * Invoices List Component
 * Paginated invoice history with filtering and bulk actions
 */

import React, { useState } from "react";
import {
  Card,
  Text,
  Group,
  Stack,
  Badge,
  Table,
  Select,
  TextInput,
  Pagination,
  Checkbox,
  ActionIcon,
  Menu,
  Button,
  Modal,
  Box,
  Skeleton,
  Alert,
} from "@mantine/core";
import {
  IconSearch,
  IconDots,
  IconDownload,
  IconRefresh,
  IconEye,
  IconInfoCircle,
  IconFilter,
} from "@tabler/icons-react";
import type { Invoice } from "@/entities/invoice/types/invoice-types";

interface InvoicesListProps {
  invoices: Invoice[];
  selectedInvoices: string[];
  onSelectionChange: (selected: string[]) => void;
  onDownload: (invoiceId: string) => void;
  onRetryPayment: (invoiceId: string) => void;
  loading?: boolean;
  downloading?: boolean;
  retrying?: boolean;
}

export const InvoicesList: React.FC<InvoicesListProps> = ({
  invoices,
  selectedInvoices,
  onSelectionChange,
  onDownload,
  onRetryPayment,
  loading = false,
  downloading = false,
  retrying = false,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const itemsPerPage = 10;

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

  const getStatusColor = (status: string) => {
    switch (status) {
      case "paid":
        return "green";
      case "open":
        return "blue";
      case "void":
        return "gray";
      case "uncollectible":
        return "red";
      default:
        return "gray";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "paid":
        return "Paid";
      case "open":
        return "Open";
      case "void":
        return "Void";
      case "uncollectible":
        return "Uncollectible";
      default:
        return status;
    }
  };

  const isOverdue = (invoice: Invoice) => {
    return invoice.status === "open" && new Date(invoice.dueDate) < new Date();
  };

  // Filter and search logic
  const filteredInvoices = invoices.filter((invoice) => {
    const matchesSearch =
      invoice.number.toLowerCase().includes(searchQuery.toLowerCase()) ||
      invoice.id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = !statusFilter || invoice.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Pagination
  const totalPages = Math.ceil(filteredInvoices.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedInvoices = filteredInvoices.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      onSelectionChange(paginatedInvoices.map((invoice) => invoice.id));
    } else {
      onSelectionChange([]);
    }
  };

  const handleSelectInvoice = (invoiceId: string, checked: boolean) => {
    if (checked) {
      onSelectionChange([...selectedInvoices, invoiceId]);
    } else {
      onSelectionChange(selectedInvoices.filter((id) => id !== invoiceId));
    }
  };

  const handleViewInvoice = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    setShowInvoiceModal(true);
  };

  const allSelected =
    paginatedInvoices.length > 0 &&
    paginatedInvoices.every((invoice) => selectedInvoices.includes(invoice.id));
  const someSelected = paginatedInvoices.some((invoice) =>
    selectedInvoices.includes(invoice.id)
  );

  if (loading) {
    return (
      <Card withBorder radius="md" p="lg">
        <Stack gap="md">
          <Skeleton height={24} width="60%" />
          <Stack gap="sm">
            {Array.from({ length: 5 }).map((_, index) => (
              <Skeleton key={index} height={60} />
            ))}
          </Stack>
        </Stack>
      </Card>
    );
  }

  return (
    <>
      <Card withBorder radius="md" p="lg">
        <Stack gap="md">
          <Group justify="space-between" align="center">
            <Text size="lg" fw={600}>
              Invoices
            </Text>
            <Badge variant="light" color="blue" size="sm">
              {invoices.length} invoice{invoices.length !== 1 ? "s" : ""}
            </Badge>
          </Group>

          {/* Filters */}
          <Group gap="md">
            <TextInput
              placeholder="Search invoices..."
              leftSection={<IconSearch size={16} />}
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.currentTarget.value)}
              style={{ flex: 1 }}
            />
            <Select
              placeholder="Filter by status"
              leftSection={<IconFilter size={16} />}
              data={[
                { value: "paid", label: "Paid" },
                { value: "open", label: "Open" },
                { value: "void", label: "Void" },
                { value: "uncollectible", label: "Uncollectible" },
              ]}
              value={statusFilter}
              onChange={setStatusFilter}
              clearable
              w={200}
            />
          </Group>

          {/* Table */}
          {paginatedInvoices.length === 0 ? (
            <Alert
              icon={<IconInfoCircle size={16} />}
              color="blue"
              variant="light"
            >
              <Text size="sm">
                {invoices.length === 0
                  ? "No invoices found."
                  : "No invoices match your search criteria."}
              </Text>
            </Alert>
          ) : (
            <Box>
              <Table striped highlightOnHover>
                <Table.Thead>
                  <Table.Tr>
                    <Table.Th>
                      <Checkbox
                        checked={allSelected}
                        indeterminate={someSelected && !allSelected}
                        onChange={(event) =>
                          handleSelectAll(event.currentTarget.checked)
                        }
                      />
                    </Table.Th>
                    <Table.Th>Invoice #</Table.Th>
                    <Table.Th>Date</Table.Th>
                    <Table.Th>Due Date</Table.Th>
                    <Table.Th>Amount</Table.Th>
                    <Table.Th>Status</Table.Th>
                    <Table.Th>Actions</Table.Th>
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {paginatedInvoices.map((invoice) => (
                    <Table.Tr key={invoice.id}>
                      <Table.Td>
                        <Checkbox
                          checked={selectedInvoices.includes(invoice.id)}
                          onChange={(event) =>
                            handleSelectInvoice(
                              invoice.id,
                              event.currentTarget.checked
                            )
                          }
                        />
                      </Table.Td>
                      <Table.Td>
                        <Text size="sm" fw={500}>
                          {invoice.number}
                        </Text>
                      </Table.Td>
                      <Table.Td>
                        <Text size="sm">{formatDate(invoice.createdAt)}</Text>
                      </Table.Td>
                      <Table.Td>
                        <Box>
                          <Text size="sm">{formatDate(invoice.dueDate)}</Text>
                          {isOverdue(invoice) && (
                            <Badge variant="light" color="red" size="xs">
                              Overdue
                            </Badge>
                          )}
                        </Box>
                      </Table.Td>
                      <Table.Td>
                        <Text size="sm" fw={500}>
                          {formatCurrency(invoice.amount, invoice.currency)}
                        </Text>
                      </Table.Td>
                      <Table.Td>
                        <Badge
                          variant="light"
                          color={getStatusColor(invoice.status)}
                          size="sm"
                        >
                          {getStatusLabel(invoice.status)}
                        </Badge>
                      </Table.Td>
                      <Table.Td>
                        <Group gap="xs">
                          <ActionIcon
                            variant="light"
                            size="sm"
                            onClick={() => handleViewInvoice(invoice)}
                          >
                            <IconEye size={14} />
                          </ActionIcon>

                          <Menu shadow="md" width={200}>
                            <Menu.Target>
                              <ActionIcon variant="light" size="sm">
                                <IconDots size={16} />
                              </ActionIcon>
                            </Menu.Target>

                            <Menu.Dropdown>
                              <Menu.Item
                                leftSection={<IconEye size={14} />}
                                onClick={() => handleViewInvoice(invoice)}
                              >
                                View Details
                              </Menu.Item>
                              <Menu.Item
                                leftSection={<IconDownload size={14} />}
                                onClick={() => onDownload(invoice.id)}
                                disabled={downloading}
                              >
                                Download PDF
                              </Menu.Item>
                              {invoice.status === "open" && (
                                <Menu.Item
                                  leftSection={<IconRefresh size={14} />}
                                  onClick={() => onRetryPayment(invoice.id)}
                                  disabled={retrying}
                                >
                                  Retry Payment
                                </Menu.Item>
                              )}
                            </Menu.Dropdown>
                          </Menu>
                        </Group>
                      </Table.Td>
                    </Table.Tr>
                  ))}
                </Table.Tbody>
              </Table>

              {/* Pagination */}
              {totalPages > 1 && (
                <Group justify="center" mt="md">
                  <Pagination
                    value={currentPage}
                    onChange={setCurrentPage}
                    total={totalPages}
                    size="sm"
                  />
                </Group>
              )}
            </Box>
          )}

          {/* Summary */}
          {invoices.length > 0 && (
            <Group
              justify="space-between"
              mt="md"
              pt="md"
              style={{ borderTop: "1px solid var(--mantine-color-gray-3)" }}
            >
              <Text size="sm" c="dimmed">
                Showing {startIndex + 1}-
                {Math.min(startIndex + itemsPerPage, filteredInvoices.length)}{" "}
                of {filteredInvoices.length} invoices
              </Text>
              <Group gap="md">
                <Text size="sm" c="dimmed">
                  Total:{" "}
                  {formatCurrency(
                    invoices.reduce((sum, inv) => sum + inv.amount, 0)
                  )}
                </Text>
                <Text size="sm" c="dimmed">
                  Paid:{" "}
                  {formatCurrency(
                    invoices
                      .filter((inv) => inv.status === "paid")
                      .reduce((sum, inv) => sum + inv.amount, 0)
                  )}
                </Text>
              </Group>
            </Group>
          )}
        </Stack>
      </Card>

      {/* Invoice Detail Modal */}
      <Modal
        opened={showInvoiceModal}
        onClose={() => setShowInvoiceModal(false)}
        title="Invoice Details"
        size="lg"
      >
        {selectedInvoice && (
          <Stack gap="md">
            <Group justify="space-between" align="flex-start">
              <Box>
                <Text size="lg" fw={600}>
                  Invoice {selectedInvoice.number}
                </Text>
                <Text size="sm" c="dimmed">
                  Created {formatDate(selectedInvoice.createdAt)}
                </Text>
              </Box>
              <Badge
                variant="light"
                color={getStatusColor(selectedInvoice.status)}
                size="lg"
              >
                {getStatusLabel(selectedInvoice.status)}
              </Badge>
            </Group>

            <Group justify="space-between">
              <Text size="sm">Due Date:</Text>
              <Text size="sm" fw={500}>
                {formatDate(selectedInvoice.dueDate)}
              </Text>
            </Group>

            <Group justify="space-between">
              <Text size="sm">Amount:</Text>
              <Text size="lg" fw={700} c="blue">
                {formatCurrency(
                  selectedInvoice.amount,
                  selectedInvoice.currency
                )}
              </Text>
            </Group>

            {selectedInvoice.lineItems &&
              selectedInvoice.lineItems.length > 0 && (
                <Box>
                  <Text size="sm" fw={500} mb="xs">
                    Line Items:
                  </Text>
                  <Stack gap="xs">
                    {selectedInvoice.lineItems.map((item, index) => (
                      <Group key={index} justify="space-between">
                        <Text size="sm">{item.description}</Text>
                        <Text size="sm" fw={500}>
                          {formatCurrency(item.amount)}
                        </Text>
                      </Group>
                    ))}
                  </Stack>
                </Box>
              )}

            <Group justify="flex-end" gap="sm" mt="md">
              <Button
                variant="light"
                leftSection={<IconDownload size={14} />}
                onClick={() => onDownload(selectedInvoice.id)}
                loading={downloading}
              >
                Download PDF
              </Button>
              {selectedInvoice.status === "open" && (
                <Button
                  leftSection={<IconRefresh size={14} />}
                  onClick={() => onRetryPayment(selectedInvoice.id)}
                  loading={retrying}
                >
                  Retry Payment
                </Button>
              )}
            </Group>
          </Stack>
        )}
      </Modal>
    </>
  );
};
