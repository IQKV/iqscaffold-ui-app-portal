import React from "react";
import { useAuth } from "@/processes/auth";
import { Alert, Button, Stack, Text, Title } from "@mantine/core";
import { IconCreditCard, IconLock } from "@tabler/icons-react";

interface BillingAccessGuardProps {
  children: React.ReactNode;
  /** Custom fallback component when access is denied */
  fallback?: React.ReactNode;
  /** Whether to show upgrade suggestion */
  showUpgrade?: boolean;
}

/**
 * Guard component that restricts access to billing features.
 * Requires: BILLING_ACCESS, BILLING_MANAGER, BILLING_ADMIN, or admin access
 */
export const BillingAccessGuard: React.FC<BillingAccessGuardProps> = ({
  children,
  fallback,
  showUpgrade = true,
}) => {
  const { hasBillingAccess, getBillingAuthorityLevel } = useAuth();

  if (hasBillingAccess()) {
    return <>{children}</>;
  }

  if (fallback) {
    return <>{fallback}</>;
  }

  return (
    <Stack align="center" gap="md" p="xl">
      <IconLock size={48} color="var(--mantine-color-gray-5)" />
      <Title order={3} ta="center">
        Billing Access Required
      </Title>
      <Text ta="center" c="dimmed" maw={400}>
        You need billing access to view this page. Contact your administrator to request access to billing features.
      </Text>
      
      {showUpgrade && (
        <Alert
          icon={<IconCreditCard size={16} />}
          title="Required Authority"
          color="blue"
          variant="light"
        >
          <Text size="sm">
            This page requires one of the following authorities:
          </Text>
          <Text size="sm" mt="xs">
            • <strong>BILLING_ACCESS</strong> - Basic billing operations
            <br />
            • <strong>BILLING_MANAGER</strong> - Billing management
            <br />
            • <strong>BILLING_ADMIN</strong> - Full billing administration
          </Text>
          <Text size="sm" mt="xs" c="dimmed">
            Current level: <strong>{getBillingAuthorityLevel()}</strong>
          </Text>
        </Alert>
      )}
      
      <Button
        variant="light"
        onClick={() => window.history.back()}
      >
        Go Back
      </Button>
    </Stack>
  );
};