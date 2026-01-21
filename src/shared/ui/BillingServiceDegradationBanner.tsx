import React from "react";
import { GenericServiceDegradationBanner } from "./GenericServiceDegradationBanner";
import { useBillingServiceHealth } from "@/shared/lib/hooks/useBillingServiceHealth";
import { t } from "@lingui/core/macro";

interface BillingServiceDegradationBannerProps {
  /** Whether to show the banner even when all services are healthy */
  alwaysShow?: boolean;
}

/**
 * Banner component that displays Billing service degradation information
 * Shows which Billing services are unavailable and provides retry options
 */
export const BillingServiceDegradationBanner: React.FC<BillingServiceDegradationBannerProps> = ({
  alwaysShow = false,
}) => {
  const serviceHealth = useBillingServiceHealth();

  const serviceDisplayNames = {
    payments: t`Payments`,
    subscriptions: t`Subscriptions`,
    invoices: t`Invoices`,
    gateway: t`Gateway`,
  };

  return (
    <GenericServiceDegradationBanner
      serviceName="Billing"
      serviceHealth={serviceHealth}
      serviceDisplayNames={serviceDisplayNames}
      alwaysShow={alwaysShow}
    />
  );
};