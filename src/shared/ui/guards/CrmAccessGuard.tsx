import React from "react";
import { useAuth } from "@/processes/auth";
import { Alert, Button, Stack, Text, Title, Group, Loader } from "@mantine/core";
import { IconUsers, IconLock, IconAlertTriangle, IconRefresh } from "@tabler/icons-react";
import { useCrmServiceHealth } from "@/shared/lib/hooks/useCrmServiceHealth";
import { useFeatureContext } from "@/shared/lib/contexts/FeatureContext";
import { t } from "@lingui/core/macro";

interface CrmAccessGuardProps {
  children: React.ReactNode;
  /** Custom fallback component when access is denied */
  fallback?: React.ReactNode;
  /** Whether to show upgrade suggestion */
  showUpgrade?: boolean;
  /** Whether to check service health */
  checkServiceHealth?: boolean;
}

/**
 * Guard component that restricts access to CRM features.
 * Requires: CRM_ACCESS or any CRM management authority or admin access
 * Also checks service health and feature availability
 */
export const CrmAccessGuard: React.FC<CrmAccessGuardProps> = ({
  children,
  fallback,
  showUpgrade = true,
  checkServiceHealth = true,
}) => {
  const { hasCrmAccess, getCrmAuthorityLevel } = useAuth();
  const { hasFeature, canAccessFeature, loading: featureLoading } = useFeatureContext();
  const { 
    isHealthy, 
    isLoading: healthLoading, 
    circuitBreakerOpen, 
    retryConnection,
    error: healthError 
  } = useCrmServiceHealth();

  // Check feature availability first
  if (featureLoading) {
    return (
      <Stack align="center" gap="md" p="xl">
        <Loader size="lg" />
        <Text ta="center" c="dimmed">
          {t`Checking feature availability...`}
        </Text>
      </Stack>
    );
  }

  // Check if CRM feature is enabled
  if (!hasFeature("crm")) {
    return (
      <Stack align="center" gap="md" p="xl">
        <IconLock size={48} color="var(--mantine-color-gray-5)" />
        <Title order={3} ta="center">
          {t`CRM Feature Not Available`}
        </Title>
        <Text ta="center" c="dimmed" maw={400}>
          {t`The CRM feature is not enabled for your account. Contact your administrator to enable CRM functionality.`}
        </Text>
      </Stack>
    );
  }

  // Check user authorization
  if (!hasCrmAccess()) {
    if (fallback) {
      return <>{fallback}</>;
    }

    return (
      <Stack align="center" gap="md" p="xl">
        <IconLock size={48} color="var(--mantine-color-gray-5)" />
        <Title order={3} ta="center">
          {t`CRM Access Required`}
        </Title>
        <Text ta="center" c="dimmed" maw={400}>
          {t`You need CRM access to view this page. Contact your administrator to request access to CRM features.`}
        </Text>

        {showUpgrade && (
          <Alert
            icon={<IconUsers size={16} />}
            title={t`Required Authority`}
            color="blue"
            variant="light"
          >
            <Text size="sm">
              {t`You need one of the following authorities: CRM_ACCESS, CRM_LEAD_MANAGER, CRM_CONTACT_MANAGER, CRM_PIPELINE_MANAGER, or CRM_ADMIN.`}
            </Text>
          </Alert>
        )}
      </Stack>
    );
  }

  // Check service health if enabled
  if (checkServiceHealth) {
    if (healthLoading) {
      return (
        <Stack align="center" gap="md" p="xl">
          <Loader size="lg" />
          <Text ta="center" c="dimmed">
            {t`Checking CRM service availability...`}
          </Text>
        </Stack>
      );
    }

    if (circuitBreakerOpen || !isHealthy) {
      return (
        <Stack align="center" gap="md" p="xl">
          <IconAlertTriangle size={48} color="var(--mantine-color-red-5)" />
          <Title order={3} ta="center">
            {t`CRM Services Unavailable`}
          </Title>
          <Text ta="center" c="dimmed" maw={400}>
            {circuitBreakerOpen 
              ? t`CRM services are temporarily unavailable due to multiple connection failures. Please try again later.`
              : t`CRM services are currently experiencing issues. Our team has been notified and is working on a fix.`
            }
          </Text>

          <Group>
            <Button
              leftSection={<IconRefresh size={16} />}
              onClick={retryConnection}
              variant="light"
            >
              {t`Try Again`}
            </Button>
            <Button
              variant="outline"
              onClick={() => {
              window.location.href = "/dashboard";
            }}
            >
              {t`Go to Dashboard`}
            </Button>
          </Group>

          {healthError && (
            <Alert
              icon={<IconAlertTriangle size={16} />}
              title={t`Technical Details`}
              color="red"
              variant="light"
              style={{ maxWidth: 500 }}
            >
              <Text size="sm" style={{ fontFamily: 'monospace' }}>
                {String(healthError)}
              </Text>
            </Alert>
          )}
        </Stack>
      );
    }
  }

  // All checks passed - render children
  return <>{children}</>;
};
