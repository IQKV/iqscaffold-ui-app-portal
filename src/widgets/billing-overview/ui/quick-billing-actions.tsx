import React from "react";
import {
  Card,
  Group,
  Text,
  Stack,
  Button,
  Skeleton,
  Badge,
  Divider,
  Alert,
  ActionIcon,
  Tooltip,
} from "@mantine/core";
import {
  IconCreditCard,
  IconTrendingUp,
  IconDownload,
  IconSettings,
  IconPlus,
  IconExclamationCircle,
  IconCheck,
  IconArrowRight,
} from "@tabler/icons-react";
import type { Subscription, PaymentMethod } from "@/shared/types/billing";

export interface QuickBillingActionsProps {
  subscription: Subscription | null;
  paymentMethods: PaymentMethod[];
  loading?: boolean;
}

export const QuickBillingActions: React.FC<QuickBillingActionsProps> = ({
  subscription,
  paymentMethods,
  loading = false,
}) => {
  if (loading) {
    return (
      <Card withBorder h={300}>
        <Stack gap="md">
          <Skeleton height={24} width={150} />
          <Stack gap="sm">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} height={36} />
            ))}
          </Stack>
        </Stack>
      </Card>
    );
  }

  const hasPaymentMethods = paymentMethods.length > 0;
  const defaultPaymentMethod = paymentMethods.find((pm) => pm.isDefault);
  const hasActiveSubscription =
    subscription &&
    (subscription.status === "active" || subscription.status === "trialing");
  const needsPaymentUpdate =
    subscription?.status === "past_due" || subscription?.status === "unpaid";

  const handleUpgradePlan = () => {
    window.location.href = "/billing/subscription";
  };

  const handleAddPaymentMethod = () => {
    window.location.href = "/billing/payment-methods";
  };

  const handleManagePaymentMethods = () => {
    window.location.href = "/billing/payment-methods";
  };

  const handleDownloadInvoices = () => {
    window.location.href = "/billing/invoices";
  };

  const handleBillingSettings = () => {
    window.location.href = "/billing/settings";
  };

  return (
    <Card withBorder>
      <Stack gap="md">
        {/* Header */}
        <Group justify="space-between" align="center">
          <Text size="lg" fw={600}>
            Quick Actions
          </Text>
          <Tooltip label="Billing settings">
            <ActionIcon
              variant="light"
              size="sm"
              onClick={handleBillingSettings}
            >
              <IconSettings size={16} />
            </ActionIcon>
          </Tooltip>
        </Group>

        {/* Payment Method Status */}
        {needsPaymentUpdate && (
          <Alert
            color="red"
            icon={<IconExclamationCircle size={16} />}
            title="Payment Issue"
          >
            <Text size="sm" mb="xs">
              Your payment method needs attention to avoid service interruption.
            </Text>
            <Button
              size="xs"
              color="red"
              variant="light"
              onClick={handleManagePaymentMethods}
            >
              Update Payment Method
            </Button>
          </Alert>
        )}

        {!hasPaymentMethods && !needsPaymentUpdate && (
          <Alert
            color="orange"
            icon={<IconCreditCard size={16} />}
            title="No Payment Method"
          >
            <Text size="sm" mb="xs">
              Add a payment method to enable automatic billing.
            </Text>
            <Button
              size="xs"
              color="orange"
              variant="light"
              onClick={handleAddPaymentMethod}
            >
              Add Payment Method
            </Button>
          </Alert>
        )}

        {/* Payment Method Info */}
        {hasPaymentMethods && defaultPaymentMethod && !needsPaymentUpdate && (
          <Group
            justify="space-between"
            p="sm"
            style={{
              backgroundColor: "var(--mantine-color-green-0)",
              borderRadius: "var(--mantine-radius-sm)",
            }}
          >
            <Group gap="xs">
              <IconCheck size={16} color="var(--mantine-color-green-6)" />
              <div>
                <Text size="sm" fw={500}>
                  Payment Method Active
                </Text>
                <Text size="xs" c="dimmed">
                  {defaultPaymentMethod.metadata.brand} ••••{" "}
                  {defaultPaymentMethod.metadata.last4}
                </Text>
              </div>
            </Group>
            <Badge color="green" variant="light" size="sm">
              Default
            </Badge>
          </Group>
        )}

        <Divider />

        {/* Action Buttons */}
        <Stack gap="sm">
          {/* Upgrade Plan */}
          {hasActiveSubscription && (
            <Button
              leftSection={<IconTrendingUp size={16} />}
              variant="filled"
              color="blue"
              onClick={handleUpgradePlan}
              fullWidth
            >
              Upgrade Plan
            </Button>
          )}

          {/* Add Payment Method */}
          <Button
            leftSection={<IconPlus size={16} />}
            variant={hasPaymentMethods ? "light" : "filled"}
            color={hasPaymentMethods ? "gray" : "blue"}
            onClick={handleAddPaymentMethod}
            fullWidth
          >
            {hasPaymentMethods ? "Add Payment Method" : "Add Payment Method"}
          </Button>

          {/* Manage Payment Methods */}
          {hasPaymentMethods && (
            <Button
              leftSection={<IconCreditCard size={16} />}
              variant="light"
              onClick={handleManagePaymentMethods}
              fullWidth
            >
              Manage Payment Methods
            </Button>
          )}

          {/* Download Invoices */}
          <Button
            leftSection={<IconDownload size={16} />}
            variant="light"
            onClick={handleDownloadInvoices}
            fullWidth
          >
            Download Invoices
          </Button>
        </Stack>

        <Divider />

        {/* Additional Links */}
        <Stack gap="xs">
          <Group
            justify="space-between"
            style={{ cursor: "pointer" }}
            onClick={() => (window.location.href = "/billing/usage")}
          >
            <Text size="sm" c="dimmed">
              View Usage Analytics
            </Text>
            <IconArrowRight size={14} color="var(--mantine-color-gray-6)" />
          </Group>

          <Group
            justify="space-between"
            style={{ cursor: "pointer" }}
            onClick={() => (window.location.href = "/billing/subscription")}
          >
            <Text size="sm" c="dimmed">
              Subscription Settings
            </Text>
            <IconArrowRight size={14} color="var(--mantine-color-gray-6)" />
          </Group>

          <Group
            justify="space-between"
            style={{ cursor: "pointer" }}
            onClick={() => (window.location.href = "/support")}
          >
            <Text size="sm" c="dimmed">
              Contact Support
            </Text>
            <IconArrowRight size={14} color="var(--mantine-color-gray-6)" />
          </Group>
        </Stack>
      </Stack>
    </Card>
  );
};
