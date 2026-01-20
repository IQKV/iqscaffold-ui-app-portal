import React from "react";
import { useAuth } from "@/processes/auth";
import { Alert, Button, Stack, Text, Title } from "@mantine/core";
import { IconChartLine, IconLock } from "@tabler/icons-react";

interface CrmPipelineManagerGuardProps {
  children: React.ReactNode;
  /** Custom fallback component when access is denied */
  fallback?: React.ReactNode;
  /** Whether to show upgrade suggestion */
  showUpgrade?: boolean;
}

/**
 * Guard component that restricts access to pipeline management features.
 * Requires: CRM_PIPELINE_MANAGER, CRM_ADMIN, or admin access
 */
export const CrmPipelineManagerGuard: React.FC<CrmPipelineManagerGuardProps> = ({
  children,
  fallback,
  showUpgrade = true,
}) => {
  const { canManagePipeline, getCrmAuthorityLevel, getUserCrmAuthorities } = useAuth();

  if (canManagePipeline()) {
    return <>{children}</>;
  }

  if (fallback) {
    return <>{fallback}</>;
  }

  return (
    <Stack align="center" gap="md" p="xl">
      <IconLock size={48} color="var(--mantine-color-gray-5)" />
      <Title order={3} ta="center">
        Pipeline Management Access Required
      </Title>
      <Text ta="center" c="dimmed" maw={400}>
        You need pipeline management permissions to access this feature. Contact your administrator to request pipeline management access.
      </Text>
      
      {showUpgrade && (
        <Alert
          icon={<IconChartLine size={16} />}
          title="Required Authority"
          color="violet"
          variant="light"
        >
          <Text size="sm">
            This feature requires one of the following authorities:
          </Text>
          <Text size="sm" mt="xs">
            • <strong>CRM_PIPELINE_MANAGER</strong> - Pipeline management permissions
            <br />
            • <strong>CRM_ADMIN</strong> - Full CRM administration
            <br />
            • <strong>ADMIN</strong> - Platform administration
          </Text>
          <Text size="sm" mt="xs" c="dimmed">
            Current CRM level: <strong>{getCrmAuthorityLevel()}</strong>
          </Text>
          {getUserCrmAuthorities().length > 0 && (
            <Text size="sm" mt="xs" c="dimmed">
              Your CRM authorities: {getUserCrmAuthorities().join(", ")}
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