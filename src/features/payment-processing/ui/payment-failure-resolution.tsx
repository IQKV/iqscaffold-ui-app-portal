/**
 * Payment Failure Resolution Component
 * Handles retry and update options for failed payments
 */

import React, { useState } from "react";
import {
  Card,
  Text,
  Button,
  Group,
  Stack,
  Alert,
  Badge,
  ActionIcon,
  Menu,
  Box,
  Modal,
  Select,
} from "@mantine/core";
import {
  IconAlertTriangle,
  IconRefresh,
  IconEdit,
  IconDots,
  IconClock,
  IconCreditCard,
} from "@tabler/icons-react";

interface FailedPayment {
  id: string;
  invoiceId: string;
  amount: number;
  paymentMethodId: string;
  failureReason: string;
  canRetry: boolean;
  nextRetryDate?: Date;
  attemptsRemaining: number;
}

interface PaymentFailureResolutionProps {
  failedPayments: FailedPayment[];
  onRetryPayment: (failedPaymentId: string) => void;
  onUpdatePaymentMethod: (paymentMethodId: string, updates: any) => void;
  loading?: boolean;
}

export const PaymentFailureResolution: React.FC<PaymentFailureResolutionProps> = ({
  failedPayments,
  onRetryPayment,
  onUpdatePaymentMethod,
  loading = false,
}) => {
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<FailedPayment | null>(null);
  const [newPaymentMethodId, setNewPaymentMethodId] = useState<string>("");

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

  const getFailureReasonColor = (reason: string) => {
    const lowerReason = reason.toLowerCase();
    if (lowerReason.includes("insufficient") || lowerReason.includes("declined")) {
      return "red";
    }
    if (lowerReason.includes("expired") || lowerReason.includes("invalid")) {
      return "orange";
    }
    return "yellow";
  };

  const getResolutionSuggestion = (reason: string) => {
    const lowerReason = reason.toLowerCase();
    if (lowerReason.includes("insufficient")) {
      return "Please ensure sufficient funds are available and try again.";
    }
    if (lowerReason.includes("expired")) {
      return "Please update your payment method with a valid expiry date.";
    }
    if (lowerReason.includes("declined")) {
      return "Contact your bank or try a different payment method.";
    }
    if (lowerReason.includes("invalid")) {
      return "Please check your payment information and update if necessary.";
    }
    return "Please try again or contact support if the issue persists.";
  };

  const handleUpdatePaymentMethod = (payment: FailedPayment) => {
    setSelectedPayment(payment);
    setShowUpdateModal(true);
  };

  const handleConfirmUpdate = () => {
    if (selectedPayment && newPaymentMethodId) {
      onUpdatePaymentMethod(selectedPayment.paymentMethodId, {
        // This would contain the updated payment method data
        newPaymentMethodId,
      });
      setShowUpdateModal(false);
      setSelectedPayment(null);
      setNewPaymentMethodId("");
    }
  };

  if (failedPayments.length === 0) {
    return null;
  }

  return (
    <>
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
                Payment Issues Detected
              </Text>
              <Text size="sm" mt="xs">
                {failedPayments.length} payment{failedPayments.length !== 1 ? "s" : ""} failed and require{failedPayments.length === 1 ? "s" : ""} attention.
              </Text>
            </Box>
            <Badge color="red" variant="filled" size="sm">
              {failedPayments.length} Failed
            </Badge>
          </Group>

          <Stack gap="sm">
            {failedPayments.map((payment) => (
              <Card key={payment.id} withBorder p="md" radius="sm" bg="white">
                <Group justify="space-between" align="flex-start">
                  <Box style={{ flex: 1 }}>
                    <Group gap="sm" align="center" mb="xs">
                      <Text size="sm" fw={500}>
                        Invoice #{payment.invoiceId}
                      </Text>
                      <Badge
                        variant="light"
                        color={getFailureReasonColor(payment.failureReason)}
                        size="xs"
                      >
                        {payment.failureReason}
                      </Badge>
                    </Group>

                    <Group gap="md" mb="xs">
                      <Text size="sm">
                        Amount: <Text component="span" fw={500}>{formatCurrency(payment.amount)}</Text>
                      </Text>
                      <Text size="sm">
                        Attempts remaining: <Text component="span" fw={500}>{payment.attemptsRemaining}</Text>
                      </Text>
                    </Group>

                    <Text size="xs" c="dimmed" mb="sm">
                      {getResolutionSuggestion(payment.failureReason)}
                    </Text>

                    {payment.nextRetryDate && (
                      <Group gap="xs" align="center">
                        <IconClock size={12} />
                        <Text size="xs" c="dimmed">
                          Next automatic retry: {formatDate(payment.nextRetryDate)}
                        </Text>
                      </Group>
                    )}
                  </Box>

                  <Group gap="xs">
                    {payment.canRetry && (
                      <Button
                        variant="light"
                        color="blue"
                        size="xs"
                        leftSection={<IconRefresh size={12} />}
                        onClick={() => onRetryPayment(payment.id)}
                        loading={loading}
                      >
                        Retry Now
                      </Button>
                    )}

                    <Menu shadow="md" width={200}>
                      <Menu.Target>
                        <ActionIcon variant="light" size="sm">
                          <IconDots size={16} />
                        </ActionIcon>
                      </Menu.Target>

                      <Menu.Dropdown>
                        <Menu.Item
                          leftSection={<IconEdit size={14} />}
                          onClick={() => handleUpdatePaymentMethod(payment)}
                        >
                          Update Payment Method
                        </Menu.Item>
                        {payment.canRetry && (
                          <Menu.Item
                            leftSection={<IconRefresh size={14} />}
                            onClick={() => onRetryPayment(payment.id)}
                          >
                            Retry Payment
                          </Menu.Item>
                        )}
                        <Menu.Item
                          leftSection={<IconCreditCard size={14} />}
                          onClick={() => {
                            // Navigate to add new payment method
                            console.log("Add new payment method");
                          }}
                        >
                          Add New Payment Method
                        </Menu.Item>
                      </Menu.Dropdown>
                    </Menu>
                  </Group>
                </Group>
              </Card>
            ))}
          </Stack>

          <Group gap="sm">
            <Button
              variant="filled"
              color="blue"
              size="sm"
              onClick={() => {
                // Retry all failed payments
                failedPayments.forEach(payment => {
                  if (payment.canRetry) {
                    onRetryPayment(payment.id);
                  }
                });
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
                // Navigate to payment methods page
                window.location.href = "/billing/payment-methods";
              }}
              leftSection={<IconCreditCard size={14} />}
            >
              Manage Payment Methods
            </Button>
          </Group>
        </Stack>
      </Alert>

      {/* Update Payment Method Modal */}
      <Modal
        opened={showUpdateModal}
        onClose={() => setShowUpdateModal(false)}
        title="Update Payment Method"
        size="md"
      >
        {selectedPayment && (
          <Stack gap="md">
            <Box>
              <Text size="sm" mb="xs">
                Failed payment for Invoice #{selectedPayment.invoiceId}
              </Text>
              <Text size="sm" c="dimmed">
                Reason: {selectedPayment.failureReason}
              </Text>
            </Box>

            <Select
              label="Select New Payment Method"
              placeholder="Choose a payment method"
              data={[
                { value: "pm_1", label: "Visa •••• 4242" },
                { value: "pm_2", label: "Mastercard •••• 5555" },
                { value: "add_new", label: "Add New Payment Method" },
              ]}
              value={newPaymentMethodId}
              onChange={(value) => setNewPaymentMethodId(value || "")}
            />

            <Group justify="flex-end" gap="sm">
              <Button
                variant="light"
                onClick={() => setShowUpdateModal(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={handleConfirmUpdate}
                disabled={!newPaymentMethodId}
                loading={loading}
              >
                Update & Retry
              </Button>
            </Group>
          </Stack>
        )}
      </Modal>
    </>
  );
};