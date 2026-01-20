import React from "react";
import { useAuth } from "@/processes/auth";
import { Alert, Button, Stack, Text, Title } from "@mantine/core";
import { IconCreditCardPay, IconLock } from "@tabler/icons-react";

interface BillingManagerGuardProps {
  children: React.ReactNode;
  /** Custom fallback component when access is denied */
  fallback?: React.ReactNode;
  /** Whether to show upgrade suggestion */
  showUpgrade?: boolean;
}

/**
 * Guard component that restricts access to billing management features.
 * Requires: BILLING_MANAGER, BILLING_ADMIN, or admin access
 */
export const BillingManagerGuard: React.FC<BillingManagerGuardProps> = ({
  children,
  fallback,
  showUpgrade = true,
}) => {
  const { canModifyBilling, getBillingAuthorityLevel, getUserBillingAuthorities } = useAuth();

  if (canModifyBilling()) {
    return <>{children}</>;
  }

  if (fallback) {
    return <>{fallback}</>;
  }

  return (
    <Stack align="center" gap="md" p="xl">
      <IconLock size={48} color="var(--mantine-color-gray-5)" />
      <Title order={3} ta="center">
        Billing Management Access Required
      </Title>
      <Text ta="center" c="dimmed" maw={400}>
        You need billing management permissions to access this feature. Contact your administrator to request billing management access.
      </Text>
      
      {showUpgrade && (
        <Alert
          icon={<IconCreditCardPay size={16} />}
          title="Required Authority"
          color="yellow"
          variant="light"
        >
          <Text size="sm">
            This feature requires one of the following authorities:
          </Text>
          <Text size="sm" mt="xs">
            • <strong>BILLING_MANAGER</strong> - Billing management permissions
            <br />
            • <strong>BILLING_ADMIN</strong> - Full billing administration
            <br />
            • <strong>ADMIN</strong> - Platform administration
          </Text>
          <Text size="sm" mt="xs" c="dimmed">
            Current billing level: <strong>{getBillingAuthorityLevel()}</strong>
          </Text>
          {getUserBillingAuthorities().length > 0 && (
            <Text size="sm" mt="xs" c="dimmed">
              Your billing authorities: {getUserBillingAuthorities().join(", ")}
            </Text>
          )}
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