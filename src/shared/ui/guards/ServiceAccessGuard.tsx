import React from "react";
import { useAuth } from "@/processes/auth";
import {
  Alert,
  Button,
  Stack,
  Text,
  Title,
  Group,
  Loader,
} from "@mantine/core";
import {
  IconUsers,
  IconLock,
  IconAlertTriangle,
  IconRefresh,
} from "@tabler/icons-react";
import { useFeatureContext } from "@/shared/lib/contexts/FeatureContext";
import { t } from "@lingui/core/macro";

interface ServiceAccessGuardProps {
  children: React.ReactNode;
  /** Feature code to check */
  featureCode: string;
  /** Service name for display */
  serviceName: string;
  /** Function to check user access */
  hasAccess: () => boolean;
  /** Service health hook result */
  serviceHealth?: {
    isHealthy: boolean;
    isLoading: boolean;
    circuitBreakerOpen: boolean;
    retryConnection: () => void;
    error?: string;
  };
  /** Custom fallback component when access is denied */
  fallback?: React.ReactNode;
  /** Whether to show upgrade suggestion */
  showUpgrade?: boolean;
  /** Whether to check service health */
  checkServiceHealth?: boolean;
  /** Required authorities for upgrade message */
  requiredAuthorities?: string[];
}

/**
 * Generic guard component that restricts access to service features.
 * Checks feature availability, user authorization, and service health.
 */
export const ServiceAccessGuard: React.FC<ServiceAccessGuardProps> = ({
  children,
  featureCode,
  serviceName,
  hasAccess,
  serviceHealth,
  fallback,
  showUpgrade = true,
  checkServiceHealth = true,
  requiredAuthorities = [],
}) => {
  const { hasFeature, loading: featureLoading } = useFeatureContext();
  const { isSuperAdmin } = useAuth();

  // SUPER_ADMIN bypass: Always grant access to SUPER_ADMIN users
  if (isSuperAdmin()) {
    return <>{children}</>;
  }

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

  // Check if feature is enabled
  if (!hasFeature(featureCode)) {
    return (
      <Stack align="center" gap="md" p="xl">
        <IconLock size={48} color="var(--mantine-color-gray-5)" />
        <Title order={3} ta="center">
          {serviceName} Feature Not Available
        </Title>
        <Text ta="center" c="dimmed" maw={400}>
          The {serviceName} feature is not enabled for your account. Contact
          your administrator to enable {serviceName} functionality.
        </Text>
      </Stack>
    );
  }

  // Check user authorization
  if (!hasAccess()) {
    if (fallback) {
      return <>{fallback}</>;
    }

    return (
      <Stack align="center" gap="md" p="xl">
        <IconLock size={48} color="var(--mantine-color-gray-5)" />
        <Title order={3} ta="center">
          {serviceName} Access Required
        </Title>
        <Text ta="center" c="dimmed" maw={400}>
          You need {serviceName} access to view this page. Contact your
          administrator to request access to {serviceName} features.
        </Text>

        {showUpgrade && requiredAuthorities.length > 0 && (
          <Alert
            icon={<IconUsers size={16} />}
            title={t`Required Authority`}
            color="blue"
            variant="light"
          >
            <Text size="sm">
              You need one of the following authorities:{" "}
              {requiredAuthorities.join(", ")}.
            </Text>
          </Alert>
        )}
      </Stack>
    );
  }

  // Check service health if enabled and provided
  if (checkServiceHealth && serviceHealth) {
    const { isHealthy, isLoading, circuitBreakerOpen, retryConnection, error } =
      serviceHealth;

    if (isLoading) {
      return (
        <Stack align="center" gap="md" p="xl">
          <Loader size="lg" />
          <Text ta="center" c="dimmed">
            {t`Checking ${serviceName} service availability...`}
          </Text>
        </Stack>
      );
    }

    if (circuitBreakerOpen || !isHealthy) {
      return (
        <Stack align="center" gap="md" p="xl">
          <IconAlertTriangle size={48} color="var(--mantine-color-red-5)" />
          <Title order={3} ta="center">
            {serviceName} Services Unavailable
          </Title>
          <Text ta="center" c="dimmed" maw={400}>
            {circuitBreakerOpen
              ? `${serviceName} services are temporarily unavailable due to multiple connection failures. Please try again later.`
              : `${serviceName} services are currently experiencing issues. Our team has been notified and is working on a fix.`}
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

          {error && (
            <Alert
              icon={<IconAlertTriangle size={16} />}
              title={t`Technical Details`}
              color="red"
              variant="light"
              style={{ maxWidth: 500 }}
            >
              <Text size="sm" style={{ fontFamily: "monospace" }}>
                {String(error)}
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
