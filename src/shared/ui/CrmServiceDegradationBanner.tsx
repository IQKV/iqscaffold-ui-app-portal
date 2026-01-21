import React from "react";
import { GenericServiceDegradationBanner } from "./GenericServiceDegradationBanner";
import { useCrmServiceHealth } from "@/shared/lib/hooks/useCrmServiceHealth";
import { t } from "@lingui/core/macro";

interface CrmServiceDegradationBannerProps {
  /** Whether to show the banner even when all services are healthy */
  alwaysShow?: boolean;
}

/**
 * Banner component that displays CRM service degradation information
 * Shows which CRM services are unavailable and provides retry options
 */
export const CrmServiceDegradationBanner: React.FC<
  CrmServiceDegradationBannerProps
> = ({ alwaysShow = false }) => {
  const serviceHealth = useCrmServiceHealth();

  const serviceDisplayNames = {
    leads: t`Leads`,
    contacts: t`Contacts`,
    pipeline: t`Pipeline`,
  };

  return (
    <GenericServiceDegradationBanner
      serviceName="CRM"
      serviceHealth={serviceHealth}
      serviceDisplayNames={serviceDisplayNames}
      alwaysShow={alwaysShow}
    />
  );
};
