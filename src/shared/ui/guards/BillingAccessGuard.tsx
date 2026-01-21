import React from "react";
import { useAuth } from "@/processes/auth";
import { ServiceAccessGuard } from "./ServiceAccessGuard";
import { useBillingServiceHealth } from "@/shared/lib/hooks/useBillingServiceHealth";

interface BillingAccessGuardProps {
  children: React.ReactNode;
  /** Custom fallback component when access is denied */
  fallback?: React.ReactNode;
  /** Whether to show upgrade suggestion */
  showUpgrade?: boolean;
  /** Whether to check service health */
  checkServiceHealth?: boolean;
}

/**
 * Guard component that restricts access to Billing features.
 * Uses the generic ServiceAccessGuard with Billing-specific configuration.
 */
export const BillingAccessGuard: React.FC<BillingAccessGuardProps> = (props) => {
  const { hasBillingAccess } = useAuth();
  const serviceHealth = useBillingServiceHealth();

  const requiredAuthorities = [
    "BILLING_ACCESS",
    "BILLING_MANAGER", 
    "BILLING_ADMIN",
    "ADMIN",
    "SUPER_ADMIN"
  ];

  return (
    <ServiceAccessGuard
      {...props}
      featureCode="billing"
      serviceName="Billing"
      hasAccess={hasBillingAccess}
      serviceHealth={props.checkServiceHealth ? serviceHealth : undefined}
      requiredAuthorities={requiredAuthorities}
    />
  );
};