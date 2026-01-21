import React from "react";
import { Alert, Group, Text, Button, Badge } from "@mantine/core";
import { IconAlertTriangle, IconRefresh } from "@tabler/icons-react";
import { useCrmServiceHealth } from "@/shared/lib/hooks/useCrmServiceHealth";
import { t } from "@lingui/core/macro";

interface ServiceDegradationBannerProps {
  /** Whether to show the banner even when all services are healthy */
  alwaysShow?: boolean;
}

/**
 * Banner component that displays service degradation information
 * Shows which CRM services are unavailable and provides retry options
 */
export const ServiceDegradationBanner: React.FC<ServiceDegradationBannerProps> = ({
  alwaysShow = false,
}) => {
  const { 
    isHealthy, 
    services, 
    circuitBreakerOpen, 
    retryConnection,
    lastChecked 
  } = useCrmServiceHealth();

  // Don't show if all services are healthy (unless alwaysShow is true)
  if (isHealthy && !alwaysShow) {
    return null;
  }

  // Don't show if circuit breaker is open (handled by CrmAccessGuard)
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
    switch (service) {
      case 'leads': 
        return t`Leads`;
      case 'contacts': 
        return t`Contacts`;
      case 'pipeline': 
        return t`Pipeline`;
      default: 
        return service;
    }
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
          ? t`All CRM Services Available`
          : t`Some CRM Services Unavailable`
      }
      color={getSeverityColor()}
      variant="light"
      style={{ marginBottom: 16 }}
    >
      <Group justify="space-between" align="flex-start">
        <div>
          {unavailableServices.length === 0 ? (
            <Text size="sm">
              {t`All CRM services are operating normally.`}
            </Text>
          ) : (
            <>
              <Text size="sm" mb="xs">
                {unavailableServices.length === 1
                  ? t`The following CRM service is currently unavailable:`
                  : t`The following CRM services are currently unavailable:`
                }
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