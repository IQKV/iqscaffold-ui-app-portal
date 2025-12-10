/**
 * Payment History Table Component
 * Displays transaction history with status and filtering
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
  Skeleton,
  Box,
  ActionIcon,
  Menu,
  Alert,
} from "@mantine/core";
import {
  IconSearch,
  IconDots,
  IconDownload,
  IconRefresh,
  IconInfoCircle,
} from "@tabler/icons-react";

interface PaymentTransaction {
  id: string;
  amount: number;
  status: "succeeded" | "failed" | "pending";
  paymentMethodId: string;
  description: string;
  createdAt: Date;
  failureReason?: string;
}

interface PaymentHistoryTableProps {
  paymentHistory: PaymentTransaction[];
  loading?: boolean;
}

export const PaymentHistoryTable: React.FC<PaymentHistoryTableProps> = ({
  paymentHistory,
  loading = false,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "succeeded":
        return "green";
      case "failed":
        return "red";
      case "pending":
        return "yellow";
      default:
        return "gray";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "succeeded":
        return "Succeeded";
      case "failed":
        return "Failed";
      case "pending":
        return "Pending";
      default:
        return status;
    }
  };

  // Filter and search logic
  const filteredHistory = paymentHistory.filter((transaction) => {
    const matchesSearch = transaction.description
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesStatus = !statusFilter || transaction.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Pagination
  const totalPages = Math.ceil(filteredHistory.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedHistory = filteredHistory.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  const handleDownloadReceipt = (transactionId: string) => {
    // Mock download - in real app this would download the receipt
    console.log("Downloading receipt for transaction:", transactionId);
  };

  const handleRetryPayment = (transactionId: string) => {
    // Mock retry - in real app this would retry the payment
    console.log("Retrying payment for transaction:", transactionId);
  };

  if (loading) {
    return (
      <Card withBorder radius="md" p="lg">
        <Stack gap="md">
          <Skeleton height={24} width="60%" />
          <Stack gap="sm">
            {Array.from({ length: 5 }).map((_, index) => (
              <Skeleton key={index} height={40} />
            ))}
          </Stack>
        </Stack>
      </Card>
    );
  }

  return (
    <Card withBorder radius="md" p="lg">
      <Stack gap="md">
        <Group justify="space-between" align="center">
          <Text size="lg" fw={600}>
            Payment History
          </Text>
          <Badge variant="light" color="blue" size="sm">
            {paymentHistory.length} transaction
            {paymentHistory.length !== 1 ? "s" : ""}
          </Badge>
        </Group>

        {/* Filters */}
        <Group gap="md">
          <TextInput
            placeholder="Search transactions..."
            leftSection={<IconSearch size={16} />}
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.currentTarget.value)}
            style={{ flex: 1 }}
          />
          <Select
            placeholder="Filter by status"
            data={[
              { value: "succeeded", label: "Succeeded" },
              { value: "failed", label: "Failed" },
              { value: "pending", label: "Pending" },
            ]}
            value={statusFilter}
            onChange={setStatusFilter}
            clearable
            w={200}
          />
        </Group>

        {/* Table */}
        {paginatedHistory.length === 0 ? (
          <Alert
            icon={<IconInfoCircle size={16} />}
            color="blue"
            variant="light"
          >
            <Text size="sm">
              {paymentHistory.length === 0
                ? "No payment history found."
                : "No transactions match your search criteria."}
            </Text>
          </Alert>
        ) : (
          <Box>
            <Table striped highlightOnHover>
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>Date</Table.Th>
                  <Table.Th>Description</Table.Th>
                  <Table.Th>Amount</Table.Th>
                  <Table.Th>Status</Table.Th>
                  <Table.Th>Actions</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {paginatedHistory.map((transaction) => (
                  <Table.Tr key={transaction.id}>
                    <Table.Td>
                      <Text size="sm">{formatDate(transaction.createdAt)}</Text>
                    </Table.Td>
                    <Table.Td>
                      <Box>
                        <Text size="sm">{transaction.description}</Text>
                        {transaction.failureReason && (
                          <Text size="xs" c="red">
                            {transaction.failureReason}
                          </Text>
                        )}
                      </Box>
                    </Table.Td>
                    <Table.Td>
                      <Text size="sm" fw={500}>
                        {formatCurrency(transaction.amount)}
                      </Text>
                    </Table.Td>
                    <Table.Td>
                      <Badge
                        variant="light"
                        color={getStatusColor(transaction.status)}
                        size="sm"
                      >
                        {getStatusLabel(transaction.status)}
                      </Badge>
                    </Table.Td>
                    <Table.Td>
                      <Menu shadow="md" width={200}>
                        <Menu.Target>
                          <ActionIcon variant="light" size="sm">
                            <IconDots size={16} />
                          </ActionIcon>
                        </Menu.Target>

                        <Menu.Dropdown>
                          {transaction.status === "succeeded" && (
                            <Menu.Item
                              leftSection={<IconDownload size={14} />}
                              onClick={() =>
                                handleDownloadReceipt(transaction.id)
                              }
                            >
                              Download Receipt
                            </Menu.Item>
                          )}
                          {transaction.status === "failed" && (
                            <Menu.Item
                              leftSection={<IconRefresh size={14} />}
                              onClick={() => handleRetryPayment(transaction.id)}
                            >
                              Retry Payment
                            </Menu.Item>
                          )}
                          <Menu.Item
                            leftSection={<IconInfoCircle size={14} />}
                            onClick={() => {
                              // In real app, this would show transaction details
                              console.log("View details for:", transaction.id);
                            }}
                          >
                            View Details
                          </Menu.Item>
                        </Menu.Dropdown>
                      </Menu>
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
        {paymentHistory.length > 0 && (
          <Group
            justify="space-between"
            mt="md"
            pt="md"
            style={{ borderTop: "1px solid var(--mantine-color-gray-3)" }}
          >
            <Text size="sm" c="dimmed">
              Showing {startIndex + 1}-
              {Math.min(startIndex + itemsPerPage, filteredHistory.length)} of{" "}
              {filteredHistory.length} transactions
            </Text>
            <Group gap="md">
              <Text size="sm" c="dimmed">
                Total:{" "}
                {formatCurrency(
                  paymentHistory.reduce(
                    (sum, t) => sum + (t.status === "succeeded" ? t.amount : 0),
                    0
                  )
                )}
              </Text>
            </Group>
          </Group>
        )}
      </Stack>
    </Card>
  );
};
