import React from "react";
import { useAuth } from "@/processes/auth";
import { Alert, Button, Stack, Text, Title } from "@mantine/core";
import { IconUsers, IconLock } from "@tabler/icons-react";

interface CrmAccessGuardProps {
  children: React.ReactNode;
  /** Custom fallback component when access is denied */
  fallback?: React.ReactNode;
  /** Whether to show upgrade suggestion */
  showUpgrade?: boolean;
}

/**
 * Guard component that restricts access to CRM features.
 * Requires: CRM_ACCESS or any CRM management authority or admin access
 */
export const CrmAccessGuard: React.FC<CrmAccessGuardProps> = ({
  children,
  fallback,
  showUpgrade = true,
}) => {
  const { hasCrmAccess, getCrmAuthorityLevel } = useAuth();

  if (hasCrmAccess()) {
    return <>{children}</>;
  }

  if (fallback) {
    return <>{fallback}</>;
  }

  return (
    <Stack align="center" gap="md" p="xl">
      <IconLock size={48} color="var(--mantine-color-gray-5)" />
      <Title order={3} ta="center">
        CRM Access Required
      </Title>
      <Text ta="center" c="dimmed" maw={400}>
        You need CRM access to view this page. Contact your administrator to
        request access to CRM features.
      </Text>

      {showUpgrade && (
        <Alert
          icon={<IconUsers size={16} />}
          title="Required Authority"
          color="blue"
          variant="light"
        >
          <Text size="sm">
            This page requires one of the following authorities:
          </Text>
          <Text size="sm" mt="xs">
            • <strong>CRM_ACCESS</strong> - Basic CRM operations
            <br />• <strong>CRM_LEAD_MANAGER</strong> - Lead management
            <br />• <strong>CRM_CONTACT_MANAGER</strong> - Contact management
            <br />• <strong>CRM_PIPELINE_MANAGER</strong> - Pipeline management
            <br />• <strong>CRM_ADMIN</strong> - Full CRM administration
          </Text>
          <Text size="sm" mt="xs" c="dimmed">
            Current level: <strong>{getCrmAuthorityLevel()}</strong>
          </Text>
        </Alert>
      )}

      <Button variant="light" onClick={() => window.history.back()}>
        Go Back
      </Button>
    </Stack>
  );
};
