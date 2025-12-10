/**
 * Payment Methods List Component
 * Displays current payment methods with default indicator and management actions
 */

import React, { useState } from "react";
import {
  Card,
  Text,
  Button,
  Group,
  Stack,
  Badge,
  ActionIcon,
  Menu,
  Alert,
  Modal,
  Skeleton,
  Box,
  ThemeIcon,
} from "@mantine/core";
import {
  IconCreditCard,
  IconDots,
  IconStar,
  IconTrash,
  IconEdit,
  IconInfoCircle,
  IconBrandVisa,
  IconBrandMastercard,
  IconBrandPaypal,
} from "@tabler/icons-react";
import { openConfirmModal } from "@mantine/modals";
import type { PaymentMethod } from "@/entities/payment-method/types/payment-method-types";

interface PaymentMethodsListProps {
  paymentMethods: PaymentMethod[];
  onSetDefault: (paymentMethodId: string) => void;
  onDelete: (paymentMethodId: string) => void;
  loading?: boolean;
  deleting?: boolean;
}

export const PaymentMethodsList: React.FC<PaymentMethodsListProps> = ({
  paymentMethods,
  onSetDefault,
  onDelete,
  loading = false,
  deleting = false,
}) => {
  const [selectedMethodId, setSelectedMethodId] = useState<string | null>(null);

  const getPaymentMethodIcon = (method: PaymentMethod) => {
    if (method.provider === "paypal") {
      return <IconBrandPaypal size={20} color="#0070ba" />;
    }

    if (method.type === "card") {
      const brand = method.metadata.brand?.toLowerCase();
      switch (brand) {
        case "visa":
          return <IconBrandVisa size={20} color="#1a1f71" />;
        case "mastercard":
          return <IconBrandMastercard size={20} color="#eb001b" />;
        default:
          return <IconCreditCard size={20} />;
      }
    }

    return <IconCreditCard size={20} />;
  };

  const formatPaymentMethodDisplay = (method: PaymentMethod) => {
    if (method.provider === "paypal") {
      return "PayPal Account";
    }

    if (method.type === "card" && method.metadata.last4) {
      const brand = method.metadata.brand || "Card";
      return `${brand} •••• ${method.metadata.last4}`;
    }

    return "Payment Method";
  };

  const getExpiryDisplay = (method: PaymentMethod) => {
    if (
      method.type === "card" &&
      method.metadata.expiryMonth &&
      method.metadata.expiryYear
    ) {
      return `${method.metadata.expiryMonth.toString().padStart(2, "0")}/${method.metadata.expiryYear}`;
    }
    return null;
  };

  const isExpiringSoon = (method: PaymentMethod) => {
    if (
      method.type !== "card" ||
      !method.metadata.expiryMonth ||
      !method.metadata.expiryYear
    ) {
      return false;
    }

    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth() + 1;
    const expiryYear = method.metadata.expiryYear;
    const expiryMonth = method.metadata.expiryMonth;

    // Check if expiring within 2 months
    if (expiryYear === currentYear) {
      return expiryMonth - currentMonth <= 2;
    }
    if (expiryYear === currentYear + 1) {
      return expiryMonth + 12 - currentMonth <= 2;
    }

    return false;
  };

  const handleDelete = (method: PaymentMethod) => {
    openConfirmModal({
      title: "Remove Payment Method",
      children: (
        <Stack gap="sm">
          <Text size="sm">
            Are you sure you want to remove this payment method?
          </Text>
          <Box>
            <Text size="sm" fw={500}>
              {formatPaymentMethodDisplay(method)}
            </Text>
            {getExpiryDisplay(method) && (
              <Text size="xs" c="dimmed">
                Expires {getExpiryDisplay(method)}
              </Text>
            )}
          </Box>
          {method.isDefault && (
            <Alert color="orange">
              This is your default payment method. You'll need to set another as
              default.
            </Alert>
          )}
        </Stack>
      ),
      labels: { confirm: "Remove", cancel: "Cancel" },
      confirmProps: { color: "red" },
      onConfirm: () => onDelete(method.id),
    });
  };

  if (loading) {
    return (
      <Card withBorder radius="md" p="lg">
        <Stack gap="md">
          <Skeleton height={24} width="60%" />
          <Stack gap="sm">
            <Skeleton height={60} />
            <Skeleton height={60} />
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
            Payment Methods
          </Text>
          <Badge variant="light" color="blue" size="sm">
            {paymentMethods.length} method
            {paymentMethods.length !== 1 ? "s" : ""}
          </Badge>
        </Group>

        {paymentMethods.length === 0 ? (
          <Alert
            icon={<IconInfoCircle size={16} />}
            color="blue"
            variant="light"
          >
            <Text size="sm">
              No payment methods found. Add a payment method to enable automatic
              billing.
            </Text>
          </Alert>
        ) : (
          <Stack gap="sm">
            {paymentMethods.map((method) => {
              const expiry = getExpiryDisplay(method);
              const expiringSoon = isExpiringSoon(method);

              return (
                <Card key={method.id} withBorder p="md" radius="sm">
                  <Group justify="space-between" align="flex-start">
                    <Group gap="md" align="center">
                      <ThemeIcon variant="light" size="lg" color="blue">
                        {getPaymentMethodIcon(method)}
                      </ThemeIcon>

                      <Box>
                        <Group gap="xs" align="center">
                          <Text size="sm" fw={500}>
                            {formatPaymentMethodDisplay(method)}
                          </Text>
                          {method.isDefault && (
                            <Badge variant="filled" color="blue" size="xs">
                              Default
                            </Badge>
                          )}
                          {expiringSoon && (
                            <Badge variant="light" color="orange" size="xs">
                              Expiring Soon
                            </Badge>
                          )}
                        </Group>

                        <Group gap="md" mt="xs">
                          {expiry && (
                            <Text size="xs" c="dimmed">
                              Expires {expiry}
                            </Text>
                          )}
                          {method.metadata.country && (
                            <Text size="xs" c="dimmed">
                              {method.metadata.country}
                            </Text>
                          )}
                          <Text size="xs" c="dimmed">
                            Added{" "}
                            {new Date(method.createdAt).toLocaleDateString()}
                          </Text>
                        </Group>
                      </Box>
                    </Group>

                    <Group gap="xs">
                      {!method.isDefault && (
                        <Button
                          variant="light"
                          size="xs"
                          leftSection={<IconStar size={12} />}
                          onClick={() => onSetDefault(method.id)}
                        >
                          Set Default
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
                            onClick={() => {
                              // In a real app, this would open an edit modal
                              console.log("Edit payment method:", method.id);
                            }}
                          >
                            Edit
                          </Menu.Item>
                          {!method.isDefault && (
                            <Menu.Item
                              leftSection={<IconStar size={14} />}
                              onClick={() => onSetDefault(method.id)}
                            >
                              Set as Default
                            </Menu.Item>
                          )}
                          <Menu.Divider />
                          <Menu.Item
                            leftSection={<IconTrash size={14} />}
                            color="red"
                            onClick={() => handleDelete(method)}
                            disabled={paymentMethods.length === 1}
                          >
                            Remove
                          </Menu.Item>
                        </Menu.Dropdown>
                      </Menu>
                    </Group>
                  </Group>
                </Card>
              );
            })}
          </Stack>
        )}

        {paymentMethods.some((method) => isExpiringSoon(method)) && (
          <Alert
            icon={<IconInfoCircle size={16} />}
            color="orange"
            variant="light"
          >
            <Text size="sm">
              One or more of your payment methods is expiring soon. Update your
              payment information to avoid service interruption.
            </Text>
          </Alert>
        )}
      </Stack>
    </Card>
  );
};
