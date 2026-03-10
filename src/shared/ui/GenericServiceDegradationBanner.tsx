import React from "react";
import { Alert, Group, Text, Button, Badge } from "@mantine/core";
import { IconAlertTriangle, IconRefresh } from "@tabler/icons-react";
import { t } from "@lingui/core/macro";

interface GenericServiceDegradationBannerProps {
  /** Service name for display */
  serviceName: string;
  /** Service health hook result */
  serviceHealth: {
    isHealthy: boolean;
    services: Record<string, boolean>;
    circuitBreakerOpen: boolean;
    retryConnection: () => void;
    lastChecked?: Date;
  };
  /** Service display name mapping */
  serviceDisplayNames?: Record<string, string>;
  /** Whether to show the banner even when all services are healthy */
  alwaysShow?: boolean;
}

/**
 * Generic banner component that displays service degradation information
 * Shows which services are unavailable and provides retry options
 */
export const GenericServiceDegradationBanner: React.FC<GenericServiceDegradationBannerProps> = ({
  serviceName,
  serviceHealth,
  serviceDisplayNames = {},
  alwaysShow = false,
}) => {
  const { isHealthy, services, circuitBreakerOpen, retryConnection, lastChecked } = serviceHealth;

  // Don't show if all services are healthy (unless alwaysShow is true)
  if (isHealthy && !alwaysShow) {
    return null;
  }

  // Don't show if circuit breaker is open (handled by ServiceAccessGuard)
  if (circuitBreakerOpen) {
    return null;
  }

  const unavailableServices = Object.entries(services)
    .filter(([_, available]) => !available)
    .map(([service]) => service);

  if (unavailableServices.length === 0 && !alwaysShow) {
    return null;
  }

  const getServiceDisplayName = (service: string) => {
    return serviceDisplayNames[service] || service.charAt(0).toUpperCase() + service.slice(1);
  };

  const getSeverityColor = () => {
    if (unavailableServices.length === 0) {
      return "green";
    }
    if (unavailableServices.length === 1) {
      return "yellow";
    }
    if (unavailableServices.length === 2) {
      return "orange";
    }
    return "red";
  };

  return (
    <Alert
      icon={<IconAlertTriangle size={16} />}
      title={
        unavailableServices.length === 0
          ? t`All ${serviceName} Services Available`
          : t`Some ${serviceName} Services Unavailable`
      }
      color={getSeverityColor()}
      variant="light"
      style={{ marginBottom: 16 }}
    >
      <Group justify="space-between" align="flex-start">
        <div>
          {unavailableServices.length === 0 ? (
            <Text size="sm">{t`All ${serviceName} services are operating normally.`}</Text>
          ) : (
            <>
              <Text size="sm" mb="xs">
                {unavailableServices.length === 1
                  ? t`The following ${serviceName} service is currently unavailable:`
                  : t`The following ${serviceName} services are currently unavailable:`}
              </Text>
              <Group gap="xs" mb="xs">
                {unavailableServices.map((service) => (
                  <Badge key={service} color="red" variant="light">
                    {getServiceDisplayName(service)}
                  </Badge>
                ))}
              </Group>
              <Text size="sm" c="dimmed">
                {t`Some features may be limited. We're working to restore full functionality.`}
              </Text>
            </>
          )}

          {lastChecked && (
            <Text size="xs" c="dimmed" mt="xs">
              Last checked: {lastChecked.toLocaleTimeString()}
            </Text>
          )}
        </div>

        <Button
          size="xs"
          variant="light"
          leftSection={<IconRefresh size={14} />}
          onClick={retryConnection}
        >
          {t`Refresh`}
        </Button>
      </Group>
    </Alert>
  );
};
