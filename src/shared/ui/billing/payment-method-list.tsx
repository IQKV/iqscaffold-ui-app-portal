import React from "react";
import {
  Box,
  Card,
  Group,
  Stack,
  Text,
  Badge,
  Button,
  ActionIcon,
  Menu,
  Alert,
  LoadingOverlay,
} from "@mantine/core";
import {
  IconCreditCard,
  IconBrandPaypal,
  IconDots,
  IconEdit,
  IconTrash,
  IconStar,
  IconStarFilled,
  IconAlertTriangle,
} from "@tabler/icons-react";
import type {
  PaymentMethod,
  PaymentMethodMetrics,
} from "@/entities/payment-method/types/payment-method-types";
import { PaymentMethodService } from "@/entities/payment-method/services/payment-method-service";

interface PaymentMethodListProps {
  paymentMethods: PaymentMethod[];
  metrics?: PaymentMethodMetrics;
  loading?: boolean;
  onEdit?: (paymentMethod: PaymentMethod) => void;
  onDelete?: (paymentMethod: PaymentMethod) => void;
  onSetDefault?: (paymentMethod: PaymentMethod) => void;
  showMetrics?: boolean;
}

export const PaymentMethodList: React.FC<PaymentMethodListProps> = ({
  paymentMethods,
  metrics,
  loading = false,
  onEdit,
  onDelete,
  onSetDefault,
  showMetrics = true,
}) => {
  const getProviderIcon = (provider: string) => {
    switch (provider) {
      case "stripe":
        return <IconCreditCard size={20} />;
      case "paypal":
        return <IconBrandPaypal size={20} />;
      default:
        return <IconCreditCard size={20} />;
    }
  };

  const getProviderColor = (provider: string) => {
    switch (provider) {
      case "stripe":
        return "blue";
      case "paypal":
        return "yellow";
      default:
        return "gray";
    }
  };

  const isCardExpiring = (paymentMethod: PaymentMethod): boolean => {
    if (
      paymentMethod.type !== "card" ||
      !paymentMethod.metadata.expiryYear ||
      !paymentMethod.metadata.expiryMonth
    ) {
      return false;
    }

    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth() + 1;
    const expiryDate = new Date(
      paymentMethod.metadata.expiryYear,
      paymentMethod.metadata.expiryMonth - 1
    );
    const threeMonthsFromNow = new Date();
    threeMonthsFromNow.setMonth(threeMonthsFromNow.getMonth() + 3);

    return expiryDate <= threeMonthsFromNow;
  };

  const canDelete = (paymentMethod: PaymentMethod): boolean => {
    return PaymentMethodService.canDelete(paymentMethod, paymentMethods);
  };

  if (loading) {
    return (
      <Box pos="relative" h={200}>
        <LoadingOverlay visible />
      </Box>
    );
  }

  if (paymentMethods.length === 0) {
    return (
      <Card withBorder>
        <Stack align="center" gap="md" py="xl">
          <IconCreditCard size={48} color="gray" />
          <Text c="dimmed" ta="center">
            No payment methods added yet
          </Text>
        </Stack>
      </Card>
    );
  }

  return (
    <Stack gap="md">
      {/* Metrics */}
      {showMetrics && metrics && (
        <Card withBorder>
          <Group justify="space-between">
            <div>
              <Text size="sm" c="dimmed">
                Total Payment Methods
              </Text>
              <Text fw={500}>{metrics.totalMethods}</Text>
            </div>
            <div>
              <Text size="sm" c="dimmed">
                Default Method
              </Text>
              <Text fw={500}>
                {metrics.defaultMethodType
                  ? metrics.defaultMethodType.charAt(0).toUpperCase() +
                    metrics.defaultMethodType.slice(1)
                  : "None"}
              </Text>
            </div>
            <div>
              <Text size="sm" c="dimmed">
                Expiring Soon
              </Text>
              <Text
                fw={500}
                c={metrics.expiringMethods.length > 0 ? "orange" : "green"}
              >
                {metrics.expiringMethods.length}
              </Text>
            </div>
          </Group>
        </Card>
      )}

      {/* Expiring Methods Alert */}
      {metrics?.expiringMethods && metrics.expiringMethods.length > 0 && (
        <Alert
          icon={<IconAlertTriangle size={16} />}
          color="orange"
          title="Payment Methods Expiring Soon"
        >
          <Text size="sm">
            {metrics.expiringMethods.length} payment method(s) will expire
            within the next 3 months. Please update them to avoid payment
            interruptions.
          </Text>
        </Alert>
      )}

      {/* Payment Methods */}
      <Stack gap="sm">
        {paymentMethods.map((paymentMethod) => (
          <Card key={paymentMethod.id} withBorder>
            <Group justify="space-between" align="flex-start">
              <Group align="flex-start">
                {getProviderIcon(paymentMethod.provider)}
                <div>
                  <Group gap="xs" align="center">
                    <Text fw={500}>
                      {PaymentMethodService.getCardDisplayName(paymentMethod)}
                    </Text>
                    {paymentMethod.isDefault && (
                      <IconStarFilled size={16} color="gold" />
                    )}
                    {isCardExpiring(paymentMethod) && (
                      <Badge color="orange" size="sm">
                        Expiring Soon
                      </Badge>
                    )}
                  </Group>

                  <Group gap="xs" mt="xs">
                    <Badge
                      color={getProviderColor(paymentMethod.provider)}
                      variant="light"
                      size="sm"
                    >
                      {paymentMethod.provider.charAt(0).toUpperCase() +
                        paymentMethod.provider.slice(1)}
                    </Badge>

                    {paymentMethod.type === "card" &&
                      paymentMethod.metadata.expiryMonth &&
                      paymentMethod.metadata.expiryYear && (
                        <Text size="sm" c="dimmed">
                          Expires{" "}
                          {paymentMethod.metadata.expiryMonth
                            .toString()
                            .padStart(2, "0")}
                          /
                          {paymentMethod.metadata.expiryYear
                            .toString()
                            .slice(-2)}
                        </Text>
                      )}
                  </Group>

                  {paymentMethod.metadata.country && (
                    <Text size="xs" c="dimmed" mt="xs">
                      {paymentMethod.metadata.country}
                    </Text>
                  )}
                </div>
              </Group>

              <Group gap="xs">
                {!paymentMethod.isDefault && onSetDefault && (
                  <ActionIcon
                    variant="subtle"
                    color="yellow"
                    onClick={() => onSetDefault(paymentMethod)}
                    title="Set as default"
                  >
                    <IconStar size={16} />
                  </ActionIcon>
                )}

                <Menu shadow="md" width={200}>
                  <Menu.Target>
                    <ActionIcon variant="subtle" color="gray">
                      <IconDots size={16} />
                    </ActionIcon>
                  </Menu.Target>

                  <Menu.Dropdown>
                    {onEdit && (
                      <Menu.Item
                        leftSection={<IconEdit size={14} />}
                        onClick={() => onEdit(paymentMethod)}
                      >
                        Edit
                      </Menu.Item>
                    )}

                    {!paymentMethod.isDefault && onSetDefault && (
                      <Menu.Item
                        leftSection={<IconStar size={14} />}
                        onClick={() => onSetDefault(paymentMethod)}
                      >
                        Set as Default
                      </Menu.Item>
                    )}

                    {onDelete && canDelete(paymentMethod) && (
                      <Menu.Item
                        leftSection={<IconTrash size={14} />}
                        color="red"
                        onClick={() => onDelete(paymentMethod)}
                      >
                        Delete
                      </Menu.Item>
                    )}

                    {onDelete && !canDelete(paymentMethod) && (
                      <Menu.Item
                        leftSection={<IconTrash size={14} />}
                        color="gray"
                        disabled
                        title="Cannot delete the only payment method"
                      >
                        Delete
                      </Menu.Item>
                    )}
                  </Menu.Dropdown>
                </Menu>
              </Group>
            </Group>
          </Card>
        ))}
      </Stack>
    </Stack>
  );
};

export default PaymentMethodList;
